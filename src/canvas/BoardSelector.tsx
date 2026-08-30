import React from "react";
import { Cpu } from "lucide-react";
import { COLORS } from "../CONSTANTS/colors";
import { TYPOGRAPHY } from "../CONSTANTS/typography";
import { BoardInfo } from "./CanvasShell";

interface BoardSelectorProps {
  boards: BoardInfo[];
  selectedBoardId: string | null;
  onSelect: (id: string | null) => void;
}

export const BoardSelector: React.FC<BoardSelectorProps> = ({ boards, selectedBoardId, onSelect }) => {
  if (boards.length === 0) {
    return (
      <div style={{
        backgroundColor: COLORS.GRAPHITE_900,
        color: COLORS.FOG,
        border: `1px solid ${COLORS.GRAPHITE_500}`,
        borderRadius: "6px",
        padding: "6px 12px",
        fontSize: "12px",
        fontFamily: TYPOGRAPHY.UI,
        opacity: 0.6
      }}>
        No board in design
      </div>
    );
  }

  if (boards.length === 1) {
    const board = boards[0];
    return (
      <div style={{
        backgroundColor: COLORS.GRAPHITE_900,
        color: COLORS.WARM_WHITE,
        border: `1px solid ${COLORS.GRAPHITE_500}`,
        borderRadius: "6px",
        padding: "6px 12px",
        fontSize: "12px",
        fontFamily: TYPOGRAPHY.UI,
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}>
        <Cpu size={14} color={COLORS.SOLDER_COPPER} />
        <span>{board.label}</span>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <select
        value={selectedBoardId || ""}
        onChange={(e) => onSelect(e.target.value || null)}
        style={{
          backgroundColor: COLORS.GRAPHITE_900,
          color: COLORS.WARM_WHITE,
          border: `1px solid ${COLORS.GRAPHITE_500}`,
          borderRadius: "6px",
          padding: "6px 32px 6px 12px",
          fontSize: "12px",
          fontFamily: TYPOGRAPHY.UI,
          appearance: "none",
          cursor: "pointer",
          minWidth: "140px",
          outline: "none"
        }}
      >
        <option value="">Select Board...</option>
        {boards.map((b) => (
          <option key={b.id} value={b.id}>
            {b.label} ({b.id.split('-').pop()})
          </option>
        ))}
      </select>
      <div style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.6 }}>
        <Cpu size={14} color={COLORS.WARM_WHITE} />
      </div>
    </div>
  );
};
