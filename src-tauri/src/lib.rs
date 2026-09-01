use std::fs;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::io::{BufRead, BufReader, Write};
use tauri::{Manager, Emitter, path::BaseDirectory};
use std::sync::Mutex;
use serialport::SerialPort;
use std::hash::{Hash, Hasher};
use std::collections::hash_map::DefaultHasher;

pub struct AppState {
    pub serial_port: Mutex<Option<Box<dyn SerialPort>>>,
}

/// GNU tools on Windows often choke on the Verbatim prefix (\\?\)
/// provided by Rust's canonicalize() or Tauri's path resolvers.
fn clean_path<P: AsRef<Path>>(path: P) -> PathBuf {
    let path_str = path.as_ref().to_string_lossy();
    if let Some(stripped) = path_str.strip_prefix(r"\\?\") {
        PathBuf::from(stripped)
    } else {
        path.as_ref().to_path_buf()
    }
}

#[derive(serde::Serialize)]
struct SerialPortInfo {
    port_name: String,
    vendor_id: Option<u16>,
    product_id: Option<u16>,
    is_arduino: bool,
}

struct BoardConfig {
    mcu: &'static str,
    f_cpu: &'static str,
    variant: &'static str,
    extra_flags: &'static [&'static str],
    avrdude_part: &'static str,
    avrdude_programmer: &'static str,
    avrdude_baud: &'static str,
}

fn get_board_config(fqbn: &str) -> Result<BoardConfig, String> {
    match fqbn {
        "arduino:avr:uno" => Ok(BoardConfig {
            mcu: "atmega328p",
            f_cpu: "16000000L",
            variant: "standard",
            extra_flags: &["-DARDUINO_AVR_UNO", "-DARDUINO_ARCH_AVR"],
            avrdude_part: "atmega328p",
            avrdude_programmer: "arduino",
            avrdude_baud: "115200",
        }),
        _ => Err(format!(
            "Unsupported board: {}. Currently, only 'arduino:avr:uno' is supported.",
            fqbn
        )),
    }
}

fn find_included_headers(source: &str) -> Vec<String> {
    // Matches #include <Foo.h> and #include "Foo.h"
    let re = regex::Regex::new(r#"#include\s*[<"]([A-Za-z0-9_\-]+\.h)[>"]"#).unwrap();
    re.captures_iter(source)
        .map(|c| c[1].to_string())
        .collect()
}

struct ResolvedLibrary {
    include_dir: PathBuf,   // root or src/, whichever actually contains the header
    source_files: Vec<PathBuf>, // all .c/.cpp under include_dir (recursive)
}

fn resolve_library(header_name: &str, search_roots: &[PathBuf]) -> Option<ResolvedLibrary> {
    for root in search_roots {
        if !root.exists() { continue; }
        let lib_dirs = fs::read_dir(root).ok()?;
        for lib_dir in lib_dirs.flatten() {
            let lib_path = lib_dir.path();
            if !lib_path.is_dir() { continue; }

            for candidate in [lib_path.join("src"), lib_path.clone()] {
                if candidate.join(header_name).exists() {
                    let source_files = collect_sources_recursive(&candidate);
                    return Some(ResolvedLibrary { include_dir: candidate, source_files });
                }
            }
        }
    }
    None
}

fn collect_sources_recursive(dir: &Path) -> Vec<PathBuf> {
    let mut result = Vec::new();
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                result.extend(collect_sources_recursive(&path));
            } else if let Some(ext) = path.extension().and_then(|s| s.to_str()) {
                if ext == "c" || ext == "cpp" {
                    result.push(path);
                }
            }
        }
    }
    result
}

#[tauri::command]
fn list_serial_ports() -> Result<Vec<SerialPortInfo>, String> {
    let ports = serialport::available_ports().map_err(|e| e.to_string())?;
    let mut port_list = Vec::new();

    for p in ports {
        let mut vendor_id = None;
        let mut product_id = None;
        let mut is_arduino = false;

        if let serialport::SerialPortType::UsbPort(info) = p.port_type {
            vendor_id = Some(info.vid);
            product_id = Some(info.pid);

            // Typical Arduino VIDs
            let vid = info.vid;
            if vid == 0x2341 || vid == 0x2A03 || vid == 0x1A86 || vid == 0x239A || vid == 0x1B4F || vid == 0x16C0 || vid == 0x10C4 || vid == 0x0403 {
                is_arduino = true;
            }

            if let Some(product) = &info.product {
                if product.contains("Arduino") {
                    is_arduino = true;
                }
            }
        }

        port_list.push(SerialPortInfo {
            port_name: p.port_name,
            vendor_id,
            product_id,
            is_arduino,
        });
    }

    Ok(port_list)
}

#[tauri::command]
fn save_full_project(
    project_path: String,
    diagram_json: String,
    files: Vec<ProjectFile>,
) -> Result<(), String> {
    let project_path = clean_path(project_path);
    // 1. Save Design
    let mut design_path = project_path.clone();
    design_path.push("design");
    if !design_path.exists() {
        fs::create_dir_all(&design_path).map_err(|e| e.to_string())?;
    }
    design_path.push("diagram.json");
    fs::write(design_path, diagram_json).map_err(|e| e.to_string())?;

    // 2. Save Code
    let mut code_path = project_path.clone();
    code_path.push("code");
    if !code_path.exists() {
        fs::create_dir_all(&code_path).map_err(|e| e.to_string())?;
    }
    for file in files {
        let mut file_path = code_path.clone();
        file_path.push(file.name);
        fs::write(file_path, file.content).map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
fn save_diagram(project_path: String, diagram_json: String) -> Result<(), String> {
    let mut path = clean_path(project_path);
    path.push("design");
    if !path.exists() {
        fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    }
    path.push("diagram.json");

    fs::write(path, diagram_json).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_projects_path(app_handle: tauri::AppHandle) -> Result<String, String> {
    let mut path = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    path.push("projects");

    if !path.exists() {
        fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    }

    Ok(clean_path(path).to_string_lossy().to_string())
}

#[derive(serde::Serialize, serde::Deserialize, Clone)]
struct RecentProject {
    path: String,
    last_opened: u64, // unix timestamp, seconds
}

fn recent_projects_file(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let mut path = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    if !path.exists() {
        fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    }
    path.push("recent_projects.json");
    Ok(path)
}

#[tauri::command]
fn add_recent_project(app_handle: tauri::AppHandle, project_path: String) -> Result<(), String> {
    let project_path = clean_path(project_path).to_string_lossy().to_string();
    let file = recent_projects_file(&app_handle)?;

    let mut entries: Vec<RecentProject> = if file.exists() {
        let raw = fs::read_to_string(&file).map_err(|e| e.to_string())?;
        serde_json::from_str(&raw).unwrap_or_default()
    } else {
        Vec::new()
    };

    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);

    // Remove any existing entry for this path (case: re-saving/re-opening),
    // then push it to the front as the most recent.
    entries.retain(|e| e.path != project_path);
    entries.insert(0, RecentProject { path: project_path, last_opened: now });

    // Cap at 20 entries so this file never grows unbounded.
    entries.truncate(20);

    let json = serde_json::to_string_pretty(&entries).map_err(|e| e.to_string())?;
    fs::write(file, json).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_recent_projects(app_handle: tauri::AppHandle) -> Result<Vec<String>, String> {
    let file = recent_projects_file(&app_handle)?;
    if !file.exists() {
        return Ok(Vec::new());
    }

    let raw = fs::read_to_string(&file).map_err(|e| e.to_string())?;
    let entries: Vec<RecentProject> = serde_json::from_str(&raw).unwrap_or_default();

    // Prune entries whose folder no longer exists on disk (moved/deleted
    // project), and don't rewrite the file just for a read — pruning here
    // is display-only. The next add_recent_project call will naturally
    // clean the file since it starts from the currently-read list too.
    let alive: Vec<String> = entries
        .into_iter()
        .filter(|e| Path::new(&e.path).exists())
        .map(|e| e.path)
        .collect();

    Ok(alive)
}

fn sanitize_project_name(name: &str) -> String {
    let cleaned: String = name
        .chars()
        .map(|c| if r#"\/:*?"<>|"#.contains(c) { '_' } else { c })
        .collect();
    let trimmed = cleaned.trim().trim_end_matches('.').to_string();
    if trimmed.is_empty() { "Untitled Project".to_string() } else { trimmed }
}

#[tauri::command]
fn create_new_project(app_handle: tauri::AppHandle, name: String) -> Result<String, String> {
    let mut base = app_handle.path().app_data_dir().map_err(|e| e.to_string())?;
    base.push("projects");
    if !base.exists() {
        fs::create_dir_all(&base).map_err(|e| e.to_string())?;
    }

    let safe_name = sanitize_project_name(&name);
    let mut candidate = base.join(&safe_name);
    let mut suffix = 2;
    while candidate.exists() {
        candidate = base.join(format!("{} ({})", safe_name, suffix));
        suffix += 1;
    }

    fs::create_dir_all(candidate.join("design")).map_err(|e| e.to_string())?;
    fs::create_dir_all(candidate.join("code")).map_err(|e| e.to_string())?;

    fs::write(
        candidate.join("design").join("diagram.json"),
        r#"{"version":1,"parts":[],"connections":[]}"#,
    ).map_err(|e| e.to_string())?;

    let default_sketch = "#include <Arduino.h>\n\nvoid setup() {\n  pinMode(LED_BUILTIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_BUILTIN, HIGH);\n  delay(1000);\n  digitalWrite(LED_BUILTIN, LOW);\n  delay(1000);\n}\n";
    fs::write(candidate.join("code").join("sketch.ino"), default_sketch)
        .map_err(|e| e.to_string())?;

    fs::write(
        candidate.join("project.json"),
        format!(r#"{{"activeFileIndex":0,"name":"{}"}}"#, safe_name.replace('"', "\\\"")),
    ).map_err(|e| e.to_string())?;

    Ok(clean_path(candidate).to_string_lossy().to_string())
}

#[tauri::command]
fn list_projects(app_handle: tauri::AppHandle) -> Result<Vec<String>, String> {
    let app_data = app_handle.path().app_data_dir().map_err(|e| e.to_string())?;

    let search_paths = vec![app_data.join("projects"), app_data.join("playground")];
    let mut projects = Vec::new();

    for path in search_paths {
        if !path.exists() {
            continue;
        }

        let entries = fs::read_dir(path).map_err(|e| e.to_string())?;
        for entry in entries {
            let entry = entry.map_err(|e| e.to_string())?;
            let p = entry.path();
            if p.is_dir() {
                let mut diag = p.clone();
                diag.push("design");
                diag.push("diagram.json");

                let mut meta = p.clone();
                meta.push("project.json");

                // Also check for legacy projects in root
                let mut legacy = p.clone();
                legacy.push("diagram.json");

                if diag.exists() || meta.exists() || legacy.exists() {
                    projects.push(clean_path(p).to_string_lossy().to_string());
                }
            }
        }
    }

    projects.sort();
    projects.dedup();

    Ok(projects)
}

#[tauri::command]
fn get_playground_path(app_handle: tauri::AppHandle) -> Result<String, String> {
    let mut path = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    path.push("playground");

    if !path.exists() {
        fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    }

    Ok(clean_path(path).to_string_lossy().to_string())
}

#[derive(serde::Serialize, serde::Deserialize)]
struct ProjectFile {
    name: String,
    content: String,
}

#[tauri::command]
fn save_project_files(project_path: String, files: Vec<ProjectFile>) -> Result<(), String> {
    let mut path = clean_path(project_path);
    path.push("code");
    if !path.exists() {
        fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    }
    for file in files {
        let mut file_path = path.clone();
        file_path.push(file.name);
        fs::write(file_path, file.content).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn load_project_files(project_path: String) -> Result<Vec<ProjectFile>, String> {
    let project_path = clean_path(project_path);
    let mut path = project_path.clone();
    path.push("code");

    let load_from = if path.exists() {
        path
    } else {
        project_path
    };

    let entries = fs::read_dir(load_from).map_err(|e| e.to_string())?;
    let mut files = Vec::new();
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.is_file() {
            let extension = path.extension().and_then(|s| s.to_str());
            if let Some(ext) = extension {
                // Only load code-related files
                if ext == "ino" || ext == "cpp" || ext == "h" || ext == "c" || ext == "hpp" {
                    let name = path.file_name().unwrap().to_string_lossy().to_string();
                    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
                    files.push(ProjectFile { name, content });
                }
            }
        }
    }
    Ok(files)
}

#[tauri::command]
fn save_project_metadata(project_path: String, metadata_json: String) -> Result<(), String> {
    let mut path = clean_path(project_path);
    if !path.exists() {
        fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    }
    path.push("project.json");

    fs::write(path, metadata_json).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_project_metadata(project_path: String) -> Result<String, String> {
    let mut path = clean_path(project_path);
    path.push("project.json");

    if !path.exists() {
        return Ok("{}".to_string());
    }

    fs::read_to_string(path).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_diagram(project_path: String) -> Result<String, String> {
    let project_path = clean_path(project_path);
    let mut path = project_path.clone();
    path.push("design");
    path.push("diagram.json");

    if path.exists() {
        fs::read_to_string(path).map_err(|e| e.to_string())
    } else {
        // Fallback to root for existing projects
        let mut old_path = project_path;
        old_path.push("diagram.json");
        fs::read_to_string(old_path).map_err(|e| e.to_string())
    }
}

#[derive(serde::Serialize)]
pub struct CompileResult {
    pub hex: String,
    pub flash_used: u32,
    pub ram_used: u32,
}

#[tauri::command]
async fn compile_sketch(
    app_handle: tauri::AppHandle,
    sketch_path: String,
    board_fqbn: String,
) -> Result<CompileResult, String> {
    let config = get_board_config(&board_fqbn)?;

    let avr_toolchain = app_handle.path().resolve("resources/avr-toolchain", BaseDirectory::Resource)
        .map_err(|e| format!("Failed to resolve avr-toolchain resource: {}", e))?;
    let avr_toolchain = clean_path(avr_toolchain);

    let arduino_core = app_handle.path().resolve("resources/arduino-core", BaseDirectory::Resource)
        .map_err(|e| format!("Failed to resolve arduino-core resource: {}", e))?;
    let arduino_core = clean_path(arduino_core);

    let arduino_variants_base = app_handle.path().resolve("resources/arduino-variants", BaseDirectory::Resource)
        .map_err(|e| format!("Failed to resolve arduino-variants resource: {}", e))?;
    let arduino_variants = clean_path(arduino_variants_base).join(config.variant);

    let user_libraries_dir = app_handle.path().app_data_dir().map_err(|e| e.to_string())?.join("libraries");
    if !user_libraries_dir.exists() {
        fs::create_dir_all(&user_libraries_dir).map_err(|e| e.to_string())?;
    }
    let bundled_libraries_dir = clean_path(
        app_handle.path().resolve("resources/arduino-libraries", BaseDirectory::Resource)
            .map_err(|e| format!("Failed to resolve arduino-libraries resource: {}", e))?
    );
    let library_search_roots = vec![bundled_libraries_dir, user_libraries_dir];

    let sketch_path = clean_path(sketch_path);
    let project_dir = sketch_path.parent().ok_or("Invalid sketch path")?;
    let toolchain_bin = avr_toolchain.join("bin");

    #[cfg(windows)]
    let avr_gcc = toolchain_bin.join("avr-gcc.exe");
    #[cfg(not(windows))]
    let avr_gcc = toolchain_bin.join("avr-gcc");

    #[cfg(windows)]
    let avr_gxx = toolchain_bin.join("avr-g++.exe");
    #[cfg(not(windows))]
    let avr_gxx = toolchain_bin.join("avr-g++");

    #[cfg(windows)]
    let avr_objcopy = toolchain_bin.join("avr-objcopy.exe");
    #[cfg(not(windows))]
    let avr_objcopy = toolchain_bin.join("avr-objcopy");

    #[cfg(windows)]
    let avr_size = toolchain_bin.join("avr-size.exe");
    #[cfg(not(windows))]
    let avr_size = toolchain_bin.join("avr-size");

    // Check if toolchain exists
    if !avr_gcc.exists() {
        return Err(format!(
            "avr-gcc not found at: {}\n\nToolchain resolved to: {}",
            avr_gcc.display(),
            avr_toolchain.display()
        ));
    }

    if !arduino_core.exists() {
        return Err(format!("Arduino core files not found at: {}", arduino_core.display()));
    }

    if !arduino_variants.exists() {
        return Err(format!("Arduino variant '{}' not found at: {}", config.variant, arduino_variants.display()));
    }

    // Scan the sketch and every other project source file for #include headers.
    let mut all_source = fs::read_to_string(&sketch_path).map_err(|e| e.to_string())?;
    if let Ok(entries) = fs::read_dir(&project_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path == sketch_path {
                continue;
            }
            if matches!(
                path.extension().and_then(|s| s.to_str()),
                Some("cpp") | Some("c") | Some("h")
            ) {
                if let Ok(contents) = fs::read_to_string(&path) {
                    all_source.push('\n');
                    all_source.push_str(&contents);
                }
            }
        }
    }

    let headers = find_included_headers(&all_source);
    let mut resolved_libraries: Vec<ResolvedLibrary> = Vec::new();
    let mut missing_headers: Vec<String> = Vec::new();

    for header in headers {
        // Skip headers already satisfied by the core itself (e.g. Arduino.h, HardwareSerial.h).
        if arduino_core.join(&header).exists() {
            continue;
        }
        match resolve_library(&header, &library_search_roots) {
            Some(lib) => {
                if !resolved_libraries
                    .iter()
                    .any(|r: &ResolvedLibrary| r.include_dir == lib.include_dir)
                {
                    resolved_libraries.push(lib);
                }
            }
            None => missing_headers.push(header),
        }
    }

    if !missing_headers.is_empty() {
        return Err(format!(
            "Missing librar{}: {}. Install {} from the Library Manager before compiling.",
            if missing_headers.len() == 1 { "y" } else { "ies" },
            missing_headers.join(", "),
            if missing_headers.len() == 1 { "it" } else { "them" }
        ));
    }

    let build_cache = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("build-cache");

    if !build_cache.exists() {
        fs::create_dir_all(&build_cache).map_err(|e| e.to_string())?;
    }
    let build_cache = clean_path(build_cache);

    let mut lib_include_args = Vec::new();
    for lib in &resolved_libraries {
        lib_include_args.push(format!("-I{}", lib.include_dir.display()));
    }

    // 1. Compile Core Files (with caching)
    let mut core_obj_files = Vec::new();
    let core_entries = fs::read_dir(&arduino_core).map_err(|e| e.to_string())?;

    for entry in core_entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        let file_name = path.file_name().unwrap().to_string_lossy();
        let extension = path.extension().and_then(|s| s.to_str());

        if let Some(ext) = extension {
            let is_c = ext == "c";
            let is_cpp = ext == "cpp";
            let is_s = ext == "S";

            if is_c || is_cpp || is_s {
                let obj_file = build_cache.join(format!("{}.o", file_name));
                core_obj_files.push(obj_file.clone());

                if !obj_file.exists() {
                    let mut cmd = Command::new(if is_cpp { &avr_gxx } else { &avr_gcc });
                    cmd.arg("-c")
                        .arg("-g")
                        .arg("-Os")
                        .arg("-w") // Suppress core warnings
                        .arg("-ffunction-sections")
                        .arg("-fdata-sections")
                        .arg(format!("-mmcu={}", config.mcu))
                        .arg(format!("-DF_CPU={}", config.f_cpu))
                        .arg("-DARDUINO=10810");

                    for flag in config.extra_flags {
                        cmd.arg(flag);
                    }

                    for arg in &lib_include_args {
                        cmd.arg(arg);
                    }

                    cmd.arg(format!("-I{}", arduino_core.display()))
                        .arg(format!("-I{}", arduino_variants.display()))
                        .arg(&path)
                        .arg("-o")
                        .arg(&obj_file);

                    let output = cmd.output().map_err(|e| format!("Failed to compile core file {}: {}", file_name, e))?;
                    if !output.status.success() {
                        return Err(format!("Error compiling core file {}: {}", file_name, String::from_utf8_lossy(&output.stderr)));
                    }
                }
            }
        }
    }

    // 1.5. Compile Library Files (with caching)
    let mut library_obj_files = Vec::new();
    for lib in &resolved_libraries {
        for source in &lib.source_files {
            let file_name = source.file_name().unwrap().to_string_lossy();
            let extension = source.extension().and_then(|s| s.to_str());
            let is_cpp = extension == Some("cpp");

            let mut hasher = DefaultHasher::new();
            source.parent().unwrap().hash(&mut hasher);
            let dir_hash = hasher.finish();

            let obj_file = build_cache.join(format!("{:x}_{}.o", dir_hash, file_name));
            library_obj_files.push(obj_file.clone());

            if !obj_file.exists() {
                let mut cmd = Command::new(if is_cpp { &avr_gxx } else { &avr_gcc });
                cmd.arg("-c")
                    .arg("-g")
                    .arg("-Os")
                    .arg("-w")
                    .arg("-ffunction-sections")
                    .arg("-fdata-sections")
                    .arg(format!("-mmcu={}", config.mcu))
                    .arg(format!("-DF_CPU={}", config.f_cpu))
                    .arg("-DARDUINO=10810");

                for flag in config.extra_flags {
                    cmd.arg(flag);
                }

                for arg in &lib_include_args {
                    cmd.arg(arg);
                }

                cmd.arg(format!("-I{}", arduino_core.display()))
                    .arg(format!("-I{}", arduino_variants.display()))
                    .arg(format!("-I{}", lib.include_dir.display()));

                for arg in &lib_include_args {
                    cmd.arg(arg);
                }

                cmd.arg(source)
                    .arg("-o")
                    .arg(&obj_file);

                let output = cmd.output().map_err(|e| format!("Failed to compile library file {}: {}", file_name, e))?;
                if !output.status.success() {
                    return Err(format!("Error compiling library file {}: {}", file_name, String::from_utf8_lossy(&output.stderr)));
                }
            }
        }
    }

    let output_elf = PathBuf::from(&sketch_path).with_extension("elf");
    let output_hex = PathBuf::from(&sketch_path).with_extension("hex");
    let sketch_obj = PathBuf::from(&sketch_path).with_extension("o");

    // 2. Compile Sketch and other source files
    let mut extra_obj_files = Vec::new();
    let project_entries = fs::read_dir(&project_dir).map_err(|e| e.to_string())?;

    for entry in project_entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        let file_name = path.file_name().unwrap().to_string_lossy();
        let extension = path.extension().and_then(|s| s.to_str());

        // Skip sketch.ino as it's handled separately or skip if it's the main sketch_path
        if path == sketch_path {
            continue;
        }

        if let Some(ext) = extension {
            if ext == "cpp" || ext == "c" {
                let obj_file = path.with_extension("o");
                extra_obj_files.push(obj_file.clone());

                let mut cmd = Command::new(if ext == "cpp" { &avr_gxx } else { &avr_gcc });
                cmd.arg("-c")
                    .arg("-g")
                    .arg("-Os")
                    .arg("-ffunction-sections")
                    .arg("-fdata-sections")
                    .arg(format!("-mmcu={}", config.mcu))
                    .arg(format!("-DF_CPU={}", config.f_cpu))
                    .arg("-DARDUINO=10810");

                for flag in config.extra_flags {
                    cmd.arg(flag);
                }

                for arg in &lib_include_args {
                    cmd.arg(arg);
                }

                cmd.arg(format!("-I{}", arduino_core.display()))
                    .arg(format!("-I{}", arduino_variants.display()))
                    .arg(format!("-I{}", project_dir.display()))
                    .arg("-include")
                    .arg("Arduino.h")
                    .arg(&path)
                    .arg("-o")
                    .arg(&obj_file);

                let output = cmd.output().map_err(|e| format!("Failed to compile {}: {}", file_name, e))?;
                if !output.status.success() {
                    return Err(format!("Error compiling {}: {}", file_name, String::from_utf8_lossy(&output.stderr)));
                }
            }
        }
    }

    let mut compile_cmd = Command::new(&avr_gxx);
    compile_cmd.arg("-c")
        .arg("-g")
        .arg("-Os")
        .arg("-ffunction-sections")
        .arg("-fdata-sections")
        .arg(format!("-mmcu={}", config.mcu))
        .arg(format!("-DF_CPU={}", config.f_cpu))
        .arg("-DARDUINO=10810");

    for flag in config.extra_flags {
        compile_cmd.arg(flag);
    }

    for arg in &lib_include_args {
        compile_cmd.arg(arg);
    }

    let compile_output = compile_cmd.arg(format!("-I{}", arduino_core.display()))
        .arg(format!("-I{}", arduino_variants.display()))
        .arg(format!("-I{}", project_dir.display()))
        .arg("-include")
        .arg("Arduino.h")
        .arg("-x")
        .arg("c++")
        .arg("-o")
        .arg(&sketch_obj)
        .arg(&sketch_path)
        .output()
        .map_err(|e| format!("Failed to execute avr-g++: {}", e))?;

    if !compile_output.status.success() {
        return Err(String::from_utf8_lossy(&compile_output.stderr).to_string());
    }

    // 3. Link everything together
    let mut link_cmd = Command::new(&avr_gcc);
    link_cmd.arg("-g")
        .arg("-Os")
        .arg(format!("-mmcu={}", config.mcu))
        .arg("-Wl,--gc-sections")
        .arg("-o")
        .arg(&output_elf)
        .arg(&sketch_obj);

    for obj in &extra_obj_files {
        link_cmd.arg(obj);
    }

    for obj in &library_obj_files {
        link_cmd.arg(obj);
    }

    for obj in &core_obj_files {
        link_cmd.arg(obj);
    }

    link_cmd.arg("-lm");

    let link_output = link_cmd.output()
        .map_err(|e| format!("Failed to execute linker: {}", e))?;

    if !link_output.status.success() {
        return Err(format!("Linker error: {}", String::from_utf8_lossy(&link_output.stderr)));
    }

    let copy_output = Command::new(&avr_objcopy)
        .arg("-O")
        .arg("ihex")
        .arg("-R")
        .arg(".eeprom")
        .arg(&output_elf)
        .arg(&output_hex)
        .output()
        .map_err(|e| format!("Failed to execute avr-objcopy: {}", e))?;

    if !copy_output.status.success() {
        return Err(String::from_utf8_lossy(&copy_output.stderr).to_string());
    }

    // 4. Get memory usage info
    let size_output = Command::new(&avr_size)
        .arg(&output_elf)
        .output()
        .map_err(|e| format!("Failed to execute avr-size: {}", e))?;

    let mut flash_used = 0;
    let mut ram_used = 0;

    if size_output.status.success() {
        let out = String::from_utf8_lossy(&size_output.stdout);
        let lines: Vec<&str> = out.lines().collect();
        if lines.len() >= 2 {
            let parts: Vec<&str> = lines[1].split_whitespace().collect();
            if parts.len() >= 3 {
                let text: u32 = parts[0].parse().unwrap_or(0);
                let data: u32 = parts[1].parse().unwrap_or(0);
                let bss: u32 = parts[2].parse().unwrap_or(0);
                flash_used = text + data;
                ram_used = data + bss;
            }
        }
    }

    let hex_content = fs::read_to_string(&output_hex).map_err(|e| e.to_string())?;
    Ok(CompileResult {
        hex: hex_content,
        flash_used,
        ram_used,
    })
}

#[tauri::command]
async fn upload_hex(
    app_handle: tauri::AppHandle,
    hex_path: String,
    port: String,
    board_fqbn: String,
) -> Result<String, String> {
    let config = get_board_config(&board_fqbn)?;

    let avr_toolchain = app_handle.path().resolve("resources/avr-toolchain", BaseDirectory::Resource)
        .map_err(|e| format!("Failed to resolve avr-toolchain resource: {}", e))?;
    let avr_toolchain = clean_path(avr_toolchain);

    let hex_path = clean_path(hex_path);
    let toolchain_bin = avr_toolchain.join("bin");

    #[cfg(windows)]
    let avrdude = toolchain_bin.join("avrdude.exe");
    #[cfg(not(windows))]
    let avrdude = toolchain_bin.join("avrdude");

    // avrdude.conf is usually bundled in the same bin folder or etc/
    let mut avrdude_conf = toolchain_bin.join("avrdude.conf");
    let mut tried_conf_paths = vec![avrdude_conf.clone()];

    if !avrdude_conf.exists() {
        // Fallback to etc/avrdude.conf if not in bin
        avrdude_conf = avr_toolchain.join("etc").join("avrdude.conf");
        tried_conf_paths.push(avrdude_conf.clone());
    }

    if !avrdude.exists() {
        return Err(format!(
            "avrdude not found at: {}\n\nToolchain resolved to: {}",
            avrdude.display(),
            avr_toolchain.display()
        ));
    }

    if !avrdude_conf.exists() {
        let paths_str = tried_conf_paths.iter()
            .map(|p| p.display().to_string())
            .collect::<Vec<_>>()
            .join("\n");
        return Err(format!("avrdude.conf not found. Tried paths:\n{}", paths_str));
    }

    let mut cmd = Command::new(&avrdude);
    cmd.arg("-C")
        .arg(&avrdude_conf)
        .arg("-v")
        .arg(format!("-p{}", config.avrdude_part))
        .arg(format!("-c{}", config.avrdude_programmer))
        .arg(format!("-P{}", port))
        .arg(format!("-b{}", config.avrdude_baud))
        .arg("-D")
        .arg(format!("-Uflash:w:{}:i", hex_path.display()))
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    let mut child = cmd.spawn().map_err(|e| format!("Failed to spawn avrdude: {}", e))?;

    let stdout = child.stdout.take().ok_or("Failed to open stdout")?;
    let stderr = child.stderr.take().ok_or("Failed to open stderr")?;

    let handle = app_handle.clone();
    std::thread::spawn(move || {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            if let Ok(l) = line {
                let _ = handle.emit("upload-progress", l);
            }
        }
    });

    let handle2 = app_handle.clone();
    std::thread::spawn(move || {
        let reader = BufReader::new(stderr);
        for line in reader.lines() {
            if let Ok(l) = line {
                let _ = handle2.emit("upload-progress", l);
            }
        }
    });

    let status = child.wait().map_err(|e| format!("avrdude execution failed: {}", e))?;
    if status.success() {
        Ok("avrdude: flash verified and upload successful".into())
    } else {
        Err("avrdude exited with error. Check the progress logs for details.".into())
    }
}

#[derive(serde::Serialize, serde::Deserialize, Clone)]
struct LibraryCatalogEntry {
    name: String,
    author: String,
    version: String,
    description: String,
    bundled: bool,
}

#[tauri::command]
fn get_library_catalog(app_handle: tauri::AppHandle) -> Result<Vec<LibraryCatalogEntry>, String> {
    let path = clean_path(
        app_handle.path().resolve("resources/library-catalog.json", BaseDirectory::Resource)
            .map_err(|e| e.to_string())?
    );
    let raw = fs::read_to_string(path).map_err(|e| e.to_string())?;
    serde_json::from_str(&raw).map_err(|e| e.to_string())
}

#[tauri::command]
fn install_bundled_library(app_handle: tauri::AppHandle, name: String) -> Result<(), String> {
    let bundled_dir = clean_path(
        app_handle.path().resolve("resources/arduino-libraries", BaseDirectory::Resource)
            .map_err(|e| e.to_string())?
    ).join(&name);
    if !bundled_dir.exists() {
        return Err(format!("'{}' is not a bundled library", name));
    }
    let dest = app_handle.path().app_data_dir().map_err(|e| e.to_string())?.join("libraries").join(&name);
    copy_dir_recursive(&bundled_dir, &dest).map_err(|e| e.to_string())
}

#[tauri::command]
fn remove_library(app_handle: tauri::AppHandle, name: String) -> Result<(), String> {
    let dir = app_handle.path().app_data_dir().map_err(|e| e.to_string())?.join("libraries").join(&name);
    if dir.exists() {
        fs::remove_dir_all(dir).map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn extract_library_zip(app_handle: &tauri::AppHandle, zip_path: &Path) -> Result<String, String> {
    let file = fs::File::open(zip_path).map_err(|e| e.to_string())?;
    let mut archive = zip::ZipArchive::new(file).map_err(|e| e.to_string())?;

    let libraries_dir = app_handle.path().app_data_dir().map_err(|e| e.to_string())?.join("libraries");
    fs::create_dir_all(&libraries_dir).map_err(|e| e.to_string())?;

    // Extract to a temp staging dir first
    let staging = std::env::temp_dir().join(format!("pisso-lib-import-{}", std::process::id()));
    if staging.exists() {
        fs::remove_dir_all(&staging).map_err(|e| e.to_string())?;
    }
    fs::create_dir_all(&staging).map_err(|e| e.to_string())?;

    for i in 0..archive.len() {
        let mut entry = archive.by_index(i).map_err(|e| e.to_string())?;
        let outpath = staging.join(entry.name());
        if entry.name().ends_with('/') {
            fs::create_dir_all(&outpath).map_err(|e| e.to_string())?;
        } else {
            if let Some(parent) = outpath.parent() {
                fs::create_dir_all(parent).map_err(|e| e.to_string())?;
            }
            let mut outfile = fs::File::create(&outpath).map_err(|e| e.to_string())?;
            std::io::copy(&mut entry, &mut outfile).map_err(|e| e.to_string())?;
        }
    }

    let entries: Vec<_> = fs::read_dir(&staging).map_err(|e| e.to_string())?.flatten().collect();
    let source_root = if entries.len() == 1 && entries[0].path().is_dir() {
        entries[0].path()
    } else {
        staging.clone()
    };

    let lib_name = source_root.file_name().ok_or("Could not determine library name")?.to_string_lossy().to_string();
    let dest = libraries_dir.join(&lib_name);
    if dest.exists() {
        fs::remove_dir_all(&dest).map_err(|e| e.to_string())?;
    }
    copy_dir_recursive(&source_root, &dest).map_err(|e| e.to_string())?;
    let _ = fs::remove_dir_all(&staging);

    Ok(lib_name)
}

#[tauri::command]
fn install_library_from_zip(app_handle: tauri::AppHandle, zip_path: String) -> Result<String, String> {
    extract_library_zip(&app_handle, Path::new(&zip_path))
}

fn copy_dir_recursive(src: &Path, dest: &Path) -> std::io::Result<()> {
    fs::create_dir_all(dest)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let dest_path = dest.join(entry.file_name());
        if entry.path().is_dir() {
            copy_dir_recursive(&entry.path(), &dest_path)?;
        } else {
            fs::copy(entry.path(), dest_path)?;
        }
    }
    Ok(())
}

#[tauri::command]
fn list_installed_libraries(app_handle: tauri::AppHandle) -> Result<Vec<String>, String> {
    let user_libraries_dir = app_handle.path().app_data_dir().map_err(|e| e.to_string())?.join("libraries");
    if !user_libraries_dir.exists() {
        return Ok(Vec::new());
    }
    let mut names = Vec::new();
    for entry in fs::read_dir(&user_libraries_dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        if entry.path().is_dir() {
            names.push(entry.file_name().to_string_lossy().to_string());
        }
    }
    Ok(names)
}

#[tauri::command]
fn open_serial(
    app_handle: tauri::AppHandle,
    state: tauri::State<AppState>,
    port_name: String,
    baud_rate: u32,
) -> Result<(), String> {
    let mut port_lock = state.serial_port.lock().map_err(|e| e.to_string())?;

    // Close existing
    *port_lock = None;

    let port = serialport::new(port_name, baud_rate)
        .timeout(std::time::Duration::from_millis(100))
        .open()
        .map_err(|e| e.to_string())?;

    let mut port_clone = port.try_clone().map_err(|e| e.to_string())?;
    *port_lock = Some(port);

    let handle = app_handle.clone();
    std::thread::spawn(move || {
        let mut buffer = [0u8; 1024];
        loop {
            match port_clone.read(&mut buffer) {
                Ok(bytes_read) if bytes_read > 0 => {
                    let data = String::from_utf8_lossy(&buffer[..bytes_read]).to_string();
                    let _ = handle.emit("serial-data", data);
                }
                Ok(_) => {}
                Err(ref e) if e.kind() == std::io::ErrorKind::TimedOut => {
                    // Just a timeout, continue unless the port is dropped
                }
                Err(_) => break,
            }
        }
    });

    Ok(())
}

#[tauri::command]
fn close_serial(state: tauri::State<AppState>) -> Result<(), String> {
    let mut port_lock = state.serial_port.lock().map_err(|e| e.to_string())?;
    *port_lock = None;
    Ok(())
}

#[tauri::command]
fn write_to_serial(state: tauri::State<AppState>, data: String) -> Result<(), String> {
    let mut port_lock = state.serial_port.lock().map_err(|e| e.to_string())?;
    if let Some(port) = port_lock.as_mut() {
        port.write_all(data.as_bytes()).map_err(|e| e.to_string())?;
        port.flush().map_err(|e| e.to_string())?;
    } else {
        return Err("Serial port not open".into());
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())
        .manage(AppState {
            serial_port: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            create_new_project,
            list_projects,
            get_recent_projects,
            add_recent_project,
            get_projects_path,
            save_full_project,
            save_diagram,
            save_project_files,
            load_project_files,
            load_diagram,
            save_project_metadata,
            load_project_metadata,
            compile_sketch,
            upload_hex,
            get_playground_path,
            list_serial_ports,
            open_serial,
            close_serial,
            write_to_serial,
            list_installed_libraries,
            get_library_catalog,
            install_bundled_library,
            remove_library,
            install_library_from_zip
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
