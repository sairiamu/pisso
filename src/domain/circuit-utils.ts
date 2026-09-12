import { Node, Edge } from "@xyflow/react";
import { Circuit, ComponentInstance, Connection } from "./models";
import { PARTS_REGISTRY } from "../parts";

/**
 * Converts a domain Circuit model to React Flow nodes and edges.
 */
export function circuitToReactFlow(circuit: Circuit): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = circuit.components.map((c) => {
    const definition = PARTS_REGISTRY.get(c.definitionId);
    return {
      id: c.id,
      type: definition?.isBoard ? "board" : "part",
      position: { x: c.x, y: c.y },
      data: {
        type: c.definitionId,
        attrs: { ...c.attributes },
        rotation: c.rotation,
      },
    };
  });

  const edges: Edge[] = circuit.connections.map((c) => ({
    id: c.id,
    source: c.from.componentId,
    sourceHandle: c.from.pinName,
    target: c.to.componentId,
    targetHandle: c.to.pinName,
    type: "wire",
    data: {
      color: c.color,
      thickness: c.thickness ?? 3,
      tracked: c.tracked ?? false,
      waypoints: c.waypoints ? [...c.waypoints] : [],
      isShorted: false, // Calculated at runtime in the UI
    },
  }));

  return { nodes, edges };
}

/**
 * Converts React Flow nodes and edges back to a domain Circuit model.
 */
export function reactFlowToCircuit(nodes: Node[], edges: Edge[]): Circuit {
  const components: ComponentInstance[] = nodes.map((n) => ({
    id: n.id,
    definitionId: (n.data as any).type,
    x: n.position.x,
    y: n.position.y,
    rotation: (n.data as any).rotation || 0,
    attributes: { ...(n.data as any).attrs },
  }));

  const connections: Connection[] = edges.map((e) => ({
    id: e.id,
    from: {
      componentId: e.source,
      pinName: e.sourceHandle || "",
    },
    to: {
      componentId: e.target,
      pinName: e.targetHandle || "",
    },
    color: e.data?.color as string | undefined,
    thickness: e.data?.thickness as number | undefined,
    tracked: e.data?.tracked as boolean | undefined,
    waypoints: (e.data?.waypoints as { x: number; y: number }[]) || [],
  }));

  return {
    components,
    connections,
    nets: [], // Nets are typically derived from connections
  };
}
