import { SerialService } from '../application/serial-service';
import { CompilerService } from '../application/compiler-service';
import { BoardDefinition, SerialPortInfo } from '../core/index';

export class DeviceService {
  public static async listSerialPorts(): Promise<SerialPortInfo[]> {
    const ports = await SerialService.listPorts();
    return ports.map(p => ({
      portName: p.port_name,
      vendorId: p.vendor_id,
      productId: p.product_id,
      isArduino: p.is_arduino
    }));
  }

  public static async openSerialPort(portName: string, baudRate: number = 115200): Promise<void> {
    await SerialService.openPort(portName, baudRate);
  }

  public static async closeSerialPort(): Promise<void> {
    await SerialService.closePort();
  }

  public static async writeToSerialPort(data: string): Promise<void> {
    await SerialService.write(data);
  }

  public static async uploadFirmware(
    hexPath: string,
    port: string,
    board: BoardDefinition
  ): Promise<string> {
    return await CompilerService.upload(hexPath, port, board);
  }
}
