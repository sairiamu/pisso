import React from "react";
import { Button, ButtonProps } from "./Button";

interface IconButtonProps extends Omit<ButtonProps, "leftIcon" | "rightIcon"> {
  icon: React.ReactNode;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = "md",
  style,
  ...props
}) => {
  const sizeMap = {
    sm: "28px",
    md: "36px",
    lg: "44px",
  };

  const dimension = sizeMap[size];

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
