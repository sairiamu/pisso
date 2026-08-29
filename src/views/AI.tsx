import React from "react";
import { COLORS } from "../CONSTANTS/colors";
import { TYPOGRAPHY } from "../CONSTANTS/typography";

export const AIView: React.FC = () => {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      color: COLORS.WARM_WHITE,
      fontFamily: TYPOGRAPHY.UI,
      textAlign: "center"
    }}>
      <h1 style={{ color: COLORS.SOLDER_COPPER, fontSize: "2.5rem", marginBottom: "1rem" }}>AI Engineering Assistant</h1>
      <p style={{ color: COLORS.FOG, fontSize: "1.2rem", opacity: 0.8 }}>Coming Soon</p>
    </div>
  );
};
