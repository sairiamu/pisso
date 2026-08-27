import React, { useMemo, useCallback, useEffect, useState, useImperativeHandle, forwardRef } from "react";
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
import { InspectorPanel } from "./InspectorPanel";
import { resolveNode, Diagram, PartInstance } from "../diagram";
import { PARTS_REGISTRY } from "../parts/registry";

const nodeTypes = {
  part: PartNode,
};

const edgeTypes = {
  wire: WireEdge,
};

export interface CanvasShellHandle {
  getDiagram: () => Diagram;
  setDiagram: (diagram: Diagram) => void;
  addPart: (type: string) => void;
}

export const CanvasShell = forwardRef<CanvasShellHandle>((_, ref) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useImperativeHandle(
    ref,
    () => ({
      getDiagram: () => ({
        version: 1,
        parts: nodes.map((n) => ({
          id: n.id,
          type: (n.data as any).type,
          x: n.position.x,
          y: n.position.y,
          rotation: (n.data as any).rotation || 0,
          attrs: (n.data as any).attrs || {},
        })),
        connections: edges.map((e) => ({
          id: e.id,
          from: { partId: e.source, pin: e.sourceHandle || "" },
          to: { partId: e.target, pin: e.targetHandle || "" },
        })),
      }),
      setDiagram: (diagram: Diagram) => {
        setNodes(
          diagram.parts.map((p) => ({
            id: p.id,
            type: "part",
            position: { x: p.x, y: p.y },
            data: { type: p.type, attrs: p.attrs, rotation: p.rotation },
          }))
        );
        setEdges(
          diagram.connections.map((c) => ({
            id: c.id,
            source: c.from.partId,
            sourceHandle: c.from.pin,
            target: c.to.partId,
            targetHandle: c.to.pin,
            type: "wire",
            data: { isShorted: false },
          }))
        );
      },
      addPart: (type: string) => {
        const timestamp = Date.now();
        const id = `${type}-${timestamp}`;
        const definition = PARTS_REGISTRY.get(type);

        setNodes((nds) => {
          // StrictMode or double-click guard: don't add if ID already exists
          if (nds.some((n) => n.id === id)) return nds;

          return [
            ...nds,
            {
              id,
              type: "part",
              position: { x: 100, y: 100 },
              data: {
                type,
                attrs: definition?.defaultAttrs
                  ? { ...definition.defaultAttrs }
                  : {},
                rotation: 0,
              },
            },
          ];
        });
      },
    }),
    [nodes, edges, setNodes, setEdges]
  );

  // Validate connections and detect shorts
  useEffect(() => {
    if (nodes.length === 0) return;

    const diagram: Diagram = {
      version: 1,
      parts: nodes.map((n) => ({
        id: n.id,
        type: (n.data as any).type,
        x: n.position.x,
        y: n.position.y,
        rotation: (n.data as any).rotation || 0,
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

  const onUpdateAttributes = useCallback(
    (id: string, attrs: Record<string, any>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                attrs,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const selectedNode = nodes.find((n) => n.selected);
  const selectedPart = useMemo<PartInstance | null>(() => {
    if (!selectedNode || selectedNode.type !== "part") return null;
    return {
      id: selectedNode.id,
      type: (selectedNode.data as any).type,
      x: selectedNode.position.x,
      y: selectedNode.position.y,
      rotation: (selectedNode.data as any).rotation || 0,
      attrs: (selectedNode.data as any).attrs || {},
    };
  }, [selectedNode]);

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
        flexDirection: "row",
      }}
    >
      <div style={{ flex: 1, height: "100%", minHeight: "600px" }}>
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
      {selectedPart && (
        <div style={{ width: "260px", borderLeft: `1px solid ${COLORS.GRAPHITE_500}` }}>
          <InspectorPanel
            selectedPart={selectedPart}
            onUpdateAttributes={onUpdateAttributes}
          />
        </div>
      )}
    </Panel>
  );
});
