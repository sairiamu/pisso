import "@wokwi/elements";
import { PartDefinition } from "./types";
import { registerPart } from "./registry";
import React from "react";

export const LCD1602_DEFINITION: PartDefinition = {
  type: "wokwi-lcd1602",
  label: "LCD 1602",
  category: "Displays",
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-lcd1602", { ...attrs, className: "wokwi-lcd1602" })}
    </div>
  ),
};

registerPart(LCD1602_DEFINITION);
