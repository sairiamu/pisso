import { ProjectManager, ProjectState } from '../application/ProjectManager';
import { ProjectState as CoreProjectState } from '../core/project/Project';

export class ProjectService {
  public static async createProject(name: string): Promise<CoreProjectState> {
    return await ProjectManager.create(name);
  }

  public static async openProject(path?: string): Promise<CoreProjectState> {
    return await ProjectManager.open(path);
  }

  public static async saveProject(state: CoreProjectState): Promise<CoreProjectState> {
    return await ProjectManager.save(state as ProjectState);
  }

  public static async saveProjectAs(state: CoreProjectState): Promise<CoreProjectState> {
    return await ProjectManager.saveAs(state as ProjectState);
  }

  public static async closeProject(): Promise<void> {
    await ProjectManager.close();
  }

  public static async getRecentProjects(): Promise<string[]> {
    return await ProjectManager.getRecentProjects();
  }

  public static async listProjects(): Promise<string[]> {
    return await ProjectManager.listProjects();
  }
}
