import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Upload } from "lucide-react";
import { COLORS } from "../CONSTANTS/colors";
import { TYPOGRAPHY } from "../CONSTANTS/typography";
import { writeSketch } from "../diagram/sketch";
import { FileEntry } from "../App";
import { BoardInfo } from "./CanvasShell";

interface UploadButtonProps {
  projectPath: string | null;
  selectedPort: string | null;
  hasHex: boolean;
  files: FileEntry[];
  onCompileSuccess?: (hex: string) => void;
  onOutput?: (output: string | null) => void;
  onUploadSuccess?: () => void;
  boards: BoardInfo[];
  selectedBoardId: string | null;
  setDebugStatus?: (status: string) => void;
}

export const UploadButton: React.FC<UploadButtonProps> = ({
  projectPath,
  selectedPort,
  hasHex,
  files,
  onCompileSuccess,
  onOutput,
  onUploadSuccess,
  boards,
  selectedBoardId,
  setDebugStatus,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = async () => {
    console.log("UploadButton: handleUpload clicked", { selectedPort, hasHex });

    if (isProcessing) return;

    onOutput?.(null); // Clear previous output

    if (boards.length === 0) {
      onOutput?.("Error: No board found in your design. Add an Arduino board to the canvas before uploading.");
      return;
    }

    if (!selectedBoardId) {
      onOutput?.("Error: No board selected. Please pick a board from the dropdown in the top bar.");
      return;
    }

    const board = boards.find(b => b.id === selectedBoardId);
    if (!board) {
      onOutput?.("Error: Selected board not found in design.");
      return;
    }

    if (!selectedPort) {
      onOutput?.("Error: No serial port selected. Please select a port from the dropdown menu in the top bar.");
      return;
    }

    setIsProcessing(true);
    onOutput?.(`Preparing upload to ${board.label} on ${selectedPort}...`);

    try {
      let activePath = projectPath;
      if (!activePath) {
        activePath = await invoke<string>("get_playground_path");
      }

      const mainSketch = files.find(f => f.name.endsWith(".ino")) || files[0];
      const sketchPath = `${activePath}/code/${mainSketch.name}`;
      // compile_sketch generates .hex in the same directory as the sketch by replacing the extension.
      const hexPath = sketchPath.replace(/\.[^/.]+$/, "") + ".hex";

      // 1. Compile if needed
      if (!hasHex) {
        onOutput?.("No compiled hex found. Compiling project first...");

        // Save all project files
        const projectFiles = files.map(file => ({
            name: file.name,
            content: file.name.endsWith(".ino") ? writeSketch(file.content) : file.content
        }));
        await invoke("save_project_files", { projectPath: activePath, files: projectFiles });

        interface CompileResult {
          hex: string;
          flash_used: number;
          ram_used: number;
        }

        const result = await invoke<CompileResult>("compile_sketch", {
          sketchPath,
          boardFqbn: board.fqbn,
        });

        onOutput?.(`Compilation successful. (Flash: ${result.flash_used} bytes, RAM: ${result.ram_used} bytes)`);
        onCompileSuccess?.(result.hex);
      }

      // 2. Upload
      onOutput?.(`Uploading to ${selectedPort}...`);
      const uploadResult = await invoke<string>("upload_hex", {
        hexPath,
        port: selectedPort,
        boardFqbn: board.fqbn,
      });

      onOutput?.(`VERIFICATION SUCCESS: ${uploadResult}`);
      onOutput?.("Your board should be running the new code.");
      if (setDebugStatus) {
        setDebugStatus(`Upload complete — flashed to ${board.label}`);
        setTimeout(() => setDebugStatus(""), 4000);
      }
      onUploadSuccess?.();
    } catch (err) {
      onOutput?.(`UPLOAD FAILED: ${err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleUpload}
      style={{
        backgroundColor: isProcessing ? COLORS.GRAPHITE_500 : COLORS.SOLDER_COPPER,
        color: COLORS.WARM_WHITE,
        border: "none",
        padding: "6px 20px",
        borderRadius: "6px",
        fontFamily: TYPOGRAPHY.UI,
        fontSize: "12px",
        fontWeight: 700,
        cursor: isProcessing ? "wait" : "pointer",
        opacity: isProcessing ? 0.7 : 1,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        outline: "none",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
      }}
    >
      <Upload size={14} />
      {isProcessing ? "PROCESSING..." : "UPLOAD"}
    </button>
  );
};
