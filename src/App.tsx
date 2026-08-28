import React, { useState, useEffect, useRef, useCallback } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { COLORS } from "./CONSTANTS/colors";
import { CanvasShell, CanvasShellHandle } from "./canvas/CanvasShell";
import { AppShell } from "./canvas/AppShell";
import { AppMode } from "./canvas/ModeSwitcher";
import { saveProject, loadProject } from "./diagram";
import { ToolBox } from "./canvas/ToolBox";
import { CodeEditor } from "./components/CodeEditor";
import { EditorTabs } from "./canvas/EditorTabs";
import { BuildConsole } from "./canvas/BuildConsole";

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
  const [files, setFiles] = useState<FileEntry[]>([
    { name: "sketch.ino", content: INITIAL_CODE }
  ]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [buildOutput, setBuildOutput] = useState<string | null>(null);
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

  const handleNewProject = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "Select Project Folder"
    });
    if (selected && typeof selected === 'string') {
      setProjectPath(selected);
      canvasRef.current?.setDiagram({ version: 1, parts: [], connections: [] });
    }
  };

  const handleSave = async () => {
    if (!projectPath || !canvasRef.current) return;
    try {
      const diagram = canvasRef.current.getDiagram();
      await saveProject(projectPath, diagram);
      alert("Project saved to " + projectPath);
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
      } catch (e) {
        setError("Failed to load project: " + e);
      }
    }
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
      mode={mode}
      onModeChange={setMode}
      onNewProject={handleNewProject}
      onOpenProject={handleOpen}
      onSaveProject={handleSave}
      saveDisabled={!projectPath}
    >
      {debugStatus && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 10000, background: 'black', color: 'white', padding: '8px 16px', borderRadius: 20, border: '1px solid #C97A4B' }}>
          {debugStatus}
        </div>
      )}
      {/* Design Mode Content */}
      <div
        style={{
          display: mode === "design" ? "flex" : "none",
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

      {/* Code Mode Content */}
      <div
        style={{
          display: mode === "code" ? "flex" : "none",
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
          onOutput={setBuildOutput}
          onProjectPathChange={setProjectPath}
        />
        <div style={{ flex: 1, minHeight: 0 }}>
          <CodeEditor value={activeFile.content} onChange={handleCodeChange} />
        </div>
        <BuildConsole output={buildOutput} onClose={() => setBuildOutput(null)} />
      </div>
    </AppShell>
  );
}

export default App;
