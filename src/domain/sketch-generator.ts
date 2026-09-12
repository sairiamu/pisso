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
