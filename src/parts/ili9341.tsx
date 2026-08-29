import "@wokwi/elements";
import { PartDefinition } from "./types";
import { registerPart } from "./registry";
import React from "react";

export const ILI9341_DEFINITION: PartDefinition = {
  type: "wokwi-ili9341",
  label: "ILI9341 TFT LCD",
  category: "Displays",
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-ili9341", { ...attrs, className: "wokwi-ili9341" })}
    </div>
  ),
};

registerPart(ILI9341_DEFINITION);
