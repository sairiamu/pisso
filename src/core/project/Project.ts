import { Circuit } from '../circuit/Circuit';

export interface ProjectFile {
  name: string;
  content: string;
}

export type FileEntry = ProjectFile;

export interface LibraryDependency {
  name: string;
  version: string;
  source: 'registry' | 'zip' | 'bundled';
}

export interface Project {
  id: string;
  name: string;
  rootPath: string;
  circuit: Circuit;
  files: ProjectFile[];
  libraries: LibraryDependency[];
  createdAt: number;
  updatedAt: number;
}

export type ProjectStatus = "closed" | "loading" | "ready" | "saving" | "dirty" | "error";

export interface ProjectState {
  path: string | null;
  name: string;
  files: ProjectFile[];
  circuit: Circuit;
  activeFileIndex: number;
  autoInstallDependencies: boolean;
  status: ProjectStatus;
}
