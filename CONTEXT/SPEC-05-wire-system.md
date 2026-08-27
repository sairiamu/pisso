# SPEC-05 — Wire/Edge System

Branch: feature/spec05-wires
Blast radius: src/canvas/, src/diagram/

## What to do
1. Custom XYFlow edge type: orthogonal (right-angle) routing between exact
   pin coordinates, not node-edge-to-node-edge
2. Clicking a pin starts a wire; clicking a second pin completes it and
   writes a `connections` entry to the in-memory diagram state
3. Wire color reflects netlist validity (Trace-Green valid, Fault-Red if
   the netlist flags a short — e.g. direct 5V-to-GND) using SPEC-04's
   `resolveNode`
4. Deleting a wire (select + delete key, or right-click menu) removes it
   from diagram state cleanly

## Verify
- [ ] Can wire Uno pin 13 -> resistor -> LED -> GND and see it rendered
      correctly with right-angle routing
- [ ] Moving a part re-routes its wires automatically
- [ ] An intentionally-shorted test wire renders Fault-Red