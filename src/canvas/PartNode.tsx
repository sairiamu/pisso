import React, { useState, useRef, useEffect, useMemo } from "react";
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

interface InternalPin {
  name: string;
  x: string | number;
  y: string | number;
}

export const PartNode: React.FC<NodeProps> = React.memo((props) => {
  const { pinStates, pinMappings, isSimulating } = useSimulation();
  const [pins, setPins] = useState<InternalPin[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const data = props.data as unknown as PartNodeData;
  const definition = data?.type ? PARTS_REGISTRY.get(data.type) : null;

  useEffect(() => {
    let mounted = true;
    const updatePins = () => {
      if (!mounted) return;
      const element = containerRef.current?.querySelector('[class^="wokwi-"], wokwi-led, wokwi-arduino-uno, wokwi-resistor, wokwi-pushbutton, wokwi-breadboard');
      if (element) {
        const pinInfo = (element as any).pinInfo;
        const svg = element.shadowRoot?.querySelector('svg');
        if (pinInfo && svg) {
          const { width, height } = svg.viewBox.baseVal;
          const newPins = pinInfo.map((p: any) => ({
            name: p.name,
            x: `${(p.x / width) * 100}%`,
            y: `${(p.y / height) * 100}%`
          }));
          setPins(newPins);
        } else {
          // Retry if not yet loaded
          setTimeout(updatePins, 50);
        }
      }
    };

    updatePins();
    return () => { mounted = false; };
  }, [data?.attrs, data?.type]);

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

  try {
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

          {/* Render one draggable connection point per pin */}
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

        {/*
            Hidden handles to satisfy React Flow's requirement for at least one source/target
            if pins haven't loaded yet, but with the new dynamic system these are mostly redundant.
        */}
        {pins.length === 0 && (
          <>
            <Handle id="loading-source" type="source" position={Position.Bottom} style={{ opacity: 0 }} />
            <Handle id="loading-target" type="target" position={Position.Top} style={{ opacity: 0 }} />
          </>
        )}
      </div>
    );
  } catch (e) {
    console.error("Error rendering PartNode", e);
    return <div style={{ color: "red" }}>Render Error</div>;
  }
});
