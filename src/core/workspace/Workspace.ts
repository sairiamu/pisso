import { AppView } from '../../canvas/AppShell';
import { AppMode } from '../../canvas/ModeSwitcher';
import { ProjectFile } from '../project/Project';
import { BoardInfo } from '../devices/Device';

export interface Workspace {
  projectPath: string | null;
  projectName: string;
  view: AppView;
  mode: AppMode;
  files: ProjectFile[];
  activeFileIndex: number;
  boards: BoardInfo[];
  selectedBoardId: string | null;
  debugStatus: string;
}
