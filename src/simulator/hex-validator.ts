import { Diagnostic } from '../domain/models';

export interface HexValidationResult {
  isValid: boolean;
  data: Uint8Array;
  diagnostics: Diagnostic[];
}

/**
 * Validates an Intel HEX string and extracts the data.
 * Checks for record types, checksums, addresses, and overall format.
 * Ensures the process never crashes, even with severely malformed input.
 */
export function validateHex(hex: string, maxFlashSize: number): HexValidationResult {
  const diagnostics: Diagnostic[] = [];

  if (!hex || hex.trim().length === 0) {
    diagnostics.push({
      severity: 'error',
      message: 'Hex firmware is empty',
      stage: 'simulation-load',
      library: 'simulation',
      suggestion: 'Ensure the sketch is compiled successfully before starting simulation.',
    });
    return { isValid: false, data: new Uint8Array(0), diagnostics };
  }

  const lines = hex.split(/\r?\n/);
  const data = new Uint8Array(maxFlashSize);
  let highestAddress = 0;
  let hasEndOfFile = false;
  let extendedAddress = 0;
  let dataFound = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNumber = i + 1;

    if (line.length === 0) continue;

    try {
      if (!line.startsWith(':')) {
        diagnostics.push({
          severity: 'error',
          message: `Malformed record at line ${lineNumber}: Missing start code ':'`,
          line: lineNumber,
          stage: 'simulation-load',
          library: 'simulation',
          code: 'HEX_MISSING_COLON',
        });
        continue;
      }

      // Minimum length: : 00 0000 01 FF (11 chars)
      if (line.length < 11) {
        diagnostics.push({
          severity: 'error',
          message: `Malformed record at line ${lineNumber}: Record is too short (${line.length} chars)`,
          line: lineNumber,
          stage: 'simulation-load',
          library: 'simulation',
          code: 'HEX_TOO_SHORT',
        });
        continue;
      }

      const hexPattern = /^[0-9A-Fa-f]+$/;
      if (!hexPattern.test(line.substring(1))) {
        diagnostics.push({
          severity: 'error',
          message: `Malformed record at line ${lineNumber}: Contains non-hexadecimal characters`,
          line: lineNumber,
          stage: 'simulation-load',
          library: 'simulation',
          code: 'HEX_INVALID_CHARS',
        });
        continue;
      }

      const byteCount = parseInt(line.substring(1, 3), 16);
      const address = parseInt(line.substring(3, 7), 16);
      const recordType = parseInt(line.substring(7, 9), 16);
      const checksum = parseInt(line.substring(line.length - 2), 16);

      // Verify length against byteCount
      const expectedLength = 1 + 2 + 4 + 2 + (byteCount * 2) + 2;
      if (line.length !== expectedLength) {
        diagnostics.push({
          severity: 'error',
          message: `Malformed record at line ${lineNumber}: Byte count ${byteCount} does not match record length`,
          line: lineNumber,
          stage: 'simulation-load',
          library: 'simulation',
          code: 'HEX_LENGTH_MISMATCH',
        });
        continue;
      }

      // Verify Checksum
      let sum = 0;
      for (let j = 1; j < line.length - 2; j += 2) {
        sum += parseInt(line.substring(j, j + 2), 16);
      }
      const calculatedChecksum = (0x100 - (sum & 0xFF)) & 0xFF;

      if (checksum !== calculatedChecksum) {
        diagnostics.push({
          severity: 'error',
          message: `Checksum mismatch at line ${lineNumber}: Expected ${calculatedChecksum.toString(16).toUpperCase().padStart(2, '0')}, found ${checksum.toString(16).toUpperCase().padStart(2, '0')}`,
          line: lineNumber,
          stage: 'simulation-load',
          library: 'simulation',
          code: 'HEX_CHECKSUM_ERROR',
        });
        continue;
      }

      switch (recordType) {
        case 0: // Data Record
          const fullAddress = extendedAddress + address;
          if (fullAddress + byteCount > maxFlashSize) {
            diagnostics.push({
              severity: 'error',
              message: `Flash overflow at line ${lineNumber}: Address 0x${(fullAddress + byteCount).toString(16).toUpperCase()} exceeds board capacity 0x${maxFlashSize.toString(16).toUpperCase()}`,
              line: lineNumber,
              stage: 'simulation-load',
              library: 'simulation',
              code: 'HEX_FLASH_OVERFLOW',
            });
          } else {
            for (let j = 0; j < byteCount; j++) {
              data[fullAddress + j] = parseInt(line.substring(9 + j * 2, 11 + j * 2), 16);
            }
            highestAddress = Math.max(highestAddress, fullAddress + byteCount);
            dataFound = true;
          }
          break;

        case 1: // End Of File Record
          hasEndOfFile = true;
          break;

        case 2: // Extended Segment Address Record
          extendedAddress = parseInt(line.substring(9, 13), 16) << 4;
          break;

        case 4: // Extended Linear Address Record
          extendedAddress = parseInt(line.substring(9, 13), 16) << 16;
          break;

        case 3: // Start Segment Address Record (Ignored in AVR)
        case 5: // Start Linear Address Record (Ignored in AVR)
          break;

        default:
          diagnostics.push({
            severity: 'warning',
            message: `Unknown record type ${recordType} at line ${lineNumber}`,
            line: lineNumber,
            stage: 'simulation-load',
            library: 'simulation',
            code: 'HEX_UNKNOWN_RECORD',
          });
          break;
      }
    } catch (err) {
      diagnostics.push({
        severity: 'error',
        message: `Critical failure parsing line ${lineNumber}: ${err instanceof Error ? err.message : String(err)}`,
        line: lineNumber,
        stage: 'simulation-load',
        library: 'simulation',
        code: 'HEX_PARSE_EXCEPTION',
      });
    }

    if (hasEndOfFile) break;
  }

  if (!dataFound && diagnostics.length === 0) {
    diagnostics.push({
      severity: 'error',
      message: 'No executable data found in HEX file',
      stage: 'simulation-load',
      library: 'simulation',
      code: 'HEX_NO_DATA',
    });
  }

  if (!hasEndOfFile && dataFound) {
    diagnostics.push({
      severity: 'warning',
      message: 'Missing End Of File record - firmware may be truncated',
      stage: 'simulation-load',
      library: 'simulation',
      code: 'HEX_MISSING_EOF',
    });
  }

  if (dataFound && highestAddress % 2 !== 0) {
    diagnostics.push({
      severity: 'warning',
      message: 'Firmware size is not word-aligned (odd number of bytes). The last byte will be treated as the lower byte of a zero-padded instruction.',
      stage: 'simulation-load',
      library: 'simulation',
      code: 'HEX_ODD_SIZE',
    });
  }

  const hasErrors = diagnostics.some(d => d.severity === 'error');

  return {
    isValid: !hasErrors,
    data,
    diagnostics,
  };
}
