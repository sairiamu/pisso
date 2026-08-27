use std::fs;
use std::path::PathBuf;
use std::process::Command;
use tauri::Manager;

#[tauri::command]
fn save_diagram(project_path: String, diagram_json: String) -> Result<(), String> {
    let mut path = PathBuf::from(project_path);
    path.push("diagram.json");

    fs::write(path, diagram_json).map_err(|e| e.to_string())
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

    let toolchain_bin = resource_dir.join("resources").join("avr-toolchain").join("bin");

    #[cfg(windows)]
    let avr_gcc = toolchain_bin.join("avr-gcc.exe");
    #[cfg(not(windows))]
    let avr_gcc = toolchain_bin.join("avr-gcc");

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

    let output_elf = PathBuf::from(&sketch_path).with_extension("elf");
    let output_hex = PathBuf::from(&sketch_path).with_extension("hex");

    // Simplified compilation command
    // Note: A real Arduino compilation would compile the core to a library first.
    // This command is a starting point that invokes the bundled avr-gcc sidecar.
    let compile_output = Command::new(&avr_gcc)
        .arg("-g")
        .arg("-Os")
        .arg("-mmcu=atmega328p")
        .arg("-DF_CPU=16000000L")
        .arg("-DARDUINO=10810")
        .arg("-DARDUINO_AVR_UNO")
        .arg("-DARDUINO_ARCH_AVR")
        .arg(format!("-I{}", arduino_core.display()))
        .arg(format!("-I{}", arduino_variants.display()))
        .arg("-o")
        .arg(&output_elf)
        .arg(&sketch_path)
        .output()
        .map_err(|e| format!("Failed to execute avr-gcc: {}", e))?;

    if !compile_output.status.success() {
        return Err(String::from_utf8_lossy(&compile_output.stderr).to_string());
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

    Ok(output_hex.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![save_diagram, load_diagram, compile_sketch])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
