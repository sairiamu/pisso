# Pissow — Architecture

## Subsystems (build order)
1. Circuit Designer (canvas, parts, wiring) — BUILDING NOW
2. Code Editor + offline compiler (avr-gcc/avrdude as subprocesses, NOT
   arduino-cli — see licensing note below)
3. Simulator (avr8js integration)
4. Real hardware upload (serial + avrdude)
5. Google Classroom/Drive layer — V2, after core IDE ships
6. Telemetry/cloud dashboard (ThingSpeak-like) — V2, separate small web app,
   not part of the Tauri desktop app

## Licensing note (compiler/uploader)
Do NOT bundle `arduino-cli` (GPL-3.0, with an explicit "commercial use
requires a paid license" clause from Arduino). Instead call `avr-gcc`
(GCC, standard external-subprocess use is fine for commercial apps),
`avrdude` (GPL-2, same subprocess pattern), and bundle Arduino core source
files (LGPL-2.1-or-later, fine to include unmodified) directly ourselves.
Get real legal sign-off before shipping regardless.

## Data Model: diagram.json
```json
{
  "version": 1,
  "parts": [
    {
      "id": "uno1",
      "type": "wokwi-arduino-uno",
      "x": 120,
      "y": 80,
      "rotation": 0,
      "attrs": {}
    },
    {
      "id": "led1",
      "type": "wokwi-led",
      "x": 320,
      "y": 140,
      "rotation": 0,
      "attrs": { "color": "red" }
    }
  ],
  "connections": [
    {
      "id": "w1",
      "from": { "partId": "uno1", "pin": "13" },
      "to": { "partId": "led1", "pin": "anode" },
      "route": []
    }
  ]
}
```

- `route` holds optional manual bend points for orthogonal wire rendering;
  empty means auto-route
- `attrs` is part-type-specific (resistor value, LED color, etc.) — keep it
  loose (`Record<string, unknown>`) but validate per-type at load time

## Sketch storage
`sketch.ino` lives alongside `diagram.json` in the same project folder.
Project folder = one Pissow project (matches the "NewProject / Clone /
Open" dashboard from the mockups).

## Parts Registry
Parts are DATA, not hardcoded components. A part type is:
```ts
interface PartDefinition {
  type: string;              // "wokwi-led"
  label: string;              // "LED"
  category: string;           // "Basic"
  pins: { name: string; x: number; y: number }[]; // relative to part origin
  render: () => JSX.Element;  // wraps the wokwi-elements web component
  defaultAttrs: Record<string, unknown>;
}
```
This is the registry both the hand-built parts (v1) and later AI-generated
or AI-imported parts (v2) will populate the same way — same interface,
different source.

## Netlist (breadboard bus logic)
Lives in `src/netlist/`, zero UI dependencies, unit-tested standalone.
Resolves: given a pin plugged into a hole, which other holes/pins are
electrically the same node (breadboard row bus, power rails, direct wires).
This module is what both wiring validation (v1) and the simulator (v3)
consume — get its API right once:
```ts
function resolveNode(diagram: Diagram, pinRef: PinRef): PinRef[]
```

## Tauri Sidecar Boundaries
- Compiler sidecar: takes sketch + board FQBN, returns .hex or error output
- Upload sidecar: takes .hex + serial port, invokes avrdude, streams
  progress/output back to the frontend
- Serial listing: native Rust command (no sidecar needed, direct Tauri
  command using a Rust serial crate)
- Simulator runs in-process (avr8js is JS/TS, no sidecar needed)

## Account/Licensing hook (for future pricing enforcement)
Even though payments aren't built yet, reserve a `deviceId`/`accountId`
concept in local storage now — the "10 free simulations/day" limit will
need a soft-enforced local counter that reconciles with a server when
online. Don't build the server now; just don't design local storage in a
way that makes adding this painful later.