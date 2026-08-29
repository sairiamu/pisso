import React, { useState } from "react";
import { X, Plus, Terminal, Activity } from "lucide-react";
import { Panel } from "../components/Panel";
import { COLORS } from "../CONSTANTS/colors";
import { TYPOGRAPHY } from "../CONSTANTS/typography";
import { useSimulation } from "../simulator/SimulationContext";
import { ConsoleView } from "./ConsoleView";
import { SerialPanel } from "./SerialPanel";

interface TerminalPanelProps {
  onClose?: () => void;
}

type TerminalTabType = "output" | "serial" | string;

interface TabDef {
  id: TerminalTabType;
  label: string;
  icon?: React.ReactNode;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({ onClose }) => {
  const {
    buildOutput,
    setBuildOutput,
    serialConnected,
  } = useSimulation();

  const [activeTab, setActiveTab] = useState<TerminalTabType>("output");
  const [extraTabs, setExtraTabs] = useState<TabDef[]>([]);

  const tabs: TabDef[] = [
    { id: "output", label: "Output", icon: <Terminal size={14} /> },
    { id: "serial", label: "Serial", icon: <Activity size={14} /> },
    ...extraTabs,
  ];

  const handleAddTab = () => {
    const newTabId = `tab-${extraTabs.length + 1}`;
    setExtraTabs([...extraTabs, { id: newTabId, label: `Debug ${extraTabs.length + 1}` }]);
    setActiveTab(newTabId);
  };

  const handleCloseExtraTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExtraTabs(extraTabs.filter(t => t.id !== id));
    if (activeTab === id) setActiveTab("output");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "output":
        return (
          <ConsoleView
            content={buildOutput || ""}
            onClear={() => setBuildOutput(null)}
            showInput={true}
            placeholder="Command..."
            onInputSubmit={(val) => console.log("Terminal Command:", val)}
          />
        );
      case "serial":
        return <SerialPanel />;
      default:
        return (
          <div style={{ padding: "12px", color: COLORS.FOG, fontFamily: TYPOGRAPHY.CODE, fontSize: "12px" }}>
            Terminal session: {activeTab}
          </div>
        );
    }
  };

  const isActiveSerial = serialConnected;

  return (
    <Panel
      showScrews={false}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: COLORS.GRAPHITE_900,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Terminal Tab Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          backgroundColor: COLORS.GRAPHITE_700,
          padding: "0 8px",
          height: "32px",
          borderBottom: `1px solid ${COLORS.GRAPHITE_500}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", overflowX: "auto" }}>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: activeTab === tab.id ? COLORS.GRAPHITE_900 : "transparent",
                color: activeTab === tab.id ? COLORS.WARM_WHITE : COLORS.FOG,
                padding: "4px 12px",
                borderRadius: "6px 6px 0 0",
                fontSize: "11px",
                fontFamily: TYPOGRAPHY.UI,
                fontWeight: 600,
                border: activeTab === tab.id ? `1px solid ${COLORS.GRAPHITE_500}` : "none",
                borderBottom: "none",
                cursor: "pointer",
                marginBottom: "-1px",
                zIndex: 2,
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
                position: "relative"
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.id === "serial" && (
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: isActiveSerial ? COLORS.TRACE_GREEN : COLORS.FAULT_RED,
                    marginLeft: "2px",
                    boxShadow: isActiveSerial ? `0 0 4px ${COLORS.TRACE_GREEN}` : "none"
                  }}
                  title={isActiveSerial ? "Serial Active" : "Serial Inactive"}
                />
              )}
              {!["output", "serial"].includes(tab.id) && (
                <X
                  size={12}
                  onClick={(e) => handleCloseExtraTab(e, tab.id)}
                  style={{ marginLeft: "4px", opacity: 0.6 }}
                />
              )}
            </div>
          ))}
          <button
            onClick={handleAddTab}
            style={{
              backgroundColor: "transparent",
              color: COLORS.SOLDER_COPPER,
              border: "none",
              padding: "4px 8px",
              cursor: "pointer",
              borderRadius: "4px",
              marginBottom: "2px",
              display: "flex",
              alignItems: "center"
            }}
          >
            <Plus size={16} />
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <span style={{ fontSize: '9px', color: COLORS.FOG, opacity: 0.5 }}>Console v1.1</span>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                backgroundColor: "transparent",
                color: COLORS.FOG,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                opacity: 0.6
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Terminal Content Area */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {renderContent()}
      </div>
    </Panel>
  );
};
