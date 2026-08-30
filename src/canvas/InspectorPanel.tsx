import React from "react";
import { RotateCw, Trash2 } from "lucide-react";
import { Panel } from "../components/Panel";
import { COLORS } from "../CONSTANTS/colors";
import { PartInstance } from "../diagram/types";
import { PARTS_REGISTRY } from "../parts/registry";

interface InspectorPanelProps {
  selectedPart: PartInstance | null;
  onUpdateAttributes: (id: string, attrs: Record<string, any>) => void;
  onRotate: () => void;
  onDelete: () => void;
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
  onUpdateAttributes,
  onRotate,
  onDelete,
}) => {
  if (!selectedPart) {
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
          Select a part to inspect its properties
        </p>
      </Panel>
    );
  }

  const definition = PARTS_REGISTRY.get(selectedPart.type);
  const label = definition?.label || selectedPart.type;
  const attributes = ATTRIBUTE_METADATA[selectedPart.type] || [];

  const handleAttrChange = (key: string, value: any) => {
    onUpdateAttributes(selectedPart.id, {
      ...selectedPart.attrs,
      [key]: value,
    });
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
          ID: {selectedPart.id}
        </p>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <button
          onClick={onRotate}
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
          onClick={onDelete}
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
          const value = selectedPart.attrs[attr.key] ?? "";

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
