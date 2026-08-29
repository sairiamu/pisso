import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Upload } from "lucide-react";
import { COLORS } from "../CONSTANTS/colors";
import { TYPOGRAPHY } from "../CONSTANTS/typography";
import { writeSketch } from "../diagram/sketch";

interface UploadButtonProps {
  projectPath: string | null;
  selectedPort: string | null;
  hasHex: boolean;
  code: string;
  onCompileSuccess?: (hex: string) => void;
  onOutput?: (output: string | null) => void;
  onUploadSuccess?: () => void;
}

export const UploadButton: React.FC<UploadButtonProps> = ({
  projectPath,
  selectedPort,
  hasHex,
  code,
  onCompileSuccess,
  onOutput,
  onUploadSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = async () => {
    console.log("UploadButton: handleUpload clicked", { selectedPort, hasHex });

    if (isProcessing) return;

    if (!selectedPort) {
      onOutput?.("Error: No serial port selected. Please select a port from the dropdown menu in the top bar.");
      return;
    }

    setIsProcessing(true);
    onOutput?.(null); // Clear previous output
    onOutput?.(`Preparing upload to ${selectedPort}...`);

    try {
      let activePath = projectPath;
      if (!activePath) {
        activePath = await invoke<string>("get_playground_path");
      }

      // 1. Compile if needed
      if (!hasHex) {
        onOutput?.("No compiled hex found. Compiling sketch first...");
        await invoke("save_sketch", {
            projectPath: activePath,
            sketchCode: writeSketch(code || "")
        });

        const hexContent = await invoke<string>("compile_sketch", {
          sketchPath: `${activePath}/sketch.ino`,
          boardFqbn: "arduino:avr:uno",
        });

        onOutput?.("Compilation successful.");
        onCompileSuccess?.(hexContent);
      }

      // 2. Upload
      onOutput?.(`Uploading to ${selectedPort}...`);
      await invoke("upload_hex", {
        hexPath: `${activePath}/sketch.hex`,
        port: selectedPort,
        boardFqbn: "arduino:avr:uno",
      });

      onOutput?.("UPLOAD SUCCESSFUL! Your board should be running the new code.");
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
