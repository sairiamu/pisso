import React, { useState, useEffect, useRef } from "react";
import { COLORS } from "../../CONSTANTS/colors";
import { commandRegistry, Command } from "../../services/CommandRegistry";
import { Search, Terminal } from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [commands, setCommands] = useState<Command[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setCommands(commandRegistry.getAllCommands());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const filtered = commandRegistry.searchCommands(query);
    setCommands(filtered);
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (commands.length > 0 ? (prev + 1) % commands.length : 0));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (commands.length > 0 ? (prev - 1 + commands.length) % commands.length : 0));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const cmd = commands[selectedIndex];
      if (cmd) {
        onClose();
        commandRegistry.executeCommand(cmd.id);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        zIndex: 50000,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "60px"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "560px",
          backgroundColor: COLORS.GRAPHITE_700,
          border: `1px solid ${COLORS.BORDER}`,
          borderRadius: "6px",
          boxShadow: "0 16px 32px rgba(0,0,0,0.6)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "420px"
        }}
      >
        {/* Input area */}
        <div
          style={{
            padding: "8px 12px",
            borderBottom: `1px solid ${COLORS.BORDER}`,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: COLORS.GRAPHITE_900
          }}
        >
          <Search size={16} color={COLORS.SOLDER_COPPER} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            style={{
              flex: 1,
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
              color: COLORS.WARM_WHITE,
              fontSize: "13px"
            }}
          />
        </div>

        {/* Commands list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
          {commands.length === 0 ? (
            <div style={{ padding: "16px", color: COLORS.FOG, fontSize: "12px", textAlign: "center" }}>
              No matching commands found.
            </div>
          ) : (
            commands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    onClose();
                    commandRegistry.executeCommand(cmd.id);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: isSelected ? COLORS.GRAPHITE_500 : "transparent",
                    color: isSelected ? COLORS.WARM_WHITE : COLORS.WARM_WHITE,
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Terminal size={14} color={isSelected ? COLORS.SOLDER_COPPER : COLORS.FOG} />
                    <span style={{ fontWeight: 600, color: COLORS.FOG, marginRight: "4px" }}>
                      {cmd.category}:
                    </span>
                    <span>{cmd.title}</span>
                  </div>

                  {cmd.keybinding && (
                    <span
                      style={{
                        fontSize: "10px",
                        backgroundColor: COLORS.GRAPHITE_900,
                        border: `1px solid ${COLORS.BORDER}`,
                        padding: "2px 6px",
                        borderRadius: "3px",
                        color: COLORS.FOG
                      }}
                    >
                      {cmd.keybinding}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
