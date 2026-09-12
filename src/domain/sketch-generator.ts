import { ProjectFile } from "./models";

/**
 * Prepares a code string for writing to the sketch.ino file.
 */
export function writeSketch(code: string): string {
  return code;
}

/**
 * Processes the content read from a sketch.ino file into the internal model.
 */
export function readSketch(content: string | null | undefined): string {
  if (content === null || content === undefined) {
    return "";
  }
  return content;
}

/**
 * Preprocesses a collection of project files into a format suitable for the compiler.
 * This handles Arduino-style .ino concatenation and prototype generation.
 */
export function preprocess(files: ProjectFile[]): ProjectFile[] {
  const inoFiles = files.filter(f => f.name.endsWith(".ino"));
  const otherFiles = files.filter(f => !f.name.endsWith(".ino"));

  if (inoFiles.length === 0) return files;

  // 1. Source Ordering: Main sketch first, then others alphabetically.
  const sortedInos = [...inoFiles].sort((a, b) => {
    // Keep 'sketch.ino' at the top if it exists
    if (a.name === 'sketch.ino') return -1;
    if (b.name === 'sketch.ino') return 1;
    return a.name.localeCompare(b.name);
  });

  // 2. Concatenate multiple .ino files
  let combinedContent = "";
  for (const file of sortedInos) {
    combinedContent += `\n#line 1 "${file.name}"\n`;
    combinedContent += file.content + "\n";
  }

  // 3. Handle includes: ensure Arduino.h is included
  if (!combinedContent.includes("#include <Arduino.h>") && !combinedContent.includes("#include \"Arduino.h\"")) {
    combinedContent = "#include <Arduino.h>\n" + combinedContent;
  }

  // 4. Automatic Prototypes
  const prototypes = generatePrototypes(combinedContent);

  // Find a good place to insert prototypes: after includes/defines but before functions.
  const lines = combinedContent.split('\n');
  let insertLine = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('#include') || lines[i].trim().startsWith('#define')) {
      insertLine = i + 1;
    }
  }

  lines.splice(insertLine, 0, "\n// --- Automatic Prototypes ---\n" + prototypes + "\n");
  combinedContent = lines.join('\n');

  // Return the main sketch plus all other files (C/C++, headers, etc. remain separate)
  return [
    { name: "sketch.ino", content: combinedContent },
    ...otherFiles
  ];
}

/**
 * Basic C++ function prototype generator.
 */
function generatePrototypes(code: string): string {
  // Strip comments to avoid false positives
  const stripped = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, (match) => ' '.repeat(match.length));

  const prototypes: string[] = [];
  // Regex to find function definitions: type name(args) {
  // It tries to be selective about what looks like a top-level function.
  const funcRegex = /^[\w\s\*&]+?\s+(\w+)\s*\([^\)]*\)\s*\{/gm;

  let match;
  while ((match = funcRegex.exec(stripped)) !== null) {
    const fullMatch = match[0].trim().replace(/\s*\{$/, "");
    const funcName = match[1];

    // Skip keywords and common Arduino entry points
    if (['if', 'while', 'for', 'switch', 'return', 'setup', 'loop'].includes(funcName)) {
      continue;
    }

    prototypes.push(fullMatch + ";");
  }

  return prototypes.join("\n");
}
