import React from "react";
import { COLORS } from "../../CONSTANTS/colors";
import { TerminalPanel } from "../../canvas/TerminalPanel";
import { GraphPanel } from "../../canvas/GraphPanel";
import { SerialPanel } from "../../canvas/SerialPanel";
import { Diagnostic } from "../../core/index";
import { X, AlertTriangle, AlertCircle, Info, Terminal, Activity, Radio, Cpu } from "lucide-react";

export type BottomPanelTab = "problems" | "terminal" | "serial" | "simulation" | "output";

interface BottomPanelProps {
  activeTab: BottomPanelTab;
  onTabChange: (tab: BottomPanelTab) => void;
  onClose: () => void;
  diagnostics?: Diagnostic[];
  onSelectDiagnostic?: (diag: Diagnostic) => void;
  height: number;
  onResizeStart: () => void;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({
  activeTab,
  onTabChange,
  onClose,
  diagnostics = [],
  onSelectDiagnostic,
  height,
  onResizeStart,
}) => {
  const tabs: { id: BottomPanelTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: "problems",
      label: "Problems",
      icon: <AlertCircle size={13} />,
      badge: diagnostics.filter(d => d.severity === 'error' || d.severity === 'warning').length
    },
    { id: "terminal", label: "Terminal", icon: <Terminal size={13} /> },
    { id: "serial", label: "Serial Monitor", icon: <Radio size={13} /> },
    { id: "simulation", label: "Simulation", icon: <Activity size={13} /> },
    { id: "output", label: "Output", icon: <Cpu size={13} /> },
  ];

  return (
    <div
      style={{
        height: `${height}px`,
        backgroundColor: COLORS.GRAPHITE_900,
        borderTop: `1px solid ${COLORS.BORDER}`,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        zIndex: 20
      }}
    >
      <div
        onMouseDown={onResizeStart}
        style={{
          height: "4px",
          width: "100%",
          cursor: "ns-resize",
          position: "absolute",
          top: "-2px",
          left: 0,
          zIndex: 30
        }}
      />

      <div
        style={{
          height: "28px",
          backgroundColor: COLORS.GRAPHITE_700,
          borderBottom: `1px solid ${COLORS.BORDER}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 8px",
          fontSize: "11px",
          userSelect: "none"
        }}
      >
        <div style={{ display: "flex", gap: "2px", height: "100%" }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                style={{
                  height: "100%",
                  padding: "0 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "transparent",
                  color: isActive ? COLORS.WARM_WHITE : COLORS.FOG,
                  border: "none",
                  borderBottom: isActive ? `2px solid ${COLORS.SOLDER_COPPER}` : "2px solid transparent",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: isActive ? 600 : 400
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {!!tab.badge && tab.badge > 0 && (
                  <span style={{
                    backgroundColor: COLORS.FAULT_RED,
                    color: COLORS.WARM_WHITE,
                    borderRadius: "10px",
                    padding: "0 5px",
                    fontSize: "9px",
                    fontWeight: 700
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          title="Close Panel"
          style={{ background: "none", border: "none", color: COLORS.FOG, cursor: "pointer" }}
        >
          <X size={14} />
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "hidden", position: "relative" }}>
        {activeTab === "problems" && (
          <div style={{ padding: "8px", overflowY: "auto", height: "100%" }}>
            {diagnostics.length === 0 ? (
              <div style={{ color: COLORS.FOG, fontSize: "12px", padding: "12px" }}>
                No problems detected in workspace.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", color: COLORS.WARM_WHITE }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${COLORS.BORDER}`, textAlign: "left", color: COLORS.FOG, fontSize: "11px" }}>
                    <th style={{ padding: "4px 8px", width: "80px" }}>Severity</th>
                    <th style={{ padding: "4px 8px" }}>Message</th>
                    <th style={{ padding: "4px 8px", width: "150px" }}>File</th>
                    <th style={{ padding: "4px 8px", width: "60px" }}>Line</th>
                  </tr>
                </thead>
                <tbody>
                  {diagnostics.map((diag, idx) => (
                    <tr
                      key={idx}
                      onClick={() => onSelectDiagnostic?.(diag)}
                      style={{ borderBottom: `1px solid ${COLORS.BORDER}40`, cursor: "pointer" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${COLORS.GRAPHITE_500}80`)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "4px 8px", display: "flex", alignItems: "center", gap: "4px" }}>
                        {diag.severity === 'error' ? (
                          <AlertCircle size={14} color={COLORS.FAULT_RED} />
                        ) : diag.severity === 'warning' ? (
                          <AlertTriangle size={14} color={COLORS.SOLDER_COPPER} />
                        ) : (
                          <Info size={14} color={COLORS.FOG} />
                        )}
                        <span style={{ textTransform: "capitalize", fontSize: "11px" }}>{diag.severity}</span>
                      </td>
                      <td style={{ padding: "4px 8px" }}>{diag.message}</td>
                      <td style={{ padding: "4px 8px", color: COLORS.FOG }}>{diag.file || "—"}</td>
                      <td style={{ padding: "4px 8px", color: COLORS.FOG }}>{diag.line || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "terminal" && (
          <TerminalPanel onClose={onClose} onSelectDiagnostic={onSelectDiagnostic} />
        )}

        {activeTab === "serial" && (
          <SerialPanel />
        )}

        {activeTab === "simulation" && (
          <GraphPanel onClose={onClose} />
        )}

        {activeTab === "output" && (
          <div style={{ padding: "12px", fontFamily: "monospace", fontSize: "12px", color: COLORS.WARM_WHITE }}>
            [System Log] Pissow Embedded IDE Workspace active.
          </div>
        )}
      </div>
    </div>
  );
};
