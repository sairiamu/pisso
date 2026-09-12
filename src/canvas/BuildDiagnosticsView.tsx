import React from "react";
import { AlertCircle, AlertTriangle, Info, ExternalLink } from "lucide-react";
import { BuildResult, Diagnostic } from "../domain/models";
import { COLORS } from "../CONSTANTS/colors";
import { TYPOGRAPHY } from "../CONSTANTS/typography";

interface BuildDiagnosticsViewProps {
  result: BuildResult;
  onShowRaw: () => void;
  onSelectDiagnostic?: (diagnostic: Diagnostic) => void;
}

export const BuildDiagnosticsView: React.FC<BuildDiagnosticsViewProps> = ({ result, onShowRaw, onSelectDiagnostic }) => {
  const { diagnostics, status } = result;

  if (diagnostics.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: COLORS.FOG }}>
        <p>Build finished with status: <strong style={{ color: status === 'success' ? COLORS.TRACE_GREEN : COLORS.FAULT_RED }}>{status.toUpperCase()}</strong></p>
        <button
          onClick={onShowRaw}
          style={{
            marginTop: "10px",
            backgroundColor: "transparent",
            border: `1px solid ${COLORS.GRAPHITE_500}`,
            color: COLORS.WARM_WHITE,
            padding: "4px 12px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px"
          }}
        >
          View Raw Output
        </button>
      </div>
    );
  }

  const errors = diagnostics.filter(d => d.severity === 'error');
  const warnings = diagnostics.filter(d => d.severity === 'warning');

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{
        padding: "8px 12px",
        backgroundColor: `${COLORS.GRAPHITE_900}88`,
        borderBottom: `1px solid ${COLORS.GRAPHITE_500}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", gap: "12px" }}>
          {errors.length > 0 && (
            <span style={{ fontSize: "11px", fontWeight: 700, color: COLORS.FAULT_RED, display: "flex", alignItems: "center", gap: "4px" }}>
              <AlertCircle size={12} /> {errors.length} ERRORS
            </span>
          )}
          {warnings.length > 0 && (
            <span style={{ fontSize: "11px", fontWeight: 700, color: COLORS.SOLDER_COPPER, display: "flex", alignItems: "center", gap: "4px" }}>
              <AlertTriangle size={12} /> {warnings.length} WARNINGS
            </span>
          )}
        </div>
        <button
          onClick={onShowRaw}
          style={{
            backgroundColor: "transparent",
            border: "none",
            color: COLORS.SOLDER_COPPER,
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          RAW OUTPUT <ExternalLink size={12} />
        </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
        {errors.map((diag, index) => (
          <DiagnosticItem
            key={`err-${index}`}
            diagnostic={diag}
            onClick={() => onSelectDiagnostic?.(diag)}
          />
        ))}
        {warnings.map((diag, index) => (
          <DiagnosticItem
            key={`warn-${index}`}
            diagnostic={diag}
            onClick={() => onSelectDiagnostic?.(diag)}
          />
        ))}
      </div>
    </div>
  );
};

const DiagnosticItem: React.FC<{ diagnostic: Diagnostic, onClick: () => void }> = ({ diagnostic, onClick }) => {
  const isError = diagnostic.severity === 'error';
  const hasLocation = !!diagnostic.file && !!diagnostic.line;

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        gap: "12px",
        padding: "10px",
        borderRadius: "6px",
        backgroundColor: isError ? `${COLORS.FAULT_RED}11` : `${COLORS.SOLDER_COPPER}11`,
        borderLeft: `3px solid ${isError ? COLORS.FAULT_RED : COLORS.SOLDER_COPPER}`,
        marginBottom: "8px",
        cursor: hasLocation ? "pointer" : "default",
        transition: "background-color 0.1s ease"
      }}
      onMouseEnter={(e) => {
        if (hasLocation) e.currentTarget.style.backgroundColor = isError ? `${COLORS.FAULT_RED}22` : `${COLORS.SOLDER_COPPER}22`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isError ? `${COLORS.FAULT_RED}11` : `${COLORS.SOLDER_COPPER}11`;
      }}
    >
      <div style={{ marginTop: "2px" }}>
        {isError ? <AlertCircle size={16} color={COLORS.FAULT_RED} /> : <AlertTriangle size={16} color={COLORS.SOLDER_COPPER} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: "13px",
          color: COLORS.WARM_WHITE,
          fontWeight: 500,
          marginBottom: "4px",
          fontFamily: TYPOGRAPHY.UI
        }}>
          {diagnostic.message}
          {diagnostic.code && <span style={{ opacity: 0.5, marginLeft: "8px", fontSize: "11px" }}>[{diagnostic.code}]</span>}
        </div>
        <div style={{
          fontSize: "11px",
          color: COLORS.FOG,
          fontFamily: TYPOGRAPHY.CODE,
          opacity: 0.8
        }}>
          {diagnostic.file && <span>{diagnostic.file.split(/[\\/]/).pop()}</span>}
          {diagnostic.line && <span>:{diagnostic.line}</span>}
          {diagnostic.column && <span>:{diagnostic.column}</span>}
        </div>
      </div>
    </div>
  );
};
