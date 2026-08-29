import React from "react";
import { COLORS } from "../CONSTANTS/colors";
import { TYPOGRAPHY } from "../CONSTANTS/typography";

export const ProfileView: React.FC = () => {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      color: COLORS.WARM_WHITE,
      fontFamily: TYPOGRAPHY.UI
    }}>
      <h1 style={{ color: COLORS.SOLDER_COPPER }}>Profile & Settings</h1>
      <p style={{ color: COLORS.FOG }}>Placeholder for user preferences and account management.</p>
    </div>
  );
};
