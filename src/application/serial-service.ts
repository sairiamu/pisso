import { SerialApi, SerialPortInfo } from "../infrastructure/tauri/serial-api";

export const SerialService = {
  async listPorts(): Promise<SerialPortInfo[]> {
    return await SerialApi.listPorts();
  },

  async openPort(portName: string, baudRate: number = 115200): Promise<void> {
    await SerialApi.openSerial(portName, baudRate);
  },

  async closePort(): Promise<void> {
    await SerialApi.closeSerial();
  },

  async write(data: string): Promise<void> {
    await SerialApi.writeToSerial(data);
  }
};
