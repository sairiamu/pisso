import { createContext, useContext, useRef, ReactNode, createElement } from "react";
import { Point } from "../netlist/router";

type RouteCache = Map<string, Point[]>;

const RouteCacheContext = createContext<RouteCache | null>(null);

export const RouteCacheProvider = ({ children }: { children: ReactNode }) => {
  const cache = useRef<RouteCache>(new Map()).current;
  return createElement(RouteCacheContext.Provider, { value: cache }, children);
};

/** Shared, mutable map of edgeId -> last computed route. Mutating it directly
 * (not via setState) is intentional: writes happen during another edge's
 * render, and must not trigger a fresh render pass or we get an infinite loop. */
export function useRouteCache(): RouteCache {
  const cache = useContext(RouteCacheContext);
  if (!cache) throw new Error("useRouteCache must be used within a RouteCacheProvider");
  return cache;
}
