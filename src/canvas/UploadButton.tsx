import React, { useState } from "react";
import { Upload } from "lucide-react";
import { COLORS } from "../CONSTANTS/colors";
import { TYPOGRAPHY } from "../CONSTANTS/typography";
import { FileEntry } from "../App";
import { BoardInfo } from "../domain/models";
import { ProjectManager } from "../application/ProjectManager";
import { CompilerService } from "../application/compiler-service";
import { BuildManager } from "../application/BuildManager";
import { getBoardByFqbn } from "../domain/boards";
import { Project, ProjectFile } from "../domain/models";

interface UploadButtonProps {
  projectPath: string | null;
  selectedPort: string | null;
  hasHex: boolean;
  files: FileEntry[];
  onCompileSuccess?: (hex: string) => void;
  onOutput?: (output: string | null) => void;
  onBuildResult?: (result: BuildResult | null) => void;
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
  onBuildResult,
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
    onBuildResult?.(null);

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

    const boardDef = getBoardByFqbn(board.fqbn);
    if (!boardDef) {
      onOutput?.(`Error: Unknown board configuration for ${board.fqbn}`);
      return;
    }

    if (!selectedPort) {
      onOutput?.("Error: No serial port selected. Please select a port from the dropdown menu in the top bar.");
      return;
    }

    setIsProcessing(true);
    onOutput?.(`Preparing upload to ${boardDef.name} on ${selectedPort}...`);

    try {
      let activePath = projectPath;
      if (!activePath) {
        activePath = await ProjectManager.getPlaygroundPath();
      }

      const mainSketch = files.find(f => f.name.endsWith(".ino")) || files[0];
      const sketchPath = `${activePath}/src/${mainSketch.name}`;
      // compile_sketch generates .hex in the same directory as the sketch by replacing the extension.
      const hexPath = sketchPath.replace(/\.[^/.]+$/, "") + ".hex";

      // 1. Compile if needed
      if (!hasHex) {
        onOutput?.("No compiled hex found. Compiling project first...");

        const buildProject: any = {
          rootPath: activePath,
          files: files as ProjectFile[],
          circuit: { components: [], connections: [], nets: [], version: 1 }
        };

        const buildResult = await BuildManager.build(buildProject, board.fqbn);
        onBuildResult?.(buildResult);

        if (buildResult.status !== 'success') {
          onOutput?.(`COMPILATION FAILED: ${buildResult.output}`);
          setIsProcessing(false);
          return;
        }

        onOutput?.(`Compilation successful. (Flash: ${buildResult.flashUsed} bytes, RAM: ${buildResult.ramUsed} bytes)`);
        if (buildResult.hex) {
          onCompileSuccess?.(buildResult.hex);
        }
      }

      // 2. Upload
      onOutput?.(`Uploading to ${selectedPort}...`);
      const uploadResult = await CompilerService.upload(
        hexPath,
        selectedPort,
        boardDef
      );

      onOutput?.(`VERIFICATION SUCCESS: ${uploadResult}`);
      onOutput?.("Your board should be running the new code.");
      if (setDebugStatus) {
        setDebugStatus(`Upload complete — flashed to ${boardDef.name}`);
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
