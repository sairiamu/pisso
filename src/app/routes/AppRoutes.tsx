import React from "react";
import { AppView } from "../../ui/layout/AppShell";
import { AppMode } from "../../ui/layout/ModeSwitcher";
import { Dashboard } from "../../views/Dashboard";
import { SavedView } from "../../views/Saved";
import { AIView } from "../../views/AI";
import { ClassesView } from "../../views/Classes";
import { ProfileView } from "../../views/Profile";
import { LibrariesView } from "../../views/Libraries";
import { ComponentLab } from "../../ui/components/Showcase";
import { CanvasShell, CanvasShellHandle } from "../../canvas/CanvasShell";
import { ToolBox } from "../../canvas/ToolBox";
import { EditorTabs } from "../../canvas/EditorTabs";
import { CodeEditor } from "../../ui/components/CodeEditor";
import { BoardInfo, FileEntry, BuildResult } from "../../core/index";
import { ProjectStatus } from "../../core/project/Project";

interface AppRoutesProps {
  view: AppView;
  mode: AppMode;
  projectPath: string | null;
  files: FileEntry[];
  activeFileIndex: number;
  autoInstallDependencies: boolean;
  boards: BoardInfo[];
  selectedBoardId: string | null;
  editorLocation?: { line: number; column?: number };
  lastBuildResult: BuildResult | null;
  canvasRef: React.RefObject<CanvasShellHandle | null>;
  status: ProjectStatus;
  onNewProject: () => void;
  onOpenProject: (path?: string) => void;
  onSaveProject: () => void;
  onSaveProjectAs: () => void;
  onCloseProject: () => void;
  onSelectView: (view: AppView) => void;
  onSelectMode: (mode: AppMode) => void;
  onCodeChange: (content: string) => void;
  onSelectTab: (index: number) => void;
  onAddTab: () => void;
  onCloseTab: (index: number) => void;
  onOutput: (output: string | null) => void;
  onBuildResult: (result: BuildResult | null) => void;
  onCompileSuccess: (hex: string) => void;
  onProjectPathChange: (path: string) => void;
  onBoardsChange: (boards: BoardInfo[]) => void;
  onAddPart: (type: string) => void;
  onAutoInstallChange: (auto: boolean) => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({
  view,
  mode,
  projectPath,
  files,
  activeFileIndex,
  autoInstallDependencies,
  boards,
  selectedBoardId,
  editorLocation,
  lastBuildResult,
  canvasRef,
  status,
  onNewProject,
  onOpenProject,
  onSaveProject,
  onSaveProjectAs,
  onCloseProject,
  onSelectView,
  onSelectMode,
  onCodeChange,
  onSelectTab,
  onAddTab,
  onCloseTab,
  onOutput,
  onBuildResult,
  onCompileSuccess,
  onProjectPathChange,
  onBoardsChange,
  onAddPart,
  onAutoInstallChange,
}) => {
  const activeFile = files[activeFileIndex] || files[0] || { name: "sketch.ino", content: "" };

  return (
    <>
      {/* Dashboard View */}
      {view === "dashboard" && (
        <Dashboard
          onNewProject={onNewProject}
          onOpenProject={onOpenProject}
          onSaveProject={onSaveProject}
          onSaveProjectAs={onSaveProjectAs}
          onCloseProject={onCloseProject}
          onSelectView={onSelectView}
          onSelectMode={onSelectMode}
          status={status}
        />
      )}

      {/* Saved View */}
      {view === "saved" && <SavedView onOpenProject={onOpenProject} />}

      {/* AI View */}
      {view === "ai" && <AIView />}

      {/* Classes View */}
      {view === "classes" && <ClassesView />}

      {/* Profile View */}
      {view === "profile" && <ProfileView />}

      {/* Libraries View */}
      {view === "libraries" && (
        <LibrariesView
          projectPath={projectPath}
          boards={boards}
          selectedBoardId={selectedBoardId}
          autoInstallDependencies={autoInstallDependencies}
          onAutoInstallChange={onAutoInstallChange}
        />
      )}

      {/* Component Lab View */}
      {view === "component-lab" && <ComponentLab />}

      {/* Design Mode Content - Workspace View */}
      <div
        style={{
          display: view === "workspace" && mode === "design" ? "flex" : "none",
          height: "100%",
          width: "100%",
          position: "relative",
          flexDirection: "row",
        }}
      >
        <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
          <CanvasShell ref={canvasRef} onBoardsChange={onBoardsChange} />
          <ToolBox onAddPart={onAddPart} />
        </div>
      </div>

      {/* Code Mode Content - Workspace View */}
      <div
        style={{
          display: view === "workspace" && mode === "code" ? "flex" : "none",
          height: "100%",
          width: "100%",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <EditorTabs
          projectPath={projectPath}
          files={files}
          activeFileIndex={activeFileIndex}
          autoInstallDependencies={autoInstallDependencies}
          onSelectTab={onSelectTab}
          onAddTab={onAddTab}
          onCloseTab={onCloseTab}
          onOutput={onOutput}
          onBuildResult={onBuildResult}
          onCompileSuccess={onCompileSuccess}
          onProjectPathChange={onProjectPathChange}
          boards={boards}
          selectedBoardId={selectedBoardId}
        />
        <div style={{ flex: 1, minHeight: 0 }}>
          <CodeEditor
            value={activeFile.content}
            onChange={onCodeChange}
            selectedLocation={editorLocation}
            diagnostics={lastBuildResult?.diagnostics.filter((d) => {
              if (!d.file) return false;
              const fileName = d.file.split(/[/\\]/).pop();
              return fileName === activeFile.name;
            })}
          />
        </div>
      </div>
    </>
  );
};
