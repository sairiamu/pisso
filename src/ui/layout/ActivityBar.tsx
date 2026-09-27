import React from "react";
import {
  Files,
  CircuitBoard,
  Code2,
  Sparkles,
  Package,
  Settings
} from "lucide-react";
import { COLORS } from "../../CONSTANTS/colors";

export type ActivityTab = "explorer" | "circuit" | "editor" | "ai" | "libraries";

interface ActivityBarProps {
  activeTab: ActivityTab | null;
  onTabChange: (tab: ActivityTab) => void;
  onOpenSettings: () => void;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activeTab,
  onTabChange,
  onOpenSettings,
}) => {
  const items: { id: ActivityTab; label: string; icon: React.ReactNode }[] = [
    { id: "explorer", label: "Project Explorer", icon: <Files size={20} /> },
    { id: "circuit", label: "Circuit Schematic", icon: <CircuitBoard size={20} /> },
    { id: "editor", label: "Firmware Code", icon: <Code2 size={20} /> },
    { id: "ai", label: "AI Assistant", icon: <Sparkles size={20} /> },
    { id: "libraries", label: "Libraries & Dependencies", icon: <Package size={20} /> },
  ];

  return (
    <div
      style={{
        width: "48px",
        backgroundColor: COLORS.GRAPHITE_900,
        borderRight: `1px solid ${COLORS.BORDER}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "6px",
        paddingBottom: "6px",
        userSelect: "none",
        zIndex: 10
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={item.label}
              style={{
                width: "100%",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "transparent",
                border: "none",
                borderLeft: isActive ? `2px solid ${COLORS.SOLDER_COPPER}` : "2px solid transparent",
                color: isActive ? COLORS.WARM_WHITE : COLORS.FOG,
                cursor: "pointer",
                transition: "color 0.15s ease"
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = COLORS.WARM_WHITE;
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = COLORS.FOG;
              }}
            >
              {item.icon}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: "auto", width: "100%" }}>
        <button
          onClick={onOpenSettings}
          title="Settings"
          style={{
            width: "100%",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
            border: "none",
            borderLeft: "2px solid transparent",
            color: COLORS.FOG,
            cursor: "pointer",
            transition: "color 0.15s ease"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.WARM_WHITE)}
          onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.FOG)}
        >
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
};
