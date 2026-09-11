import React from "react";
import { COLORS } from "../CONSTANTS/colors";
import { TYPOGRAPHY } from "../CONSTANTS/typography";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({ children, required, style, ...props }) => {
  return (
    <label
      style={{
        display: "block",
        fontSize: "13px",
        fontWeight: 600,
        color: COLORS.FOG,
        marginBottom: "6px",
        fontFamily: TYPOGRAPHY.UI,
        ...style,
      }}
      {...props}
    >
      {children}
      {required && <span style={{ color: COLORS.FAULT_RED, marginLeft: "4px" }}>*</span>}
    </label>
  );
};
