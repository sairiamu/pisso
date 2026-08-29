import React from "react";
import { FolderOpen } from "lucide-react";
import { COLORS } from "../CONSTANTS/colors";
import { TYPOGRAPHY } from "../CONSTANTS/typography";

interface SavedViewProps {
  onOpenProject: () => void;
}

export const SavedView: React.FC<SavedViewProps> = ({ onOpenProject }) => {
  return (
    <div style={{
      padding: "40px",
      color: COLORS.WARM_WHITE,
      fontFamily: TYPOGRAPHY.UI,
      display: "flex",
      flexDirection: "column",
      gap: "24px"
    }}>
      <h1 style={{ color: COLORS.SOLDER_COPPER, margin: 0 }}>Saved Projects</h1>
      <p style={{ color: COLORS.FOG }}>Select a project to continue your work.</p>

      <div style={{
        backgroundColor: COLORS.GRAPHITE_700,
        border: `1px solid ${COLORS.GRAPHITE_500}`,
        borderRadius: "12px",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        textAlign: "center"
      }}>
        <div style={{ opacity: 0.5 }}>
          <FolderOpen size={48} color={COLORS.FOG} />
        </div>
        <div style={{ color: COLORS.FOG }}>No projects found in your saved locations.</div>
        <button
          onClick={onOpenProject}
          style={{
            backgroundColor: COLORS.SOLDER_COPPER,
            color: COLORS.WARM_WHITE,
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 600,
            marginTop: "8px"
          }}
        >
          Browse Projects
        </button>
      </div>
    </div>
  );
};
