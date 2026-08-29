import { invoke } from "@tauri-apps/api/core";
import { Diagram } from "./types";
import { save } from "./save";
import { load } from "./load";

/**
 * Saves the current diagram state to a file named diagram.json in the specified project directory.
 */
export async function saveProject(projectPath: string, diagram: Diagram): Promise<void> {
  const serialized = save(diagram);
  const jsonString = JSON.stringify(serialized, null, 2);
  await invoke("save_diagram", { projectPath, diagramJson: jsonString });
}

/**
 * Loads the diagram state from a diagram.json file in the specified project directory.
 */
export async function loadProject(projectPath: string): Promise<Diagram> {
  const jsonString = await invoke<string>("load_diagram", { projectPath });
  const data = JSON.parse(jsonString);
  return load(data);
}
