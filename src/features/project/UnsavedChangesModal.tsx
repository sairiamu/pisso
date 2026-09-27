import React from "react";
import { COLORS } from "../../CONSTANTS/colors";

interface UnsavedChangesModalProps {
  isOpen: boolean;
  projectName: string;
  onSaveAndClose: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  projectName,
  onSaveAndClose,
  onDiscard,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.85)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 30000
    }}>
      <div style={{
        backgroundColor: COLORS.GRAPHITE_700,
        border: `1px solid ${COLORS.GRAPHITE_500}`,
        borderRadius: "12px",
        padding: "32px",
        width: "450px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
      }}>
        <h2 style={{ color: COLORS.WARM_WHITE, marginTop: 0, marginBottom: "16px" }}>Unsaved Changes</h2>
        <p style={{ color: COLORS.FOG, lineHeight: 1.5, marginBottom: "24px" }}>
          Project "{projectName}" has unsaved changes. Do you want to save them before closing?
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={onSaveAndClose}
            style={{
              backgroundColor: COLORS.SOLDER_COPPER,
              color: COLORS.WARM_WHITE,
              border: "none",
              padding: "12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            Save and Close
          </button>
          <button
            onClick={onDiscard}
            style={{
              backgroundColor: "transparent",
              color: COLORS.FAULT_RED,
              border: `1px solid ${COLORS.FAULT_RED}`,
              padding: "12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            Discard Changes
          </button>
          <button
            onClick={onCancel}
            style={{
              backgroundColor: "transparent",
              color: COLORS.FOG,
              border: `1px solid ${COLORS.GRAPHITE_500}`,
              padding: "12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
