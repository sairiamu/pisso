import React, { useState, useMemo } from "react";
import { getRegisteredParts, PartDefinition } from "../parts";
import { Panel } from "../components/Panel";
import { COLORS } from "../CONSTANTS/colors";

interface ToolBoxProps {
  onAddPart: (type: string) => void;
}

const PartThumbnail: React.FC<{ part: PartDefinition; onClick: () => void }> = ({
  part,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px 8px",
        backgroundColor: COLORS.GRAPHITE_800,
        border: `1px solid ${COLORS.GRAPHITE_500}`,
        borderRadius: "8px",
        color: COLORS.WARM_WHITE,
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        width: "100%",
        height: "120px",
        gap: "12px",
        outline: "none",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden"
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = COLORS.GRAPHITE_500;
        e.currentTarget.style.borderColor = COLORS.SOLDER_COPPER;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = COLORS.GRAPHITE_800;
        e.currentTarget.style.borderColor = COLORS.GRAPHITE_500;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            transform: "scale(0.45)",
            transformOrigin: "center center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {part.render({ attrs: part.defaultAttrs })}
        </div>
      </div>
      <span
        style={{
          fontSize: "0.75rem",
          textAlign: "center",
          fontWeight: 600,
          color: COLORS.WARM_WHITE,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {part.label}
      </span>
    </button>
  );
};

export const ToolBox: React.FC<ToolBoxProps> = ({ onAddPart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const allParts = useMemo(() => getRegisteredParts(), []);

  const filteredParts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return allParts.filter(
      (p) =>
        p.label.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.type.toLowerCase().includes(query)
    );
  }, [allParts, searchQuery]);

  const groupedParts = useMemo(() => {
    const groups: Record<string, PartDefinition[]> = {};
    filteredParts.forEach((p) => {
      if (!groups[p.category]) {
        groups[p.category] = [];
      }
      groups[p.category].push(p);
    });
    return groups;
  }, [filteredParts]);

  return (
    <div
      style={{
        position: "absolute",
        top: "16px",
        right: "16px",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "12px",
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: isOpen ? COLORS.SOLDER_COPPER : COLORS.GRAPHITE_700,
          color: COLORS.WARM_WHITE,
          border: `1px solid ${COLORS.GRAPHITE_500}`,
          borderRadius: "8px",
          padding: "10px 20px",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: "0.85rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          fontFamily: "Inter, sans-serif",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          outline: "none"
        }}
      >
        {isOpen ? "Close" : "ToolBox"}
      </button>

      {isOpen && (
        <Panel
          showScrews={true}
          style={{
            width: "320px",
            maxHeight: "calc(100vh - 100px)",
            display: "flex",
            flexDirection: "column",
            padding: "24px",
            boxSizing: "border-box",
            boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
            border: `1px solid ${COLORS.GRAPHITE_500}`,
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <h2
              style={{
                margin: "0 0 4px 0",
                fontSize: "1.2rem",
                color: COLORS.WARM_WHITE,
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
              }}
            >
              ToolBox
            </h2>
            <p style={{ margin: 0, fontSize: "0.75rem", color: COLORS.FOG, fontFamily: "Inter, sans-serif" }}>
              Drag or click parts to add them to the canvas
            </p>
          </div>

          <input
            type="text"
            placeholder="Search parts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              marginBottom: "24px",
              backgroundColor: COLORS.GRAPHITE_900,
              border: `1px solid ${COLORS.GRAPHITE_500}`,
              borderRadius: "6px",
              color: COLORS.WARM_WHITE,
              fontSize: "0.9rem",
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "Inter, sans-serif",
            }}
          />

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              paddingRight: "8px",
              display: "flex",
              flexDirection: "column",
              gap: "28px",
            }}
          >
            {Object.entries(groupedParts).map(([category, parts]) => (
              <div key={category}>
                <h3
                  style={{
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    color: COLORS.SOLDER_COPPER,
                    marginBottom: "16px",
                    borderBottom: `1px solid ${COLORS.GRAPHITE_500}`,
                    paddingBottom: "8px",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 800,
                  }}
                >
                  {category}
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "16px",
                  }}
                >
                  {parts.map((part) => (
                    <PartThumbnail
                      key={part.type}
                      part={part}
                      onClick={() => onAddPart(part.type)}
                    />
                  ))}
                </div>
              </div>
            ))}

            {filteredParts.length === 0 && (
              <div
                style={{
                  color: COLORS.FOG,
                  textAlign: "center",
                  marginTop: "20px",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.9rem",
                  fontStyle: "italic"
                }}
              >
                No parts matching "{searchQuery}"
              </div>
            )}
          </div>
        </Panel>
      )}
    </div>
  );
};
