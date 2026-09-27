import React, { useState } from "react";
import { X } from "lucide-react";
import { COLORS } from "../../CONSTANTS/colors";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [projectName, setProjectName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim()) {
      onSubmit(projectName.trim());
      setProjectName("");
      onClose();
    }
  };

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
      zIndex: 20000
    }}>
      <div style={{
        backgroundColor: COLORS.GRAPHITE_700,
        border: `1px solid ${COLORS.GRAPHITE_500}`,
        borderRadius: "12px",
        padding: "32px",
        width: "400px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
        position: "relative"
      }}>
        <button
          onClick={onClose}
          style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: COLORS.FOG }}
        >
          <X size={20} />
        </button>
        <h2 style={{ color: COLORS.WARM_WHITE, marginTop: 0, marginBottom: "24px" }}>New Project</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", color: COLORS.FOG, fontSize: "12px", marginBottom: "8px" }}>PROJECT NAME</label>
            <input
              autoFocus
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My Awesome Project"
              style={{
                width: "100%",
                backgroundColor: COLORS.GRAPHITE_900,
                border: `1px solid ${COLORS.GRAPHITE_500}`,
                borderRadius: "6px",
                padding: "12px",
                color: COLORS.WARM_WHITE,
                fontSize: "14px",
                outline: "none"
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: "transparent",
                color: COLORS.WARM_WHITE,
                border: `1px solid ${COLORS.GRAPHITE_500}`,
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!projectName.trim()}
              style={{
                backgroundColor: COLORS.SOLDER_COPPER,
                color: COLORS.WARM_WHITE,
                border: "none",
                padding: "10px 24px",
                borderRadius: "6px",
                cursor: projectName.trim() ? "pointer" : "default",
                fontWeight: 600,
                opacity: projectName.trim() ? 1 : 0.5
              }}
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
