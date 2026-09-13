import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectManager } from './ProjectManager';
import { ProjectService } from './project-service';
import { SystemApi } from '../infrastructure/tauri/system-api';

vi.mock('./project-service');
vi.mock('../infrastructure/tauri/system-api');

describe('ProjectManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new project', async () => {
    vi.mocked(ProjectService.createNewProject).mockResolvedValue('/path/to/project');
    vi.mocked(ProjectService.loadProject).mockResolvedValue({ version: 1, components: [], connections: [], nets: [] });
    vi.mocked(ProjectService.loadProjectFiles).mockResolvedValue([{ name: 'sketch.ino', content: '' }]);
    vi.mocked(ProjectService.loadProjectMetadata).mockResolvedValue({ name: 'Test Project', activeFileIndex: 0 });

    const state = await ProjectManager.create('Test Project');

    expect(state.path).toBe('/path/to/project');
    expect(state.name).toBe('Test Project');
    expect(ProjectService.createNewProject).toHaveBeenCalledWith('Test Project');
  });

  it('should open a project by path', async () => {
    vi.mocked(ProjectService.loadProject).mockResolvedValue({ version: 1, components: [], connections: [], nets: [] });
    vi.mocked(ProjectService.loadProjectFiles).mockResolvedValue([{ name: 'sketch.ino', content: '' }]);
    vi.mocked(ProjectService.loadProjectMetadata).mockResolvedValue({ name: 'Opened Project', activeFileIndex: 1 });

    const state = await ProjectManager.open('/path/to/existing');

    expect(state.path).toBe('/path/to/existing');
    expect(state.name).toBe('Opened Project');
    expect(state.activeFileIndex).toBe(1);
    expect(ProjectService.addRecentProject).toHaveBeenCalledWith('/path/to/existing');
  });

  it('should open a project via dialog if no path provided', async () => {
    vi.mocked(SystemApi.openDirectoryDialog).mockResolvedValue('/dialog/path');
    vi.mocked(ProjectService.loadProject).mockResolvedValue({ version: 1, components: [], connections: [], nets: [] });
    vi.mocked(ProjectService.loadProjectFiles).mockResolvedValue([]);
    vi.mocked(ProjectService.loadProjectMetadata).mockResolvedValue({ name: 'Dialog Project' });

    const state = await ProjectManager.open();

    expect(state.path).toBe('/dialog/path');
    expect(state.name).toBe('Dialog Project');
    expect(SystemApi.openDirectoryDialog).toHaveBeenCalled();
  });

  it('should save a project at its current path', async () => {
    const state: any = {
      path: '/path/to/project',
      name: 'Test Project',
      files: [{ name: 'sketch.ino', content: 'void setup() {}' }],
      circuit: { version: 1, components: [], connections: [], nets: [] },
      activeFileIndex: 0,
      status: 'ready'
    };

    const saved = await ProjectManager.save(state);

    expect(saved).toEqual(state);
    expect(ProjectService.saveFullProject).toHaveBeenCalledWith('/path/to/project', state.circuit, state.files);
    expect(ProjectService.saveProjectMetadata).toHaveBeenCalled();
    expect(ProjectService.addRecentProject).toHaveBeenCalledWith('/path/to/project');
  });

  it('should saveAs to a new path', async () => {
    vi.mocked(SystemApi.openDirectoryDialog).mockResolvedValue('/new/path');
    const state: any = {
      path: '/old/path',
      name: 'old',
      files: [],
      circuit: { version: 1, components: [], connections: [], nets: [] },
      activeFileIndex: 0,
      status: 'ready'
    };

    const newState = await ProjectManager.saveAs(state);

    expect(newState.path).toBe('/new/path');
    expect(ProjectService.saveFullProject).toHaveBeenCalledWith('/new/path', state.circuit, state.files);
    expect(ProjectService.addRecentProject).toHaveBeenCalledWith('/new/path');
  });

  it('should rename a project', async () => {
    vi.mocked(ProjectService.renameProject).mockResolvedValue('/path/to/renamed');

    const newPath = await ProjectManager.rename('/path/to/project', 'New Name');

    expect(newPath).toBe('/path/to/renamed');
    expect(ProjectService.renameProject).toHaveBeenCalledWith('/path/to/project', 'New Name');
  });

  it('should delete a project', async () => {
    await ProjectManager.delete('/path/to/project');
    expect(ProjectService.deleteProject).toHaveBeenCalledWith('/path/to/project');
  });

  it('should close a project', async () => {
    // Current close is mostly a placeholder, but we test it exists
    await expect(ProjectManager.close()).resolves.toBeUndefined();
  });

  it('should reopen a project (open with path)', async () => {
    vi.mocked(ProjectService.loadProject).mockResolvedValue({ version: 1, components: [], connections: [], nets: [] });
    vi.mocked(ProjectService.loadProjectFiles).mockResolvedValue([]);
    vi.mocked(ProjectService.loadProjectMetadata).mockResolvedValue({ name: 'Recent Project' });

    const state = await ProjectManager.open('/some/recent/path');

    expect(state.path).toBe('/some/recent/path');
    expect(ProjectService.loadProject).toHaveBeenCalledWith('/some/recent/path');
  });

  it('should handle project loading corruption', async () => {
    const corruptionError = JSON.stringify({
      type: 'CORRUPTION',
      file: 'circuit.json',
      message: 'Unexpected token }'
    });
    vi.mocked(ProjectService.loadProject).mockRejectedValue(corruptionError);

    await expect(ProjectManager.open('/corrupt/path')).rejects.toBe(corruptionError);
  });
});
