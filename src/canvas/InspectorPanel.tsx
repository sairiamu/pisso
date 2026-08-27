import React from "react";
import { Panel } from "../components/Panel";
import { COLORS } from "../CONSTANTS/colors";
import { PartInstance } from "../diagram/types";
import { PARTS_REGISTRY } from "../parts/registry";

interface InspectorPanelProps {
  selectedPart: PartInstance | null;
  onUpdateAttributes: (id: string, attrs: Record<string, any>) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedPart,
  onUpdateAttributes,
}) => {
  if (!selectedPart) {
    return null;
  }

  const definition = PARTS_REGISTRY.get(selectedPart.type);
  const label = definition?.label || selectedPart.type;

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

      <div style={{ flex: 1, overflowY: "auto" }}>
        {Object.entries(selectedPart.attrs).map(([key, value]) => (
          <div key={key} style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                color: COLORS.FOG,
                marginBottom: "4px",
              }}
            >
              {key}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleAttrChange(key, e.target.value)}
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
          </div>
        ))}
      </div>
    </Panel>
  );
};
