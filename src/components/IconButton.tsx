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
  const dimension = SIZE_MAP[size] || SIZE_MAP.md;

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
