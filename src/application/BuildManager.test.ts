import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BuildManager, BuildableProject } from './BuildManager';
import { CompilerService } from './compiler-service';
import { ProjectFile } from '../domain/models';

vi.mock('./compiler-service');
vi.mock('./project-service');
vi.mock('../parts', () => ({
  PARTS_REGISTRY: {
    get: vi.fn((id) => {
        if (id === 'wokwi-arduino-uno') return { isBoard: true, fqbn: 'arduino:avr:uno' };
        return null;
    })
  }
}));

describe('BuildManager Preprocessing & Build', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should correctly preprocess multiple .ino files and generate prototypes', async () => {
    const files: ProjectFile[] = [
      {
        name: 'sketch.ino',
        content: `
void setup() {
  Serial.begin(9600);
  greet();
}

void loop() {
  int result = add(5, 3);
}
        `
      },
      {
        name: 'extra.ino',
        content: `
void greet() {
  Serial.println("Hello");
}

int add(int a, int b) {
  return a + b;
}
        `
      },
      {
        name: 'helper.cpp',
        content: 'int cpp_helper() { return 42; }'
      }
    ];

    const project: BuildableProject = {
      rootPath: '/test/project',
      files: files,
      circuit: {
        version: 1,
        components: [{ id: 'uno', definitionId: 'wokwi-arduino-uno', x: 0, y: 0, rotation: 0, attributes: {} }],
        connections: [],
        nets: []
      }
    };

    vi.mocked(CompilerService.compile).mockResolvedValue({
      success: true,
      hex: ':100000000C9435000C945D000C945D000C945D00D4',
      flash_used: 1024,
      ram_used: 128,
      stdout: 'Compilation successful',
      stderr: ''
    });

    const result = await BuildManager.build(project);

    expect(result.status).toBe('success');
    expect(result.hex).toBeDefined();
    expect(result.flashUsed).toBe(1024);

    // Verify preprocessing logic
    const compileCalls = vi.mocked(CompilerService.compile).mock.calls;
    const processedFiles = compileCalls[0][1];

    // Should have 2 files: sketch.ino (combined) and helper.cpp
    expect(processedFiles.length).toBe(2);
    const mainSketch = processedFiles.find(f => f.name === 'sketch.ino');
    expect(mainSketch).toBeDefined();

    // Check for prototypes
    expect(mainSketch?.content).toContain('void greet();');
    expect(mainSketch?.content).toContain('int add(int a, int b);');

    // Check for concatenation
    expect(mainSketch?.content).toContain('void greet() {');
    expect(mainSketch?.content).toContain('int add(int a, int b) {');

    // Check for Arduino.h
    expect(mainSketch?.content).toContain('#include <Arduino.h>');

    // Check for helper.cpp
    const helper = processedFiles.find(f => f.name === 'helper.cpp');
    expect(helper).toBeDefined();
    expect(helper?.content).toBe('int cpp_helper() { return 42; }');
  });

  it('should handle build failures and return structured diagnostics', async () => {
    const project: BuildableProject = {
      rootPath: '/test/fail',
      files: [{ name: 'sketch.ino', content: 'void setup() { error_here(); }' }],
      circuit: {
        version: 1,
        components: [{ id: 'uno', definitionId: 'wokwi-arduino-uno', x: 0, y: 0, rotation: 0, attributes: {} }],
        connections: [],
        nets: []
      }
    };

    vi.mocked(CompilerService.compile).mockRejectedValue(
        '/test/fail/src/sketch.ino:1:16: error: \'error_here\' was not declared in this scope'
    );

    const result = await BuildManager.build(project);

    expect(result.status).toBe('failed');
    expect(result.diagnostics.length).toBeGreaterThan(0);
    expect(result.diagnostics[0].message).toContain('error_here');
    expect(result.diagnostics[0].line).toBe(1);
  });
});
