import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BuildManager, BuildableProject } from './BuildManager';
import { CompilerApi } from '../infrastructure/tauri/compiler-api';
import { ProjectService } from './project-service';
import { ProjectFile } from '../domain/models';

// We mock the infrastructure and service layers that touch the disk or Rust backend
vi.mock('../infrastructure/tauri/compiler-api');
vi.mock('./project-service');
vi.mock('../parts', () => ({
  PARTS_REGISTRY: {
    get: vi.fn((id) => {
      if (id === 'wokwi-arduino-uno') return { isBoard: true, fqbn: 'arduino:avr:uno', name: 'Arduino Uno' };
      return null;
    })
  }
}));

describe('Build Integration (Sketch to HEX)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully process a sketch and produce a non-empty HEX', async () => {
    // 1. Setup a minimal known-good sketch
    const files: ProjectFile[] = [
      {
        name: 'sketch.ino',
        content: `
          void setup() {
            pinMode(LED_BUILTIN, OUTPUT);
          }
          void loop() {
            digitalWrite(LED_BUILTIN, HIGH);
            delay(100);
            digitalWrite(LED_BUILTIN, LOW);
            delay(100);
          }
        `
      }
    ];

    const project: BuildableProject = {
      rootPath: '/test/integration-project',
      files: files,
      circuit: {
        version: 1,
        components: [
          { id: 'board1', definitionId: 'wokwi-arduino-uno', x: 0, y: 0, rotation: 0, attributes: {} }
        ],
        connections: [],
        nets: []
      }
    };

    // 2. Mock the successful compilation at the API boundary
    // In a real integration test environment, this would be the Rust bridge
    const mockHex = ':100000000C9435000C945D000C945D000C945D00D4'; // Valid-looking minimal HEX
    vi.mocked(CompilerApi.compileSketch).mockResolvedValue({
      success: true,
      hex: mockHex,
      flash_used: 444,
      ram_used: 9,
      stdout: 'Compiling...',
      stderr: ''
    });

    vi.mocked(ProjectService.saveProjectFiles).mockResolvedValue(undefined);

    // 3. Execute the full build flow: Preprocess -> Compile -> Link (simulated) -> Result
    const result = await BuildManager.build(project);

    // 4. Verification
    expect(result.status).toBe('success');
    expect(result.hex).toBe(mockHex);
    expect(result.hex?.length).toBeGreaterThan(0);

    // Verify that preprocessing occurred (BuildManager calls preprocess)
    // We can verify this by checking if the files passed to CompilerApi were processed
    const compileCall = vi.mocked(CompilerApi.compileSketch).mock.calls[0];
    // Path should be correct
    expect(compileCall[0]).toContain('sketch.ino');

    // Verify ProjectService was called to sync files to "disk" before compilation
    expect(ProjectService.saveProjectFiles).toHaveBeenCalled();

    // Check structured data
    expect(result.flashUsed).toBe(444);
    expect(result.ramUsed).toBe(9);
  });

  it('should handle multi-file Arduino projects through the full pipeline', async () => {
    // 1. Setup a multi-file project
    const files: ProjectFile[] = [
      { name: 'sketch.ino', content: 'void setup() { greet(); } void loop() {}' },
      { name: 'helper.ino', content: 'void greet() { Serial.println("Hi"); }' },
      { name: 'utils.h', content: '#define VERSION 1' }
    ];

    const project: BuildableProject = {
      rootPath: '/test/multi-file',
      files: files,
      circuit: {
        version: 1,
        components: [{ id: 'b1', definitionId: 'wokwi-arduino-uno', x: 0, y: 0, rotation: 0, attributes: {} }],
        connections: [],
        nets: []
      }
    };

    vi.mocked(CompilerApi.compileSketch).mockResolvedValue({
      success: true,
      hex: ':020000040000FA',
      flash_used: 100,
      ram_used: 10,
      stdout: '',
      stderr: ''
    });

    // 2. Run build
    const result = await BuildManager.build(project);

    // 3. Verify
    expect(result.status).toBe('success');
    expect(result.hex).toBe(':020000040000FA');

    // Verify that the files passed to the compiler were preprocessed (concatenated .inos)
    const processedFiles = vi.mocked(ProjectService.saveProjectFiles).mock.calls[0][1];

    // Should have sketch.ino (combined) and utils.h
    expect(processedFiles.length).toBe(2);
    const combinedIno = processedFiles.find(f => f.name === 'sketch.ino');
    expect(combinedIno?.content).toContain('void setup()');
    expect(combinedIno?.content).toContain('void greet()');
    expect(combinedIno?.content).toContain('void greet();'); // Prototype
    expect(combinedIno?.content).toContain('#include <Arduino.h>');

    const headerFile = processedFiles.find(f => f.name === 'utils.h');
    expect(headerFile).toBeDefined();
    expect(headerFile?.content).toContain('#define VERSION 1');
  });
});
