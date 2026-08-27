# SPEC-02 — Arduino Uno Canvas Node

Branch: feature/spec02-uno-node
Blast radius: src/canvas/, src/parts/, package.json (new dep only)

## What to do
1. Install `@wokwi/elements`
2. Create `src/parts/arduino-uno.ts` — PartDefinition for the Uno
   (per ARCHITECTURE.md interface), wrapping the wokwi Uno web component
3. Create a generic XYFlow custom node type in `src/canvas/PartNode.tsx`
   that renders any PartDefinition's `render()` output
4. Render one static Uno node on an empty canvas — draggable, no pins,
   no wiring yet
5. Apply DESIGN_SYSTEM.md panel treatment to the canvas frame itself
   (the container around the XYFlow canvas, not the part)

## Verify
- [ ] Uno renders correctly at multiple zoom levels (SVG scales cleanly)
- [ ] Node is draggable on canvas
- [ ] Canvas frame matches DESIGN_SYSTEM.md panel anatomy (subtle screws,
      soft inset shadow, correct Graphite tokens)