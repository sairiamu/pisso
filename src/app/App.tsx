import React, { useState, useEffect, useRef, useCallback } from "react";
import { ProjectService } from "../services/ProjectService";
import { DiagnosticService } from "../services/DiagnosticService";
import { AppShell, AppView } from "../ui/layout/AppShell";
import { AppMode } from "../ui/layout/ModeSwitcher";
import { CanvasShellHandle } from "../canvas/CanvasShell";
import { useSimulation } from "../simulator/SimulationContext";
import { useCircuit } from "../domain/CircuitContext";
import { AppRoutes } from "./routes/AppRoutes";
import { NewProjectModal } from "../features/project/NewProjectModal";
import { UnsavedChangesModal } from "../features/project/UnsavedChangesModal";
import { ProjectErrorView } from "../features/project/ProjectErrorView";
import { BoardInfo, FileEntry, Diagnostic, ProjectStatus } from "../core/index";
import { COLORS } from "../CONSTANTS/colors";

const INITIAL_CODE = `#include <Arduino.h>

// Example C++ code for verification
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
  Serial.println("Pulse sent.");
}
`;

export function AppContent() {
  const [status, setStatus] = useState<ProjectStatus>("closed");
  const [errorContent, setErrorContent] = useState<React.ReactNode | null>(null);
  const [projectPath, setProjectPath] = useState<string | null>(null);
  const [view, setView] = useState<AppView>("dashboard");
  const [files, setFiles] = useState<FileEntry[]>([
    { name: "sketch.ino", content: INITIAL_CODE }
  ]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [autoInstallDependencies, setAutoInstallDependencies] = useState(false);
  const { isSimulating, setIsSimulating, appendBuildOutput, setLastBuildResult, lastBuildResult } = useSimulation();
  const { circuit, setCircuit, addComponent, clearCircuit } = useCircuit();
  const [lastHex, setLastHex] = useState<string | null>(null);
  const [mode, setMode] = useState<AppMode>("design");
  const [debugStatus, setDebugStatus] = useState<string>("");
  const [isNaming, setIsNaming] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [boards, setBoards] = useState<BoardInfo[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [isClosingDirty, setIsClosingDirty] = useState(false);
  const [editorLocation, setEditorLocation] = useState<{ line: number; column?: number } | undefined>(undefined);
  const canvasRef = useRef<CanvasShellHandle>(null);

  const lastSavedState = useRef<{ circuit: string; files: string }>({ circuit: '', files: '' });

  const updateLastSaved = useCallback((c: any, f: any) => {
    lastSavedState.current = {
      circuit: JSON.stringify(c),
      files: JSON.stringify(f)
    };
  }, []);

  // Dirty detection
  useEffect(() => {
    if (status === "ready") {
      const currentCircuit = JSON.stringify(circuit);
      const currentFiles = JSON.stringify(files);
      if (currentCircuit !== lastSavedState.current.circuit || currentFiles !== lastSavedState.current.files) {
        setStatus("dirty");
      }
    }
  }, [circuit, files, status]);

  // Board auto-selection
  useEffect(() => {
    if (boards.length > 0) {
      if (!selectedBoardId || !boards.find(b => b.id === selectedBoardId)) {
        setSelectedBoardId(boards[0].id);
      }
    } else {
      setSelectedBoardId(null);
    }
  }, [boards, selectedBoardId]);

  // Error boundary listener
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message === "ResizeObserver loop completed with undelivered notifications." ||
          event.message === "ResizeObserver loop limit exceeded") {
        return;
      }
      setErrorContent(event.message);
      setStatus("error");
    };
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  const handleCodeChange = (newContent: string) => {
    setFiles(prev => prev.map((f, i) =>
      i === activeFileIndex ? { ...f, content: newContent } : f
    ));
  };

  const handleAddTab = () => {
    const newName = `file${files.length}.h`;
    setFiles([...files, { name: newName, content: "// New header file\n" }]);
    setActiveFileIndex(files.length);
  };

  const handleCloseTab = (index: number) => {
    if (files.length <= 1) return;
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    if (activeFileIndex >= newFiles.length) {
      setActiveFileIndex(newFiles.length - 1);
    }
  };

  const formatError = (e: any): React.ReactNode => {
    const message = e instanceof Error ? e.message : String(e);
    const diagnostic = DiagnosticService.parseDiagnosticJson(message);
    if (diagnostic) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontWeight: 700, color: COLORS.SOLDER_COPPER }}>{diagnostic.type.replace('_', ' ')}</div>
          <div style={{ fontSize: '13px' }}>
            <span style={{ opacity: 0.7 }}>File:</span> {diagnostic.file}
          </div>
          <div style={{ fontSize: '13px' }}>
            <span style={{ opacity: 0.7 }}>Error:</span> {diagnostic.message}
          </div>
          {diagnostic.type === 'VERSION_MISMATCH' && (
             <div style={{ fontSize: '12px', marginTop: '4px', color: COLORS.FAULT_RED }}>
               Project version ({diagnostic.current}) is newer than the application supports ({diagnostic.required}).
             </div>
          )}
        </div>
      );
    }
    return message;
  };

  const handleNewProject = async (name: string) => {
    setStatus("loading");
    try {
      const state = await ProjectService.createProject(name);

      setProjectPath(state.path);
      setFiles(state.files);
      setActiveFileIndex(state.activeFileIndex);
      setAutoInstallDependencies(state.autoInstallDependencies);
      setCircuit(state.circuit);
      setProjectName(state.name);

      updateLastSaved(state.circuit, state.files);
      setStatus("ready");
      setView("workspace");
      setMode("design");

      setDebugStatus(`Project "${name}" created`);
      setTimeout(() => setDebugStatus(""), 2000);
    } catch (e) {
      setErrorContent(formatError(e));
      setStatus("error");
    }
  };

  const handleSave = async () => {
    if (!canvasRef.current) return false;
    setStatus("saving");
    try {
      const currentState = {
        path: projectPath,
        name: projectName || projectPath?.split(/[/\\]/).pop() || "Untitled",
        files,
        circuit,
        activeFileIndex,
        autoInstallDependencies,
        status: "saving" as ProjectStatus
      };

      const savedState = await ProjectService.saveProject(currentState);

      setProjectPath(savedState.path);
      setProjectName(savedState.name);

      updateLastSaved(circuit, files);
      setStatus("ready");

      setDebugStatus("Project saved successfully");
      setTimeout(() => setDebugStatus(""), 2000);
      return true;
    } catch (e) {
      if (e instanceof Error && e.message === "Save As cancelled") {
        setStatus("dirty");
        return false;
      }
      setErrorContent(formatError(e));
      setStatus("error");
      return false;
    }
  };

  const handleSaveAs = async () => {
    if (!canvasRef.current) return false;
    const oldStatus = status;
    setStatus("saving");
    try {
      const currentState = {
        path: projectPath,
        name: projectName || projectPath?.split(/[/\\]/).pop() || "Untitled",
        files,
        circuit,
        activeFileIndex,
        autoInstallDependencies,
        status: "saving" as ProjectStatus
      };

      const savedState = await ProjectService.saveProjectAs(currentState);

      setProjectPath(savedState.path);
      setProjectName(savedState.name);

      updateLastSaved(circuit, files);
      setStatus("ready");

      setDebugStatus(`Project saved as "${savedState.name}"`);
      setTimeout(() => setDebugStatus(""), 2000);
      return true;
    } catch (e) {
      if (e instanceof Error && e.message === "Save As cancelled") {
        setStatus(oldStatus);
        return false;
      }
      setErrorContent(formatError(e));
      setStatus("error");
      return false;
    }
  };

  const handleOpen = async (path?: string) => {
    setStatus("loading");
    try {
      const state = await ProjectService.openProject(path);

      setProjectPath(state.path);
      setFiles(state.files);
      setActiveFileIndex(state.activeFileIndex);
      setAutoInstallDependencies(state.autoInstallDependencies);
      setCircuit(state.circuit);
      setProjectName(state.name);

      updateLastSaved(state.circuit, state.files);
      setStatus("ready");
      setView("workspace");
      setMode("design");
    } catch (e) {
      if (e instanceof Error && e.message === "No project selected") {
        setStatus("closed");
        return;
      }
      setErrorContent(formatError(e));
      setStatus("error");
    }
  };

  const forceCloseProject = async () => {
    await ProjectService.closeProject();
    setProjectPath(null);
    setStatus("closed");
    clearCircuit();
    setView("dashboard");
    setIsClosingDirty(false);
  };

  const handleCloseProject = async () => {
    if (status === 'dirty') {
      setIsClosingDirty(true);
      return;
    }
    await forceCloseProject();
  };

  const handleSaveAndClose = async () => {
    const success = await handleSave();
    if (success) {
      await forceCloseProject();
    }
  };

  const handleAddPart = useCallback((type: string) => {
    setDebugStatus(`Adding ${type}...`);
    const pos = {
      x: 150 + (circuit.components.length * 50) % 400,
      y: 150 + (circuit.components.length * 50) % 400
    };
    addComponent(type, pos.x, pos.y);
    setDebugStatus(`Added ${type}`);
    setTimeout(() => setDebugStatus(""), 2000);
  }, [circuit.components.length, addComponent]);

  const handleSelectDiagnostic = useCallback((diag: Diagnostic) => {
    if (!diag.file || !diag.line) return;
    const fileName = diag.file.split(/[/\\]/).pop();
    const index = files.findIndex(f => f.name === fileName);

    if (index !== -1) {
      setActiveFileIndex(index);
      setEditorLocation({ line: diag.line, column: diag.column });
      setView("workspace");
      setMode("code");
      setTimeout(() => setEditorLocation(undefined), 100);
    }
  }, [files]);

  if (status === "error") {
    return (
      <ProjectErrorView
        errorContent={errorContent}
        onBackToDashboard={() => {
          setStatus("closed");
          setErrorContent(null);
          setView("dashboard");
        }}
        onReload={() => window.location.reload()}
      />
    );
  }

  return (
    <AppShell
      view={view}
      onViewChange={setView}
      mode={mode}
      onModeChange={setMode}
      onNewProject={() => setIsNaming(true)}
      onOpenProject={handleOpen}
      onSaveProject={handleSave}
      onCloseProject={handleCloseProject}
      onSelectDiagnostic={handleSelectDiagnostic}
      saveDisabled={status === "saving" || status === "loading" || status === "ready"}
      lastHex={lastHex}
      isSimulating={isSimulating}
      onSimulateToggle={setIsSimulating}
      projectPath={projectPath}
      files={files}
      onCompileSuccess={setLastHex}
      boards={boards}
      selectedBoardId={selectedBoardId}
      onSelectBoard={setSelectedBoardId}
      setDebugStatus={setDebugStatus}
      status={status}
      autoInstallDependencies={autoInstallDependencies}
      circuit={circuit}
    >
      <UnsavedChangesModal
        isOpen={isClosingDirty}
        projectName={projectName}
        onSaveAndClose={handleSaveAndClose}
        onDiscard={forceCloseProject}
        onCancel={() => setIsClosingDirty(false)}
      />

      <NewProjectModal
        isOpen={isNaming}
        onClose={() => setIsNaming(false)}
        onSubmit={handleNewProject}
      />

      {debugStatus && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10000,
          background: 'black',
          color: 'white',
          padding: '8px 16px',
          borderRadius: 20,
          border: `1px solid ${COLORS.SOLDER_COPPER}`
        }}>
          {debugStatus}
        </div>
      )}

      {(status === "loading" || status === "saving") && (
        <div style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: COLORS.GRAPHITE_700,
          color: COLORS.WARM_WHITE,
          padding: "12px 20px",
          borderRadius: "8px",
          border: `1px solid ${COLORS.SOLDER_COPPER}`,
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          gap: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
        }}>
          <div style={{
            width: "16px",
            height: "16px",
            border: `2px solid ${COLORS.FOG}`,
            borderTopColor: COLORS.SOLDER_COPPER,
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          {status === "loading" ? "Loading Project..." : "Saving Changes..."}
        </div>
      )}

      <AppRoutes
        view={view}
        mode={mode}
        projectPath={projectPath}
        files={files}
        activeFileIndex={activeFileIndex}
        autoInstallDependencies={autoInstallDependencies}
        boards={boards}
        selectedBoardId={selectedBoardId}
        editorLocation={editorLocation}
        lastBuildResult={lastBuildResult}
        canvasRef={canvasRef}
        status={status}
        onNewProject={() => setIsNaming(true)}
        onOpenProject={handleOpen}
        onSaveProject={handleSave}
        onSaveProjectAs={handleSaveAs}
        onCloseProject={handleCloseProject}
        onSelectView={setView}
        onSelectMode={setMode}
        onCodeChange={handleCodeChange}
        onSelectTab={setActiveFileIndex}
        onAddTab={handleAddTab}
        onCloseTab={handleCloseTab}
        onOutput={appendBuildOutput}
        onBuildResult={setLastBuildResult}
        onCompileSuccess={setLastHex}
        onProjectPathChange={setProjectPath}
        onBoardsChange={setBoards}
        onAddPart={handleAddPart}
        onAutoInstallChange={setAutoInstallDependencies}
      />
    </AppShell>
  );
}

export default function App() {
  return <AppContent />;
}
