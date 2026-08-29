import React, { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { NodeProps, Handle, Position } from "@xyflow/react";
import { PARTS_REGISTRY } from "../parts/registry";
import { Pin } from "../components/Pin";
import { COLORS } from "../CONSTANTS/colors";
import { useSimulation } from "../simulator/SimulationContext";
import { ErrorBoundary } from "../components/ErrorBoundary";

export type PartNodeData = {
  type: string;
  attrs?: Record<string, any>;
  rotation?: number;
};

const SafePartRender: React.FC<{
  definition: any;
  attrs: any;
  pinValues: any;
  nodeId: string;
}> = ({ definition, attrs, pinValues, nodeId }) => {
  try {
    return (
      <div className="wokwi-container" style={{ display: "inline-block", margin: 0, padding: 0, lineHeight: 0 }}>
        {definition.render({ attrs, pinValues })}
      </div>
    );
  } catch (err) {
    return (
      <div style={{ color: "red", fontSize: "10px", padding: "5px", border: "1px solid red" }}>
        Error: {definition.type}
      </div>
    );
  }
};

export const PartNode: React.FC<NodeProps> = React.memo((props) => {
  const { pinStates, pinMappings, isSimulating } = useSimulation();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const refSvgRef = useRef<SVGSVGElement>(null);
  const [dynamicPins, setDynamicPins] = useState<{ name: string; x: number; y: number }[] | null>(null);
  const retryCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const data = props.data as unknown as PartNodeData;
  const definition = data?.type ? PARTS_REGISTRY.get(data.type) : null;

  const updatePins = useCallback(() => {
    try {
      const wrapper = wrapperRef.current;
      const refSvg = refSvgRef.current;
      if (!wrapper || !refSvg) return;

      // Find the Wokwi element
      const element = Array.from(wrapper.querySelectorAll('*'))
        .find(el => el.tagName.toLowerCase().includes('wokwi-')) as HTMLElement;

      if (!element || !element.shadowRoot) {
        if (retryCountRef.current < 50) {
          retryCountRef.current++;
          timerRef.current = setTimeout(updatePins, 100);
        }
        return;
      }

      const svg = element.shadowRoot.querySelector('svg');
      if (!svg) {
        if (retryCountRef.current < 50) {
          retryCountRef.current++;
          timerRef.current = setTimeout(updatePins, 100);
        }
        return;
      }

      const pinInfo = (element as any).pinInfo;
      if (!pinInfo || !Array.isArray(pinInfo) || pinInfo.length === 0) {
        if (retryCountRef.current < 50) {
          retryCountRef.current++;
          timerRef.current = setTimeout(updatePins, 100);
        }
        return;
      }

      // MATHEMATICALLY PERFECT COORDINATE MAPPING
      // 1. Get the matrix that transforms Wokwi SVG units to screen pixels
      const svgToScreen = svg.getScreenCTM();
      // 2. Get the matrix that transforms local pixels in our wrapperRef to screen pixels
      const wrapperToScreen = refSvg.getScreenCTM();

      if (!svgToScreen || !wrapperToScreen) {
        if (retryCountRef.current < 50) {
          retryCountRef.current++;
          timerRef.current = setTimeout(updatePins, 100);
        }
        return;
      }

      // 3. Create a relative matrix: Wokwi SVG Space -> Screen -> Local Wrapper Space
      // The wrapperToScreen.inverse() maps screen pixels back to local CSS pixels.
      const relMatrix = wrapperToScreen.inverse().multiply(svgToScreen);

      const pt = svg.createSVGPoint();
      const newPins = pinInfo.map((p: any) => {
        if (!p || typeof p.x !== 'number' || typeof p.y !== 'number' || !p.name) return null;
        pt.x = p.x;
        pt.y = p.y;

        // Transform the point from internal Wokwi units to local wrapper pixels
        const pLoc = pt.matrixTransform(relMatrix);

        return {
          name: p.name,
          x: pLoc.x,
          y: pLoc.y
        };
      }).filter(Boolean) as { name: string; x: number; y: number }[];

      if (newPins.length > 0) {
        setDynamicPins(newPins);
      }
    } catch (err) {
      console.error(`PartNode: Matrix sync failed for ${data.type}`, err);
    }
  }, [definition, data.type]);

  useEffect(() => {
    retryCountRef.current = 0;
    updatePins();

    // Refresh at key intervals to catch slow-rendering components
    const timers = [100, 500, 1500, 3000].map(ms => setTimeout(updatePins, ms));
    return () => timers.forEach(t => clearTimeout(t));
  }, [updatePins, data.attrs, data.rotation]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const observer = new ResizeObserver(() => updatePins());
    observer.observe(wrapper);
    const element = Array.from(wrapper.querySelectorAll('*')).find(el => el.tagName.toLowerCase().includes('wokwi-'));
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, [updatePins]);

  const pins = useMemo(() => dynamicPins || [], [dynamicPins]);

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
          if (states.includes('HIGH')) values[pin.name] = 'HIGH';
          else if (states.includes('LOW')) values[pin.name] = 'LOW';
          else values[pin.name] = 'FLOAT';
        }
      });
    }
    return values;
  }, [isSimulating, pins, pinMappings, pinStates, props.id]);

  const rotation = data.rotation || 0;

  return (
    <ErrorBoundary name={`PartNode(${data.type})`}>
      <div
        className="pissow-part-node"
        style={{
          position: "relative",
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center center",
          padding: "20px",
          backgroundColor: props.selected ? "rgba(201, 122, 75, 0.2)" : "rgba(30, 32, 38, 0.4)",
          border: props.selected ? `2px solid ${COLORS.SOLDER_COPPER}` : `1px solid ${COLORS.GRAPHITE_500}`,
          borderRadius: "8px",
          display: "inline-block",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          textAlign: "center"
        }}
      >
        <div style={{ color: COLORS.WARM_WHITE, fontSize: "10px", marginBottom: "8px", opacity: 0.6, fontFamily: "monospace", pointerEvents: "none" }}>
          {definition?.label}
        </div>

        <div
          ref={wrapperRef}
          style={{
            position: "relative",
            display: "inline-block",
            lineHeight: 0
          }}
        >
          {/* Reference SVG at origin (0,0) for sub-pixel coordinate mapping */}
          <svg
            ref={refSvgRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '1px',
              height: '1px',
              opacity: 0, // Must be rendered but invisible
              pointerEvents: 'none'
            }}
          >
            <rect width="1" height="1" />
          </svg>

          {/* Render the actual Wokwi element */}
          <div style={{ pointerEvents: "none", display: "inline-block" }}>
            <SafePartRender
              definition={definition}
              attrs={data.attrs || {}}
              pinValues={pinValues}
              nodeId={props.id}
            />
          </div>

          {/* Render draggable handles at mathematically transformed coordinates */}
          {pins.map((pin) => (
            <Pin
              key={pin.name}
              id={pin.name}
              x={pin.x}
              y={pin.y}
              _internal={true}
            />
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
});
