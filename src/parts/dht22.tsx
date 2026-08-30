import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const DHT22_DEFINITION: PartDefinition = {
  type: "wokwi-dht22",
  label: "DHT22 Temperature/Humidity Sensor",
  category: "Sensors",
  viewBox: { x: 0, y: 0, width: 57.078, height: 116.745 },
  pins: [
    { name: "VCC", x: 15, y: 114.9 },
    { name: "SDA", x: 24.5, y: 114.9 },
    { name: "NC", x: 34.1, y: 114.9 },
    { name: "GND", x: 43.8, y: 114.9 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-dht22", { ...attrs, className: "wokwi-dht22" })}
    </div>
  ),
};


