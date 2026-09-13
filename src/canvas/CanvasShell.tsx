import React, { useMemo, useCallback, useEffect, useState, useImperativeHandle, forwardRef, useRef } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Connection as RFConnection,
  ConnectionMode,
  ReactFlowInstance,
  ReactFlowProvider,
  Panel as RFPanel,
  NodeChange,
  EdgeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Grid } from "lucide-react";
import { Panel } from "../components/Panel";
import { COLORS } from "../CONSTANTS/colors";
import { PartNode } from "./PartNode";
import { WireEdge } from "./WireEdge";
import { InspectorPanel } from "./InspectorPanel";
import { ProjectContextMenu } from "./ProjectContextMenu";
import { resolveNode } from "../domain/circuit-resolver";
import { Circuit, ComponentInstance, BoardInfo, PinReference } from "../domain/models";
import { circuitToReactFlow } from "../domain/circuit-utils";
import { useCircuit } from "../domain/CircuitContext";
import { PARTS_REGISTRY } from "../parts";
import { useSimulation } from "../simulator/SimulationContext";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { RouteCacheProvider } from "./RouteCache";
import { WireActionsProvider } from "./WireActions";
import "../parts"; // Ensure all parts are registered

const nodeTypes = {
  part: PartNode,
  board: PartNode,
};

const edgeTypes = {
  wire: WireEdge,
};

export interface CanvasShellHandle {
  getCircuit: () => Circuit;
  setCircuit: (circuit: Circuit) => void;
  addPart: (type: string) => void;
  getBoards: () => BoardInfo[];
}

interface CanvasInternalProps {
  onBoardsChange?: (boards: BoardInfo[]) => void;
}

const CanvasInternal = forwardRef<CanvasShellHandle, CanvasInternalProps>(({ onBoardsChange }, ref) => {
  const {
    circuit,
    addComponent,
    removeComponent,
    moveComponent,
    connectPins,
    disconnectPins,
    addWaypoint,
    moveWaypoint,
    removeWaypoint,
    setCircuit,
    undo,
    redo,
  } = useCircuit();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<Set<string>>(new Set());

  const { nodes, edges } = useMemo(() => {
    const { nodes: baseNodes, edges: baseEdges } = circuitToReactFlow(circuit);

    const enrichedNodes = baseNodes.map(node => ({
      ...node,
      selected: selectedNodeIds.has(node.id),
    }));

    const enrichedEdges = baseEdges.map(edge => {
      const sourcePin: PinReference = { componentId: edge.source, pinName: edge.sourceHandle || "" };
      const connectedPins = resolveNode(circuit, sourcePin);

      const has5V = connectedPins.some(p => p.pinName.includes("5V"));
      const hasGND = connectedPins.some(p => p.pinName.toLowerCase().includes("gnd"));
      const isShorted = has5V && hasGND;

      return {
        ...edge,
        selected: selectedEdgeIds.has(edge.id),
        data: {
          ...edge.data,
          isShorted,
        }
      };
    });

    return { nodes: enrichedNodes, edges: enrichedEdges };
  }, [circuit, selectedNodeIds, selectedEdgeIds]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    changes.forEach((change) => {
      if (change.type === "position" && change.position) {
        moveComponent(change.id, change.position.x, change.position.y);
      }
      if (change.type === "remove") {
        removeComponent(change.id);
      }
      if (change.type === "select") {
        setSelectedNodeIds(prev => {
          const next = new Set(prev);
          if (change.selected) next.add(change.id);
          else next.delete(change.id);
          return next;
        });
      }
    });
  }, [moveComponent, removeComponent]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    changes.forEach((change) => {
      if (change.type === "remove") {
        disconnectPins(change.id);
      }
      if (change.type === "select") {
        setSelectedEdgeIds(prev => {
          const next = new Set(prev);
          if (change.selected) next.add(change.id);
          else next.delete(change.id);
          return next;
        });
      }
    });
  }, [disconnectPins]);

  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [backgroundStyle, setBackgroundStyle] = useState<'dots' | 'lines' | 'plain'>('dots');
  const { setPinMappings, setSerialConnected } = useSimulation();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const wireActions = useMemo(
    () => ({
      onAddWaypoint: addWaypoint,
      onMoveWaypoint: moveWaypoint,
      onRemoveWaypoint: removeWaypoint
    }),
    [addWaypoint, moveWaypoint, removeWaypoint]
  );

  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      event.preventDefault();
      setContextMenu({
        x: (event as any).clientX,
        y: (event as any).clientY,
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

      const pos = position || {
        x: 150 + (circuit.components.length * 50) % 400,
        y: 150 + (circuit.components.length * 50) % 400
      };

      addComponent(type, pos.x, pos.y, definition.defaultAttrs ? { ...definition.defaultAttrs } : {});
    } catch (err) {
      setLastError(String(err));
    }
  }, [circuit.components.length, addComponent]);

  useImperativeHandle(
    ref,
    () => ({
      getCircuit: () => circuit,
      setCircuit: (newCircuit: Circuit) => {
        setCircuit(newCircuit);
      },
      addPart: (type: string) => addPartInternal(type),
      getBoards: () => {
        return circuit.components
          .map((c) => {
            const definition = PARTS_REGISTRY.get(c.definitionId);
            if (definition?.isBoard) {
              return {
                id: c.id,
                type: c.definitionId,
                label: definition.label,
                fqbn: definition.fqbn!,
              };
            }
            if (c.definitionId === "wokwi-arduino-uno") {
              return {
                id: c.id,
                type: c.definitionId,
                label: definition?.label || "Arduino Uno",
                fqbn: definition?.fqbn || "arduino:avr:uno",
              };
            }
            return null;
          })
          .filter((b): b is BoardInfo => b !== null);
      },
    }),
    [circuit, addPartInternal, setCircuit]
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

  // Update simulation pin mappings
  useEffect(() => {
    if (circuit.components.length === 0) return;

    const mappings: Record<string, (string | number)[]> = {};
    const unoComponent = circuit.components.find(c => c.definitionId === 'wokwi-arduino-uno');
    let rxTxConnected = false;

    if (unoComponent) {
      circuit.components.forEach(comp => {
        const definition = PARTS_REGISTRY.get(comp.definitionId);
        if (definition) {
          // Find all connected pins of this component
          const connectedPinNames = new Set<string>();
          circuit.connections.forEach(conn => {
            if (conn.from.componentId === comp.id) connectedPinNames.add(conn.from.pinName);
            if (conn.to.componentId === comp.id) connectedPinNames.add(conn.to.pinName);
          });

          connectedPinNames.forEach(pinName => {
            const connectedPins = resolveNode(circuit, { componentId: comp.id, pinName });
            const unoConnections = connectedPins
              .filter(p => p.componentId === unoComponent.id)
              .map(p => p.pinName);

            if (unoConnections.length > 0) {
              mappings[`${comp.id}:${pinName}`] = unoConnections;

              if (unoConnections.includes('0') || unoConnections.includes('1')) {
                if (connectedPins.some(p => p.componentId !== unoComponent.id)) {
                  rxTxConnected = true;
                }
              }
            }
          });
        }
      });
    }
    setPinMappings(mappings);
    setSerialConnected(rxTxConnected);
  }, [circuit, setPinMappings, setSerialConnected]);

  // Debug: log components to console
  useEffect(() => {
    console.log("Current Domain Circuit Components:", circuit.components);
    if (onBoardsChange) {
      const boards = circuit.components
        .map((c) => {
          const definition = PARTS_REGISTRY.get(c.definitionId);
          if (definition?.isBoard) {
            return {
              id: c.id,
              type: c.definitionId,
              label: definition.label,
              fqbn: definition.fqbn!,
            };
          }
          if (c.definitionId === 'wokwi-arduino-uno') {
            return {
              id: c.id,
              type: c.definitionId,
              label: definition?.label || 'Arduino Uno',
              fqbn: definition?.fqbn || 'arduino:avr:uno',
            };
          }
          return null;
        })
        .filter((b): b is BoardInfo => b !== null);
      onBoardsChange(boards);
    }
  }, [circuit, onBoardsChange]);

  const onConnect = useCallback(
    (params: RFConnection) => {
      console.log("Connecting:", params);
      connectPins(
        { componentId: params.source || "", pinName: params.sourceHandle || "" },
        { componentId: params.target || "", pinName: params.targetHandle || "" }
      );
    },
    [connectPins]
  );

  const selectedNode = nodes.find((n) => n.selected);
  const selectedEdge = edges.find((e) => e.selected) || null;
  const selectedPart = useMemo<ComponentInstance | null>(() => {
    if (!selectedNode) return null;
    return circuit.components.find((c) => c.id === selectedNode.id) || null;
  }, [selectedNode, circuit.components]);

  const memoizedNodeTypes = useMemo(() => nodeTypes, []);
  const memoizedEdgeTypes = useMemo(() => edgeTypes, []);

  return (
    <WireActionsProvider actions={wireActions}>
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
        style={{ flex: 1, height: "100%", minHeight: "600px", position: "relative" }}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <style>
          {`
            @keyframes pissow-glow-pulse {
              0% { opacity: 0.2; }
              50% { opacity: 0.5; }
              100% { opacity: 0.2; }
            }
            .pissow-wire-glow {
              animation: pissow-glow-pulse 1.5s ease-in-out infinite;
            }
            .react-flow__node-part,
            .react-flow__node-board {
              background: transparent;
              border: none;
              border-radius: 0;
              padding: 0;
              width: auto;
              box-shadow: none;
            }
            .react-flow__edges, .react-flow__connectionline {
              z-index: 1000;
              pointer-events: none;
            }
            .react-flow__edge {
              pointer-events: visibleStroke;
              cursor: pointer;
            }
            .nodrag {
              cursor: default;
            }
            .nodrag wokwi-pushbutton,
            .nodrag wokwi-slide-switch,
            .nodrag wokwi-dip-switch,
            .nodrag wokwi-tilt-switch,
            .nodrag wokwi-potentiometer,
            .nodrag wokwi-analog-joystick,
            .nodrag wokwi-rotary-encoder {
              cursor: pointer !important;
            }
          `}
        </style>
        <ErrorBoundary name="Canvas">
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
            minZoom={0.03}
            maxZoom={8}
          >
            {backgroundStyle !== 'plain' && (
              <Background
                variant={backgroundStyle === 'dots' ? BackgroundVariant.Dots : BackgroundVariant.Lines}
                color={COLORS.GRAPHITE_500}
                gap={20}
              />
            )}
            <RFPanel
              position="top-left"
              style={{
                marginTop: 50,
                marginLeft: 10,
                zIndex: 3000,
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setBackgroundStyle((s) => (s === 'dots' ? 'lines' : s === 'lines' ? 'plain' : 'dots'));
                }}
                title="Change canvas background"
                style={{
                  backgroundColor: COLORS.GRAPHITE_900,
                  border: `1px solid ${COLORS.GRAPHITE_500}`,
                  borderRadius: "6px",
                  padding: "6px 10px",
                  color: COLORS.WARM_WHITE,
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
                  pointerEvents: "all",
                }}
              >
                <Grid size={14} />
                {backgroundStyle === 'dots' ? 'Dots' : backgroundStyle === 'lines' ? 'Grid' : 'Plain'}
              </button>
            </RFPanel>
            {lastError && (
              <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, background: 'red', color: 'white', padding: '4px 8px', borderRadius: 4 }}>
                {lastError}
              </div>
            )}
            <div style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 1000, color: COLORS.FOG, fontSize: 10 }}>
              Nodes: {nodes.length}
            </div>
          </ReactFlow>
        </ErrorBoundary>
      </div>
      {(selectedPart || selectedEdge) && (
        <div style={{ width: "260px", borderLeft: `1px solid ${COLORS.GRAPHITE_500}` }}>
          <InspectorPanel
            selectedPart={selectedPart}
            selectedEdge={selectedEdge ? {
              id: selectedEdge.id,
              color: (selectedEdge.data as any)?.color as string | undefined,
              thickness: (selectedEdge.data as any)?.thickness as number | undefined,
              tracked: (selectedEdge.data as any)?.tracked as boolean | undefined,
            } : null}
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
    </WireActionsProvider>
  );
});

export interface CanvasShellProps extends CanvasInternalProps {}

export const CanvasShell = forwardRef<CanvasShellHandle, CanvasShellProps>((props, ref) => (
  <ReactFlowProvider>
    <RouteCacheProvider>
      <CanvasInternal {...props} ref={ref} />
    </RouteCacheProvider>
  </ReactFlowProvider>
));
