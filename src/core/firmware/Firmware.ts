import { ProjectFile } from '../project/Project';

export interface Firmware {
  sketchPath: string;
  files: ProjectFile[];
  preprocessedSource?: string;
}

export interface BuildConfiguration {
  boardFqbn: string;
  mcu: string;
  fCpu: string;
  variant: string;
  extraFlags: string[];
  autoInstallDependencies: boolean;
}
