export interface Diagnostic {
  severity: 'error' | 'warning' | 'info';
  message: string;
  file?: string;
  line?: number;
  column?: number;
  code?: string;
  library?: string;
  stage?: string;
  reason?: string;
  details?: string;
  suggestion?: string;
  partId?: string;
  pin?: string;
  connectionId?: string;
}

export interface ProjectDiagnostic {
  type: string;
  file: string;
  message: string;
  current?: number;
  required?: number;
}

export interface BuildResult {
  status: 'success' | 'failed' | 'error';
  hex?: string;
  flashUsed?: number;
  ramUsed?: number;
  stdout: string;
  stderr: string;
  output: string;
  diagnostics: Diagnostic[];
  timestamp: number;
}
