import React from "react";
import { ReactFlow, Background, BackgroundVariant } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Panel } from "../components/Panel";
import { COLORS } from "../CONSTANTS/colors";

export const CanvasShell: React.FC = () => {
  return (
    <Panel
      showScrews={true}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 1, width: "100%", height: "100%" }}>
        <ReactFlow
          colorMode="dark"
          nodes={[]}
          edges={[]}
          style={{ backgroundColor: COLORS.GRAPHITE_900 }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            color={COLORS.GRAPHITE_500}
            gap={20}
          />
        </ReactFlow>
      </div>
    </Panel>
  );
};
