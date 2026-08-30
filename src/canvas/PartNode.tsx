import React, { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { NodeProps } from "@xyflow/react";
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
}> = ({ definition, attrs, pinValues }) => {
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
  const [dynamicPins, setDynamicPins] = useState<{ name: string; x: number; y: number }[] | null>(null);
  const retryCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const data = props.data as unknown as PartNodeData;
  const definition = data?.type ? PARTS_REGISTRY.get(data.type) : null;

  const updatePins = useCallback(() => {
    try {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      // Find the Wokwi custom element
      const element = Array.from(wrapper.querySelectorAll('*'))
        .find(el => el.tagName.toLowerCase().includes('wokwi-')) as HTMLElement;

      if (!element || !element.shadowRoot) {
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

      // @wokwi/elements' pinInfo.x/y are already CSS pixels relative to the
      // custom element's own natural (unscaled) top-left corner — NOT the
      // same space as the element's internal mm-based SVG viewBox. Do not
      // route these through the shadow-root SVG's CTM.
      //
      // offsetWidth/offsetHeight are layout measurements, unaffected by
      // CSS transform (zoom/rotation), so they always match pinInfo's
      // coordinate space.
      const naturalWidth = element.offsetWidth;
      const naturalHeight = element.offsetHeight;
      if (naturalWidth === 0 || naturalHeight === 0) {
        if (retryCountRef.current < 50) {
          retryCountRef.current++;
          timerRef.current = setTimeout(updatePins, 100);
        }
        return;
      }

      // The wokwi element sits at the wrapper's own top-left corner (no
      // padding/margin on any element in between), so pinInfo coordinates
      // map directly onto the wrapper's local space.
      const newPins = pinInfo
        .filter((p: any) => p && typeof p.x === 'number' && typeof p.y === 'number' && p.name)
        .map((p: any) => ({ name: p.name, x: p.x, y: p.y })) as
        { name: string; x: number; y: number }[];

      if (newPins.length > 0) {
        setDynamicPins(newPins);
      }
    } catch (err) {
      console.error(`PartNode: pin sync failed for ${data.type}`, err);
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
          {/* Render the actual Wokwi element */}
          <div style={{ pointerEvents: "none", display: "inline-block" }}>
            <SafePartRender
              definition={definition}
              attrs={data.attrs || {}}
              pinValues={pinValues}
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

