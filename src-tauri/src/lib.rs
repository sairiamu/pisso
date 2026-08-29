use std::fs;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::io::{BufRead, BufReader};
use tauri::{Manager, Emitter};

/// GNU tools on Windows often choke on the Verbatim prefix (\\?\)
/// provided by Rust's canonicalize() or Tauri's path resolvers.
fn clean_path<P: AsRef<Path>>(path: P) -> PathBuf {
    let path_str = path.as_ref().to_string_lossy();
    if path_str.starts_with(r"\\?\") {
        PathBuf::from(&path_str[4..])
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
fn save_diagram(project_path: String, diagram_json: String) -> Result<(), String> {
    let mut path = PathBuf::from(project_path);
    path.push("diagram.json");

    fs::write(path, diagram_json).map_err(|e| e.to_string())
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

#[tauri::command]
fn save_sketch(project_path: String, sketch_code: String) -> Result<(), String> {
    let mut path = PathBuf::from(project_path);
    path.push("sketch.ino");

    fs::write(path, sketch_code).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_diagram(project_path: String) -> Result<String, String> {
    let mut path = PathBuf::from(project_path);
    path.push("diagram.json");

    fs::read_to_string(path).map_err(|e| e.to_string())
}

#[tauri::command]
async fn compile_sketch(
    app_handle: tauri::AppHandle,
    sketch_path: String,
    _board_fqbn: String,
) -> Result<String, String> {
    let resource_dir = app_handle
        .path()
        .resource_dir()
        .map_err(|e| e.to_string())?;

    let resource_dir = clean_path(resource_dir);
    let sketch_path = clean_path(sketch_path);

    let toolchain_bin = resource_dir.join("resources").join("avr-toolchain").join("bin");

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

    let arduino_core = resource_dir.join("resources").join("arduino-core");
    let arduino_variants = resource_dir.join("resources").join("arduino-variants").join("standard");

    // Check if toolchain exists
    if !avr_gcc.exists() {
        return Err(format!("avr-gcc not found at {}", avr_gcc.display()));
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
                        .arg("-mmcu=atmega328p")
                        .arg("-DF_CPU=16000000L")
                        .arg("-DARDUINO=10810")
                        .arg("-DARDUINO_AVR_UNO")
                        .arg("-DARDUINO_ARCH_AVR")
                        .arg(format!("-I{}", arduino_core.display()))
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

    // 2. Compile Sketch
    let compile_output = Command::new(&avr_gxx)
        .arg("-c")
        .arg("-g")
        .arg("-Os")
        .arg("-ffunction-sections")
        .arg("-fdata-sections")
        .arg("-mmcu=atmega328p")
        .arg("-DF_CPU=16000000L")
        .arg("-DARDUINO=10810")
        .arg("-DARDUINO_AVR_UNO")
        .arg("-DARDUINO_ARCH_AVR")
        .arg(format!("-I{}", arduino_core.display()))
        .arg(format!("-I{}", arduino_variants.display()))
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
        .arg("-mmcu=atmega328p")
        .arg("-Wl,--gc-sections")
        .arg("-o")
        .arg(&output_elf)
        .arg(&sketch_obj);

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
    _board_fqbn: String,
) -> Result<(), String> {
    let resource_dir = app_handle
        .path()
        .resource_dir()
        .map_err(|e| e.to_string())?;

    let resource_dir = clean_path(resource_dir);
    let hex_path = clean_path(hex_path);

    let toolchain_bin = resource_dir.join("resources").join("avr-toolchain").join("bin");

    #[cfg(windows)]
    let avrdude = toolchain_bin.join("avrdude.exe");
    #[cfg(not(windows))]
    let avrdude = toolchain_bin.join("avrdude");

    // avrdude.conf is usually bundled in the same bin folder or etc/
    let mut avrdude_conf = toolchain_bin.join("avrdude.conf");
    if !avrdude_conf.exists() {
        // Fallback to etc/avrdude.conf if not in bin
        avrdude_conf = toolchain_bin.parent().unwrap().join("etc").join("avrdude.conf");
    }

    if !avrdude.exists() {
        return Err(format!("avrdude not found at {}", avrdude.display()));
    }

    // For now, we hardcode Uno parameters (atmega328p, arduino programmer, 115200 baud)
    // In the future, these would be derived from board_fqbn.
    let mut cmd = Command::new(&avrdude);
    cmd.arg("-C")
        .arg(&avrdude_conf)
        .arg("-v")
        .arg("-patmega328p")
        .arg("-carduino")
        .arg(format!("-P{}", port))
        .arg("-b115200")
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            save_diagram,
            save_sketch,
            load_diagram,
            compile_sketch,
            upload_hex,
            get_playground_path,
            list_serial_ports
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
