use std::fs;
use std::path::PathBuf;

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![save_diagram, load_diagram])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
