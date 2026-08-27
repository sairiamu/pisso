import React, { useState, useEffect } from "react";
import { COLORS } from "./CONSTANTS/colors";
import { getRegisteredParts } from "./parts";
import { CanvasShell } from "./canvas/CanvasShell";

function App() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setError(event.message);
    };
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (error) {
    return (
      <div style={{ backgroundColor: "red", color: "white", padding: 20 }}>
        <h1>Runtime Error</h1>
        <pre>{error}</pre>
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
      <h1 style={{ margin: "0 0 10px 0", fontFamily: "Inter, sans-serif" }}>
        Pissow Workbench
      </h1>
      <p style={{ color: COLORS.FOG, margin: "0 0 20px 0" }}>
        Registered Parts: {parts.length} ({parts.map(p => p.label).join(", ")})
      </p>

      <div style={{ flex: 1, width: "100%", minHeight: 0 }}>
        <CanvasShell />
      </div>
    </main>
  );
}

export default App;
