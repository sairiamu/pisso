import React, { useState, useEffect, useRef } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { COLORS } from "./CONSTANTS/colors";
import { getRegisteredParts } from "./parts";
import { CanvasShell, CanvasShellHandle } from "./canvas/CanvasShell";
import { saveProject, loadProject } from "./diagram";
import { ToolBox } from "./canvas/ToolBox";

function App() {
  const [error, setError] = useState<string | null>(null);
  const [projectPath, setProjectPath] = useState<string | null>(null);
  const canvasRef = useRef<CanvasShellHandle>(null);

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

  if (error) {
    return (
      <div style={{ backgroundColor: "red", color: "white", padding: 20 }}>
        <h1>Runtime Error</h1>
        <pre>{error}</pre>
        <button onClick={() => setError(null)}>Dismiss</button>
      </div>
    );
  }

  const parts = getRegisteredParts();

  return (
    <main style={{
      backgroundColor: COLORS.GRAPHITE_900,
      height: "100vh",
      width: "100vw",
      display: "flex",
      flexDirection: "column",
      padding: "20px",
      boxSizing: "border-box",
      margin: 0,
      color: COLORS.WARM_WHITE
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <h1 style={{ margin: 0, fontFamily: "Inter, sans-serif" }}>
          Pissow Workbench {projectPath ? ` - ${projectPath}` : "(No Project)"}
        </h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleNewProject} style={{ padding: "8px 16px", cursor: "pointer" }}>New Project</button>
          <button onClick={handleOpen} style={{ padding: "8px 16px", cursor: "pointer" }}>Open</button>
          <button onClick={handleSave} disabled={!projectPath} style={{ padding: "8px 16px", cursor: "pointer" }}>Save</button>
        </div>
      </div>

      <p style={{ color: COLORS.FOG, margin: "0 0 20px 0" }}>
        Registered Parts: {parts.length} ({parts.map(p => p.label).join(", ")})
      </p>

      <div style={{ flex: 1, width: "100%", minHeight: 0, position: "relative" }}>
        <CanvasShell ref={canvasRef} />
        <ToolBox onAddPart={(type) => canvasRef.current?.addPart(type)} />
      </div>
    </main>
  );
}

export default App;
