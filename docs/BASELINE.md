# Project Baseline Audit - Pisso

**Date:** 2026-09-11
**Project Name:** pissow
**Root Folder:** `C:/Users/User/OneDrive/Desktop/Task_(incomplete)/pissow`

## Diagnostics Run

### 1. TypeScript Check
- **Command:** `npx tsc --noEmit`
- **Result:** Failed
- **Errors:** 6 errors in 5 files

| File | Line | Error Code | Description |
|------|------|------------|-------------|
| `src/components/IconButton.tsx` | 2 | TS2459 | `ButtonProps` declared locally in `./Button` but not exported. |
| `src/components/IconButton.tsx` | 20 | TS7053 | Element implicitly has an 'any' type when indexing `sizeMap` with `size`. |
| `src/components/Input.tsx` | 6 | TS2430 | `InputProps` incorrectly extends `InputHTMLAttributes` (incompatible `prefix` property). |
| `src/components/Showcase.tsx` | 5 | TS6133 | `PanelFooter` is declared but never read. |
| `src/parts/utils.ts` | 1 | TS6133 | `PinState` is declared but never read. |
| `src/utils/pin-resolver.ts` | 1 | TS6133 | `PinDefinition` is declared but never read. |

### 2. Rust Check
- **Command:** `cargo check` (in `src-tauri`)
- **Result:** Success
- **Errors/Warnings:** None reported.

### 3. Rust Tests
- **Command:** `cargo test` (in `src-tauri`)
- **Result:** Success
- **Output:** 0 tests passed, 0 failed, 0 ignored. (No tests defined)

### 4. Frontend Build
- **Command:** `npm run build`
- **Note:** Runs `tsc && vite build`. Expected to fail due to TypeScript errors.

## Current Architecture Observations

- **Framework:** Tauri v2
- **Frontend:** React, Vite, TypeScript
- **Backend:** Rust
- **Project Schema (Version 1):**
  - `pisso.json`: Project metadata (name, schemaVersion, activeFileIndex).
  - `design/circuit.json`: Circuit diagram state.
  - `src/`: Source code files (.ino, .cpp, .h).
  - `libraries/`: Project-specific libraries.
  - `assets/`: Project assets.
  - `build/`: Build artifacts.
  - `simulation/`: Simulation-related data.
- **Key Features:**
  - Arduino-like IDE with multi-tab support (`EditorTabs.tsx`).
  - Simulation support (implied by `avr8js` and `simulator/engine` imports).
  - Native compilation for AVR (Arduino Uno) using bundled `avr-toolchain` and `arduino-core`.
  - Serial port communication for uploading and monitoring.
  - Project persistence in `app_data_dir/projects`.
  - Build caching for core and library object files.
  - Automatic migration from legacy fragmented project structures.
The following commands are exposed to the frontend via `pissow_lib`:
- `create_new_project`: Initializes a project structure with `design` and `code` folders.
- `list_projects`: Lists existing projects in app data.
- `get_recent_projects` / `add_recent_project`: Manages a list of recently opened projects.
- `save_full_project` / `save_diagram` / `save_project_files`: Persistence for design and code.
- `load_project_files` / `load_diagram`: Retrieval of project assets.
- `compile_sketch`: Invokes `avr-gcc`/`avr-g++` to compile `.ino` and other sources.
- `upload_hex`: Uses `avrdude` to upload compiled hex to a board.
- `list_serial_ports` / `open_serial` / `close_serial` / `write_to_serial`: Serial interaction.
- `get_library_catalog` / `install_bundled_library` / `install_library_from_zip` / `remove_library`: Library management.

## Known Broken Workflows
- **Compilation/Build:** The frontend build command `npm run build` will fail because it runs `tsc` first, which currently reports type errors.
- **TypeScript Type Safety:** Several components have type mismatches or missing exports that prevent a clean build.
- **Board Support:** Currently hardcoded to only support `arduino:avr:uno`.
