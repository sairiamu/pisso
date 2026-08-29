import React, { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { NodeProps, Handle, Position } from "@xyflow/react";
import { PARTS_REGISTRY } from "../parts/registry";
import { Pin } from "../components/Pin";
import { COLORS } from "../CONSTANTS/colors";
import { useSimulation } from "../simulator/SimulationContext";
import { ErrorBoundary } from "../components/ErrorBoundary";

export type PartNodeData = {
  type: string;
  attrs?: Record<string, any>;
  rotation?: number;
};

export const PartNode: React.FC<NodeProps> = React.memo((props) => {
  const { pinStates, pinMappings, isSimulating } = useSimulation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dynamicPins, setDynamicPins] = useState<{ name: string; x: string; y: string }[] | null>(null);
  const retryCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const data = props.data as unknown as PartNodeData;
  const definition = data?.type ? PARTS_REGISTRY.get(data.type) : null;

  /**
   * Hardened updatePins logic to dynamically extract pin positions from Wokwi elements.
   * This is more robust than static registry definitions for complex or configurable parts.
   */
  const updatePins = useCallback(() => {
    try {
      const container = containerRef.current;
      if (!container) return;

      // Find any Wokwi element within the node
      const element = container.querySelector('[class^="wokwi-"], [tag^="wokwi-"], wokwi-arduino-uno, wokwi-led, wokwi-7segment') as any;

      if (!element) {
        if (retryCountRef.current < 15) {
          retryCountRef.current++;
          timerRef.current = setTimeout(updatePins, 100);
        }
        return;
      }

      // Safe shadow DOM and SVG inspection
      const shadow = element.shadowRoot;
      if (!shadow) {
        if (retryCountRef.current < 15) {
          retryCountRef.current++;
          timerRef.current = setTimeout(updatePins, 100);
        }
        return;
      }

      const svg = shadow.querySelector('svg');
      if (!svg) {
        if (retryCountRef.current < 15) {
          retryCountRef.current++;
          timerRef.current = setTimeout(updatePins, 100);
        }
        return;
      }

      // Validate viewBox to prevent division by zero or NaN coordinates
      const viewBox = svg.viewBox?.baseVal;
      if (!viewBox || viewBox.width <= 0 || viewBox.height <= 0) {
        if (retryCountRef.current < 15) {
          retryCountRef.current++;
          timerRef.current = setTimeout(updatePins, 100);
        }
        return;
      }

      const { x: vx, y: vy, width: vw, height: vh } = viewBox;

      // Inspect pinInfo property provided by Wokwi elements
      const pinInfo = element.pinInfo;
      if (!pinInfo || !Array.isArray(pinInfo)) {
        if (definition && definition.pins.length > 0 && retryCountRef.current < 10) {
          retryCountRef.current++;
          timerRef.current = setTimeout(updatePins, 100);
        }
        return;
      }

      const newPins = pinInfo.map((p: any) => {
        // Validate each pin's data
        if (!p || typeof p.x !== 'number' || typeof p.y !== 'number' || !p.name) return null;
        if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) return null;

        // Convert absolute SVG coordinates to percentage-based CSS coordinates
        return {
          name: p.name,
          x: `${((p.x - vx) / vw) * 100}%`,
          y: `${((p.y - vy) / vh) * 100}%`
        };
      }).filter(Boolean) as { name: string; x: string; y: string }[];

      if (newPins.length > 0) {
        setDynamicPins(newPins);
      }
    } catch (err) {
      console.warn("PartNode: Error updating dynamic pins:", err);
    }
  }, [definition]);

  useEffect(() => {
    retryCountRef.current = 0;
    updatePins();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [updatePins, data.attrs]);

  const pins = useMemo(() => {
    // Prefer dynamic pins from the actual element if available
    if (dynamicPins && dynamicPins.length > 0) return dynamicPins;

    // Fallback to static definitions from the registry
    if (!definition) return [];

    try {
      const { x: vx, y: vy, width: vw, height: vh } = definition.viewBox;
      if (vw <= 0 || vh <= 0) return [];

      return definition.pins.map(p => ({
        name: p.name,
        x: `${((Number(p.x) - vx) / vw) * 100}%`,
        y: `${((Number(p.y) - vy) / vh) * 100}%`
      }));
    } catch (e) {
      return [];
    }
  }, [definition, dynamicPins]);

  // Resolve pin values for simulation
  const pinValues = useMemo(() => {
    const values: Record<string, 'HIGH' | 'LOW' | 'FLOAT'> = {};
    if (isSimulating && pins.length > 0) {
      pins.forEach(pin => {
        const key = `${props.id}:${pin.name}`;
        const mappedArduinoPins = pinMappings[key] || [];

        if (mappedArduinoPins.some(p => String(p).toLowerCase().includes('gnd'))) {
          values[pin.name] = 'LOW';
        } else {
          const states = mappedArduinoPins.map(p => pinStates[p]).filter(Boolean);
          if (states.includes('HIGH')) {
            values[pin.name] = 'HIGH';
          } else if (states.includes('LOW')) {
            values[pin.name] = 'LOW';
          } else {
            values[pin.name] = 'FLOAT';
          }
        }
      });
    }
    return values;
  }, [isSimulating, pins, pinMappings, pinStates, props.id]);

  if (!data || !data.type) {
    return <div style={{ color: "orange" }}>Missing Node Data</div>;
  }

  if (!definition) {
    return (
      <div
        style={{
          padding: 10,
          background: "rgba(255,0,0,0.2)",
          color: "white",
          border: "1px solid red",
        }}
      >
        Unknown Part: {data.type}
      </div>
    );
  }

  const rotation = data.rotation || 0;

  return (
    <ErrorBoundary name={`PartNode(${data.type})`}>
      <div
        ref={containerRef}
        className="pissow-part-node"
        style={{
          position: "relative",
          minWidth: "100px",
          minHeight: "100px",
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center center",
          padding: "20px",
          backgroundColor: props.selected ? "rgba(201, 122, 75, 0.2)" : "rgba(60, 64, 72, 0.8)",
          border: props.selected ? `2px solid ${COLORS.SOLDER_COPPER}` : `1px solid ${COLORS.GRAPHITE_500}`,
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <div style={{ color: COLORS.WARM_WHITE, fontSize: "10px", marginBottom: "5px", opacity: 0.5 }}>
          {definition.label}
        </div>
        <div style={{ position: "relative", display: "inline-block" }}>
          {/* Render the actual Wokwi element */}
          <div style={{ pointerEvents: "none" }}>
            {definition.render({ attrs: data.attrs || {}, pinValues })}
          </div>

          {/* Render draggable connection points */}
          {pins.map((pin) => (
            <Pin
              key={pin.name}
              id={pin.name}
              x={pin.x}
              y={pin.y}
              _internal={true}
            />
          ))}

          {/* Development helper to cross-check pin placement */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <wokwi-show-pins />
            </div>
          )}
        </div>

        {/* Hidden handles for React Flow connectivity */}
        {pins.length === 0 && (
          <>
            <Handle id="loading-source" type="source" position={Position.Bottom} style={{ opacity: 0 }} />
            <Handle id="loading-target" type="target" position={Position.Top} style={{ opacity: 0 }} />
          </>
        )}
      </div>
    </ErrorBoundary>
  );
});
