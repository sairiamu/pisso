import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const SEVEN_SEGMENT_DEFINITION: PartDefinition = {
  type: "wokwi-7segment",
  label: "7 Segment Display",
  category: "Displays",
  defaultAttrs: { color: "red" },
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-7segment", { ...attrs, className: "wokwi-7segment" })}
    </div>
  ),
};


