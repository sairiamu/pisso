import { listen, EventCallback, UnlistenFn } from "@tauri-apps/api/event";

export const EventApi = {
  listen: async <T>(eventName: string, handler: EventCallback<T>): Promise<UnlistenFn> => {
    return await listen<T>(eventName, handler);
  }
};
