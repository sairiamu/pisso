import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const MPU6050_DEFINITION: PartDefinition = {
  type: "wokwi-mpu6050",
  label: "MPU6050 Accelerometer/Gyroscope",
  category: "Sensors",
  viewBox: { x: 0, y: 0, width: 97.52, height: 83.92 },
  pins: [
    { name: "VCC", x: 9.6, y: 83.92 },
    { name: "GND", x: 19.2, y: 83.92 },
    { name: "SCL", x: 28.8, y: 83.92 },
    { name: "SDA", x: 38.4, y: 83.92 },
    { name: "XDA", x: 48.0, y: 83.92 },
    { name: "XCL", x: 57.6, y: 83.92 },
    { name: "AD0", x: 67.2, y: 83.92 },
    { name: "INT", x: 76.8, y: 83.92 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-mpu6050", { ...attrs, className: "wokwi-mpu6050" })}
    </div>
  ),
};


