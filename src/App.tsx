import { useState, useEffect, useRef, useCallback } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { CanvasShell, CanvasShellHandle, BoardInfo } from "./canvas/CanvasShell";
import { AppShell, AppView } from "./canvas/AppShell";
import { AppMode } from "./canvas/ModeSwitcher";
import {
  loadProject,
  loadProjectFiles,
  saveProjectMetadata,
  loadProjectMetadata,
  saveFullProject,
  addRecentProject
} from "./diagram";
import { ToolBox } from "./canvas/ToolBox";
import { CodeEditor } from "./components/CodeEditor";
import { EditorTabs } from "./canvas/EditorTabs";
import { useSimulation } from "./simulator/SimulationContext";
import { Dashboard } from "./views/Dashboard";
import { AIView } from "./views/AI";
import { ClassesView } from "./views/Classes";
import { SavedView } from "./views/Saved";
import { ProfileView } from "./views/Profile";
import { X } from "lucide-react";
import { COLORS } from "./CONSTANTS/colors";

export interface FileEntry {
  name: string;
  content: string;
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
  const [error, setError] = useState<string | null>(null);
  const [projectPath, setProjectPath] = useState<string | null>(null);
  const [view, setView] = useState<AppView>("dashboard");
  const [files, setFiles] = useState<FileEntry[]>([
    { name: "sketch.ino", content: INITIAL_CODE }
  ]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const { isSimulating, setIsSimulating, appendBuildOutput } = useSimulation();
  const [lastHex, setLastHex] = useState<string | null>(null);
  const [mode, setMode] = useState<AppMode>("design");
  const [debugStatus, setDebugStatus] = useState<string>("");
  const [isNaming, setIsNaming] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [isProjectActive, setIsProjectActive] = useState(false);
  const [boards, setBoards] = useState<BoardInfo[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const canvasRef = useRef<CanvasShellHandle>(null);

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
      // Ignore ResizeObserver loop limit errors, which are generally harmless
      // but triggered by components like CodeMirror or XYFlow during layout.
      if (event.message === "ResizeObserver loop completed with undelivered notifications." ||
          event.message === "ResizeObserver loop limit exceeded") {
        return;
      }
      setError(event.message);
    };
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  const handleNewProject = async (name: string) => {
    try {
      const newProjectPath = await invoke<string>("create_new_project", { name });

      setProjectPath(newProjectPath);
      setFiles([{ name: "sketch.ino", content: INITIAL_CODE }]);
      setActiveFileIndex(0);
      setIsProjectActive(true);
      setView("workspace");
      setMode("design");

      setTimeout(() => {
        canvasRef.current?.setDiagram({ version: 1, parts: [], connections: [] });
      }, 50);

      setDebugStatus(`Project "${name}" created`);
      setTimeout(() => setDebugStatus(""), 2000);
    } catch (e) {
      setError(`Failed to create project: ${e}`);
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
    let currentPath = projectPath;

    if (!currentPath) {
      let defaultPath: string | undefined;
      try {
        defaultPath = await invoke<string>("get_projects_path");
      } catch (e) {}

      const selected = await open({
        directory: true,
        multiple: false,
        defaultPath,
        title: "Select Folder to Save Project"
      });
      if (selected && typeof selected === 'string') {
        currentPath = selected;
        setProjectPath(selected);
      } else {
        return; // User cancelled
      }
    }

    if (!canvasRef.current) return;
    try {
      const diagram = canvasRef.current.getDiagram();

      // Save everything (Design + Code) in one atomic-like operation
      await saveFullProject(currentPath, diagram, files);

      await addRecentProject(currentPath);

      // Save metadata separately as it's not core project data
      await saveProjectMetadata(currentPath, { activeFileIndex });

      setDebugStatus("Project saved successfully");
      setTimeout(() => setDebugStatus(""), 2000);
    } catch (e) {
      setError(`Save Failed: ${e}`);
      console.error("Project save error:", e);
    }
  };

  const handleOpen = async (path?: string) => {
    let selected: string | null = null;

    if (path) {
      selected = path;
    } else {
      let defaultPath: string | undefined;
      try {
        defaultPath = await invoke<string>("get_projects_path");
      } catch (e) {}

      const result = await open({
        directory: true,
        multiple: false,
        defaultPath,
        title: "Open Project Folder"
      });
      if (result && typeof result === 'string') {
        selected = result;
      }
    }

    if (selected) {
      try {
        const diagram = await loadProject(selected);
        const projectFiles = await loadProjectFiles(selected);
        const metadata = await loadProjectMetadata(selected);

        setProjectPath(selected);
        await addRecentProject(selected);
        canvasRef.current?.setDiagram(diagram);

        if (projectFiles.length > 0) {
          setFiles(projectFiles);
          if (metadata && typeof metadata.activeFileIndex === 'number' && metadata.activeFileIndex < projectFiles.length) {
            setActiveFileIndex(metadata.activeFileIndex);
          } else {
            setActiveFileIndex(0);
          }
        }

        setIsProjectActive(true);
        setView("workspace");
        setMode("design"); // Default to design when opening
      } catch (e) {
        setError("Failed to load project: " + e);
      }
    }
  };

  const handleCloseProject = () => {
    setProjectPath(null);
    setIsProjectActive(false);
    canvasRef.current?.setDiagram({ version: 1, parts: [], connections: [] });
    setView("dashboard");
  };

  const handleAddPart = useCallback((type: string) => {
    console.log("App: Adding part", type);
    setDebugStatus(`Adding ${type}...`);
    if (canvasRef.current) {
      canvasRef.current.addPart(type);
      setDebugStatus(`Added ${type}`);
    } else {
      setDebugStatus("Error: canvasRef is null");
    }
    setTimeout(() => setDebugStatus(""), 2000);
  }, []);

  if (error) {
    return (
      <div style={{ backgroundColor: "red", color: "white", padding: 20 }}>
        <h1>Runtime Error</h1>
        <pre>{error}</pre>
        <button onClick={() => setError(null)}>Dismiss</button>
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
      saveDisabled={false}
      lastHex={lastHex}
      isSimulating={isSimulating}
      onSimulateToggle={setIsSimulating}
      projectPath={projectPath}
      isProjectActive={isProjectActive}
      files={files}
      onCompileSuccess={setLastHex}
      boards={boards}
      selectedBoardId={selectedBoardId}
      onSelectBoard={setSelectedBoardId}
      setDebugStatus={setDebugStatus}
    >
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

      {/* Dashboard View */}
      {view === "dashboard" && (
        <Dashboard
          onNewProject={() => setIsNaming(true)}
          onOpenProject={handleOpen}
          onSaveProject={handleSave}
          onCloseProject={handleCloseProject}
          onSelectView={setView}
          onSelectMode={setMode}
          projectPath={projectPath}
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
          onSelectTab={setActiveFileIndex}
          onAddTab={handleAddTab}
          onCloseTab={handleCloseTab}
          onOutput={appendBuildOutput}
          onCompileSuccess={setLastHex}
          onProjectPathChange={setProjectPath}
          boards={boards}
          selectedBoardId={selectedBoardId}
        />
        <div style={{ flex: 1, minHeight: 0 }}>
          <CodeEditor value={activeFile.content} onChange={handleCodeChange} />
        </div>
      </div>
    </AppShell>
  );
}

export default App;
