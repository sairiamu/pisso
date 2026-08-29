import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const DHT22_DEFINITION: PartDefinition = {
  type: "wokwi-dht22",
  label: "DHT22 Temperature/Humidity Sensor",
  category: "Sensors",
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-dht22", { ...attrs, className: "wokwi-dht22" })}
    </div>
  ),
};


