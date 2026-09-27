import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileCode,
  Cpu,
  Package,
  Plus,
  FolderOpen,
  CircuitBoard
} from "lucide-react";
import { COLORS } from "../../CONSTANTS/colors";
import { FileEntry, Circuit } from "../../core/index";

interface ProjectExplorerProps {
  projectName?: string;
  files: FileEntry[];
  activeFileIndex: number;
  circuit?: Circuit;
  onSelectFile: (index: number) => void;
  onAddFile: () => void;
  onOpenProject: () => void;
  onAddComponent: () => void;
  onSelectComponent?: (id: string) => void;
}

export const ProjectExplorer: React.FC<ProjectExplorerProps> = ({
  projectName = "Untitled Project",
  files,
  activeFileIndex,
  circuit,
  onSelectFile,
  onAddFile,
  onOpenProject,
  onAddComponent,
}) => {
  const [filesExpanded, setFilesExpanded] = useState(true);
  const [componentsExpanded, setComponentsExpanded] = useState(true);

  return (
    <div
      style={{
        width: "240px",
        backgroundColor: COLORS.GRAPHITE_700,
        borderRight: `1px solid ${COLORS.BORDER}`,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontSize: "12px",
        color: COLORS.WARM_WHITE,
        userSelect: "none",
        overflow: "hidden"
      }}
    >
      {/* Explorer Header */}
      <div
        style={{
          padding: "8px 12px",
          borderBottom: `1px solid ${COLORS.BORDER}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 700,
          color: COLORS.FOG,
          letterSpacing: "0.05em",
          fontSize: "11px"
        }}
      >
        <span>EXPLORER</span>
        <div style={{ display: "flex", gap: "4px" }}>
          <button
            onClick={onAddFile}
            title="New File"
            style={{ background: "none", border: "none", color: COLORS.FOG, cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.WARM_WHITE)}
            onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.FOG)}
          >
            <Plus size={14} />
          </button>
          <button
            onClick={onOpenProject}
            title="Open Folder"
            style={{ background: "none", border: "none", color: COLORS.FOG, cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.WARM_WHITE)}
            onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.FOG)}
          >
            <FolderOpen size={14} />
          </button>
        </div>
      </div>

      {/* Project Folder Bar */}
      <div
        style={{
          padding: "6px 12px",
          fontWeight: 600,
          color: COLORS.SOLDER_COPPER,
          borderBottom: `1px solid ${COLORS.BORDER}`,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "11px"
        }}
      >
        <CircuitBoard size={14} />
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {projectName.toUpperCase()}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
        {/* Section: Firmware Source Files */}
        <div>
          <div
            onClick={() => setFilesExpanded(!filesExpanded)}
            style={{
              padding: "4px 12px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "11px",
              color: COLORS.FOG
            }}
          >
            {filesExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span>FIRMWARE FILES</span>
          </div>

          {filesExpanded && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {files.map((file, idx) => {
                const isActive = idx === activeFileIndex;
                return (
                  <div
                    key={idx}
                    onClick={() => onSelectFile(idx)}
                    style={{
                      padding: "4px 12px 4px 28px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                      backgroundColor: isActive ? COLORS.GRAPHITE_500 : "transparent",
                      color: isActive ? COLORS.WARM_WHITE : COLORS.FOG
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = `${COLORS.GRAPHITE_500}80`;
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <FileCode size={14} color={isActive ? COLORS.SOLDER_COPPER : COLORS.FOG} />
                    <span>{file.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section: Circuit Components */}
        <div style={{ marginTop: "8px" }}>
          <div
            onClick={() => setComponentsExpanded(!componentsExpanded)}
            style={{
              padding: "4px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "11px",
              color: COLORS.FOG
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {componentsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span>CIRCUIT COMPONENTS ({circuit?.components.length || 0})</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddComponent();
              }}
              title="Add Component"
              style={{ background: "none", border: "none", color: COLORS.FOG, cursor: "pointer" }}
            >
              <Plus size={12} />
            </button>
          </div>

          {componentsExpanded && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {(!circuit || circuit.components.length === 0) ? (
                <div style={{ padding: "4px 12px 4px 28px", color: COLORS.FOG, fontSize: "11px", fontStyle: "italic" }}>
                  No components in circuit
                </div>
              ) : (
                circuit.components.map((comp) => (
                  <div
                    key={comp.id}
                    style={{
                      padding: "4px 12px 4px 28px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                      color: COLORS.FOG
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${COLORS.GRAPHITE_500}80`)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <Cpu size={14} color={COLORS.TRACE_GREEN} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {comp.definitionId.replace("wokwi-", "")} ({comp.id})
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Section: Project Dependencies */}
        <div style={{ marginTop: "8px" }}>
          <div
            style={{
              padding: "4px 12px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontWeight: 600,
              fontSize: "11px",
              color: COLORS.FOG
            }}
          >
            <Package size={14} />
            <span>DEPENDENCIES</span>
          </div>
          <div style={{ padding: "4px 12px 4px 28px", color: COLORS.FOG, fontSize: "11px" }}>
            Arduino Core Library
          </div>
        </div>
      </div>
    </div>
  );
};
