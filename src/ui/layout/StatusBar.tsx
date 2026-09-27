import React from "react";
import { COLORS } from "../../CONSTANTS/colors";
import { Cpu, Play, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import { commandRegistry } from "../../services/CommandRegistry";

interface StatusBarProps {
  boardLabel?: string;
  isSimulating?: boolean;
  isBuilding?: boolean;
  lastBuildSuccess?: boolean | null;
  selectedPort?: string | null;
  cursorPosition?: { line: number; column?: number };
}

export const StatusBar: React.FC<StatusBarProps> = ({
  boardLabel = "Arduino Uno",
  isSimulating = false,
  isBuilding = false,
  lastBuildSuccess = null,
  selectedPort = null,
  cursorPosition,
}) => {
  return (
    <div
      style={{
        height: "22px",
        backgroundColor: COLORS.GRAPHITE_900,
        borderTop: `1px solid ${COLORS.BORDER}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 10px",
        fontSize: "11px",
        color: COLORS.WARM_WHITE,
        userSelect: "none",
        zIndex: 1000
      }}
    >
      {/* Left status items */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Board */}
        <button
          onClick={() => commandRegistry.executeCommand("workbench.action.openSettings")}
          style={{
            background: "none",
            border: "none",
            color: COLORS.WARM_WHITE,
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "11px",
            cursor: "pointer",
            padding: 0
          }}
        >
          <Cpu size={12} color={COLORS.SOLDER_COPPER} />
          <span>{boardLabel}</span>
        </button>

        {/* Port */}
        <button
          onClick={() => commandRegistry.executeCommand("workbench.action.openSerialMonitor")}
          style={{
            background: "none",
            border: "none",
            color: COLORS.WARM_WHITE,
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "11px",
            cursor: "pointer",
            padding: 0
          }}
        >
          <Zap size={12} color={selectedPort ? COLORS.TRACE_GREEN : COLORS.FOG} />
          <span>{selectedPort ? selectedPort : "No Port Selected"}</span>
        </button>

        {/* Build status */}
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          {isBuilding ? (
            <span style={{ color: COLORS.SOLDER_COPPER }}>Compiling...</span>
          ) : lastBuildSuccess === true ? (
            <span style={{ color: COLORS.TRACE_GREEN, display: "flex", alignItems: "center", gap: "4px" }}>
              <CheckCircle2 size={12} /> Build Succeeded
            </span>
          ) : lastBuildSuccess === false ? (
            <span style={{ color: COLORS.FAULT_RED, display: "flex", alignItems: "center", gap: "4px" }}>
              <AlertCircle size={12} /> Build Failed
            </span>
          ) : (
            <span style={{ color: COLORS.FOG }}>Ready</span>
          )}
        </div>
      </div>

      {/* Center status items - Simulation state */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          onClick={() => commandRegistry.executeCommand(isSimulating ? "workbench.action.stopSimulation" : "workbench.action.runSimulation")}
          style={{
            backgroundColor: isSimulating ? COLORS.TRACE_GREEN : COLORS.GRAPHITE_500,
            color: COLORS.WARM_WHITE,
            border: "none",
            borderRadius: "3px",
            padding: "1px 8px",
            fontSize: "10px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          <Play size={10} />
          <span>{isSimulating ? "SIMULATION RUNNING" : "START SIMULATION"}</span>
        </button>
      </div>

      {/* Right status items */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", color: COLORS.FOG }}>
        {cursorPosition && (
          <span>
            Ln {cursorPosition.line}, Col {cursorPosition.column || 1}
          </span>
        )}
        <span>UTF-8</span>
        <span>C++ / Arduino</span>
      </div>
    </div>
  );
};
