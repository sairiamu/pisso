import React, { useEffect, useRef } from "react";
import { Panel } from "../components/Panel";
import { COLORS } from "../CONSTANTS/colors";
import { TYPOGRAPHY } from "../CONSTANTS/typography";

interface BuildConsoleProps {
  output: string | null;
  onClose: () => void;
}

/**
 * BuildConsole component to display compiler output (avr-gcc stderr/stdout).
 * Reuses the styling family of the panels and the code editor's palette.
 */
export const BuildConsole: React.FC<BuildConsoleProps> = ({ output, onClose }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  if (output === null) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "16px",
        left: "16px",
        right: "16px",
        height: "160px",
        zIndex: 1000,
      }}
    >
      <Panel
        showScrews={false}
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: COLORS.GRAPHITE_900,
          border: `1px solid ${COLORS.GRAPHITE_500}`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 16px",
            backgroundColor: COLORS.GRAPHITE_700,
            borderBottom: `1px solid ${COLORS.GRAPHITE_500}`,
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: COLORS.FOG,
              fontFamily: TYPOGRAPHY.UI,
            }}
          >
            Build Output
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: COLORS.FOG,
              cursor: "pointer",
              fontSize: "16px",
              padding: "0 4px",
            }}
          >
            ×
          </button>
        </div>
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            padding: "12px 16px",
            overflowY: "hidden",
            fontFamily: TYPOGRAPHY.CODE,
            fontSize: "12px",
            lineHeight: "1.5",
            color: output.toLowerCase().includes("error")
              ? COLORS.FAULT_RED
              : COLORS.WARM_WHITE,
            whiteSpace: "pre-wrap",
          }}
        >
          {output}
        </div>
      </Panel>
    </div>
  );
};
