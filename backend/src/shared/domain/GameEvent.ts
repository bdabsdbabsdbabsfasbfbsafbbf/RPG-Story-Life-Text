export interface GameEvent {
  type: string;
  payload: Record<string, unknown>;
  timestamp: Date;
  playerId?: string;
}

export class EventBus {
  private handlers: Map<string, Array<(event: GameEvent) => Promise<void>>> = new Map();

  subscribe(eventType: string, handler: (event: GameEvent) => Promise<void>): void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
  }

  async publish(event: GameEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    await Promise.all(handlers.map(h => h(event).catch(e => console.error(`Event handler error: ${e}`))));
  }

  remove(eventType: string, handler: (event: GameEvent) => Promise<void>): void {
    const handlers = this.handlers.get(eventType) || [];
    this.handlers.set(eventType, handlers.filter(h => h !== handler));
  }
}

export const eventBus = new EventBus();
