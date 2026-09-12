import { ProjectService } from "./project-service";
import { SystemApi } from "../infrastructure/tauri/system-api";
import { Circuit, ProjectFile } from "../domain/models";

export type ProjectStatus = "closed" | "loading" | "ready" | "dirty" | "saving" | "error";

export interface ProjectState {
  path: string | null;
  name: string;
  files: ProjectFile[];
  circuit: Circuit;
  activeFileIndex: number;
  status: ProjectStatus;
  error?: string;
}

/**
 * ProjectManager is responsible for high-level project operations:
 * create, open, save, saveAs, close, rename, delete.
 *
 * It orchestrates between the persistence layer (ProjectService)
 * and the system dialogs (SystemApi).
 */
export const ProjectManager = {
  async create(name: string): Promise<ProjectState> {
    const path = await ProjectService.createNewProject(name);
    const circuit = await ProjectService.loadProject(path);
    const files = await ProjectService.loadProjectFiles(path);
    const metadata = await ProjectService.loadProjectMetadata(path);

    return {
      path,
      name: metadata?.name || name,
      files,
      circuit,
      activeFileIndex: metadata?.activeFileIndex ?? 0
    };
  },

  async open(path?: string): Promise<ProjectState> {
    let selected: string | null = null;

    if (path) {
      selected = path;
    } else {
      let defaultPath: string | undefined;
      try {
        defaultPath = await ProjectService.getProjectsPath();
      } catch (e) {}

      selected = await SystemApi.openDirectoryDialog(
        defaultPath,
        "Open Project Folder"
      );
    }

    if (!selected) {
      throw new Error("No project selected");
    }

    const circuit = await ProjectService.loadProject(selected);
    const files = await ProjectService.loadProjectFiles(selected);
    const metadata = await ProjectService.loadProjectMetadata(selected);
    await ProjectService.addRecentProject(selected);

    return {
      path: selected,
      name: metadata?.name || selected.split(/[\\/]/).pop() || "Untitled",
      files,
      circuit,
      activeFileIndex: metadata?.activeFileIndex ?? 0
    };
  },

  async save(state: ProjectState): Promise<ProjectState> {
    let currentPath = state.path;

    if (!currentPath) {
      return await this.saveAs(state);
    }

    await ProjectService.saveFullProject(currentPath, state.circuit, state.files);
    await ProjectService.addRecentProject(currentPath);

    const metadata = {
      schemaVersion: 1,
      name: state.name,
      activeFileIndex: state.activeFileIndex
    };
    await ProjectService.saveProjectMetadata(currentPath, metadata);

    return state;
  },

  async saveAs(state: ProjectState): Promise<ProjectState> {
    let defaultPath: string | undefined;
    try {
      defaultPath = await ProjectService.getProjectsPath();
    } catch (e) {}

    const selected = await SystemApi.openDirectoryDialog(
      defaultPath,
      "Select Folder to Save Project"
    );

    if (!selected) {
      throw new Error("Save As cancelled");
    }

    const newState = { ...state, path: selected };
    // Update name based on new path if not explicitly changed
    if (newState.name === state.path?.split(/[\\/]/).pop()) {
        newState.name = selected.split(/[\\/]/).pop() || newState.name;
    }

    return await this.save(newState);
  },

  async close(): Promise<void> {
    // Current project context cleanup can go here
    // In a more complex app, this might involve clearing global caches,
    // stopping watchers, etc.
  },

  async rename(path: string, newName: string): Promise<string> {
    return await ProjectService.renameProject(path, newName);
  },

  async delete(path: string): Promise<void> {
    await ProjectService.deleteProject(path);
  },

  async getRecentProjects(): Promise<string[]> {
    return await ProjectService.getRecentProjects();
  },

  async listProjects(): Promise<string[]> {
    return await ProjectService.listProjects();
  },

  async getProjectsPath(): Promise<string> {
    return await ProjectService.getProjectsPath();
  },

  async getPlaygroundPath(): Promise<string> {
    return await ProjectService.getPlaygroundPath();
  }
};
