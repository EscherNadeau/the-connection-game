/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Global type declarations
declare global {
  interface Window {
    gameStartingItems?: any[]
    gameDebug?: any
  }
}

// Module declarations for services that might not have types
declare module '../services/game/physicsService.js' {
  export default {
    stop(): void
  }
}

declare module '../services/game/GameModeManager.js' {
  export default {
    cleanup(): void
  }
}

declare module '../services/game/modes/ModeManager.js' {
  export default {
    cleanup(): void
  }
}

declare module '@/services/ui/BackgroundsService.js' {
  export default class BackgroundsService {
    // Add any methods you use from BackgroundsService
  }
  
  export function getBackgroundUrlsAsync(theme: string): Promise<string[]>
}

declare module '@store/gameState.store.js' {
  export function useGameStateStore(): {
    collabClientId: string
    collabConnected: boolean
    connectCollab(url: string): void
    sendCollab(type: string, data: any): void
  }
}

declare module './SearchPanel.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

export {}
