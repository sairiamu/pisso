use std::fs;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::io::{BufRead, BufReader, Write};
use tauri::{Manager, Emitter, path::BaseDirectory};
use std::sync::Mutex;
use serialport::SerialPort;

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

#[tauri::command]
async fn compile_sketch(
    app_handle: tauri::AppHandle,
    sketch_path: String,
    board_fqbn: String,
) -> Result<String, String> {
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

    let build_cache = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("build-cache");

    if !build_cache.exists() {
        fs::create_dir_all(&build_cache).map_err(|e| e.to_string())?;
    }
    let build_cache = clean_path(build_cache);

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

    let hex_content = fs::read_to_string(&output_hex).map_err(|e| e.to_string())?;
    Ok(hex_content)
}

#[tauri::command]
async fn upload_hex(
    app_handle: tauri::AppHandle,
    hex_path: String,
    port: String,
    board_fqbn: String,
) -> Result<(), String> {
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
        Ok(())
    } else {
        Err("avrdude exited with error. Check the progress logs for details.".into())
    }
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
        .manage(AppState {
            serial_port: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
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
            write_to_serial
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
