# SPEC-01 — Project Scaffold

Branch: feature/spec01-scaffold
Blast radius: repo root, package.json, tauri.conf.json, src/, src-tauri/ (new files only)

## What to do
1. `npm create tauri-app@latest` with React + TypeScript + Vite template
2. Set app name to "Pissow" (placeholder — confirm final name before v1 ships)
3. Set up folder structure per CODING_RULES.md (`src/parts`, `src/canvas`,
   `src/netlist`, `src/diagram`)
4. Install XYFlow (`@xyflow/react`)
5. Configure Tailwind (or plain CSS variables per DESIGN_SYSTEM.md palette
   — decide and note the choice in this file's PR)
6. Add CONTEXT/ folder to repo with all files from this session

## Verify
- [ ] `npm run tauri dev` opens an empty window with no errors
- [ ] Folder structure matches CODING_RULES.md
- [ ] Design tokens (palette from DESIGN_SYSTEM.md) are available as CSS
      variables or Tailwind theme config, not hardcoded hex anywhere