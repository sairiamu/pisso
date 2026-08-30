import { invoke } from "@tauri-apps/api/core";
import { Diagram } from "./types";
import { save } from "./save";
import { load } from "./load";

export interface ProjectFile {
  name: string;
  content: string;
}

/**
 * Records a project path as recently used (called after a successful
 * save or open). Safe to call even if it fails — recency tracking should
 * never block the user's actual save/open action.
 */
export async function addRecentProject(projectPath: string): Promise<void> {
  try {
    await invoke("add_recent_project", { projectPath });
  } catch (err) {
    console.warn("Failed to record recent project:", err);
  }
}

/**
 * Returns recently opened/saved project paths, most recent first, with
 * any paths that no longer exist on disk already filtered out.
 */
export async function getRecentProjects(): Promise<string[]> {
  return await invoke<string[]>("get_recent_projects");
}

/**
 * Saves the entire project (diagram and code files) in a single operation.
 */
export async function saveFullProject(
  projectPath: string,
  diagram: Diagram,
  files: ProjectFile[]
): Promise<void> {
  const serialized = save(diagram);
  const diagramJson = JSON.stringify(serialized, null, 2);
  await invoke("save_full_project", { projectPath, diagramJson, files });
}

/**
 * Saves the current diagram state to design/diagram.json in the specified project directory.
 */
export async function saveProject(projectPath: string, diagram: Diagram): Promise<void> {
  const serialized = save(diagram);
  const jsonString = JSON.stringify(serialized, null, 2);
  await invoke("save_diagram", { projectPath, diagramJson: jsonString });
}

/**
 * Saves all code files to the code/ directory in the specified project directory.
 */
export async function saveProjectFiles(projectPath: string, files: ProjectFile[]): Promise<void> {
  await invoke("save_project_files", { projectPath, files });
}

/**
 * Loads the diagram state from design/diagram.json in the specified project directory.
 */
export async function loadProject(projectPath: string): Promise<Diagram> {
  const jsonString = await invoke<string>("load_diagram", { projectPath });
  const data = JSON.parse(jsonString);
  return load(data);
}

/**
 * Loads all code files from the code/ directory in the specified project directory.
 */
export async function loadProjectFiles(projectPath: string): Promise<ProjectFile[]> {
  return await invoke<ProjectFile[]>("load_project_files", { projectPath });
}

/**
 * Saves project metadata (e.g., active file index) to project.json.
 */
export async function saveProjectMetadata(projectPath: string, metadata: any): Promise<void> {
  const jsonString = JSON.stringify(metadata, null, 2);
  await invoke("save_project_metadata", { projectPath, metadataJson: jsonString });
}

/**
 * Loads project metadata from project.json.
 */
export async function loadProjectMetadata(projectPath: string): Promise<any> {
  const jsonString = await invoke<string>("load_project_metadata", { projectPath });
  return JSON.parse(jsonString);
}
