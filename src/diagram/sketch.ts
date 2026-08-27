/**
 * Prepares a code string for writing to the sketch.ino file.
 * Following the pure transformation pattern used in diagram/save.ts,
 * this function transforms the internal sketch model (currently a plain string)
 * into the format intended for disk storage.
 */
export function writeSketch(code: string): string {
  return code;
}

/**
 * Processes the content read from a sketch.ino file into the internal model.
 * Following the pure transformation pattern used in diagram/load.ts,
 * this function ensures the raw disk content is valid for the editor.
 */
export function readSketch(content: string | null | undefined): string {
  if (content === null || content === undefined) {
    return "";
  }
  return content;
}
