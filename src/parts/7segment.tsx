import "@wokwi/elements";
import { PartDefinition } from "./types";
import { getPinValue } from "./utils";
import React from "react";

export const SEVEN_SEGMENT_DEFINITION: PartDefinition = {
  type: "wokwi-7segment",
  label: "7 Segment Display",
  category: "Displays",
  viewBox: { x: 0, y: 0, width: 10, height: 17 },
  pins: [
    { name: "a", x: 1, y: 17 },
    { name: "b", x: 2, y: 17 },
    { name: "c", x: 3, y: 17 },
    { name: "d", x: 4, y: 17 },
    { name: "e", x: 5, y: 17 },
    { name: "f", x: 6, y: 17 },
    { name: "g", x: 7, y: 17 },
    { name: "dp", x: 8, y: 17 },
    { name: "com.1", x: 4.5, y: 0 },
    { name: "com.2", x: 4.5, y: 17 },
  ],
  defaultAttrs: { color: "red" },
  render: ({ attrs, pinValues }) => {
    const segments = ["a", "b", "c", "d", "e", "f", "g", "dp"];
    const values = segments.map((seg) =>
      getPinValue(pinValues, seg, "7 Segment") === "HIGH" ? 1 : 0
    );
    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        {React.createElement("wokwi-7segment", {
          ...attrs,
          values,
          className: "wokwi-7segment",
        })}
      </div>
    );
  },
};


