import React from "react";
import { RotateCw, Trash2 } from "lucide-react";
import { Panel } from "../components/Panel";
import { COLORS } from "../CONSTANTS/colors";
import { ComponentInstance } from "../domain/models";
import { PARTS_REGISTRY } from "../parts/registry";
import { useCircuit } from "../domain/CircuitContext";

interface InspectorPanelProps {
  selectedPart: ComponentInstance | null;
  selectedEdge?: { id: string; color?: string; thickness?: number; tracked?: boolean } | null;
}

const ATTRIBUTE_METADATA: Record<string, { label: string; type: 'text' | 'number' | 'color' | 'boolean'; key: string }[]> = {
  'wokwi-led': [
    { key: 'color', label: 'Color', type: 'color' },
    { key: 'flip', label: 'Flip', type: 'boolean' },
    { key: 'label', label: 'Label', type: 'text' },
  ],
  'wokwi-resistor': [
    { key: 'value', label: 'Resistance (Ω)', type: 'text' },
    { key: 'label', label: 'Label', type: 'text' },
  ],
  'wokwi-pushbutton': [
    { key: 'color', label: 'Color', type: 'color' },
    { key: 'label', label: 'Label', type: 'text' },
  ],
  'wokwi-arduino-uno': [
    { key: 'label', label: 'Label', type: 'text' },
  ],
  'wokwi-breadboard': [
    { key: 'label', label: 'Label', type: 'text' },
  ],
};

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedPart,
  selectedEdge,
}) => {
  const {
    updateComponent,
    updateConnectionStyle,
    rotateComponent,
    removeComponent,
    disconnectPins
  } = useCircuit();

  if (!selectedPart && !selectedEdge) {
    return (
      <Panel
        showScrews={false}
        style={{
          width: "260px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "16px",
          boxSizing: "border-box",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p style={{ color: COLORS.FOG, fontSize: "0.8rem", textAlign: "center" }}>
          Select a part or wire to inspect its properties
        </p>
      </Panel>
    );
  }

  if (selectedEdge) {
    return (
      <Panel
        showScrews={false}
        style={{
          width: "260px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "16px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <h2
          style={{
            margin: "0 0 16px 0",
            fontSize: "1.2rem",
            color: COLORS.WARM_WHITE,
            fontFamily: "Inter, sans-serif",
          }}
        >
          Inspector
        </h2>

        <div style={{ marginBottom: "20px" }}>
          <h3
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: COLORS.FOG,
              marginBottom: "8px",
              borderBottom: `1px solid ${COLORS.GRAPHITE_500}`,
              paddingBottom: "4px",
            }}
          >
            Wire Connection
          </h3>
          <p style={{ fontSize: "0.75rem", color: COLORS.FOG, margin: "4px 0" }}>
            ID: {selectedEdge.id}
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <button
            onClick={() => disconnectPins(selectedEdge.id)}
            title="Delete wire"
            style={{
              flex: 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              backgroundColor: "transparent",
              border: `1px solid ${COLORS.FAULT_RED}`,
              borderRadius: "6px",
              padding: "8px",
              color: COLORS.FAULT_RED,
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "0.8rem", color: COLORS.FOG, marginBottom: "6px" }}>
              Color
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="color"
                value={selectedEdge.color || COLORS.TRACE_GREEN}
                onChange={(e) => updateConnectionStyle(selectedEdge.id, { color: e.target.value })}
                style={{
                  width: '32px',
                  height: '32px',
                  padding: 0,
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              />
              <input
                type="text"
                value={selectedEdge.color || COLORS.TRACE_GREEN}
                onChange={(e) => updateConnectionStyle(selectedEdge.id, { color: e.target.value })}
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  backgroundColor: COLORS.GRAPHITE_900,
                  border: `1px solid ${COLORS.GRAPHITE_500}`,
                  borderRadius: "4px",
                  color: COLORS.WARM_WHITE,
                  fontSize: "0.9rem",
                  outline: "none",
                  minWidth: 0,
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "0.8rem", color: COLORS.FOG, marginBottom: "6px" }}>
              Thickness: {selectedEdge.thickness || 3}px
            </label>
            <input
              type="range"
              min="1"
              max="8"
              step="1"
              value={selectedEdge.thickness || 3}
              onChange={(e) => updateConnectionStyle(selectedEdge.id, { thickness: parseInt(e.target.value) })}
              style={{ width: "100%", cursor: "pointer" }}
            />
          </div>

          <div style={{ marginBottom: "16px", display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="tracked-toggle"
              checked={!!selectedEdge.tracked}
              onChange={(e) => updateConnectionStyle(selectedEdge.id, { tracked: e.target.checked })}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="tracked-toggle" style={{ fontSize: "0.8rem", color: COLORS.FOG, cursor: 'pointer' }}>
              Track Connection (Glow)
            </label>
          </div>
        </div>
      </Panel>
    );
  }

  const definition = PARTS_REGISTRY.get(selectedPart!.definitionId);
  const label = definition?.label || selectedPart!.definitionId;
  const attributes = ATTRIBUTE_METADATA[selectedPart!.definitionId] || [];

  const handleAttrChange = (key: string, value: any) => {
    if (selectedPart) {
      updateComponent(selectedPart.id, {
        ...selectedPart.attributes,
        [key]: value,
      });
    }
  };

  return (
    <Panel
      showScrews={false}
      style={{
        width: "260px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "16px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <h2
        style={{
          margin: "0 0 16px 0",
          fontSize: "1.2rem",
          color: COLORS.WARM_WHITE,
          fontFamily: "Inter, sans-serif",
        }}
      >
        Inspector
      </h2>

      <div style={{ marginBottom: "20px" }}>
        <h3
          style={{
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: COLORS.FOG,
            marginBottom: "8px",
            borderBottom: `1px solid ${COLORS.GRAPHITE_500}`,
            paddingBottom: "4px",
          }}
        >
          {label}
        </h3>
        <p style={{ fontSize: "0.75rem", color: COLORS.FOG, margin: "4px 0" }}>
          ID: {selectedPart?.id}
        </p>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <button
          onClick={() => rotateComponent(selectedPart!.id)}
          title="Rotate 90°"
          style={{
            flex: 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            backgroundColor: COLORS.GRAPHITE_900,
            border: `1px solid ${COLORS.GRAPHITE_500}`,
            borderRadius: "6px",
            padding: "8px",
            color: COLORS.WARM_WHITE,
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          <RotateCw size={14} /> Rotate
        </button>
        <button
          onClick={() => removeComponent(selectedPart!.id)}
          title="Delete part"
          style={{
            flex: 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            backgroundColor: "transparent",
            border: `1px solid ${COLORS.FAULT_RED}`,
            borderRadius: "6px",
            padding: "8px",
            color: COLORS.FAULT_RED,
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {attributes.map((attr) => {
          const value = selectedPart?.attributes[attr.key] ?? "";

          return (
            <div key={attr.key} style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  color: COLORS.FOG,
                  marginBottom: "6px",
                }}
              >
                {attr.label}
              </label>

              {attr.type === 'boolean' ? (
                <input
                  type="checkbox"
                  checked={!!value}
                  onChange={(e) => handleAttrChange(attr.key, e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
              ) : attr.type === 'color' ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={value.startsWith('#') ? value : "#ff0000"} // Wokwi colors can be names or hex
                    onChange={(e) => handleAttrChange(attr.key, e.target.value)}
                    style={{
                      width: '32px',
                      height: '32px',
                      padding: 0,
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer'
                    }}
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleAttrChange(attr.key, e.target.value)}
                    style={{
                      flex: 1,
                      padding: "6px 8px",
                      backgroundColor: COLORS.GRAPHITE_900,
                      border: `1px solid ${COLORS.GRAPHITE_500}`,
                      borderRadius: "4px",
                      color: COLORS.WARM_WHITE,
                      fontSize: "0.9rem",
                      outline: "none",
                      minWidth: 0,
                    }}
                  />
                </div>
              ) : (
                <input
                  type={attr.type === 'number' ? 'number' : 'text'}
                  value={value}
                  onChange={(e) => handleAttrChange(attr.key, e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    backgroundColor: COLORS.GRAPHITE_900,
                    border: `1px solid ${COLORS.GRAPHITE_500}`,
                    borderRadius: "4px",
                    color: COLORS.WARM_WHITE,
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              )}
            </div>
          );
        })}

        {attributes.length === 0 && (
          <p style={{ fontSize: "0.75rem", color: COLORS.FOG, fontStyle: 'italic' }}>
            No editable properties.
          </p>
        )}
      </div>
    </Panel>
  );
};
