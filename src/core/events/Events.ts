export type EventType =
  | 'project:created'
  | 'project:opened'
  | 'project:saved'
  | 'project:closed'
  | 'circuit:changed'
  | 'build:started'
  | 'build:completed'
  | 'build:failed'
  | 'simulation:started'
  | 'simulation:stopped'
  | 'device:selected'
  | 'serial:data';

export interface AppEvent<T = any> {
  type: EventType;
  payload: T;
  timestamp: number;
}

export type EventCallback<T = any> = (event: AppEvent<T>) => void;

export class EventBus {
  private static instance: EventBus;
  private listeners: Map<EventType, EventCallback[]> = new Map();

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public on<T = any>(type: EventType, callback: EventCallback<T>): () => void {
    const callbacks = this.listeners.get(type) || [];
    callbacks.push(callback);
    this.listeners.set(type, callbacks);

    return () => {
      const current = this.listeners.get(type) || [];
      this.listeners.set(
        type,
        current.filter(cb => cb !== callback)
      );
    };
  }

  public emit<T = any>(type: EventType, payload: T): void {
    const event: AppEvent<T> = {
      type,
      payload,
      timestamp: Date.now()
    };
    const callbacks = this.listeners.get(type) || [];
    callbacks.forEach(cb => cb(event));
  }
}
