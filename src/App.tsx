import { useState, useEffect, useRef, useCallback } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { CanvasShell, CanvasShellHandle } from "./canvas/CanvasShell";
import { AppShell, AppView } from "./canvas/AppShell";
import { AppMode } from "./canvas/ModeSwitcher";
import { saveProject, loadProject } from "./diagram";
import { ToolBox } from "./canvas/ToolBox";
import { CodeEditor } from "./components/CodeEditor";
import { EditorTabs } from "./canvas/EditorTabs";
import { useSimulation } from "./simulator/SimulationContext";
import { Dashboard } from "./views/Dashboard";
import { AIView } from "./views/AI";
import { ClassesView } from "./views/Classes";
import { SavedView } from "./views/Saved";
import { ProfileView } from "./views/Profile";

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
  const canvasRef = useRef<CanvasShellHandle>(null);

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
      setError(event.message);
    };
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  const handleNewProject = async (name: string) => {
    setProjectPath(null); // Reset path for a truly new, unsaved project
    canvasRef.current?.setDiagram({ version: 1, parts: [], connections: [] });
    setFiles([{ name: "sketch.ino", content: INITIAL_CODE }]);
    setView("workspace");
    setDebugStatus(`Project "${name}" initialized.`);
    setTimeout(() => setDebugStatus(""), 2000);
  };

  const handleSave = async () => {
    let currentPath = projectPath;

    if (!currentPath) {
      const selected = await open({
        directory: true,
        multiple: false,
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
      await saveProject(currentPath, diagram);
      // Also save the code files
      await invoke("save_project_files", { projectPath: currentPath, files });
      alert("Project saved to " + currentPath);
    } catch (e) {
      setError(String(e));
    }
  };

  const handleOpen = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "Open Project Folder"
    });
    if (selected && typeof selected === 'string') {
      try {
        const diagram = await loadProject(selected);
        setProjectPath(selected);
        canvasRef.current?.setDiagram(diagram);
        setView("workspace");
      } catch (e) {
        setError("Failed to load project: " + e);
      }
    }
  };

  const handleCloseProject = () => {
    setProjectPath(null);
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
      onNewProject={handleNewProject}
      onOpenProject={handleOpen}
      onSaveProject={handleSave}
      onCloseProject={handleCloseProject}
      saveDisabled={false}
      lastHex={lastHex}
      isSimulating={isSimulating}
      onSimulateToggle={setIsSimulating}
      projectPath={projectPath}
      files={files}
      onCompileSuccess={setLastHex}
    >
      {debugStatus && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 10000, background: 'black', color: 'white', padding: '8px 16px', borderRadius: 20, border: '1px solid #C97A4B' }}>
          {debugStatus}
        </div>
      )}

      {/* Dashboard View */}
      {view === "dashboard" && (
        <Dashboard
          onNewProject={handleNewProject}
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
          <CanvasShell ref={canvasRef} />
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
        />
        <div style={{ flex: 1, minHeight: 0 }}>
          <CodeEditor value={activeFile.content} onChange={handleCodeChange} />
        </div>
      </div>
    </AppShell>
  );
}

export default App;
