import { Circuit } from "../domain/models";
import { serializeCircuit, deserializeCircuit } from "../domain/serialization";
import { ProjectApi, ProjectFile } from "../infrastructure/tauri/project-api";

export const ProjectService = {
  async addRecentProject(projectPath: string): Promise<void> {
    try {
      await ProjectApi.addRecentProject(projectPath);
    } catch (err) {
      console.warn("Failed to record recent project:", err);
    }
  },

  async getRecentProjects(): Promise<string[]> {
    return await ProjectApi.getRecentProjects();
  },

  async saveFullProject(
    projectPath: string,
    circuit: Circuit,
    files: ProjectFile[]
  ): Promise<void> {
    const serialized = serializeCircuit(circuit);
    const diagramJson = JSON.stringify(serialized, null, 2);
    await ProjectApi.saveFullProject(projectPath, diagramJson, files);
  },

  async saveProject(projectPath: string, circuit: Circuit): Promise<void> {
    const serialized = serializeCircuit(circuit);
    const jsonString = JSON.stringify(serialized, null, 2);
    await ProjectApi.saveDiagram(projectPath, jsonString);
  },

  async saveProjectFiles(projectPath: string, files: ProjectFile[]): Promise<void> {
    await ProjectApi.saveProjectFiles(projectPath, files);
  },

  async loadProject(projectPath: string): Promise<Circuit> {
    const jsonString = await ProjectApi.loadDiagram(projectPath);
    const data = JSON.parse(jsonString);
    return deserializeCircuit(data);
  },

  async loadProjectFiles(projectPath: string): Promise<ProjectFile[]> {
    return await ProjectApi.loadProjectFiles(projectPath);
  },

  async saveProjectMetadata(projectPath: string, metadata: any): Promise<void> {
    const jsonString = JSON.stringify(metadata, null, 2);
    await ProjectApi.saveMetadata(projectPath, jsonString);
  },

  async loadProjectMetadata(projectPath: string): Promise<any> {
    const jsonString = await ProjectApi.loadMetadata(projectPath);
    return JSON.parse(jsonString);
  },

  async getPlaygroundPath(): Promise<string> {
    return await ProjectApi.getPlaygroundPath();
  },

  async createNewProject(name: string): Promise<string> {
    return await ProjectApi.createNewProject(name);
  },

  async getProjectsPath(): Promise<string> {
    return await ProjectApi.getProjectsPath();
  },

  async listProjects(): Promise<string[]> {
    return await ProjectApi.listProjects();
  }
};
