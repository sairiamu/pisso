import React, { useEffect, useRef, useState, useCallback } from "react";
import { Plus, FolderOpen, Save } from "lucide-react";
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

interface AppShellProps {
  children: React.ReactNode;
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onNewProject?: () => void;
  onOpenProject?: () => void;
  onSaveProject?: () => void;
  saveDisabled?: boolean;
  lastHex?: string | null;
  isSimulating?: boolean;
  onSimulateToggle?: (simulating: boolean) => void;
  projectPath?: string | null;
}

/**
 * AppShell provides the persistent outer frame and navigation rail for the application.
 * It wraps the active center content (e.g., Design Canvas or Code Editor).
 */
export const AppShell: React.FC<AppShellProps> = ({
  children,
  mode,
  onModeChange,
  onNewProject,
  onOpenProject,
  onSaveProject,
  saveDisabled,
  lastHex,
  isSimulating,
  onSimulateToggle,
  projectPath,
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
    buildOutput,
    setWriteSerialHandler
  } = useSimulation();

  // Automatically show terminal when build output arrives
  useEffect(() => {
    if (buildOutput) {
      setBottomPanel('terminal');
    }
  }, [buildOutput]);

  // Wire serial input handler
  useEffect(() => {
    setWriteSerialHandler((data: string) => {
      if (engineRef.current) {
        for (let i = 0; i < data.length; i++) {
          engineRef.current.serialWrite(data.charCodeAt(i));
        }
      }
    });
  }, [setWriteSerialHandler]);

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
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.pause();
        engineRef.current = null;
        resetPinStates();
      }
    };
  }, [isSimulating, resetPinStates]);

  const handleSimulate = () => {
    if (isSimulating) {
      onSimulateToggle?.(false);
      return;
    }

    if (!lastHex) {
      alert("No compiled hex available. Please compile your sketch first.");
      return;
    }

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
      onSimulateToggle?.(true);
    } catch (err) {
      console.error("Failed to start simulation:", err);
      alert("Simulation Error: " + err);
    }
  };

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
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: PANEL.SPACING.XL,
            gap: PANEL.SPACING.XL,
            borderRadius: "10px",
          }}
        >
          {/* Nav Rail Icons (Placeholders/Actions) */}
          <button
            onClick={onNewProject}
            title="New Project"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              backgroundColor: COLORS.GRAPHITE_500,
              opacity: 0.8,
              border: `1px solid ${COLORS.GRAPHITE_500}`,
              color: COLORS.WARM_WHITE,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Plus size={18} />
          </button>
          <button
            onClick={onOpenProject}
            title="Open Project"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              backgroundColor: COLORS.GRAPHITE_500,
              opacity: 0.5,
              border: `1px solid ${COLORS.GRAPHITE_500}`,
              color: COLORS.WARM_WHITE,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FolderOpen size={16} />
          </button>
          <button
            onClick={onSaveProject}
            disabled={saveDisabled}
            title="Save Project"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              backgroundColor: COLORS.GRAPHITE_500,
              opacity: saveDisabled ? 0.2 : 0.5,
              border: `1px solid ${COLORS.GRAPHITE_500}`,
              color: COLORS.WARM_WHITE,
              cursor: saveDisabled ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Save size={16} />
          </button>

          <div
            style={{
              marginTop: "auto",
              marginBottom: PANEL.SPACING.XL,
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              backgroundColor: COLORS.GRAPHITE_500,
              opacity: 0.2,
              border: `1px solid ${COLORS.GRAPHITE_500}`
            }}
          />
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
        {/* Top Header with Toggle and Action Buttons */}
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

            <PortSelector
              projectPath={projectPath || null}
              onPortSelect={setSelectedPort}
            />
          </div>
        </div>

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
