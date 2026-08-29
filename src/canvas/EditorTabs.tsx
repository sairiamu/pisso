import React from "react";
import { X, Plus } from "lucide-react";
import { Panel } from "../components/Panel";
import { COLORS } from "../CONSTANTS/colors";
import { TYPOGRAPHY } from "../CONSTANTS/typography";
import { RunButton } from "./RunButton";
import { FileEntry } from "../App";

interface EditorTabsProps {
  projectPath: string | null;
  files: FileEntry[];
  activeFileIndex: number;
  onSelectTab: (index: number) => void;
  onAddTab: () => void;
  onCloseTab: (index: number) => void;

+-
  onOutput?: (output: string | null) => void;
  onCompileSuccess?: (hex: string) => void;
  onProjectPathChange?: (path: string) => void;
}

/**
 * EditorTabs component with multi-tab support and Add Tab button.
 */
export const EditorTabs: React.FC<EditorTabsProps> = ({
  projectPath,
  files,
  activeFileIndex,
  onSelectTab,
  onAddTab,
  onCloseTab,
  onOutput,
  onCompileSuccess,
  onProjectPathChange,
}) => {
  return (
    <Panel
      showScrews={false}
      style={{
        borderRadius: "8px 8px 0 0",
        backgroundColor: COLORS.GRAPHITE_700,
        height: "36px",
        borderBottom: `1px solid ${COLORS.GRAPHITE_500}`,
      }}
    >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            height: "100%",
            padding: "0 8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", overflowX: "hidden", flex: 1 }}>
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                onClick={() => onSelectTab(index)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: activeFileIndex === index ? COLORS.GRAPHITE_900 : "transparent",
                  color: activeFileIndex === index ? COLORS.WARM_WHITE : COLORS.FOG,
                  padding: "6px 12px",
                  borderRadius: "6px 6px 0 0",
                  fontSize: "12px",
                  fontFamily: TYPOGRAPHY.UI,
                  border: activeFileIndex === index ? `1px solid ${COLORS.GRAPHITE_500}` : "none",
                  borderBottom: activeFileIndex === index ? "none" : "none",
                  cursor: "pointer",
                  marginBottom: activeFileIndex === index ? "-1px" : "0",
                  zIndex: activeFileIndex === index ? 2 : 1,
                  whiteSpace: "nowrap"
                }}
              >
                <span>{file.name}</span>
                {files.length > 1 && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(index);
                    }}
                    style={{
                      color: COLORS.FOG,
                      cursor: "pointer",
                      opacity: 0.6,
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    <X size={14} />
                  </span>
                )}
              </div>
            ))}
            <button
              onClick={onAddTab}
              style={{
                backgroundColor: "transparent",
                color: COLORS.SOLDER_COPPER,
                border: "none",
                padding: "6px 10px",
                cursor: "pointer",
                borderRadius: "4px",
                marginBottom: "2px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              title="Add new file"
            >
              <Plus size={18} />
            </button>
          </div>

          <div style={{ marginBottom: "4px", marginRight: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
            <RunButton
              projectPath={projectPath}
              code={files[0].content} // We compile the main sketch.ino for now
              onOutput={onOutput}
              onCompileSuccess={onCompileSuccess}
              onProjectPathChange={onProjectPathChange}
            />
          </div>
        </div>
      </Panel>
  );
};
