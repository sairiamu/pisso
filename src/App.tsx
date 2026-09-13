import React, { useState, useEffect, useRef, useCallback } from "react";
import { ProjectManager, ProjectState, ProjectStatus } from "./application/ProjectManager";
import { CanvasShell, CanvasShellHandle } from "./canvas/CanvasShell";
import { BoardInfo } from "./domain/models";
import { AppShell, AppView } from "./canvas/AppShell";
import { AppMode } from "./canvas/ModeSwitcher";
import { ToolBox } from "./canvas/ToolBox";
import { CodeEditor } from "./components/CodeEditor";
import { EditorTabs } from "./canvas/EditorTabs";
import { useSimulation } from "./simulator/SimulationContext";
import { useCircuit } from "./domain/CircuitContext";
import { Dashboard } from "./views/Dashboard";
import { AIView } from "./views/AI";
import { ClassesView } from "./views/Classes";
import { SavedView } from "./views/Saved";
import { ProfileView } from "./views/Profile";
import { LibrariesView } from "./views/Libraries";
import { ComponentLab } from "./components/Showcase";
import { X, AlertTriangle } from "lucide-react";
import { COLORS } from "./CONSTANTS/colors";
import { Diagnostic } from "./domain/models";

export interface FileEntry {
  name: string;
  content: string;
}

export interface ProjectDiagnostic {
  type: string;
  file: string;
  message: string;
  current?: number;
  required?: number;
}

function formatError(e: any): React.ReactNode {
  const message = e instanceof Error ? e.message : String(e);
  try {
    const diagnostic = JSON.parse(message) as ProjectDiagnostic;
    if (diagnostic && diagnostic.type) {
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
  } catch (err) {}
  return message;
}

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

function App() {
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

  const lastSavedState = useRef<{ circuit: string, files: string }>({ circuit: '', files: '' });

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

  useEffect(() => {
    if (boards.length > 0) {
      if (!selectedBoardId || !boards.find(b => b.id === selectedBoardId)) {
        setSelectedBoardId(boards[0].id);
      }
    } else {
      setSelectedBoardId(null);
    }
  }, [boards, selectedBoardId]);

  const activeFile = files[activeFileIndex] || files[0];

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

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Ignore ResizeObserver loop limit errors
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

  const handleNewProject = async (name: string) => {
    setStatus("loading");
    try {
      const state = await ProjectManager.create(name);

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

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim()) {
      const name = projectName.trim();
      setIsNaming(false);
      setProjectName("");
      handleNewProject(name);
    }
  };

  const handleSave = async () => {
    if (!canvasRef.current) return;
    setStatus("saving");
    try {
      const currentState: ProjectState = {
        path: projectPath,
        name: projectName || projectPath?.split(/[/\\]/).pop() || "Untitled",
        files,
        circuit,
        activeFileIndex,
        autoInstallDependencies,
        status: "saving"
      };

      const savedState = await ProjectManager.save(currentState);

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
      console.error("Project save error:", e);
      return false;
    }
  };

  const handleSaveAs = async () => {
    if (!canvasRef.current) return;
    const oldStatus = status;
    setStatus("saving");
    try {
      const currentState: ProjectState = {
        path: projectPath,
        name: projectName || projectPath?.split(/[/\\]/).pop() || "Untitled",
        files,
        circuit,
        activeFileIndex,
        autoInstallDependencies,
        status: "saving"
      };

      const savedState = await ProjectManager.saveAs(currentState);

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
      const state = await ProjectManager.open(path);

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
    await ProjectManager.close();
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

  const handleDiscardChanges = async () => {
    await forceCloseProject();
  };

  const handleSaveAndClose = async () => {
    const success = await handleSave();
    if (success) {
      await forceCloseProject();
    }
  };

  const handleAddPart = useCallback((type: string) => {
    console.log("App: Adding part", type);
    setDebugStatus(`Adding ${type}...`);

    // Default position
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

    // 1. Find the file index
    const fileName = diag.file.split(/[/\\]/).pop();
    const index = files.findIndex(f => f.name === fileName);

    if (index !== -1) {
      setActiveFileIndex(index);
      setEditorLocation({ line: diag.line, column: diag.column });
      setView("workspace");
      setMode("code");

      // Clear location after a short delay so clicking the same error again triggers a re-scroll
      setTimeout(() => setEditorLocation(undefined), 100);
    }
  }, [files]);

  if (status === "error") {
    return (
      <div style={{
        backgroundColor: COLORS.GRAPHITE_900,
        color: COLORS.WARM_WHITE,
        padding: "40px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif"
      }}>
        <div style={{
          backgroundColor: COLORS.GRAPHITE_700,
          border: `1px solid ${COLORS.FAULT_RED}`,
          borderRadius: "12px",
          padding: "32px",
          maxWidth: "600px",
          width: "100%",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
        }}>
          <h1 style={{ color: COLORS.FAULT_RED, marginTop: 0, display: "flex", alignItems: "center", gap: "12px" }}>
            <AlertTriangle size={32} /> Runtime Error
          </h1>
          <div style={{
            backgroundColor: COLORS.GRAPHITE_900,
            padding: "16px",
            borderRadius: "6px",
            border: `1px solid ${COLORS.GRAPHITE_500}`,
            marginBottom: "24px",
            overflow: "auto",
            maxHeight: "300px"
          }}>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{errorContent}</pre>
          </div>
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              onClick={() => {
                setStatus("closed");
                setErrorContent(null);
                setView("dashboard");
              }}
              style={{
                backgroundColor: COLORS.GRAPHITE_500,
                color: COLORS.WARM_WHITE,
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: COLORS.SOLDER_COPPER,
                color: COLORS.WARM_WHITE,
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      </div>
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
    >
      {isClosingDirty && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 30000
        }}>
          <div style={{
            backgroundColor: COLORS.GRAPHITE_700,
            border: `1px solid ${COLORS.GRAPHITE_500}`,
            borderRadius: "12px",
            padding: "32px",
            width: "450px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
          }}>
            <h2 style={{ color: COLORS.WARM_WHITE, marginTop: 0, marginBottom: "16px" }}>Unsaved Changes</h2>
            <p style={{ color: COLORS.FOG, lineHeight: 1.5, marginBottom: "24px" }}>
              Project "{projectName}" has unsaved changes. Do you want to save them before closing?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                onClick={handleSaveAndClose}
                style={{
                  backgroundColor: COLORS.SOLDER_COPPER,
                  color: COLORS.WARM_WHITE,
                  border: "none",
                  padding: "12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                Save and Close
              </button>
              <button
                onClick={handleDiscardChanges}
                style={{
                  backgroundColor: "transparent",
                  color: COLORS.FAULT_RED,
                  border: `1px solid ${COLORS.FAULT_RED}`,
                  padding: "12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                Discard Changes
              </button>
              <button
                onClick={() => setIsClosingDirty(false)}
                style={{
                  backgroundColor: "transparent",
                  color: COLORS.FOG,
                  border: `1px solid ${COLORS.GRAPHITE_500}`,
                  padding: "12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isNaming && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 20000
        }}>
          <div style={{
            backgroundColor: COLORS.GRAPHITE_700,
            border: `1px solid ${COLORS.GRAPHITE_500}`,
            borderRadius: "12px",
            padding: "32px",
            width: "400px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            position: "relative"
          }}>
            <button
              onClick={() => setIsNaming(false)}
              style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: COLORS.FOG }}
            >
              <X size={20} />
            </button>
            <h2 style={{ color: COLORS.WARM_WHITE, marginTop: 0, marginBottom: "24px" }}>New Project</h2>
            <form onSubmit={handleCreateProjectSubmit}>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", color: COLORS.FOG, fontSize: "12px", marginBottom: "8px" }}>PROJECT NAME</label>
                <input
                  autoFocus
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="My Awesome Project"
                  style={{
                    width: "100%",
                    backgroundColor: COLORS.GRAPHITE_900,
                    border: `1px solid ${COLORS.GRAPHITE_500}`,
                    borderRadius: "6px",
                    padding: "12px",
                    color: COLORS.WARM_WHITE,
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setIsNaming(false)}
                  style={{
                    backgroundColor: "transparent",
                    color: COLORS.WARM_WHITE,
                    border: `1px solid ${COLORS.GRAPHITE_500}`,
                    padding: "10px 20px",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!projectName.trim()}
                  style={{
                    backgroundColor: COLORS.SOLDER_COPPER,
                    color: COLORS.WARM_WHITE,
                    border: "none",
                    padding: "10px 24px",
                    borderRadius: "6px",
                    cursor: projectName.trim() ? "pointer" : "default",
                    fontWeight: 600,
                    opacity: projectName.trim() ? 1 : 0.5
                  }}
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {debugStatus && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 10000, background: 'black', color: 'white', padding: '8px 16px', borderRadius: 20, border: '1px solid #C97A4B' }}>
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
           <div className="spinner" style={{
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

      {/* Dashboard View */}
      {view === "dashboard" && (
        <Dashboard
          onNewProject={() => setIsNaming(true)}
          onOpenProject={handleOpen}
          onSaveProject={handleSave}
          onSaveProjectAs={handleSaveAs}
          onCloseProject={handleCloseProject}
          onSelectView={setView}
          onSelectMode={setMode}
          status={status}
        />
      )}

      {/* Saved View */}
      {view === "saved" && <SavedView onOpenProject={handleOpen} />}

      {/* AI View */}
      {view === "ai" && <AIView />}

      {/* Classes View */}
      {view === "classes" && <ClassesView />}

      {/* Profile View */}
      {view === "profile" && <ProfileView />}

      {/* Libraries View */}
      {view === "libraries" && (
        <LibrariesView
          projectPath={projectPath}
          boards={boards}
          selectedBoardId={selectedBoardId}
          autoInstallDependencies={autoInstallDependencies}
          onAutoInstallChange={setAutoInstallDependencies}
        />
      )}

      {/* Component Lab View */}
      {view === "component-lab" && <ComponentLab />}

      {/* Design Mode Content - Only visible in Workspace */}
      <div
        style={{
          display: (view === "workspace" && mode === "design") ? "flex" : "none",
          height: "100%",
          width: "100%",
          position: "relative",
          flexDirection: "row"
        }}
      >
        <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
          <CanvasShell ref={canvasRef} onBoardsChange={setBoards} />
          <ToolBox
            onAddPart={handleAddPart}
          />
        </div>
      </div>

      {/* Code Mode Content - Only visible in Workspace */}
      <div
        style={{
          display: (view === "workspace" && mode === "code") ? "flex" : "none",
          height: "100%",
          width: "100%",
          flexDirection: "column",
          position: "relative"
        }}
      >
        <EditorTabs
          projectPath={projectPath}
          files={files}
          activeFileIndex={activeFileIndex}
          autoInstallDependencies={autoInstallDependencies}
          onSelectTab={setActiveFileIndex}
          onAddTab={handleAddTab}
          onCloseTab={handleCloseTab}
          onOutput={appendBuildOutput}
          onBuildResult={setLastBuildResult}
          onCompileSuccess={setLastHex}
          onProjectPathChange={setProjectPath}
          boards={boards}
          selectedBoardId={selectedBoardId}
        />
        <div style={{ flex: 1, minHeight: 0 }}>
          <CodeEditor
            value={activeFile.content}
            onChange={handleCodeChange}
            selectedLocation={editorLocation}
            diagnostics={lastBuildResult?.diagnostics.filter(d => {
              if (!d.file) return false;
              const fileName = d.file.split(/[/\\]/).pop();
              return fileName === activeFile.name;
            })}
          />
        </div>
      </div>
    </AppShell>
  );
}

export default App;
