# Pissow — Coding Rules

## Stack
- React + Vite + TypeScript
- Tauri v2 (native shell, serial access, filesystem)
- XYFlow (canvas: circuit nodes + wires)
- Zustand (or React Context, decide at scaffold time) for canvas/project state
- Monaco or CodeMirror for the code editor (decide in SPEC-07)
- Rust sidecars for: avr-gcc invocation, avrdude invocation, serial port listing

## Project Independence
This project shares NO code, NO monorepo, and NO packages with Lumio or any
other app. It is a standalone repo from day one. Do not import from, or
reference paths belonging to, any other project.

## Branch Strategy
- Branch-per-feature, short-lived (3–7 days max)
- Branch names: `feature/<spec-number>-<short-slug>` e.g. `feature/spec02-uno-node`
- One SPEC file = one branch = one PR, unless a SPEC explicitly says otherwise

## Blast Radius Discipline
Every task has a stated blast radius (files/folders it's allowed to touch).
Agents and contributors must not edit outside that radius without a new task.
This keeps circuit-designer work from silently touching compiler/simulator
code before those subsystems exist.

## File/Folder Conventions
- `src/parts/` — part definitions (data), one file per part type
- `src/canvas/` — XYFlow node/edge components, canvas state
- `src/netlist/` — breadboard bus logic, electrical node resolution (NO UI
  imports allowed in this folder — must be unit-testable standalone)
- `src/diagram/` — diagram.json read/write, schema types, validation
- `src-tauri/` — Rust side: sidecars, serial, filesystem commands
- `CONTEXT/` — this documentation

## Data Model Discipline
`diagram.json` is the contract every subsystem reads/writes. Any change to
its shape is a breaking change and must be called out explicitly in the PR
description, with a note on what migrates old files.

## Testing
- `src/netlist/` gets unit tests first — before any canvas UI exists, prove
  the breadboard bus logic in isolation
- Wire/pin resolution logic is tested the same way: pure functions, no DOM

## Agent Prompt Convention
Every agent prompt for this project opens with:
"You are working on Pissow — read /CONTEXT/CODING_RULES.md and
/CONTEXT/DESIGN_SYSTEM.md first."

Every prompt includes: Branch, Blast radius, What to do, Verify checklist.
Tasks stay small (~30 min agent scope), matching one SPEC step at a time.