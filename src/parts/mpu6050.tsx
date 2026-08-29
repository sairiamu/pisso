import "@wokwi/elements";
import { PartDefinition } from "./types";
import { registerPart } from "./registry";
import React from "react";

export const MPU6050_DEFINITION: PartDefinition = {
  type: "wokwi-mpu6050",
  label: "MPU6050 Accelerometer/Gyroscope",
  category: "Sensors",
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-mpu6050", { ...attrs, className: "wokwi-mpu6050" })}
    </div>
  ),
};

registerPart(MPU6050_DEFINITION);
