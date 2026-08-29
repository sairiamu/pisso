import React, { useEffect, useRef, useState } from "react";
import { Copy, Trash2, ChevronRight, Check } from "lucide-react";
import { COLORS } from "../CONSTANTS/colors";
import { EDITOR_CONFIG } from "../CONSTANTS/editor";

interface ConsoleLine {
  text: string;
  timestamp: string;
}

interface ConsoleViewProps {
  content: string;
  onClear: () => void;
  onInputSubmit?: (value: string) => void;
  placeholder?: string;
  showInput?: boolean;
}

export const ConsoleView: React.FC<ConsoleViewProps> = ({
  content,
  onClear,
  onInputSubmit,
  placeholder = "Type a command...",
  showInput = false,
}) => {
  const [autoscroll, setAutoscroll] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [lines, setLines] = useState<ConsoleLine[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [inputValue, setInputValue] = useState("");
  const [copied, setCopied] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastProcessedLength = useRef(0);

  // Process incoming content into lines with timestamps
  useEffect(() => {
    if (content === "") {
      setLines([]);
      lastProcessedLength.current = 0;
      return;
    }

    if (content.length > lastProcessedLength.current) {
      const newText = content.slice(lastProcessedLength.current);
      const newLines = newText.split("\n");

      const timestamp = new Date().toLocaleTimeString([], {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      setLines(prev => {
        const updated = [...prev];

        newLines.forEach((lineText, index) => {
          if (index === 0 && updated.length > 0 && !content.slice(0, lastProcessedLength.current).endsWith("\n")) {
            // Append to the last line if it didn't end with a newline
            updated[updated.length - 1].text += lineText;
          } else if (lineText || index < newLines.length - 1) {
            // Add a new line
            updated.push({ text: lineText, timestamp });
          }
        });

        return updated;
      });

      lastProcessedLength.current = content.length;
    }
  }, [content]);

  // Autoscroll logic
  useEffect(() => {
    if (autoscroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, autoscroll]);

  const handleCopy = () => {
    const textToCopy = lines.map(l => (showTimestamps ? `[${l.timestamp}] ` : "") + l.text).join("\n");
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showInput) return;

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(newIndex);
        setInputValue(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInputValue(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputValue("");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !onInputSubmit) return;

    onInputSubmit(inputValue);
    setHistory(prev => [...prev, inputValue]);
    setHistoryIndex(-1);
    setInputValue("");
  };

  return (
    <div
      data-testid="console-view"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "#121417",
        border: `1px solid ${COLORS.GRAPHITE_500}33` // Subtle border to see the container
      }}
    >
      {/* Controls Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 12px",
        backgroundColor: COLORS.GRAPHITE_900, // Darker to distinguish from tab bar
        borderBottom: `1px solid ${COLORS.GRAPHITE_500}`,
        minHeight: "32px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <label style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: COLORS.FOG,
            fontSize: "11px",
            cursor: "pointer",
            userSelect: "none"
          }}>
            <div style={{
              position: "relative",
              width: "28px",
              height: "14px",
              backgroundColor: autoscroll ? COLORS.TRACE_GREEN : COLORS.GRAPHITE_500,
              borderRadius: "7px",
              transition: "background-color 0.2s"
            }}>
              <div style={{
                position: "absolute",
                top: "2px",
                left: autoscroll ? "16px" : "2px",
                width: "10px",
                height: "10px",
                backgroundColor: COLORS.WARM_WHITE,
                borderRadius: "50%",
                transition: "left 0.2s"
              }} />
              <input
                type="checkbox"
                checked={autoscroll}
                onChange={e => setAutoscroll(e.target.checked)}
                style={{ display: "none" }}
              />
            </div>
            <span style={{ fontWeight: 600 }}>AUTOSCROLL</span>
          </label>

          <label style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: COLORS.FOG,
            fontSize: "11px",
            cursor: "pointer",
            userSelect: "none"
          }}>
             <div style={{
              position: "relative",
              width: "28px",
              height: "14px",
              backgroundColor: showTimestamps ? COLORS.SOLDER_COPPER : COLORS.GRAPHITE_500,
              borderRadius: "7px",
              transition: "background-color 0.2s"
            }}>
              <div style={{
                position: "absolute",
                top: "2px",
                left: showTimestamps ? "16px" : "2px",
                width: "10px",
                height: "10px",
                backgroundColor: COLORS.WARM_WHITE,
                borderRadius: "50%",
                transition: "left 0.2s"
              }} />
              <input
                type="checkbox"
                checked={showTimestamps}
                onChange={e => setShowTimestamps(e.target.checked)}
                style={{ display: "none" }}
              />
            </div>
            <span style={{ fontWeight: 600 }}>TIMESTAMPS</span>
          </label>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {copied && (
            <span style={{
              fontSize: "10px",
              color: COLORS.TRACE_GREEN,
              fontWeight: 800,
              backgroundColor: `${COLORS.TRACE_GREEN}22`,
              padding: "2px 8px",
              borderRadius: "4px",
              border: `1px solid ${COLORS.TRACE_GREEN}44`
            }}>
              COPIED!
            </span>
          )}
          <button
            onClick={handleCopy}
            title={copied ? "Copied!" : "Copy all"}
            style={{
              backgroundColor: "transparent",
              color: copied ? COLORS.TRACE_GREEN : COLORS.WARM_WHITE,
              border: `1px solid ${COLORS.GRAPHITE_500}`,
              borderRadius: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 8px",
              fontSize: "10px",
              fontWeight: 600
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            COPY
          </button>
          <button
            onClick={onClear}
            title="Clear output"
            style={{
              backgroundColor: "transparent",
              color: COLORS.WARM_WHITE,
              border: `1px solid ${COLORS.GRAPHITE_500}`,
              borderRadius: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 8px",
              fontSize: "10px",
              fontWeight: 600
            }}
          >
            <Trash2 size={12} />
            CLEAR
          </button>
        </div>
      </div>

      {/* Lines Area */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          padding: "8px 12px",
          overflowY: "auto",
          fontFamily: EDITOR_CONFIG.FONT_FAMILY,
          fontSize: "12px",
          color: COLORS.WARM_WHITE,
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          lineHeight: 1.5,
        }}
      >
        {lines.length === 0 ? (
          <span style={{ color: COLORS.GRAPHITE_500, fontStyle: "italic" }}>No data yet.</span>
        ) : (
          lines.map((line, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "1px" }}>
              {showTimestamps && (
                <span style={{ color: COLORS.GRAPHITE_500, userSelect: "none", minWidth: "65px" }}>
                  [{line.timestamp}]
                </span>
              )}
              <span>{line.text}</span>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      {showInput && (
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 12px",
            borderTop: `1px solid ${COLORS.GRAPHITE_500}33`,
            backgroundColor: "#121417"
          }}
        >
          <ChevronRight size={14} color={COLORS.SOLDER_COPPER} style={{ marginRight: "4px" }} />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={{
              flex: 1,
              backgroundColor: "transparent",
              border: "none",
              color: COLORS.WARM_WHITE,
              fontFamily: EDITOR_CONFIG.FONT_FAMILY,
              fontSize: "12px",
              outline: "none",
            }}
          />
        </form>
      )}
    </div>
  );
};
