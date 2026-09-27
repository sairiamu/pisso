import { Diagnostic, ProjectDiagnostic } from '../core/diagnostics/Diagnostic';

export class DiagnosticService {
  public static parseDiagnosticJson(message: string): ProjectDiagnostic | null {
    try {
      const diagnostic = JSON.parse(message) as ProjectDiagnostic;
      if (diagnostic && diagnostic.type) {
        return diagnostic;
      }
    } catch (e) {}
    return null;
  }

  public static filterByFile(diagnostics: Diagnostic[], fileName: string): Diagnostic[] {
    return diagnostics.filter(d => {
      if (!d.file) return false;
      const fName = d.file.split(/[/\\]/).pop();
      return fName === fileName;
    });
  }
}
