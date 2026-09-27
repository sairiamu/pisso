# Engineering Audit — Pissow

**Date:** 2026-09-11  
**Target Repository:** `sairiamu/pisso` (`pissow`)  
**Objective:** Comprehensive engineering audit of the codebase, architecture, build system, simulation pipeline, and test suites prior to professional IoT engineering workbench transformation.

---

## 1. Current Architecture

Pissow is architected as a local-first desktop application utilizing:
- **Desktop Shell / Native Backend:** Tauri v2 (`src-tauri/`) written in Rust. Handles secure filesystem access, atomic project persistence, serial port communication, background execution of native toolchains (`avr-gcc`, `avrdude`), and event streaming.
- **Frontend Presentation Layer:** React 19, TypeScript, and Vite (`src/`). Uses XYFlow (`@xyflow/react`) for circuit canvas rendering and CodeMirror for sketch editing.
- **Styling & Design System:** Tailored dark-first "Bench" skeuomorphism (`DESIGN_SYSTEM.md`), utilizing custom CSS variables and Lucide icons.
- **Simulation Engine:** Client-side emulation via `avr8js`, `intel-hex`, and `@wokwi/elements` web components.

---

## 2. Current Dependency Graph

### Frontend (`package.json`)
- **UI & Canvas:** `@xyflow/react` (^12.11.5), `lucide-react` (^1.34.0)
- **Editor & Language Support:** `codemirror` (^6.0.2), `@codemirror/lang-cpp` (^6.0.3), `@codemirror/language`, `@codemirror/lint`, `@codemirror/state`, `@codemirror/view`
- **Electronics & Simulation:** `@wokwi/elements` (^1.9.2), `avr8js` (^0.21.0), `intel-hex` (^0.2.0)
- **Tauri Bridge:** `@tauri-apps/api` (^2), `@tauri-apps/plugin-fs`, `@tauri-apps/plugin-dialog`, `@tauri-apps/plugin-http`, `@tauri-apps/plugin-opener`
- **Build / Dev:** Vite (^7.0.4), TypeScript (~5.8.3), Vitest (^3.0.0)

### Backend (`src-tauri/Cargo.toml`)
- Tauri v2 (`tauri`, `tauri-build`, plugins)
- Serialization & Utilities: `serde`, `serde_json`, `regex`, `tempfile`, `zip`
- Hardware Interaction: `serialport` (^4.10.0)
- Cryptography & Streams: `sha2`, `futures-util`

---

## 3. Frontend Architecture

- **Entry Point:** `src/main.tsx` renders `App.tsx` (wrapped by `CircuitContext`, `SimulationContext`, etc.).
- **Application Shell & Layout:** Managed via `src/canvas/AppShell.tsx`, `CanvasShell.tsx`, `EditorTabs.tsx`, `InspectorPanel.tsx`, `ToolBox.tsx`, and `ConsoleView.tsx`.
- **Canvas Nodes & Wires:** `PartNode.tsx` wraps `@wokwi/elements` web components dynamically based on part definitions in `src/parts/`. `WireEdge.tsx` renders custom SVG connections with orthogonal routing (`wire-router.ts`).
- **State Management:** Combination of React Context (`CircuitContext`, `SimulationContext`), Zustand/observable stores (`SimulationStore`), and local component state.

---

## 4. Rust Architecture (`src-tauri/src/lib.rs`)

- **Commands Exposed (`pissow_lib`):**
  - **Project Management:** `create_new_project`, `list_projects`, `get_recent_projects`, `add_recent_project`, `get_projects_path`, `rename_project`, `delete_project`, `get_playground_path`.
  - **Persistence & Migration:** `save_full_project`, `save_diagram`, `save_project_files`, `load_project_files`, `load_diagram`, `save_project_metadata`, `load_project_metadata`.
  - **Compilation & Upload:** `compile_sketch`, `upload_hex`, `scan_missing_headers`.
  - **Library Management:** `get_library_catalog`, `install_bundled_library`, `install_library_from_zip`, `download_and_install_library`, `remove_library`, `list_installed_libraries`.
  - **Serial Communication:** `list_serial_ports`, `open_serial`, `close_serial`, `write_to_serial`.
- **State & Concurrency:** Uses `AppState` guarded by `Mutex<Option<Box<dyn SerialPort>>>` for background serial reading threads and Tauri event emission (`serial-data`, `upload-progress`, `library-download-progress`).

---

## 5. Simulation Architecture

- **Engine:** Client-side execution in `src/simulator/engine.ts` using `avr8js`.
- **Pipeline:**
  1. Compiles sketch to `.hex` (via Rust backend).
  2. Parses hex using `intel-hex`.
  3. Instantiates `AvrRunner` with CPU (`CPU` for `atmega328p`) and peripherals (timers, UART, GPIO).
  4. Resolves breadboard netlist (`SimulationNetlist.ts`, `pinMap.ts`) to wire component pin states to microcontroller pins.
  5. Runs simulation tick loop, emitting pin states and serial output to `SimulationStore` and React UI components.

---

## 6. Build / Compile Architecture

- **Toolchain:** Bundled GNU AVR toolchain (`avr-gcc`, `avr-g++`, `avr-objcopy`, `avr-size`, `avrdude`) located in Tauri resource directories (`src-tauri/resources/`).
- **Target Board:** Hardcoded to `arduino:avr:uno` (`atmega328p`, 16MHz).
- **Compilation Steps:**
  1. Scans project `.ino`, `.cpp`, `.c` files for `#include` directives.
  2. Resolves headers against project libraries, user libraries (`app_data/libraries`), bundled libraries (`resources/arduino-libraries`), and Arduino core (`resources/arduino-core`).
  3. Compiles core files and library files into `.o` objects with disk-level caching in `build-cache`.
  4. Compiles sketch sources, links all object files into an `.elf` binary using `avr-gcc`.
  5. Extracts Intel Hex (`.hex`) via `avr-objcopy`.
  6. Computes flash and RAM utilization via `avr-size`.

---

## 7. Current Project & Circuit Model

### Project Directory Structure
- `pisso.json` — Project metadata (schemaVersion, name, activeFileIndex)
- `design/circuit.json` — Circuit diagram state
- `src/` — Sketch source code files (`.ino`, `.cpp`, `.h`)
- `libraries/` — Project-local libraries
- `assets/` — Binary assets
- `build/` — Build artifacts
- `simulation/` — Simulation data

### Circuit Diagram Model (`diagram.json`)
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
    }
  ],
  "connections": [
    {
      "id": "w1",
      "from": { "partId": "uno1", "pin": "13" },
      "to": { "partId": "led1", "pin": "A" },
      "route": []
    }
  ]
}
```

---

## 8. Current Known Failures

1. **TypeScript Typecheck (`npx tsc --noEmit`):**
   - 12 compilation errors across 6 files. Examples:
     - Missing `storeState` property in `SimulationContext.tsx`.
     - Unused declarations/imports in `RunButton.tsx`, `UploadButton.tsx`, `validator.ts`, `SimulationAdapter.ts`, `SimulationNetlist.ts`.
2. **Vitest Frontend Test Suite (`pnpm test`):**
   - 3 test files failing (`diagram.test.ts`, `netlist/router.test.ts` report "No test suite found").
   - `BuildManager.test.ts` fails 2 tests expecting `success`/`failed` status from mocked/stubbed compilation flows.
3. **Cargo Build / Test Concurrency:**
   - Cargo build (`cargo check` / `cargo test`) can trigger `STATUS_ACCESS_VIOLATION` (`-1073741510`) on Windows when building 551 dependencies without job limiting (`-j 2`).

---

## 9. Technical Debt, Dead/Duplicated Code, & Concerns

- **Service Duplication:** Multiple overlapping abstractions for compilation and project management (`BuildManager.ts`, `compiler-service.ts`, `ProjectManager.ts`, `project-service.ts`).
- **Empty / Stub Tests:** Test files like `diagram.test.ts` and `router.test.ts` contain no test suites, causing Vitest suite failures.
- **Security:** Subprocess execution of `avr-gcc` and `avrdude` relies on valid resource paths; lack of strict input sanitization on zip archive extractions (though staged in temporary directories).
- **Performance:** Heavy Rust dependency tree (551 crates) leads to long initial compile times (`~3m50s`). Frontend bundle relies on React 19 + XYFlow with complex SVG part rendering.

---

## 10. Recommended Refactoring Order

1. **Phase 1: Type Safety & Test Stabilization**
   - Fix all TypeScript compilation errors (`tsc`) and ensure `npx tsc --noEmit` passes cleanly.
   - Fix or remove empty/broken Vitest test files (`diagram.test.ts`, `router.test.ts`) and correct `BuildManager.test.ts` expectations.
2. **Phase 2: Architecture & Service Cleanup**
   - Deduplicate overlapping service/manager classes (`BuildManager` vs `compiler-service`, etc.).
   - Establish clean separation between UI components and domain/netlist logic.
3. **Phase 3: Robust Error Handling & Simulation Hardening**
   - Enhance toolchain error propagation and hex validation.
   - Stabilize `avr8js` simulation lifecycle management and state synchronization.
