import React, { useEffect, useRef } from "react";
import { EditorState, Compartment } from "@codemirror/state";
import { EditorView, basicSetup } from "codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { linter, Diagnostic as LinterDiagnostic } from "@codemirror/lint";
import { tags as t } from "@lezer/highlight";
import { EDITOR_CONFIG } from "../CONSTANTS/editor";
import { Diagnostic } from "../domain/models";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  selectedLocation?: { line: number; column?: number };
  diagnostics?: Diagnostic[];
}

/**
 * Reusable Code Editor component using CodeMirror 6.
 * Styled using design system tokens from CONSTANTS/editor.ts and CONSTANTS/colors.ts.
 */
const pissowTheme = EditorView.theme(
  {
    "&": {
      color: EDITOR_CONFIG.THEME.FOREGROUND,
      backgroundColor: EDITOR_CONFIG.THEME.BACKGROUND,
      fontFamily: EDITOR_CONFIG.FONT_FAMILY,
      fontSize: EDITOR_CONFIG.FONT_SIZE,
      height: "100%",
    },
    "&.cm-editor.cm-focused": {
      outline: "none",
    },
    ".cm-content": {
      caretColor: EDITOR_CONFIG.THEME.CURSOR,
      lineHeight: EDITOR_CONFIG.LINE_HEIGHT,
    },
    ".cm-scroller": {
      overflow: "auto",
      scrollbarWidth: "none",
      msOverflowStyle: "none",
      "&::-webkit-scrollbar": {
        display: "none",
      },
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: EDITOR_CONFIG.THEME.CURSOR
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": {
      backgroundColor: EDITOR_CONFIG.THEME.SELECTION,
    },
    ".cm-gutters": {
      backgroundColor: EDITOR_CONFIG.THEME.GUTTER_BACKGROUND,
      color: EDITOR_CONFIG.THEME.LINE_NUMBERS,
      border: "none",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "transparent",
      color: EDITOR_CONFIG.THEME.FOREGROUND,
    },
    ".cm-foldGutter": {
      color: EDITOR_CONFIG.THEME.LINE_NUMBERS,
    },
  },
  { dark: true }
);

const pissowHighlightStyle = HighlightStyle.define([
  { tag: t.comment, color: EDITOR_CONFIG.SYNTAX.COMMENT, fontStyle: "italic" },
  { tag: [t.keyword, t.operatorKeyword, t.modifier], color: EDITOR_CONFIG.SYNTAX.KEYWORD, fontWeight: "bold" },
  { tag: [t.string, t.regexp, t.special(t.string)], color: EDITOR_CONFIG.SYNTAX.STRING },
  { tag: [t.number, t.bool, t.null], color: EDITOR_CONFIG.SYNTAX.NUMBER },
  { tag: [t.operator, t.compareOperator, t.logicOperator, t.arithmeticOperator], color: EDITOR_CONFIG.SYNTAX.OPERATOR },
  { tag: [t.function(t.variableName), t.labelName], color: EDITOR_CONFIG.SYNTAX.FUNCTION },
  { tag: t.variableName, color: EDITOR_CONFIG.SYNTAX.VARIABLE },
  { tag: [t.className, t.typeName, t.namespace, t.macroName], color: EDITOR_CONFIG.SYNTAX.TYPE },
  { tag: [t.propertyName, t.attributeName], color: EDITOR_CONFIG.SYNTAX.CONSTANT },
  { tag: [t.punctuation, t.separator, t.bracket], color: EDITOR_CONFIG.SYNTAX.PUNCTUATION },
]);

export const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, className, selectedLocation, diagnostics = [] }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const linterCompartment = useRef(new Compartment());

  const getLinterExtension = (diags: Diagnostic[]) => {
    return linter((view) => {
      return diags.map(d => {
        const line = d.line ? Math.max(1, Math.min(d.line, view.state.doc.lines)) : 1;
        const lineInfo = view.state.doc.line(line);
        const from = lineInfo.from + (d.column ? Math.max(0, Math.min(d.column - 1, lineInfo.length)) : 0);
        const to = lineInfo.to;

        return {
          from,
          to,
          severity: d.severity === 'info' ? 'info' : d.severity,
          message: d.message,
          actions: []
        } as LinterDiagnostic;
      });
    });
  };

  useEffect(() => {
    if (!editorRef.current) return;

    const startState = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        cpp(),
        pissowTheme,
        syntaxHighlighting(pissowHighlightStyle),
        linterCompartment.current.of(getLinterExtension(diagnostics)),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: { from: 0, to: viewRef.current.state.doc.length, insert: value },
      });
    }
  }, [value]);

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: linterCompartment.current.reconfigure(getLinterExtension(diagnostics))
      });
    }
  }, [diagnostics]);

  useEffect(() => {
    if (viewRef.current && selectedLocation) {
      const { line, column = 1 } = selectedLocation;
      try {
        const pos = viewRef.current.state.doc.line(line).from + (column - 1);
        viewRef.current.dispatch({
          selection: { head: pos, anchor: pos },
          scrollIntoView: true,
        });
        viewRef.current.focus();
      } catch (e) {
        console.warn("Failed to jump to location:", selectedLocation, e);
      }
    }
  }, [selectedLocation]);

  return <div ref={editorRef} className={className} style={{ height: "100%", width: "100%" }} />;
};
