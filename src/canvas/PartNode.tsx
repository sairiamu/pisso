import React from "react";
import { NodeProps, Handle, Position } from "@xyflow/react";
import { PARTS_REGISTRY } from "../parts/registry";
import { Pin } from "../components/Pin";

export type PartNodeData = {
  type: string;
  attrs?: Record<string, any>;
  rotation?: number;
};

export const PartNode: React.FC<NodeProps> = React.memo((props) => {
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

    return (
      <div
        className="pissow-part-node"
        style={{
          position: "relative",
          minWidth: 50,
          minHeight: 50,
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center center",
        }}
      >
        {definition.render({ attrs: data.attrs || {} })}
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
