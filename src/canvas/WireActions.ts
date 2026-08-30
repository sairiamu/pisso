import { createContext, useContext, ReactNode, createElement } from "react";

export interface WireActions {
  onAddWaypoint: (edgeId: string, point: { x: number; y: number }, insertAtIndex: number) => void;
  onMoveWaypoint: (edgeId: string, index: number, point: { x: number; y: number }) => void;
  onRemoveWaypoint: (edgeId: string, index: number) => void;
}

const WireActionsContext = createContext<WireActions | null>(null);

export const WireActionsProvider = ({ children, actions }: { children: ReactNode; actions: WireActions }) => {
  return createElement(WireActionsContext.Provider, { value: actions }, children);
};

export function useWireActions(): WireActions {
  const actions = useContext(WireActionsContext);
  if (!actions) throw new Error("useWireActions must be used within a WireActionsProvider");
  return actions;
}
