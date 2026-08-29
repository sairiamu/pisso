export function getBreadboardInternalConnections(pinName: string): string[] {
  // Power rails
  if (pinName.startsWith("tp."))
    return Array.from({ length: 25 }, (_, i) => `tp.${i}`);
  if (pinName.startsWith("tg."))
    return Array.from({ length: 25 }, (_, i) => `tg.${i}`);
  if (pinName.startsWith("bp."))
    return Array.from({ length: 25 }, (_, i) => `bp.${i}`);
  if (pinName.startsWith("bg."))
    return Array.from({ length: 25 }, (_, i) => `bg.${i}`);

  // Bus rows (1a-1e connected, 1f-1j connected)
  const match = pinName.match(/^(\d+)([a-j])$/);
  if (match) {
    const row = match[1];
    const colLetter = match[2];
    const colIndex = colLetter.charCodeAt(0) - 97; // 0-9

    const group =
      colIndex < 5 ? ["a", "b", "c", "d", "e"] : ["f", "g", "h", "i", "j"];
    return group.map((letter) => `${row}${letter}`);
  }

  return [pinName];
}

export function isBreadboard(type: string): boolean {
  return type === "wokwi-breadboard";
}
