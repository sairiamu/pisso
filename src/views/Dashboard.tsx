import React, { useState, useEffect } from "react";
import { Plus, FolderOpen, Clock, Folder, ChevronDown, CircuitBoard } from "lucide-react";
import { COLORS } from "../CONSTANTS/colors";
import { TYPOGRAPHY } from "../CONSTANTS/typography";
import { getRecentProjects } from "../diagram";

interface DashboardProps {
  onNewProject: () => void;
  onOpenProject: (path?: string) => void;
  onSaveProject?: () => void;
  onCloseProject?: () => void;
  onSelectView?: (view: any) => void;
  onSelectMode?: (mode: any) => void;
  projectPath: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNewProject,
  onOpenProject,
  onSaveProject,
  onCloseProject,
  onSelectView,
  onSelectMode,
  projectPath
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [recentProjects, setRecentProjects] = useState<string[]>([]);

  useEffect(() => {
    getRecentProjects().then(setRecentProjects).catch(() => setRecentProjects([]));
  }, []);

  const getProjectName = (path: string) => {
    const parts = path.split(/[\\/]/);
    return parts[parts.length - 1] || path;
  };

  const menuStyle: React.CSSProperties = {
    position: "relative",
    cursor: "pointer",
  };

  const dropdownStyle: React.CSSProperties = {
    position: "absolute",
    top: "100%",
    left: 0,
    backgroundColor: COLORS.GRAPHITE_700,
    border: `1px solid ${COLORS.GRAPHITE_500}`,
    borderRadius: "4px",
    padding: "4px 0",
    zIndex: 100,
    minWidth: "160px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
  };

  const menuItemStyle = (disabled?: boolean): React.CSSProperties => ({
    padding: "8px 16px",
    fontSize: "13px",
    color: disabled ? COLORS.FOG : COLORS.WARM_WHITE,
    cursor: disabled ? "default" : "pointer",
    whiteSpace: "nowrap",
    backgroundColor: "transparent",
    transition: "background-color 0.2s ease",
    opacity: disabled ? 0.5 : 1
  });

  const handleMenuClick = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: COLORS.GRAPHITE_900,
        fontFamily: TYPOGRAPHY.UI,
        position: "relative"
      }}
      onClick={() => setActiveMenu(null)}
    >
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Dashboard Top Menu */}
      <div style={{
        height: "40px",
        backgroundColor: COLORS.GRAPHITE_700,
        borderBottom: `1px solid ${COLORS.GRAPHITE_500}`,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: "24px"
      }}>
        <div style={menuStyle} onClick={(e) => { e.stopPropagation(); handleMenuClick('file'); }}>
          <div style={{ color: COLORS.WARM_WHITE, fontSize: "13px", fontWeight: 500, opacity: 0.8, display: "flex", alignItems: "center", gap: "4px" }}>
            File <ChevronDown size={14} />
          </div>
          {activeMenu === 'file' && (
            <div style={dropdownStyle}>
              <div style={menuItemStyle()} onClick={onNewProject}>New Project</div>
              <div style={menuItemStyle()} onClick={() => onOpenProject()}>Open Project</div>
              <div
                style={menuItemStyle()}
                onClick={() => onSaveProject?.()}
              >
                Save Project
              </div>
              <div style={menuItemStyle(true)}>Save As...</div>
              <div
                style={{ ...menuItemStyle(!projectPath), borderTop: `1px solid ${COLORS.GRAPHITE_500}`, marginTop: "4px" }}
                onClick={() => projectPath && onCloseProject?.()}
              >
                Close Project
              </div>
            </div>
          )}
        </div>

        <div style={menuStyle} onClick={(e) => { e.stopPropagation(); handleMenuClick('view'); }}>
          <div style={{ color: COLORS.WARM_WHITE, fontSize: "13px", fontWeight: 500, opacity: 0.8, display: "flex", alignItems: "center", gap: "4px" }}>
            View <ChevronDown size={14} />
          </div>
          {activeMenu === 'view' && (
            <div style={dropdownStyle}>
              <div
                style={menuItemStyle(!projectPath)}
                onClick={() => { if(projectPath) { onSelectView?.('workspace'); onSelectMode?.('design'); }}}
              >
                Design
              </div>
              <div
                style={menuItemStyle(!projectPath)}
                onClick={() => { if(projectPath) { onSelectView?.('workspace'); onSelectMode?.('code'); }}}
              >
                Code
              </div>
              <div style={menuItemStyle(true)}>Terminal</div>
              <div style={menuItemStyle(true)}>Graph</div>
              <div style={menuItemStyle(true)}>Simulate</div>
            </div>
          )}
        </div>

        <div style={menuStyle} onClick={(e) => { e.stopPropagation(); handleMenuClick('folders'); }}>
          <div style={{ color: COLORS.WARM_WHITE, fontSize: "13px", fontWeight: 500, opacity: 0.8, display: "flex", alignItems: "center", gap: "4px" }}>
            Folders <ChevronDown size={14} />
          </div>
          {activeMenu === 'folders' && (
            <div style={dropdownStyle}>
              <div style={menuItemStyle()}>Manage Folders...</div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div
        className="no-scrollbar"
        style={{
          padding: "40px",
          color: COLORS.WARM_WHITE,
          display: "flex",
          flexDirection: "column",
          gap: "32px",
          flex: 1,
          overflowY: "auto"
        }}
      >
        <header>
          <h1 style={{ fontSize: "32px", fontWeight: 700, margin: 0, color: COLORS.WARM_WHITE }}>
            Welcome to <span style={{ color: COLORS.SOLDER_COPPER }}>PISSOW</span>
          </h1>
          <p style={{ color: COLORS.FOG, marginTop: "8px" }}>Engineering & Electronics Workspace</p>
        </header>

        <div style={{ display: "flex", gap: "20px" }}>
           <button
             onClick={onNewProject}
             style={{
               flex: 1,
               backgroundColor: COLORS.GRAPHITE_700,
               border: `1px solid ${COLORS.GRAPHITE_500}`,
               borderRadius: "12px",
               padding: "32px 24px",
               cursor: "pointer",
               display: "flex",
               flexDirection: "column",
               alignItems: "center",
               gap: "16px",
               transition: "all 0.2s ease",
               textAlign: "center"
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
             <Plus size={40} color={COLORS.SOLDER_COPPER} />
             <div>
               <div style={{ fontWeight: 600, fontSize: "18px", color: COLORS.WARM_WHITE, marginBottom: "4px" }}>New Project</div>
               <div style={{ fontSize: "14px", color: COLORS.FOG }}>Start a new engineering design</div>
             </div>
           </button>

           <button
             onClick={() => onOpenProject()}
             style={{
               flex: 1,
               backgroundColor: COLORS.GRAPHITE_700,
               border: `1px solid ${COLORS.GRAPHITE_500}`,
               borderRadius: "12px",
               padding: "32px 24px",
               cursor: "pointer",
               display: "flex",
               flexDirection: "column",
               alignItems: "center",
               gap: "16px",
               transition: "all 0.2s ease",
               textAlign: "center"
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
             <FolderOpen size={40} color={COLORS.SOLDER_COPPER} />
             <div>
               <div style={{ fontWeight: 600, fontSize: "18px", color: COLORS.WARM_WHITE, marginBottom: "4px" }}>Open Project</div>
               <div style={{ fontSize: "14px", color: COLORS.FOG }}>Open an existing project from disk</div>
             </div>
           </button>
        </div>

        <section>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Clock size={20} color={COLORS.FOG} />
            <h2 style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>Recent Projects</h2>
          </div>
          {recentProjects.length === 0 ? (
            <div style={{
              color: COLORS.FOG,
              fontSize: "14px",
              padding: "32px",
              backgroundColor: COLORS.GRAPHITE_900,
              borderRadius: "12px",
              border: `1px dashed ${COLORS.GRAPHITE_500}`,
              textAlign: "center"
            }}>
              No recent projects found.
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px"
            }}>
              {recentProjects.slice(0, 6).map((path) => (
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
        </section>

        <section>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Folder size={20} color={COLORS.FOG} />
            <h2 style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>Your Folders</h2>
          </div>
          <div style={{
            color: COLORS.FOG,
            fontSize: "14px",
            padding: "32px",
            backgroundColor: COLORS.GRAPHITE_900,
            borderRadius: "12px",
            border: `1px dashed ${COLORS.GRAPHITE_500}`,
            textAlign: "center"
          }}>
            Connect to your Pissow project folders.
          </div>
        </section>
      </div>
    </div>
  );
};
