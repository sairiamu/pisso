# Pissow — Design System ("Bench" skeuomorphism)

## Direction
Physical-instrument skeuomorphism, softened. Reference: Misso (Telemetry
Console) — brushed panel texture, corner screws, riveted panel edges,
"live equipment" feel. Pissow uses the same visual family but:
- Lower contrast than Misso's near-black/pure-white panels
- Smoother panel surface — subtle noise/gradient instead of a strong
  diagonal brushed-metal texture
- Screws/rivets present but small, low-opacity, and NOT on every panel —
  reserve them for primary containers (toolbars, main canvas frame,
  dashboard cards), not every button or minor element
- No screen ever looks "toylike" — the goal is a professional lab
  instrument, not a cartoon control panel

## Palette
Electronics-native, not arbitrary brand colors — pull from real components:

| Token          | Hex       | Use                                    |
|----------------|-----------|------------------------------------------|
| Graphite-900   | #1C1E22   | App background, deepest panel recess    |
| Graphite-700   | #2A2D33   | Panel surface (default)                 |
| Graphite-500   | #3C4048   | Raised panel / hover surface            |
| Solder-Copper  | #C97A4B   | Primary accent — buttons, active states |
| Trace-Green    | #4CAF6D   | Success, "connected", simulate-running  |
| Fault-Red      | #E5533D   | Errors, disconnected pin warnings       |
| Warm-White     | #EDE8E0   | Primary text on dark surfaces           |
| Fog            | #9A9F A6  | Secondary/muted text                    |

Light mode is a v2 concern — build dark-first, matching how this app will
actually be used (workshop/classroom lighting, screen glare on breadboards).

## Typography
- UI: Inter
- Code editor: JetBrains Mono
- Numeric readouts (pin states, sim values): JetBrains Mono, tabular figures

## Panel Anatomy (the core reusable pattern)
Every major container (toolbar, canvas frame, dashboard card, ToolBox menu)
follows this layered look:
1. Base: Graphite-700, 8–10px corner radius (softer than Misso's sharper
   corners)
2. Subtle inset shadow (1–2px) to suggest a recessed panel, not a flat card
3. Optional corner screws — 4–6px circles, Graphite-500 fill, faint
   highlight — only on primary containers, opacity ~0.6 so they read as
   detail, not decoration competing for attention
4. Accent edge-glow (1px Solder-Copper at 15% opacity) only on the
   currently-active/focused panel — this is how "which panel is live"
   reads at a glance, borrowed from Misso's orange "GO LIVE" language but
   used sparingly

## Buttons
- Primary action (Run, Upload, Connect): Solder-Copper fill, slightly
  raised (soft drop shadow, not the hard bevel Misso uses), warm-white text
- Secondary (Share, Rename, Export): Graphite-500 fill, Warm-White text,
  flat — no shadow, so primary actions stay visually dominant
- Destructive (Delete): Fault-Red border only, transparent fill, fills
  solid on hover — never solid-red at rest, this avoids alarm fatigue in
  a tool students will use constantly

## Canvas-Specific
- Wires: Trace-Green when carrying a valid connection, Fault-Red on an
  invalid/shorted connection (from netlist validation), Fog when unselected
  and idle
- Parts: rendered via wokwi-elements SVGs, NOT re-skinned — the part
  should look like the real component; skeuomorphism applies to the
  *chrome* around the canvas (toolbars, panels), not to faking realism
  the parts library already provides
- Pins: small copper-colored dots, brighten on hover/valid-connection-target

## What NOT to do
- No pure black (#000) or pure white (#FFF) anywhere — always Graphite/Warm-White
- No heavy drop shadows or hard bevel edges (that's the "lower the
  boldness" note — Misso's aesthetic, dialed back)
- Don't put rivets/screws on small interactive elements (buttons, chips) —
  reserve for panel frames only