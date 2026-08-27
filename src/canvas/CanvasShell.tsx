import React, { useMemo, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Panel } from "../components/Panel";
import { COLORS } from "../CONSTANTS/colors";
import { PartNode } from "./PartNode";
import { WireEdge } from "./WireEdge";
import { resolveNode, Diagram } from "../netlist";

const nodeTypes = {
  part: PartNode,
};

const edgeTypes = {
  wire: WireEdge,
};

const initialNodes: Node[] = [
  {
    id: "uno-1",
    type: "part",
    position: { x: 50, y: 50 },
    data: { type: "wokwi-arduino-uno", attrs: {} },
  },
  {
    id: "res-1",
    type: "part",
    position: { x: 350, y: 150 },
    data: { type: "wokwi-resistor", attrs: { value: "220" } },
  },
  {
    id: "led-1",
    type: "part",
    position: { x: 500, y: 50 },
    data: { type: "wokwi-led", attrs: { color: "red" } },
  },
  {
    id: "bb-1",
    type: "part",
    position: { x: 50, y: 400 },
    data: { type: "wokwi-breadboard", attrs: {} },
  },
];

export const CanvasShell: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([
    {
      id: "short-wire",
      source: "uno-1",
      target: "uno-1",
      sourceHandle: "5V",
      targetHandle: "GND.2",
      type: "wire",
      data: { isShorted: false },
    },
  ]);

  // Validate connections and detect shorts
  useEffect(() => {
    const diagram: Diagram = {
      version: 1,
      parts: nodes.map((n) => ({
        id: n.id,
        type: (n.data as any).type,
        attrs: (n.data as any).attrs || {},
      })),
      connections: edges.map((e) => ({
        id: e.id,
        from: { partId: e.source, pin: e.sourceHandle || "" },
        to: { partId: e.target, pin: e.targetHandle || "" },
      })),
    };

    let hasChanged = false;
    const newEdges = edges.map((edge) => {
      const sourcePin = { partId: edge.source, pin: edge.sourceHandle || "" };
      const connectedPins = resolveNode(diagram, sourcePin);

      const has5V = connectedPins.some(p => p.pin.includes("5V"));
      const hasGND = connectedPins.some(p => p.pin.toLowerCase().includes("gnd"));
      const isShorted = has5V && hasGND;

      if (edge.data?.isShorted !== isShorted) {
        hasChanged = true;
        return { ...edge, data: { ...edge.data, isShorted } };
      }
      return edge;
    });

    if (hasChanged) {
      setEdges(newEdges);
    }
  }, [nodes, edges, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        type: "wire",
        id: `w-${Date.now()}`,
        data: { isShorted: false }
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const memoizedNodeTypes = useMemo(() => nodeTypes, []);
  const memoizedEdgeTypes = useMemo(() => edgeTypes, []);

  return (
    <Panel
      showScrews={true}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 1, width: "100%", height: "100%", minHeight: "600px" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={memoizedNodeTypes}
          edgeTypes={memoizedEdgeTypes}
          connectionMode={ConnectionMode.Loose}
          colorMode="dark"
          fitView
          deleteKeyCode={["Backspace", "Delete"]}
          style={{ backgroundColor: COLORS.GRAPHITE_900 }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            color={COLORS.GRAPHITE_500}
            gap={20}
          />
        </ReactFlow>
      </div>
    </Panel>
  );
};
