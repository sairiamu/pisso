# Pissow Architecture Documentation

## Overview

Pissow is an embedded circuit design, simulation, and micro-controller IDE built on top of React, TypeScript, Wokwi elements, avr8js, and Tauri.

The application follows a **feature-oriented, layered architecture** to ensure strict separation of concerns, maintainability, and testability.

---

## High-Level Target Directory Layout

```
src/
├── app/                  # Application composition root
│   ├── App.tsx           # Slim composition root
│   ├── providers/        # React context providers wrapper (AppProviders)
│   └── routes/           # View routing & workspace layout router (AppRoutes)
│
├── core/                 # Pure domain models, events & business entities
│   ├── project/          # Project, ProjectFile, ProjectState, ProjectStatus
│   ├── circuit/          # Circuit, ComponentInstance, Connection, Net, Pin
│   ├── firmware/         # Firmware, BuildConfiguration
│   ├── simulation/       # Simulation, PinState, ObservableSimulationState
│   ├── diagnostics/      # Diagnostic, ProjectDiagnostic, BuildResult
│   ├── devices/          # Board, BoardInfo, BoardDefinition, SerialPortInfo
│   ├── events/           # Typed EventBus & domain event definitions
│   └── workspace/        # Workspace state & active view models
│
├── services/             # Application Services (business operations)
│   ├── ProjectService.ts # Project lifecycle, save/open/close orchestration
│   ├── BuildService.ts   # Compilation, hex artifact generation, diagnostics
│   ├── SimulationService.ts # Simulation runner, pin state & serial bridge
│   ├── DeviceService.ts  # Serial ports, board selection & firmware uploading
│   ├── CircuitService.ts # Part addition, wire routing, circuit state commands
│   └── DiagnosticService.ts # Compiler diagnostic parsing & error navigation
│
├── features/             # Domain feature modules
│   ├── project/          # New project, unsaved changes modals & error views
│   ├── editor/           # Code editor tabs & syntax highlighting
│   ├── circuit/          # Canvas shell, part node, wire edge, toolbox, inspector
│   ├── simulation/       # Run button & simulation controls
│   ├── build/            # Build diagnostics view & upload button
│   ├── debugger/         # Terminal panel, console view & serial panel
│   ├── device/           # Board & port selectors
│   ├── ai/               # AI Assistant view
│   └── libraries/        # Library manager view
│
├── platform/             # Infrastructure & platform adapters
│   └── tauri/            # Tauri IPC bridges (compiler, serial, project, system)
│
└── ui/                   # Reusable UI layer
    ├── primitives/       # Atomic UI elements (Button, Card, Input, Badge, etc.)
    ├── components/       # Generic components (CodeEditor, ErrorBoundary, Showcase)
    └── layout/           # Outer layout wrappers (AppShell, ModeSwitcher)
```

---

## Architectural Rules

1. **Unidirectional Dependency Flow**:
   `UI / Views` $\rightarrow$ `Application Services` $\rightarrow$ `Domain Entities` $\rightarrow$ `Platform Bridges`.
   UI components must **never** invoke platform IPC commands directly or mutate core state directly without using application services/domain commands.

2. **Domain Model Integrity**:
   Domain interfaces in `src/core/` are strongly-typed and explicit. Large collections of loosely related props are prohibited in favor of domain objects.

3. **Application Services**:
   Services encapsulate business workflows (`ProjectService`, `BuildService`, `SimulationService`, `DeviceService`, `CircuitService`, `DiagnosticService`), keeping UI components thin and purely presentational.

4. **Composition Root (`src/app/App.tsx`)**:
   `App.tsx` serves primarily as the composition root, wiring providers, view routing, modals, and top-level error boundaries.
