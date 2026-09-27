import React from "react";
import { AlertTriangle } from "lucide-react";
import { COLORS } from "../../CONSTANTS/colors";

interface ProjectErrorViewProps {
  errorContent: React.ReactNode;
  onBackToDashboard: () => void;
  onReload: () => void;
}

export const ProjectErrorView: React.FC<ProjectErrorViewProps> = ({
  errorContent,
  onBackToDashboard,
  onReload,
}) => {
  return (
    <div style={{
      backgroundColor: COLORS.GRAPHITE_900,
      color: COLORS.WARM_WHITE,
      padding: "40px",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Inter, sans-serif"
    }}>
      <div style={{
        backgroundColor: COLORS.GRAPHITE_700,
        border: `1px solid ${COLORS.FAULT_RED}`,
        borderRadius: "12px",
        padding: "32px",
        maxWidth: "600px",
        width: "100%",
        boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
      }}>
        <h1 style={{ color: COLORS.FAULT_RED, marginTop: 0, display: "flex", alignItems: "center", gap: "12px" }}>
          <AlertTriangle size={32} /> Runtime Error
        </h1>
        <div style={{
          backgroundColor: COLORS.GRAPHITE_900,
          padding: "16px",
          borderRadius: "6px",
          border: `1px solid ${COLORS.GRAPHITE_500}`,
          marginBottom: "24px",
          overflow: "auto",
          maxHeight: "300px"
        }}>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{errorContent}</pre>
        </div>
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            onClick={onBackToDashboard}
            style={{
              backgroundColor: COLORS.GRAPHITE_500,
              color: COLORS.WARM_WHITE,
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            Back to Dashboard
          </button>
          <button
            onClick={onReload}
            style={{
              backgroundColor: COLORS.SOLDER_COPPER,
              color: COLORS.WARM_WHITE,
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            Reload Application
          </button>
        </div>
      </div>
    </div>
  );
};
