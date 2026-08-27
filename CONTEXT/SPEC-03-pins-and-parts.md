# SPEC-03 — Pin Metadata + Remaining MVP Parts

Branch: feature/spec03-pins-parts
Blast radius: src/parts/, src/canvas/

## What to do
1. Add precise pin coordinates (relative to part origin) to the Uno's
   PartDefinition — every digital/analog pin, 5V, GND
2. Add PartDefinitions for: breadboard, LED, resistor, pushbutton
   (per ARCHITECTURE.md's parts-as-data pattern)
3. Render pins as small visible dots on each node (Solder-Copper per
   DESIGN_SYSTEM.md), positioned exactly per pin metadata — this is the
   detail that makes wiring feel precise later, get it right now
4. Pins should highlight on hover (brighten) even though nothing is
   clickable/wireable yet — visual groundwork for SPEC-05

## Verify
- [ ] All 5 MVP parts render with correctly positioned pins
- [ ] Pin positions visually line up with the real component's physical
      pin locations (compare against real part photos/wokwi's reference)
- [ ] Hover state on pins works