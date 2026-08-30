import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { COLORS } from "../CONSTANTS/colors";
import { writeSketch } from "../diagram/sketch";
import { FileEntry } from "../App";
import { BoardInfo } from "./CanvasShell";

interface RunButtonProps {
  projectPath: string | null;
  files: FileEntry[];
  onOutput?: (output: string | null) => void;
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
        activePath = await invoke<string>("get_playground_path");
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
      // 1. Save all project files
      const projectFiles = files.map(file => ({
          name: file.name,
          content: file.name.endsWith(".ino") ? writeSketch(file.content) : file.content
      }));
      await invoke("save_project_files", { projectPath: activePath, files: projectFiles });

      // 2. Invoke the compile command
      // Find the main sketch file (sketch.ino)
      const mainSketch = files.find(f => f.name.endsWith(".ino")) || files[0];
      // Note: save_project_files saves all files into a "code" subdirectory.
      const sketchPath = `${activePath}/code/${mainSketch.name}`;

      interface CompileResult {
        hex: string;
        flash_used: number;
        ram_used: number;
      }

      const result = await invoke<CompileResult>("compile_sketch", {
        sketchPath,
        boardFqbn: board.fqbn,
      });

      const successMsg = `Successfully compiled: Flash ${result.flash_used} bytes, RAM ${result.ram_used} bytes`;
      setStatus(successMsg);
      onOutput?.(successMsg);
      onCompileSuccess?.(result.hex);
      succeeded = true;
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
