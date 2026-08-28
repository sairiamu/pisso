import React from "react";
import { Panel } from "../components/Panel";
import { COLORS } from "../CONSTANTS/colors";
import { ModeSwitcher, AppMode } from "./ModeSwitcher";
import { TYPOGRAPHY } from "../CONSTANTS/typography";

interface AppShellProps {
  children: React.ReactNode;
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onNewProject?: () => void;
  onOpenProject?: () => void;
  onSaveProject?: () => void;
  saveDisabled?: boolean;
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
  saveDisabled
}) => {
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
            paddingTop: "20px",
            gap: "20px",
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
              fontSize: "18px"
            }}
          >
            +
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
              fontSize: "14px"
            }}
          >
            📂
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
              fontSize: "14px"
            }}
          >
            💾
          </button>

          <div
            style={{
              marginTop: "auto",
              marginBottom: "20px",
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
              style={{
                backgroundColor: COLORS.GRAPHITE_500,
                color: COLORS.WARM_WHITE,
                border: "none",
                padding: "6px 16px",
                borderRadius: "6px",
                fontFamily: TYPOGRAPHY.UI,
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              SERIAL
            </button>
            <button
              style={{
                backgroundColor: COLORS.GRAPHITE_500,
                color: COLORS.WARM_WHITE,
                border: "none",
                padding: "6px 16px",
                borderRadius: "6px",
                fontFamily: TYPOGRAPHY.UI,
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              GRAPH
            </button>
            <button
              style={{
                backgroundColor: COLORS.SOLDER_COPPER,
                color: COLORS.WARM_WHITE,
                border: "none",
                padding: "6px 20px",
                borderRadius: "6px",
                fontFamily: TYPOGRAPHY.UI,
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }}
            >
              SIMULATE
            </button>
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
            position: "relative"
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
