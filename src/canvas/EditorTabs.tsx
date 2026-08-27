import React from "react";
import { Panel } from "../components/Panel";
import { COLORS } from "../CONSTANTS/colors";
import { TYPOGRAPHY } from "../CONSTANTS/typography";

/**
 * EditorTabs component.
 * Currently supports a single "Untitled" tab per requirements.
 * Styled using the Panel component and design system tokens.
 */
export const EditorTabs: React.FC = () => {
  return (
    <Panel
      showScrews={false}
      style={{
        borderRadius: "8px 8px 0 0",
        backgroundColor: COLORS.GRAPHITE_700,
        height: "36px",
        borderBottom: `1px solid ${COLORS.GRAPHITE_500}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          height: "100%",
          padding: "0 8px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: COLORS.GRAPHITE_900,
            color: COLORS.WARM_WHITE,
            padding: "6px 12px",
            borderRadius: "6px 6px 0 0",
            fontSize: "12px",
            fontFamily: TYPOGRAPHY.UI,
            border: `1px solid ${COLORS.GRAPHITE_500}`,
            borderBottom: "none",
            cursor: "default",
            marginBottom: "-1px", // Overlap the borderBottom of the container
          }}
        >
          <span>Untitled</span>
          <span
            style={{
              color: COLORS.FOG,
              fontSize: "14px",
              lineHeight: 1,
              cursor: "pointer",
            }}
            title="Close tab"
          >
            ×
          </span>
        </div>
      </div>
    </Panel>
  );
};
