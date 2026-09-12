import { invoke } from "@tauri-apps/api/core";

export interface SerialPortInfo {
  port_name: string;
  vendor_id?: number;
  product_id?: number;
  is_arduino: boolean;
}

export const SerialApi = {
  listPorts: async (): Promise<SerialPortInfo[]> => {
    return await invoke<SerialPortInfo[]>("list_serial_ports");
  },

  openSerial: async (portName: string, baudRate: number): Promise<void> => {
    await invoke("open_serial", { portName, baudRate });
  },

  closeSerial: async (): Promise<void> => {
    await invoke("close_serial");
  },

  writeToSerial: async (data: string): Promise<void> => {
    await invoke("write_to_serial", { data });
  }
};
