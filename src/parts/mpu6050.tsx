import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const MPU6050_DEFINITION: PartDefinition = {
  type: "wokwi-mpu6050",
  label: "MPU6050 Accelerometer/Gyroscope",
  category: "Sensors",
  viewBox: { x: 0, y: 0, width: 25.8, height: 22.2 },
  pins: [
    { name: "VCC", x: 2.54, y: 22.2 },
    { name: "GND", x: 5.08, y: 22.2 },
    { name: "SCL", x: 7.62, y: 22.2 },
    { name: "SDA", x: 10.16, y: 22.2 },
    { name: "XDA", x: 12.7, y: 22.2 },
    { name: "XCL", x: 15.24, y: 22.2 },
    { name: "AD0", x: 17.78, y: 22.2 },
    { name: "INT", x: 20.32, y: 22.2 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-mpu6050", { ...attrs, className: "wokwi-mpu6050" })}
    </div>
  ),
};


