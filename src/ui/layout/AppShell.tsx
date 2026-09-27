import React, { useEffect, useState, useCallback } from "react";
import { TopMenuBar } from "./TopMenuBar";
import { ActivityBar, ActivityTab } from "./ActivityBar";
import { ProjectExplorer } from "../../features/explorer/ProjectExplorer";
import { StatusBar } from "./StatusBar";
import { BottomPanel, BottomPanelTab } from "./BottomPanel";
import { CommandPalette } from "./CommandPalette";
import { COLORS } from "../../CONSTANTS/colors";
import { EventApi } from "../../platform/tauri/event-api";
import { SerialService } from "../../application/serial-service";
import { useSimulation } from "../../simulator/SimulationContext";
import { BoardInfo, Diagnostic, Circuit, FileEntry } from "../../core/index";
import { ProjectStatus } from "../../core/project/Project";
import { commandRegistry } from "../../services/CommandRegistry";
import { InspectorPanel } from "../../canvas/InspectorPanel";
import { AIView } from "../../views/AI";
import { Sparkles, SlidersHorizontal, X } from "lucide-react";

export type AppView = "dashboard" | "saved" | "ai" | "classes" | "profile" | "libraries" | "workspace" | "component-lab";

interface AppShellProps {
  children: React.ReactNode;
  view: AppView;
  onViewChange: (view: AppView) => void;
  mode: "design" | "code";
  onModeChange: (mode: "design" | "code") => void;
  onNewProject?: () => void;
  onOpenProject?: () => void;
  onSaveProject?: () => void;
  onCloseProject?: () => void;
  onSelectDiagnostic?: (diagnostic: Diagnostic) => void;
  saveDisabled?: boolean;
  lastHex?: string | null;
  isSimulating?: boolean;
  onSimulateToggle?: (simulating: boolean) => void;
  projectPath?: string | null;
  projectName?: string;
  files: FileEntry[];
  activeFileIndex: number;
  onSelectFile: (index: number) => void;
  onAddFile: () => void;
  onCompileSuccess?: (hex: string) => void;
  boards: BoardInfo[];
  selectedBoardId: string | null;
  onSelectBoard: (id: string | null) => void;
  setDebugStatus?: (status: string) => void;
  status: ProjectStatus;
  autoInstallDependencies?: boolean;
  circuit?: Circuit;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  view,
  onViewChange,
  onModeChange,
  onOpenProject,
  onSaveProject,
  onSelectDiagnostic,
  isSimulating,
  projectName = "Untitled Project",
  files,
  activeFileIndex,
  onSelectFile,
  onAddFile,
  boards,
  selectedBoardId,
  status,
  circuit,
}) => {
  const [activityTab, setActivityTab] = useState<ActivityTab | null>("explorer");
  const [bottomPanelTab, setBottomPanelTab] = useState<BottomPanelTab>("terminal");
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(false);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(220);
  const [isResizing, setIsResizing] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [rightInspectorTab, setRightInspectorTab] = useState<"properties" | "ai" | null>("properties");

  const {
    appendSerialOutput,
    buildOutput,
    appendBuildOutput,
    setWriteSerialHandler,
    serialSource,
    lastBuildResult
  } = useSimulation();

  const activeBoard = boards.find(b => b.id === selectedBoardId);

  useEffect(() => {
    let unlisten: (() => void) | null = null;
    EventApi.listen<string>("upload-progress", (event) => {
      appendBuildOutput(event.payload);
    }).then(u => { unlisten = u; });

    return () => { if (unlisten) unlisten(); };
  }, [appendBuildOutput]);

  useEffect(() => {
    let unlisten: (() => void) | null = null;
    EventApi.listen<string>("serial-data", (event) => {
      if (serialSource === 'hardware') {
        appendSerialOutput(event.payload);
      }
    }).then(u => { unlisten = u; });

    return () => { if (unlisten) unlisten(); };
  }, [appendSerialOutput, serialSource]);

  useEffect(() => {
    if (buildOutput) {
      setIsBottomPanelOpen(true);
      setBottomPanelTab('terminal');
    }
  }, [buildOutput]);

  useEffect(() => {
    setWriteSerialHandler((data: string) => {
      if (serialSource === 'simulation') {
        // Handled via simulationManager
      } else {
        SerialService.write(data).catch(() => {});
      }
    });
  }, [setWriteSerialHandler, serialSource]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const newHeight = window.innerHeight - e.clientY - 22;
    setBottomPanelHeight(Math.max(120, Math.min(newHeight, window.innerHeight * 0.7)));
  }, [isResizing]);

  const handleMouseUp = useCallback(() => setIsResizing(false), []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "P" || e.key === "p")) {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === "b" || e.key === "B")) {
        e.preventDefault();
        setActivityTab(prev => prev ? null : "explorer");
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === "j" || e.key === "J")) {
        e.preventDefault();
        setIsBottomPanelOpen(prev => !prev);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        if (onSaveProject) onSaveProject();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "B" || e.key === "b")) {
        e.preventDefault();
        commandRegistry.executeCommand("workbench.action.buildProject");
        return;
      }

      if (e.key === "F5") {
        e.preventDefault();
        commandRegistry.executeCommand("workbench.action.runSimulation");
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSaveProject]);

  const handleActivityTabChange = (tab: ActivityTab) => {
    if (tab === "circuit") {
      onViewChange("workspace");
      onModeChange("design");
    } else if (tab === "editor") {
      onViewChange("workspace");
      onModeChange("code");
    } else if (tab === "ai") {
      onViewChange("ai");
    } else if (tab === "libraries") {
      onViewChange("libraries");
    }

    if (activityTab === tab) {
      setActivityTab(null);
    } else {
      setActivityTab(tab);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
        backgroundColor: COLORS.GRAPHITE_900,
        color: COLORS.WARM_WHITE,
        overflow: "hidden",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      <TopMenuBar
        projectName={projectName}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden", position: "relative" }}>
        <ActivityBar
          activeTab={activityTab}
          onTabChange={handleActivityTabChange}
          onOpenSettings={() => commandRegistry.executeCommand("workbench.action.openSettings")}
        />

        {activityTab === "explorer" && (
          <ProjectExplorer
            projectName={projectName}
            files={files}
            activeFileIndex={activeFileIndex}
            circuit={circuit}
            onSelectFile={(idx) => {
              onSelectFile(idx);
              onViewChange("workspace");
              onModeChange("code");
            }}
            onAddFile={() => {
              onAddFile();
              onViewChange("workspace");
              onModeChange("code");
            }}
            onOpenProject={() => {
              if (onOpenProject) onOpenProject();
            }}
            onAddComponent={() => {
              onViewChange("workspace");
              onModeChange("design");
            }}
          />
        )}

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100%" }}>
          <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
            {children}
          </div>

          {isBottomPanelOpen && (
            <BottomPanel
              activeTab={bottomPanelTab}
              onTabChange={setBottomPanelTab}
              onClose={() => setIsBottomPanelOpen(false)}
              diagnostics={lastBuildResult?.diagnostics || []}
              onSelectDiagnostic={onSelectDiagnostic}
              height={bottomPanelHeight}
              onResizeStart={() => setIsResizing(true)}
            />
          )}
        </div>

        {view === "workspace" && (
          <div
            style={{
              width: "280px",
              backgroundColor: COLORS.GRAPHITE_700,
              borderLeft: `1px solid ${COLORS.BORDER}`,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                height: "28px",
                borderBottom: `1px solid ${COLORS.BORDER}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 8px",
                fontSize: "11px",
                backgroundColor: COLORS.GRAPHITE_900
              }}
            >
              <div style={{ display: "flex", gap: "4px" }}>
                <button
                  onClick={() => setRightInspectorTab("properties")}
                  style={{
                    background: "transparent",
                    color: rightInspectorTab === "properties" ? COLORS.WARM_WHITE : COLORS.FOG,
                    border: "none",
                    borderBottom: rightInspectorTab === "properties" ? `2px solid ${COLORS.SOLDER_COPPER}` : "2px solid transparent",
                    padding: "4px 8px",
                    cursor: "pointer",
                    fontSize: "11px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <SlidersHorizontal size={12} /> Properties
                </button>
                <button
                  onClick={() => setRightInspectorTab("ai")}
                  style={{
                    background: "transparent",
                    color: rightInspectorTab === "ai" ? COLORS.WARM_WHITE : COLORS.FOG,
                    border: "none",
                    borderBottom: rightInspectorTab === "ai" ? `2px solid ${COLORS.SOLDER_COPPER}` : "2px solid transparent",
                    padding: "4px 8px",
                    cursor: "pointer",
                    fontSize: "11px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <Sparkles size={12} /> AI Assistant
                </button>
              </div>

              <button
                onClick={() => setRightInspectorTab(null)}
                style={{ background: "none", border: "none", color: COLORS.FOG, cursor: "pointer" }}
              >
                <X size={13} />
              </button>
            </div>

            {rightInspectorTab === "properties" && (
              <div style={{ flex: 1, overflowY: "auto" }}>
                <InspectorPanel selectedPart={null} />
              </div>
            )}

            {rightInspectorTab === "ai" && (
              <div style={{ flex: 1, overflowY: "auto" }}>
                <AIView />
              </div>
            )}
          </div>
        )}
      </div>

      <StatusBar
        boardLabel={activeBoard?.label || "Arduino Uno"}
        isSimulating={isSimulating}
        isBuilding={status === "loading" || status === "saving"}
        lastBuildSuccess={lastBuildResult ? lastBuildResult.status === "success" : null}
        selectedPort={null}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
};
