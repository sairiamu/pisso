# SPEC-06 — Parts Sidebar + Save/Load

Branch: feature/spec06-sidebar-persist
Blast radius: src/canvas/, src/diagram/, src-tauri/ (filesystem commands)

## What to do
1. Sidebar UI listing all registered PartDefinitions, grouped by category,
   with search — drag (or click-to-place) onto canvas
2. Implement `src/diagram/save.ts` / `load.ts` — serialize current canvas
   state to `diagram.json`, write to a project folder via a Tauri
   filesystem command; load does the reverse and rehydrates the canvas
3. Wire up a minimal "New Project / Open" flow (matching the dashboard
   mockup) — doesn't need the full dashboard UI yet, just enough to save
   and reopen a real project folder for testing

## Verify
- [ ] Build the button->resistor->LED test circuit, save, close the app,
      reopen, and confirm it loads back identically (positions + wires)
- [ ] Sidebar search filters correctly across all 5 MVP parts
- [ ] Sidebar panel follows DESIGN_SYSTEM.md secondary-panel treatment