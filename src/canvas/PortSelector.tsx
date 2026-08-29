import React, { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { RefreshCw, Cpu } from "lucide-react";
import { COLORS } from "../CONSTANTS/colors";
import { TYPOGRAPHY } from "../CONSTANTS/typography";

interface SerialPort {
  port_name: string;
  vendor_id?: number;
  product_id?: number;
  is_arduino: boolean;
}

interface PortSelectorProps {
  projectPath: string | null;
  onPortSelect?: (port: string | null) => void;
}

export const PortSelector: React.FC<PortSelectorProps> = ({ projectPath, onPortSelect }) => {
  const [ports, setPorts] = useState<SerialPort[]>([]);
  const [selectedPort, setSelectedPort] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPorts = useCallback(async () => {
    setIsLoading(true);
    try {
      const availablePorts = await invoke<SerialPort[]>("list_serial_ports");
      setPorts(availablePorts);

      // If we have a selected port that's no longer available, keep it in UI but marked?
      // For now, if current selection is not in list and list not empty, don't clear it yet
      // but if we just started, try to pick an Arduino
      if (!selectedPort && availablePorts.length > 0) {
        const arduino = availablePorts.find(p => p.is_arduino);
        if (arduino) {
          setSelectedPort(arduino.port_name);
          onPortSelect?.(arduino.port_name);
        }
      }
    } catch (err) {
      console.error("Failed to list serial ports:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPort, onPortSelect]);

  // Load persisted port for project
  useEffect(() => {
    if (projectPath) {
      const saved = localStorage.getItem(`port_${projectPath}`);
      if (saved) {
        setSelectedPort(saved);
        onPortSelect?.(saved);
      }
    }
    fetchPorts();
  }, [projectPath]);

  const handleSelect = (portName: string) => {
    setSelectedPort(portName);
    onPortSelect?.(portName);
    if (projectPath) {
      localStorage.setItem(`port_${projectPath}`, portName);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ position: "relative" }}>
        <select
          value={selectedPort || ""}
          onChange={(e) => handleSelect(e.target.value)}
          style={{
            backgroundColor: COLORS.GRAPHITE_900,
            color: COLORS.WARM_WHITE,
            border: `1px solid ${COLORS.GRAPHITE_500}`,
            borderRadius: "6px",
            padding: "6px 32px 6px 12px",
            fontSize: "12px",
            fontFamily: TYPOGRAPHY.UI,
            appearance: "none",
            cursor: "pointer",
            minWidth: "140px",
            outline: "none"
          }}
        >
          <option value="" disabled>Select Port...</option>
          {ports.map((p) => (
            <option key={p.port_name} value={p.port_name}>
              {p.port_name} {p.is_arduino ? "(Arduino)" : ""}
            </option>
          ))}
          {ports.length === 0 && <option value="" disabled>No ports found</option>}
        </select>
        <div style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.6 }}>
          <Cpu size={14} color={COLORS.WARM_WHITE} />
        </div>
      </div>

      <button
        onClick={fetchPorts}
        disabled={isLoading}
        title="Refresh ports"
        style={{
          backgroundColor: "transparent",
          color: COLORS.FOG,
          border: "none",
          padding: "4px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "4px",
          transition: "background-color 0.2s"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.GRAPHITE_500)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} style={{
             animation: isLoading ? "spin 1s linear infinite" : "none"
        }} />
      </button>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};
