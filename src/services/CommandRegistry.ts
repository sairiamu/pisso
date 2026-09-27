export interface Command {
  id: string;
  title: string;
  category: string;
  description?: string;
  keybinding?: string;
  icon?: string;
  handler: () => any | Promise<any>;
  enabled?: boolean | (() => boolean);
}

export class CommandRegistry {
  private static instance: CommandRegistry;
  private commands: Map<string, Command> = new Map();
  private listeners: Set<() => void> = new Set();

  private constructor() {}

  public static getInstance(): CommandRegistry {
    if (!CommandRegistry.instance) {
      CommandRegistry.instance = new CommandRegistry();
    }
    return CommandRegistry.instance;
  }

  public registerCommand(command: Command): () => void {
    this.commands.set(command.id, command);
    this.notifyListeners();

    return () => {
      this.unregisterCommand(command.id);
    };
  }

  public unregisterCommand(id: string): void {
    if (this.commands.has(id)) {
      this.commands.delete(id);
      this.notifyListeners();
    }
  }

  public async executeCommand(id: string): Promise<boolean> {
    const cmd = this.commands.get(id);
    if (!cmd) {
      console.warn(`[CommandRegistry] Command not found: ${id}`);
      return false;
    }

    const isEnabled = typeof cmd.enabled === 'function' ? cmd.enabled() : cmd.enabled !== false;
    if (!isEnabled) {
      console.warn(`[CommandRegistry] Command disabled: ${id}`);
      return false;
    }

    try {
      await cmd.handler();
      return true;
    } catch (err) {
      console.error(`[CommandRegistry] Error executing command ${id}:`, err);
      return false;
    }
  }

  public getCommand(id: string): Command | undefined {
    return this.commands.get(id);
  }

  public getAllCommands(): Command[] {
    return Array.from(this.commands.values()).filter(cmd => {
      return typeof cmd.enabled === 'function' ? cmd.enabled() : cmd.enabled !== false;
    });
  }

  public searchCommands(query: string): Command[] {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return this.getAllCommands();

    return this.getAllCommands().filter(cmd => {
      const fullText = `${cmd.category}: ${cmd.title} ${cmd.description || ''}`.toLowerCase();
      return fullText.includes(trimmed);
    });
  }

  public onCommandsChanged(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(fn => fn());
  }
}

export const commandRegistry = CommandRegistry.getInstance();
