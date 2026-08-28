import React, { useEffect, useRef, useState } from "react";
import { Panel } from "../components/Panel";
import { COLORS } from "../CONSTANTS/colors";
import { TYPOGRAPHY } from "../CONSTANTS/typography";
import { useSimulation } from "../simulator/SimulationContext";
import { X } from "lucide-react";

interface DataPoint {
  time: number;
  value: number;
}

interface GraphPanelProps {
  onClose?: () => void;
}

/**
 * GraphPanel plots digital pin states over time.
 */
export const GraphPanel: React.FC<GraphPanelProps> = ({ onClose }) => {
  const { pinStates, isSimulating } = useSimulation();
  const [monitoredPin, setMonitoredPin] = useState<string | number>(13);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);

  // Resize canvas to match container
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
        drawGraph();
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Record data points when the monitored pin changes
  useEffect(() => {
    if (!isSimulating) {
      setDataPoints([]);
      startTimeRef.current = Date.now();
      return;
    }

    const value = pinStates[monitoredPin] === "HIGH" ? 1 : 0;
    const time = (Date.now() - startTimeRef.current) / 1000;

    setDataPoints((prev) => {
      const lastPoint = prev[prev.length - 1];
      if (lastPoint && lastPoint.value === value) {
        return prev;
      }
      // Add a point just before the change to create a step effect
      const newPoints = [...prev];
      if (lastPoint) {
        newPoints.push({ time, value: lastPoint.value });
      }
      newPoints.push({ time, value });

      // Keep only last 20 seconds of data
      return newPoints.filter(p => p.time > time - 20);
    });
  }, [pinStates[monitoredPin], monitoredPin, isSimulating]);

  // Animation frame to slide the graph even if no data changes
  useEffect(() => {
    let animationFrame: number;
    const render = () => {
      drawGraph();
      animationFrame = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [dataPoints]);

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 30;
    const currentTime = (Date.now() - startTimeRef.current) / 1000;
    const timeWindow = 10; // 10 seconds visible

    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = COLORS.GRAPHITE_500;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Labels
    ctx.fillStyle = COLORS.FOG;
    ctx.font = `10px ${TYPOGRAPHY.UI}`;
    ctx.fillText("HIGH", 5, padding + 5);
    ctx.fillText("LOW", 5, height - padding + 5);

    if (dataPoints.length === 0) return;

    // Draw line
    ctx.strokeStyle = COLORS.TRACE_GREEN;
    ctx.lineWidth = 2;
    ctx.beginPath();

    const timeToX = (t: number) => {
      const elapsed = currentTime - t;
      return width - padding - (elapsed / timeWindow) * (width - 2 * padding);
    };

    const valueToY = (v: number) => {
      return v === 1 ? padding : height - padding;
    };

    let first = true;

    // Add current state point to the end
    const lastPoint = dataPoints[dataPoints.length - 1];
    const displayPoints = [...dataPoints, { time: currentTime, value: lastPoint.value }];

    for (const p of displayPoints) {
      const x = timeToX(p.time);
      const y = valueToY(p.value);

      if (x < padding) continue;

      if (first) {
        ctx.moveTo(x, y);
        first = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  };

  return (
    <Panel
      showScrews={false}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: COLORS.GRAPHITE_900,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "8px 12px",
          borderBottom: `1px solid ${COLORS.GRAPHITE_500}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: COLORS.GRAPHITE_700,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: COLORS.FOG,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontFamily: TYPOGRAPHY.UI,
            }}
          >
            Logic Analyzer
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "10px", color: COLORS.FOG }}>Pin:</span>
            <input
              type="text"
              value={monitoredPin}
              onChange={(e) => setMonitoredPin(e.target.value)}
              style={{
                width: "30px",
                backgroundColor: COLORS.GRAPHITE_900,
                border: `1px solid ${COLORS.GRAPHITE_500}`,
                borderRadius: "3px",
                color: COLORS.WARM_WHITE,
                fontSize: "10px",
                textAlign: "center",
                outline: "none"
              }}
            />
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              backgroundColor: "transparent",
              color: COLORS.FOG,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              opacity: 0.6
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>
      <div
        ref={containerRef}
        style={{ flex: 1, position: "relative", padding: "10px", minHeight: 0 }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </div>
    </Panel>
  );
};
