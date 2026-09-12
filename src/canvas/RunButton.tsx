import React, { useState } from "react";
import { COLORS } from "../CONSTANTS/colors";
import { FileEntry } from "../App";
import { BoardInfo } from "../domain/models";
import { ProjectManager } from "../application/ProjectManager";
import { BuildManager } from "../application/BuildManager";
import { Project, ProjectFile } from "../domain/models";

interface RunButtonProps {
  projectPath: string | null;
  files: FileEntry[];
  onOutput?: (output: string | null) => void;
  onBuildResult?: (result: BuildResult | null) => void;
  onCompileSuccess?: (hex: string) => void;
  onProjectPathChange?: (path: string) => void;
  boards: BoardInfo[];
  selectedBoardId: string | null;
}

/**
 * RunButton component to compile the current sketch.
 * If no project is open, it uses a hidden playground directory to avoid interrupting the user.
 */
export const RunButton: React.FC<RunButtonProps> = ({
  projectPath,
  files,
  onOutput,
  onBuildResult,
  onCompileSuccess,
  onProjectPathChange,
  boards,
  selectedBoardId,
}) => {
  const [isCompiling, setIsCompiling] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleRun = async () => {
    let activePath = projectPath;
    let succeeded = false;

    if (!activePath) {
      try {
        // Automatically use a playground directory if no project is open
        activePath = await ProjectManager.getPlaygroundPath();
        if (activePath && onProjectPathChange) {
          onProjectPathChange(activePath);
        }
      } catch (err) {
        onOutput?.(`System Error: Failed to initialize playground. ${err}`);
        return;
      }
    }

    setIsCompiling(true);
    setStatus("Compiling...");
    onOutput?.(null); // Clear previous output
    onBuildResult?.(null);

    if (boards.length === 0) {
      const errorMsg = "Error: No board found in your design. Add an Arduino board to the canvas before compiling.";
      setStatus(errorMsg);
      onOutput?.(errorMsg);
      setIsCompiling(false);
      return;
    }

    if (!selectedBoardId) {
      const errorMsg = "Error: No board selected. Please pick a board from the dropdown in the top bar.";
      setStatus(errorMsg);
      onOutput?.(errorMsg);
      setIsCompiling(false);
      return;
    }

    const board = boards.find(b => b.id === selectedBoardId);
    if (!board) {
      const errorMsg = "Error: Selected board not found in design.";
      setStatus(errorMsg);
      onOutput?.(errorMsg);
      setIsCompiling(false);
      return;
    }

    onOutput?.(`Compiling project for ${board.label}...`);

    try {
      // 1. Construct a temporary project object for the BuildManager
      // In a more mature architecture, the project would be passed in directly.
      const buildProject: Partial<Project> & { rootPath: string, files: ProjectFile[] } = {
        rootPath: activePath,
        files: files as ProjectFile[],
        circuit: { components: [], connections: [], nets: [], version: 1 } // Simplified for build
      };

      // 2. Invoke the BuildManager
      const result = await BuildManager.build(buildProject as Project, board.fqbn);
      onBuildResult?.(result);

      if (result.status === 'success') {
        setStatus(result.output.split('\n').pop() || "Success");
        onOutput?.(result.output);
        if (result.hex) {
          onCompileSuccess?.(result.hex);
        }
        succeeded = true;
      } else {
        const firstError = result.diagnostics.find(d => d.severity === 'error');
        const firstWarning = result.diagnostics.find(d => d.severity === 'warning');

        if (firstError) {
          setStatus(`Error: ${firstError.message}`);
        } else if (firstWarning) {
          setStatus(`Warning: ${firstWarning.message}`);
        } else {
          const lastLine = result.output.split("\n").pop();
          setStatus(lastLine && lastLine.trim() ? lastLine : "Compilation failed");
        }
        onOutput?.(result.output);
      }
    } catch (err) {
      const errorMsg = String(err);
      setStatus(`Error: ${errorMsg.split("\n")[0]}`);
      onOutput?.(errorMsg);
      console.error("Compilation error:", err);
    } finally {
      setIsCompiling(false);
      // Clear status after 5 seconds if successful
      if (succeeded) {
        setTimeout(() => setStatus(null), 5000);
      }
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {status && (
        <div
          style={{
            fontSize: "11px",
            color: status.startsWith("Error") ? COLORS.FAULT_RED : COLORS.TRACE_GREEN,
            maxWidth: "200px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontFamily: "Inter, sans-serif",
            backgroundColor: `${COLORS.GRAPHITE_900}CC`,
            padding: "4px 8px",
            borderRadius: "4px",
            border: `1px solid ${status.startsWith("Error") ? COLORS.FAULT_RED : COLORS.TRACE_GREEN}44`,
            pointerEvents: "none"
          }}
          title={status}
        >
          {status}
        </div>
      )}
      <button
        onClick={handleRun}
        disabled={isCompiling}
        style={{
          backgroundColor: isCompiling ? COLORS.GRAPHITE_500 : COLORS.SOLDER_COPPER,
          color: COLORS.WARM_WHITE,
          border: "none",
          borderRadius: "6px",
          padding: "8px 20px",
          cursor: isCompiling ? "wait" : "pointer",
          fontWeight: 700,
          fontSize: "0.8rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          boxShadow: isCompiling ? "none" : "0 2px 4px rgba(0,0,0,0.3)",
          transition: "all 0.2s ease-in-out",
          fontFamily: "Inter, sans-serif",
          opacity: 1,
          outline: "none",
          position: "relative",
          zIndex: 10
        }}
      >
        {isCompiling ? "Compiling..." : "Run"}
      </button>
    </div>
  );
};
