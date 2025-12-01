/**
 * CollabService (Stubbed)
 * Previously handled WebSocket real-time collaboration
 * Now returns no-op - multiplayer removed
 */

type Handler = (data?: any) => void

export default class CollabService {
  private handlers: Map<string, Handler[]> = new Map()
  
  constructor(url?: string) {
    // No-op - no WebSocket connection
  }

  on(event: string, handler: Handler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, [])
    }
    this.handlers.get(event)!.push(handler)
  }

  off(event: string, handler?: Handler): void {
    if (handler) {
      const handlers = this.handlers.get(event)
      if (handlers) {
        const idx = handlers.indexOf(handler)
        if (idx !== -1) handlers.splice(idx, 1)
      }
    } else {
      this.handlers.delete(event)
    }
  }

  send(data: any): void {
    // No-op
  }

  close(): void {
    // No-op
  }
}
