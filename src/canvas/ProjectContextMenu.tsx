import React, { useEffect, useRef } from "react";
import { COLORS } from "../CONSTANTS/colors";
import { TYPOGRAPHY } from "../CONSTANTS/typography";

interface ProjectContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onShare?: () => void;
  onRename?: () => void;
  onEdit?: () => void;
  onSubmit?: () => void;
  onDelete?: () => void;
}

/**
 * Reusable context menu for project actions.
 * Matches the design used in the dashboard's Recents list.
 */
export const ProjectContextMenu: React.FC<ProjectContextMenuProps> = ({
  x,
  y,
  onClose,
  onShare,
  onRename,
  onEdit,
  onSubmit,
  onDelete,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const itemStyle: React.CSSProperties = {
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "13px",
    fontFamily: TYPOGRAPHY.UI,
    color: COLORS.WARM_WHITE,
    backgroundColor: "transparent",
    border: "none",
    width: "100%",
    textAlign: "left",
    display: "block",
    transition: "background-color 0.2s",
    outline: "none",
  };

  const deleteItemStyle: React.CSSProperties = {
    ...itemStyle,
    color: COLORS.FAULT_RED,
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: y,
        left: x,
        zIndex: 1000,
        backgroundColor: COLORS.GRAPHITE_700,
        border: `1px solid ${COLORS.GRAPHITE_500}`,
        borderRadius: "6px",
        padding: "4px 0",
        minWidth: "150px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
      }}
    >
      {[
        { label: "Share", action: onShare },
        { label: "Rename", action: onRename },
        { label: "Edit", action: onEdit },
        { label: "Submit", action: onSubmit },
      ].map((item) => (
        <button
          key={item.label}
          style={itemStyle}
          onClick={(e) => {
            e.stopPropagation();
            item.action?.();
            onClose();
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.GRAPHITE_500)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          {item.label}
        </button>
      ))}
      <div style={{ height: "1px", backgroundColor: COLORS.GRAPHITE_500, margin: "4px 0" }} />
      <button
        style={deleteItemStyle}
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.();
          onClose();
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = COLORS.FAULT_RED;
          e.currentTarget.style.color = COLORS.WARM_WHITE;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = COLORS.FAULT_RED;
        }}
      >
        Delete
      </button>
    </div>
  );
};
