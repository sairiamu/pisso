import React from "react";
import { Button, ButtonProps, ButtonSize } from "./Button";

type IconButtonProps = Omit<ButtonProps, "leftIcon" | "rightIcon"> & {
  icon: React.ReactNode;
};

const SIZE_MAP: Record<ButtonSize, string> = {
  sm: "28px",
  md: "36px",
  lg: "44px",
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = "md",
  style,
  ...props
}) => {
  const dimension = (size ? SIZE_MAP[size] : null) || SIZE_MAP.md;

  return (
    <Button
      size={size}
      style={{
        width: dimension,
        height: dimension,
        padding: 0,
        minWidth: dimension,
        ...style,
      }}
      {...props}
    >
      {icon}
    </Button>
  );
};
