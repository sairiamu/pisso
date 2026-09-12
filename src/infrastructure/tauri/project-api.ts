import { invoke } from "@tauri-apps/api/core";
import { Diagram } from "../../domain/diagram";

export interface ProjectFile {
  name: string;
  content: string;
}

export const ProjectApi = {
  addRecentProject: async (projectPath: string): Promise<void> => {
    await invoke("add_recent_project", { projectPath });
  },

  getRecentProjects: async (): Promise<string[]> => {
    return await invoke<string[]>("get_recent_projects");
  },

  saveFullProject: async (projectPath: string, diagramJson: string, files: ProjectFile[]): Promise<void> => {
    await invoke("save_full_project", { projectPath, diagramJson, files });
  },

  saveDiagram: async (projectPath: string, diagramJson: string): Promise<void> => {
    await invoke("save_diagram", { projectPath, diagramJson });
  },

  saveProjectFiles: async (projectPath: string, files: ProjectFile[]): Promise<void> => {
    await invoke("save_project_files", { projectPath, files });
  },

  loadDiagram: async (projectPath: string): Promise<string> => {
    return await invoke<string>("load_diagram", { projectPath });
  },

  loadProjectFiles: async (projectPath: string): Promise<ProjectFile[]> => {
    return await invoke<ProjectFile[]>("load_project_files", { projectPath });
  },

  saveMetadata: async (projectPath: string, metadataJson: string): Promise<void> => {
    await invoke("save_project_metadata", { projectPath, metadataJson });
  },

  loadMetadata: async (projectPath: string): Promise<string> => {
    return await invoke<string>("load_project_metadata", { projectPath });
  },

  getPlaygroundPath: async (): Promise<string> => {
    return await invoke<string>("get_playground_path");
  },

  createNewProject: async (name: string): Promise<string> => {
    return await invoke<string>("create_new_project", { name });
  },

  getProjectsPath: async (): Promise<string> => {
    return await invoke<string>("get_projects_path");
  },

  listProjects: async (): Promise<string[]> => {
    return await invoke<string[]>("list_projects");
  }
};
