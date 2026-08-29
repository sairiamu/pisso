import React, { useEffect, useRef, useState } from "react";
import { X, Plus, Terminal, Activity, ChevronRight } from "lucide-react";
import { Panel } from "../components/Panel";
import { COLORS } from "../CONSTANTS/colors";
import { EDITOR_CONFIG } from "../CONSTANTS/editor";
import { TYPOGRAPHY } from "../CONSTANTS/typography";
import { useSimulation } from "../simulator/SimulationContext";

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
    serialOutput,
    clearSerialOutput,
    buildOutput,
    setBuildOutput,
    writeSerial,
    serialConnected,
    isSimulating,
    serialSource
  } = useSimulation();

  const [activeTab, setActiveTab] = useState<TerminalTabType>("output");
  const [extraTabs, setExtraTabs] = useState<TabDef[]>([]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [serialOutput, buildOutput, activeTab]);

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

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (activeTab === "serial") {
      writeSerial(inputValue + "\n");
    } else if (activeTab === "output") {
      // For now, output tab just echoes for "terminal feel" or does nothing
      console.log("Terminal Input:", inputValue);
    }

    setInputValue("");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "output":
        return (
          <div style={{ color: buildOutput?.toLowerCase().includes("error") ? COLORS.FAULT_RED : COLORS.WARM_WHITE }}>
            {buildOutput || <span style={{ color: COLORS.GRAPHITE_500, fontStyle: "italic" }}>No build output yet.</span>}
          </div>
        );
      case "serial":
        return (
          <div>
            {serialOutput || <span style={{ color: COLORS.GRAPHITE_500, fontStyle: "italic" }}>Waiting for serial data...</span>}
          </div>
        );
      default:
        return <span style={{ color: COLORS.GRAPHITE_500 }}>Terminal session: {activeTab}</span>;
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
                zIndex: activeTab === tab.id ? 2 : 1,
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
          {activeTab === "serial" && (
            <button
              onClick={clearSerialOutput}
              style={{
                backgroundColor: "transparent",
                color: COLORS.FOG,
                border: `1px solid ${COLORS.GRAPHITE_500}`,
                borderRadius: "4px",
                fontSize: "10px",
                padding: "1px 6px",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          )}
          {activeTab === "output" && (
            <button
              onClick={() => setBuildOutput(null)}
              style={{
                backgroundColor: "transparent",
                color: COLORS.FOG,
                border: `1px solid ${COLORS.GRAPHITE_500}`,
                borderRadius: "4px",
                fontSize: "10px",
                padding: "1px 6px",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          )}
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
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          padding: "12px",
          overflowY: "auto",
          fontFamily: EDITOR_CONFIG.FONT_FAMILY,
          fontSize: "12px",
          color: COLORS.WARM_WHITE,
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          lineHeight: 1.5,
          backgroundColor: "#121417", // Slightly darker than Graphite-900 for terminal feel
        }}
      >
        {renderContent()}
      </div>

      {/* Terminal Input Area */}
      <form
        onSubmit={handleInputSubmit}
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#121417",
          padding: "4px 12px 8px 12px",
          borderTop: `1px solid ${COLORS.GRAPHITE_500}33`
        }}
      >
        <ChevronRight size={14} color={COLORS.SOLDER_COPPER} style={{ marginRight: "4px" }} />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={activeTab === "serial" ? "Send to serial..." : "Command..."}
          style={{
            flex: 1,
            backgroundColor: "transparent",
            border: "none",
            color: COLORS.WARM_WHITE,
            fontFamily: EDITOR_CONFIG.FONT_FAMILY,
            fontSize: "12px",
            outline: "none",
          }}
        />
      </form>
    </Panel>
  );
};
