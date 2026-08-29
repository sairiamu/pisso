import React, { useEffect, useState } from "react";
import { FolderOpen, CircuitBoard } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { COLORS } from "../CONSTANTS/colors";
import { TYPOGRAPHY } from "../CONSTANTS/typography";

interface SavedViewProps {
  onOpenProject: (path?: string) => void;
}

export const SavedView: React.FC<SavedViewProps> = ({ onOpenProject }) => {
  const [projects, setProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const list = await invoke<string[]>("list_projects");
        setProjects(list);
      } catch (err) {
        console.error("Failed to list projects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const getProjectName = (path: string) => {
    // Basic extraction of the last folder name from the path
    const parts = path.split(/[\\/]/);
    return parts[parts.length - 1] || path;
  };

  return (
    <div style={{
      padding: "40px",
      color: COLORS.WARM_WHITE,
      fontFamily: TYPOGRAPHY.UI,
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      height: "100%",
      overflowY: "auto"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ color: COLORS.SOLDER_COPPER, margin: 0 }}>Saved Projects</h1>
          <p style={{ color: COLORS.FOG }}>Select a project to continue your work.</p>
        </div>
        <button
          onClick={() => onOpenProject()}
          style={{
            backgroundColor: "transparent",
            color: COLORS.WARM_WHITE,
            border: `1px solid ${COLORS.GRAPHITE_500}`,
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <FolderOpen size={18} />
          Browse External...
        </button>
      </div>

      {loading ? (
        <div style={{ color: COLORS.FOG }}>Searching for projects...</div>
      ) : projects.length === 0 ? (
        <div style={{
          backgroundColor: COLORS.GRAPHITE_700,
          border: `1px solid ${COLORS.GRAPHITE_500}`,
          borderRadius: "12px",
          padding: "60px 40px",
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
          <div style={{ color: COLORS.FOG }}>No projects found in your local projects folder.</div>
          <p style={{ fontSize: "14px", color: COLORS.FOG, maxWidth: "400px" }}>
            Projects created through the dashboard are automatically saved to your local Pissow directory.
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "20px"
        }}>
          {projects.map((path) => (
            <div
              key={path}
              onClick={() => onOpenProject(path)}
              style={{
                backgroundColor: COLORS.GRAPHITE_700,
                border: `1px solid ${COLORS.GRAPHITE_500}`,
                borderRadius: "10px",
                padding: "20px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "16px"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = COLORS.SOLDER_COPPER;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = COLORS.GRAPHITE_500;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{
                width: "48px",
                height: "48px",
                backgroundColor: COLORS.GRAPHITE_900,
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: COLORS.SOLDER_COPPER
              }}>
                <CircuitBoard size={24} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: COLORS.WARM_WHITE, marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {getProjectName(path)}
                </div>
                <div style={{ fontSize: "12px", color: COLORS.FOG, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {path}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
