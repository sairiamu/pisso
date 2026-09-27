import React, { useState, useRef, useEffect } from "react";
import { COLORS } from "../../CONSTANTS/colors";
import { commandRegistry } from "../../services/CommandRegistry";
import { Search, CircuitBoard } from "lucide-react";

interface TopMenuBarProps {
  projectName?: string;
  onOpenCommandPalette: () => void;
}

interface MenuItem {
  label: string;
  commandId?: string;
  shortcut?: string;
  divider?: boolean;
}

const MENUS: { title: string; items: MenuItem[] }[] = [
  {
    title: "File",
    items: [
      { label: "New Project...", commandId: "workbench.action.newProject" },
      { label: "Open Project...", commandId: "workbench.action.openProject", shortcut: "Ctrl+O" },
      { divider: true, label: "" },
      { label: "Save Project", commandId: "workbench.action.saveProject", shortcut: "Ctrl+S" },
      { label: "Save As...", commandId: "workbench.action.saveProjectAs" },
      { divider: true, label: "" },
      { label: "Close Project", commandId: "workbench.action.closeProject" },
    ]
  },
  {
    title: "Edit",
    items: [
      { label: "Format Code", commandId: "workbench.action.formatCode" },
      { label: "Add Component", commandId: "workbench.action.addComponent" },
    ]
  },
  {
    title: "View",
    items: [
      { label: "Toggle Primary Side Bar", commandId: "workbench.action.toggleSidebar", shortcut: "Ctrl+B" },
      { label: "Toggle Panel", commandId: "workbench.action.togglePanel", shortcut: "Ctrl+J" },
      { divider: true, label: "" },
      { label: "Open Circuit Schematic", commandId: "workbench.action.openCircuit" },
      { label: "Open Firmware Code", commandId: "workbench.action.openFirmware" },
    ]
  },
  {
    title: "Run",
    items: [
      { label: "Build Project", commandId: "workbench.action.buildProject", shortcut: "Ctrl+Shift+B" },
      { label: "Run Simulation", commandId: "workbench.action.runSimulation", shortcut: "F5" },
      { label: "Stop Simulation", commandId: "workbench.action.stopSimulation", shortcut: "Shift+F5" },
      { label: "Pause Simulation", commandId: "workbench.action.pauseSimulation" },
    ]
  },
  {
    title: "Debug",
    items: [
      { label: "Flash Device", commandId: "workbench.action.flashDevice" },
      { label: "Open Serial Monitor", commandId: "workbench.action.openSerialMonitor" },
    ]
  },
  {
    title: "Tools",
    items: [
      { label: "Generate Circuit with AI", commandId: "workbench.action.generateCircuitAI" },
      { label: "Explain Error", commandId: "workbench.action.explainError" },
      { divider: true, label: "" },
      { label: "Export PCB", commandId: "workbench.action.exportPCB" },
      { label: "Export Gerbers", commandId: "workbench.action.exportGerbers" },
    ]
  },
  {
    title: "Help",
    items: [
      { label: "Command Palette...", commandId: "workbench.action.toggleCommandPalette", shortcut: "Ctrl+Shift+P" },
      { label: "Open Settings", commandId: "workbench.action.openSettings" },
    ]
  }
];

export const TopMenuBar: React.FC<TopMenuBarProps> = ({
  projectName,
  onOpenCommandPalette
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuItemClick = (commandId?: string) => {
    setActiveMenu(null);
    if (commandId) {
      commandRegistry.executeCommand(commandId);
    }
  };

  return (
    <div
      ref={menuRef}
      style={{
        height: "30px",
        backgroundColor: COLORS.GRAPHITE_900,
        borderBottom: `1px solid ${COLORS.BORDER}`,
        display: "flex",
        alignItems: "center",
        padding: "0 10px",
        fontSize: "12px",
        color: COLORS.WARM_WHITE,
        userSelect: "none",
        zIndex: 1000,
        position: "relative"
      }}
    >
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginRight: "16px", fontWeight: 700, color: COLORS.SOLDER_COPPER }}>
        <CircuitBoard size={16} />
        <span style={{ fontSize: "12px", letterSpacing: "0.05em" }}>PISSOW</span>
      </div>

      {/* Menu items */}
      <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
        {MENUS.map((menu) => {
          const isOpen = activeMenu === menu.title;
          return (
            <div key={menu.title} style={{ position: "relative" }}>
              <button
                onClick={() => setActiveMenu(isOpen ? null : menu.title)}
                onMouseEnter={() => {
                  if (activeMenu !== null) setActiveMenu(menu.title);
                }}
                style={{
                  background: isOpen ? COLORS.GRAPHITE_500 : "transparent",
                  color: isOpen ? COLORS.WARM_WHITE : COLORS.WARM_WHITE,
                  border: "none",
                  padding: "4px 8px",
                  borderRadius: "3px",
                  fontSize: "12px",
                  cursor: "pointer",
                  outline: "none"
                }}
              >
                {menu.title}
              </button>

              {isOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "26px",
                    left: 0,
                    backgroundColor: COLORS.GRAPHITE_700,
                    border: `1px solid ${COLORS.BORDER}`,
                    borderRadius: "4px",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.5)",
                    padding: "4px 0",
                    minWidth: "200px",
                    zIndex: 2000
                  }}
                >
                  {menu.items.map((item, idx) => {
                    if (item.divider) {
                      return <div key={idx} style={{ height: "1px", backgroundColor: COLORS.BORDER, margin: "4px 0" }} />;
                    }
                    return (
                      <button
                        key={idx}
                        onClick={() => handleMenuItemClick(item.commandId)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          background: "transparent",
                          color: COLORS.WARM_WHITE,
                          border: "none",
                          padding: "6px 12px",
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.GRAPHITE_500)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <span>{item.label}</span>
                        {item.shortcut && (
                          <span style={{ color: COLORS.FOG, fontSize: "10px", marginLeft: "16px" }}>
                            {item.shortcut}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Command Palette Trigger */}
      <button
        onClick={onOpenCommandPalette}
        style={{
          margin: "0 auto",
          backgroundColor: COLORS.GRAPHITE_700,
          border: `1px solid ${COLORS.BORDER}`,
          borderRadius: "4px",
          padding: "3px 12px",
          color: COLORS.FOG,
          fontSize: "11px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          width: "280px",
          justifyContent: "space-between"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Search size={12} />
          <span>{projectName ? `Pissow - ${projectName}` : "Search commands..."}</span>
        </div>
        <span style={{ fontSize: "10px", backgroundColor: COLORS.GRAPHITE_500, padding: "1px 5px", borderRadius: "3px" }}>
          Ctrl+Shift+P
        </span>
      </button>
    </div>
  );
};
