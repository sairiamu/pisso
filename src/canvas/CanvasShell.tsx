import React, { useMemo, useCallback, useEffect, useState, useImperativeHandle, forwardRef, useRef } from "react";
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
  ReactFlowInstance,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Panel } from "../components/Panel";
import { COLORS } from "../CONSTANTS/colors";
import { PartNode } from "./PartNode";
import { WireEdge } from "./WireEdge";
import { InspectorPanel } from "./InspectorPanel";
import { ProjectContextMenu } from "./ProjectContextMenu";
import { resolveNode, Diagram, PartInstance } from "../diagram";
import { PARTS_REGISTRY } from "../parts";
import { useSimulation } from "../simulator/SimulationContext";
import "../parts"; // Ensure all parts are registered

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

const CanvasInternal = forwardRef<CanvasShellHandle>((_, ref) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const { setPinMappings } = useSimulation();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
      });
    },
    [setContextMenu]
  );

  const addPartInternal = useCallback((type: string, position?: { x: number, y: number }) => {
    try {
      const definition = PARTS_REGISTRY.get(type);
      if (!definition) {
        setLastError(`Part definition not found for type: ${type}`);
        console.warn(`Part definition not found for type: ${type}`);
        return;
      }

      const id = `${type}-${Math.random().toString(36).substr(2, 9)}`;

      const newNode: Node = {
        id,
        type: "part",
        position: { x: 0, y: 0 }, // Will be updated
        data: {
          type,
          attrs: definition.defaultAttrs ? { ...definition.defaultAttrs } : {},
          rotation: 0,
        },
      };

      setNodes((nds) => {
        const pos = position || {
          x: 150 + (nds.length * 50) % 400,
          y: 150 + (nds.length * 50) % 400
        };
        const updatedNode = { ...newNode, position: pos };
        console.log("Adding node:", updatedNode);
        return [...nds, updatedNode];
      });
    } catch (err) {
      setLastError(String(err));
    }
  }, [setNodes]);

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
      addPart: (type: string) => addPartInternal(type),
    }),
    [nodes, edges, setNodes, setEdges, addPartInternal]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addPartInternal(type, position);
    },
    [reactFlowInstance, addPartInternal]
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

    // Update simulation pin mappings
    const mappings: Record<string, (string | number)[]> = {};
    const unoPart = diagram.parts.find(p => p.type === 'arduino-uno');

    if (unoPart) {
      diagram.parts.forEach(part => {
        const definition = PARTS_REGISTRY.get(part.type);
        if (definition) {
          definition.pins.forEach(pin => {
            const connectedPins = resolveNode(diagram, { partId: part.id, pin: pin.name });
            const unoConnections = connectedPins
              .filter(p => p.partId === unoPart.id)
              .map(p => p.pin);

            if (unoConnections.length > 0) {
              mappings[`${part.id}:${pin.name}`] = unoConnections;
            }
          });
        }
      });
    }
    setPinMappings(mappings);
  }, [nodes, edges, setEdges, setPinMappings]);

  // Debug: log nodes to console
  useEffect(() => {
    console.log("Current Canvas Nodes:", nodes);
  }, [nodes]);

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
      <div
        ref={reactFlowWrapper}
        style={{ flex: 1, height: "100%", minHeight: "600px" }}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onPaneContextMenu={onPaneContextMenu}
          nodeTypes={memoizedNodeTypes}
          edgeTypes={memoizedEdgeTypes}
          connectionMode={ConnectionMode.Loose}
          colorMode="dark"
          deleteKeyCode={["Backspace", "Delete"]}
          style={{ backgroundColor: COLORS.GRAPHITE_900 }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            color={COLORS.GRAPHITE_500}
            gap={20}
          />
          {lastError && (
            <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, background: 'red', color: 'white', padding: '4px 8px', borderRadius: 4 }}>
              {lastError}
            </div>
          )}
          <div style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 1000, color: COLORS.FOG, fontSize: 10 }}>
            Nodes: {nodes.length}
          </div>
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
      {contextMenu && (
        <ProjectContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onShare={() => console.log("Share project")}
          onRename={() => console.log("Rename project")}
          onEdit={() => console.log("Edit project")}
          onSubmit={() => console.log("Submit project")}
          onDelete={() => console.log("Delete project")}
        />
      )}
    </Panel>
  );
});

export const CanvasShell = forwardRef<CanvasShellHandle>((props, ref) => (
  <ReactFlowProvider>
    <CanvasInternal {...props} ref={ref} />
  </ReactFlowProvider>
));
