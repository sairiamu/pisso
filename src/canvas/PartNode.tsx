import React from "react";
import { NodeProps, Handle, Position } from "@xyflow/react";
import { PARTS_REGISTRY } from "../parts/registry";
import { Pin } from "../components/Pin";
import { COLORS } from "../CONSTANTS/colors";
import { useSimulation } from "../simulator/SimulationContext";

export type PartNodeData = {
  type: string;
  attrs?: Record<string, any>;
  rotation?: number;
};

export const PartNode: React.FC<NodeProps> = React.memo((props) => {
  const { pinStates, pinMappings, isSimulating } = useSimulation();

  try {
    const data = props.data as unknown as PartNodeData;
    if (!data || !data.type) {
      return <div style={{ color: "orange" }}>Missing Node Data</div>;
    }

    const definition = PARTS_REGISTRY.get(data.type);

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

    // Resolve pin values for simulation
    const pinValues: Record<string, 'HIGH' | 'LOW' | 'FLOAT'> = {};
    if (isSimulating) {
      definition.pins.forEach(pin => {
        const key = `${props.id}:${pin.name}`;
        const mappedArduinoPins = pinMappings[key] || [];

        // If connected to GND, it's LOW
        if (mappedArduinoPins.some(p => String(p).toLowerCase().includes('gnd'))) {
          pinValues[pin.name] = 'LOW';
        } else {
          // Check states of all connected Arduino pins
          const states = mappedArduinoPins.map(p => pinStates[p]).filter(Boolean);
          if (states.includes('HIGH')) {
            pinValues[pin.name] = 'HIGH';
          } else if (states.includes('LOW')) {
            pinValues[pin.name] = 'LOW';
          } else {
            pinValues[pin.name] = 'FLOAT';
          }
        }
      });
    }

    return (
      <div
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
        <div style={{ pointerEvents: "none" }}>
          {definition.render({ attrs: data.attrs || {}, pinValues })}
        </div>
        {definition.pins.map((pin) => (
          <Pin
            key={pin.name}
            id={pin.name}
            x={pin.x}
            y={pin.y}
            _internal={true}
          />
        ))}
        {/* Fallback handles just in case, with explicit IDs to avoid conflicts */}
        <Handle
          id="fallback-source"
          type="source"
          position={Position.Bottom}
          style={{ opacity: 0 }}
        />
        <Handle
          id="fallback-target"
          type="target"
          position={Position.Top}
          style={{ opacity: 0 }}
        />
      </div>
    );
  } catch (e) {
    console.error("Error rendering PartNode", e);
    return <div style={{ color: "red" }}>Render Error</div>;
  }
});
