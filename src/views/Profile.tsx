import React from "react";
import { COLORS } from "../CONSTANTS/colors";
import { TYPOGRAPHY } from "../CONSTANTS/typography";

export const ProfileView: React.FC = () => {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      padding: "40px",
      height: "100%",
      color: COLORS.WARM_WHITE,
      fontFamily: TYPOGRAPHY.UI,
      overflowY: "auto"
    }}>
      <h1 style={{ color: COLORS.SOLDER_COPPER, fontSize: "2rem", marginBottom: "2rem" }}>Profile & Settings</h1>

      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1.5rem", borderBottom: `1px solid ${COLORS.GRAPHITE_500}`, paddingBottom: "0.5rem", marginBottom: "1rem" }}>Profile</h2>
        <div style={{ color: COLORS.FOG, padding: "1rem", backgroundColor: COLORS.GRAPHITE_700, borderRadius: "8px" }}>
          <p>User profile information will appear here.</p>
        </div>
      </section>

      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1.5rem", borderBottom: `1px solid ${COLORS.GRAPHITE_500}`, paddingBottom: "0.5rem", marginBottom: "1rem" }}>Settings</h2>
        <div style={{ color: COLORS.FOG, padding: "1rem", backgroundColor: COLORS.GRAPHITE_700, borderRadius: "8px" }}>
          <p>Application preferences and editor settings placeholder.</p>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: "1.5rem", borderBottom: `1px solid ${COLORS.GRAPHITE_500}`, paddingBottom: "0.5rem", marginBottom: "1rem" }}>Account & Integrations</h2>
        <div style={{ color: COLORS.FOG, padding: "2rem", backgroundColor: COLORS.GRAPHITE_900, borderRadius: "8px", border: `1px dashed ${COLORS.GRAPHITE_500}`, textAlign: "center" }}>
          <p>Future account sync, cloud storage, and third-party integrations coming soon.</p>
        </div>
      </section>
    </div>
  );
};
