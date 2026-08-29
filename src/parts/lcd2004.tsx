import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const LCD2004_DEFINITION: PartDefinition = {
  type: "wokwi-lcd2004",
  label: "LCD 2004",
  category: "Displays",
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-lcd2004", { ...attrs, className: "wokwi-lcd2004" })}
    </div>
  ),
};


