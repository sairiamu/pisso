import React, { useEffect, useRef, useState, useCallback } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { LayoutDashboard, FolderHeart, Sparkles, GraduationCap, User, Save, CircuitBoard, Plus } from "lucide-react";
import { Panel } from "../components/Panel";
import { COLORS } from "../CONSTANTS/colors";
import { PANEL } from "../CONSTANTS/panel";
import { ModeSwitcher, AppMode } from "./ModeSwitcher";
import { TYPOGRAPHY } from "../CONSTANTS/typography";
import { SimulationEngine } from "../simulator/engine";
import { useSimulation } from "../simulator/SimulationContext";
import { TerminalPanel } from "./TerminalPanel";
import { GraphPanel } from "./GraphPanel";
import { PortSelector } from "./PortSelector";
import { BoardSelector } from "./BoardSelector";
import { UploadButton } from "./UploadButton";
import { BoardInfo } from "./CanvasShell";

import { FileEntry } from "../App";

export type AppView = "dashboard" | "saved" | "ai" | "classes" | "profile" | "workspace";

interface AppShellProps {
  children: React.ReactNode;
  view: AppView;
  onViewChange: (view: AppView) => void;
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onNewProject?: () => void;
  onOpenProject?: () => void;
  onSaveProject?: () => void;
  onCloseProject?: () => void;
  saveDisabled?: boolean;
  lastHex?: string | null;
  isSimulating?: boolean;
  onSimulateToggle?: (simulating: boolean) => void;
  projectPath?: string | null;
  isProjectActive?: boolean;
  files: FileEntry[];
  onCompileSuccess?: (hex: string) => void;
  boards: BoardInfo[];
  selectedBoardId: string | null;
  onSelectBoard: (id: string | null) => void;
  setDebugStatus?: (status: string) => void;
}

/**
 * AppShell provides the persistent outer frame and navigation rail for the application.
 * It wraps the active center content (e.g., Design Canvas or Code Editor).
 */
export const AppShell: React.FC<AppShellProps> = ({
  children,
  view,
  onViewChange,
  mode,
  onModeChange,
  onNewProject,
  onSaveProject,
  saveDisabled,
  lastHex,
  isSimulating,
  onSimulateToggle,
  projectPath,
  isProjectActive,
  files,
  onCompileSuccess,
  boards,
  selectedBoardId,
  onSelectBoard,
  setDebugStatus,
}) => {
  const [bottomPanel, setBottomPanel] = useState<'terminal' | 'graph' | null>(null);
  const [selectedPort, setSelectedPort] = useState<string | null>(null);
  const [serialHeight, setSerialHeight] = useState(200);
  const [isResizing, setIsResizing] = useState(false);
  const engineRef = useRef<SimulationEngine | null>(null);
  const {
    setPinState,
    resetPinStates,
    appendSerialOutput,
    clearSerialOutput,
    buildOutput,
    appendBuildOutput,
    setWriteSerialHandler,
    serialSource,
    setSerialSource,
    setSerialConnected
  } = useSimulation();

  // Listen for native upload progress events
  useEffect(() => {
    let unlisten: (() => void) | null = null;

    listen<string>("upload-progress", (event) => {
      appendBuildOutput(event.payload);
    }).then(u => { unlisten = u; });

    return () => {
      if (unlisten) unlisten();
    };
  }, [appendBuildOutput]);

  // Listen for native serial data events
  useEffect(() => {
    let unlisten: (() => void) | null = null;

    listen<string>("serial-data", (event) => {
      if (serialSource === 'hardware') {
        appendSerialOutput(event.payload);
      }
    }).then(u => { unlisten = u; });

    return () => {
      if (unlisten) unlisten();
    };
  }, [appendSerialOutput, serialSource]);

  // Close hardware serial on unmount
  useEffect(() => {
    return () => {
      invoke("close_serial").catch(() => {});
    };
  }, []);

  // Automatically show terminal when build output arrives
  useEffect(() => {
    if (buildOutput) {
      setBottomPanel('terminal');
    }
  }, [buildOutput]);

  // Wire serial input handler
  useEffect(() => {
    setWriteSerialHandler((data: string) => {
      if (serialSource === 'simulation') {
        if (engineRef.current) {
          for (let i = 0; i < data.length; i++) {
            engineRef.current.serialWrite(data.charCodeAt(i));
          }
        }
      } else {
        invoke("write_to_serial", { data }).catch(err => {
          console.error("Failed to write to hardware serial:", err);
        });
      }
    });
  }, [setWriteSerialHandler, serialSource]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const newHeight = window.innerHeight - e.clientY - 16; // Subtract padding/margin
    setSerialHeight(Math.max(100, Math.min(newHeight, window.innerHeight * 0.7)));
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (!isSimulating && engineRef.current) {
      engineRef.current.pause();
      engineRef.current = null;
      resetPinStates();
      setSerialConnected(false);
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.pause();
        engineRef.current = null;
        resetPinStates();
        setSerialConnected(false);
      }
    };
  }, [isSimulating, resetPinStates, setSerialConnected]);

  const handleSimulate = async () => {
    if (isSimulating) {
      onSimulateToggle?.(false);
      return;
    }

    if (!lastHex) {
      alert("No compiled hex available. Please compile your sketch first.");
      return;
    }

    // Stop hardware serial before starting simulation
    if (serialSource === 'hardware') {
      try {
        await invoke("close_serial");
      } catch (err) {
        console.error("Failed to close hardware serial:", err);
      }
    }
    clearSerialOutput();
    setSerialSource('simulation');

    try {
      const engine = SimulationEngine.fromHex(lastHex);
      engine.onPinChange = (pin, state) => {
        setPinState(pin, state);
      };
      engine.onUartByte = (byte) => {
        appendSerialOutput(String.fromCharCode(byte));
      };
      engineRef.current = engine;
      engine.start();
      setSerialConnected(true);
      onSimulateToggle?.(true);
    } catch (err) {
      console.error("Failed to start simulation:", err);
      alert("Simulation Error: " + err);
    }
  };

  const handleUploadSuccess = useCallback(async () => {
    // Stop simulation if running
    if (isSimulating) {
      onSimulateToggle?.(false);
    }

    clearSerialOutput();
    // Switch to hardware serial
    setSerialSource('hardware');
    if (selectedPort) {
      try {
        await invoke("open_serial", { portName: selectedPort, baudRate: 115200 });
        setSerialConnected(true);
      } catch (err) {
        console.error("Failed to open hardware serial:", err);
        appendBuildOutput(`Error opening serial port: ${err}`);
      }
    }
  }, [isSimulating, onSimulateToggle, selectedPort, setSerialSource, setSerialConnected, appendBuildOutput]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "100%",
        backgroundColor: COLORS.GRAPHITE_900,
        overflow: "hidden",
      }}
    >
      {/* Left Navigation Rail */}
      <div style={{ padding: "8px 0 8px 8px" }}>
        <Panel
          showScrews={false}
          style={{
            width: "60px",
            height: "100%",
            borderRadius: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: PANEL.SPACING.RAIL,
              gap: PANEL.SPACING.RAIL,
              height: "100%",
            }}
          >
            {/* Nav Rail Icons */}
            <button
              onClick={onNewProject}
              title="New Project"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "transparent",
                border: "none",
                color: COLORS.SOLDER_COPPER,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                marginBottom: "8px",
                borderBottom: `2px solid ${COLORS.GRAPHITE_500}`
              }}
            >
              <Plus size={22} />
            </button>

            {isProjectActive && (
              <button
                onClick={() => onViewChange("workspace")}
                title="Studio (Design & Code)"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: view === "workspace" ? COLORS.SOLDER_COPPER : "transparent",
                  border: "none",
                  color: view === "workspace" ? COLORS.WARM_WHITE : COLORS.FOG,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                  marginBottom: "4px",
                  borderBottom: `2px solid ${COLORS.GRAPHITE_500}`
                }}
              >
                <CircuitBoard size={22} />
              </button>
            )}
            <button
              onClick={() => onViewChange("dashboard")}
              title="Dashboard"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: view === "dashboard" ? COLORS.SOLDER_COPPER : "transparent",
                border: "none",
                color: view === "dashboard" ? COLORS.WARM_WHITE : COLORS.FOG,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease"
              }}
            >
              <LayoutDashboard size={22} />
            </button>
            <button
              onClick={() => onViewChange("saved")}
              title="Saved Projects"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: view === "saved" ? COLORS.SOLDER_COPPER : "transparent",
                border: "none",
                color: view === "saved" ? COLORS.WARM_WHITE : COLORS.FOG,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease"
              }}
            >
              <FolderHeart size={22} />
            </button>
            <button
              onClick={() => onViewChange("ai")}
              title="AI Assistant"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: view === "ai" ? COLORS.SOLDER_COPPER : "transparent",
                border: "none",
                color: view === "ai" ? COLORS.WARM_WHITE : COLORS.FOG,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease"
              }}
            >
              <Sparkles size={22} />
            </button>
            <button
              onClick={() => onViewChange("classes")}
              title="Classes"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: view === "classes" ? COLORS.SOLDER_COPPER : "transparent",
                border: "none",
                color: view === "classes" ? COLORS.WARM_WHITE : COLORS.FOG,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease"
              }}
            >
              <GraduationCap size={22} />
            </button>

            <div style={{ marginTop: "auto", marginBottom: PANEL.SPACING.RAIL }}>
              <button
                onClick={() => onViewChange("profile")}
                title="Profile & Settings"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: view === "profile" ? COLORS.SOLDER_COPPER : "transparent",
                  border: "none",
                  color: view === "profile" ? COLORS.WARM_WHITE : COLORS.FOG,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease"
                }}
              >
                <User size={22} />
              </button>
            </div>
          </div>
        </Panel>
      </div>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "8px",
          minWidth: 0
        }}
      >
        {/* Top Header with Toggle and Action Buttons - Only visible in Workspace */}
        {view === "workspace" && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
              padding: "0 4px"
            }}
          >
            <ModeSwitcher mode={mode} onModeChange={onModeChange} />

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setBottomPanel(bottomPanel === 'terminal' ? null : 'terminal')}
                style={{
                  backgroundColor: bottomPanel === 'terminal' ? COLORS.SOLDER_COPPER : COLORS.GRAPHITE_500,
                  color: COLORS.WARM_WHITE,
                  border: "none",
                  padding: "6px 16px",
                  borderRadius: "6px",
                  fontFamily: TYPOGRAPHY.UI,
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background-color 0.2s ease"
                }}
              >
                TERMINAL
              </button>
              <button
                onClick={() => setBottomPanel(bottomPanel === 'graph' ? null : 'graph')}
                style={{
                  backgroundColor: bottomPanel === 'graph' ? COLORS.SOLDER_COPPER : COLORS.GRAPHITE_500,
                  color: COLORS.WARM_WHITE,
                  border: "none",
                  padding: "6px 16px",
                  borderRadius: "6px",
                  fontFamily: TYPOGRAPHY.UI,
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background-color 0.2s ease"
                }}
              >
                GRAPH
              </button>
              <button
                onClick={handleSimulate}
                style={{
                  backgroundColor: isSimulating ? COLORS.TRACE_GREEN : COLORS.SOLDER_COPPER,
                  color: COLORS.WARM_WHITE,
                  border: "none",
                  padding: "6px 20px",
                  borderRadius: "6px",
                  fontFamily: TYPOGRAPHY.UI,
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  transition: "background-color 0.2s ease"
                }}
              >
                {isSimulating ? "STOP SIM" : "SIMULATE"}
              </button>

              <BoardSelector
                boards={boards}
                selectedBoardId={selectedBoardId}
                onSelect={onSelectBoard}
              />

              <PortSelector
                projectPath={projectPath || null}
                onPortSelect={setSelectedPort}
              />

              <UploadButton
                projectPath={projectPath || null}
                selectedPort={selectedPort}
                hasHex={!!lastHex}
                files={files}
                onCompileSuccess={onCompileSuccess}
                onOutput={appendBuildOutput}
                onUploadSuccess={handleUploadSuccess}
                boards={boards}
                selectedBoardId={selectedBoardId}
                setDebugStatus={setDebugStatus}
              />

              <button
                onClick={onSaveProject}
                disabled={saveDisabled}
                title="Save Project"
                style={{
                  backgroundColor: COLORS.GRAPHITE_500,
                  color: COLORS.WARM_WHITE,
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  cursor: saveDisabled ? "default" : "pointer",
                  opacity: saveDisabled ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Save size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Outer frame for center content */}
        <div
          style={{
            flex: 1,
            border: `1px solid ${COLORS.GRAPHITE_500}`,
            borderRadius: "10px",
            overflow: "hidden",
            backgroundColor: COLORS.GRAPHITE_900,
            position: "relative",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
            {children}
          </div>

          {bottomPanel && (
            <div
              style={{
                height: `${serialHeight}px`,
                borderTop: `2px solid ${COLORS.GRAPHITE_500}`,
                position: "relative",
                zIndex: 20,
                display: "flex",
                flexDirection: "column"
              }}
            >
              <div
                onMouseDown={() => setIsResizing(true)}
                style={{
                  height: "4px",
                  width: "100%",
                  cursor: "ns-resize",
                  position: "absolute",
                  top: "-3px",
                  left: 0,
                  zIndex: 30,
                  backgroundColor: isResizing ? COLORS.SOLDER_COPPER : "transparent",
                  transition: "background-color 0.2s ease"
                }}
              />
              {bottomPanel === 'terminal' ? (
                <TerminalPanel onClose={() => setBottomPanel(null)} />
              ) : (
                <GraphPanel onClose={() => setBottomPanel(null)} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
