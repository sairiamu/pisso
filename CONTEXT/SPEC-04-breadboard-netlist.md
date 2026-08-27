# SPEC-04 — Breadboard Bus Logic (Netlist)

Branch: feature/spec04-netlist
Blast radius: src/netlist/ (new folder), tests

## What to do
1. Model the breadboard as a data structure: rows of 5 holes (one
   electrical node each), plus two full-length power rails (+ and -)
2. Implement `resolveNode(diagram, pinRef): PinRef[]` per ARCHITECTURE.md
   — given any pin plugged into a breadboard hole, return every other
   pin/hole on the same electrical node
3. NO UI code in this folder — pure functions only, importable and
   testable standalone
4. Write unit tests covering: same-row continuity, power rail continuity,
   a pin NOT connected to anything, two different rows being correctly
   NOT connected

## Verify
- [ ] All netlist unit tests pass in isolation (no canvas/UI running)
- [ ] `src/netlist/` has zero imports from `src/canvas/` or React
- [ ] Manually reason through 2–3 real circuit examples against the test
      output to sanity-check correctness before moving on