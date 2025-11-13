import { createApp } from 'vue'
import pinia from '@store/pinia.ts'
import { useFiltersStore } from '@store/filters.store.ts'
import { useGameStateStore } from '@store/gameState.store.ts'
import App from './App.vue'

// Import all services for global debugging access
import tmdbCache from '@services/cache/tmdbCache.ts'
import physicsService from '@services/game/physicsService.ts'
import cacheService from '@services/cacheService.ts'
import goalModeService from '@modes/GoalModeService.ts'
import hybridModeService from '@modes/HybridModeService.ts'
import knowledgeModeService from '@modes/KnowledgeModeService.ts'
import antiModeService from '@modes/AntiModeService.ts'
import zenModeService from '@modes/ZenModeService.ts'
import ConnectionService from '@services/game/ConnectionService.ts'
import GameEngineService from '@services/game/GameEngineService.ts'
import SearchService from '@services/game/SearchService.ts'
import GameModeManager from '@services/game/GameModeManager.ts'
import gameSettingsService from '@services/GameSettingsService.ts'
import uiService from '@services/ui/UIService.ts'
import utilityService from '@utils/utility.ts'
import { debug, warn, error as logError } from './services/ui/log.ts'
import './assets/styles/theme.css'

// Initialize UI service (sets theme and listeners)
try { 
  uiService.initialize() 
} catch (err) {
  // UI service initialization failure is non-critical - app can still function
  debug('UI service initialization failed', { error: err })
}

// Create Pinia stores once (usable in dev globals and debug object)
const filtersStore = useFiltersStore(pinia)
const gameStateStore = useGameStateStore(pinia)

// Make services globally available for debugging (dev only)
if (import.meta.env && import.meta.env.DEV) {
  window.tmdbCache = tmdbCache
  window.physicsService = physicsService
  window.cacheService = cacheService
  window.goalModeService = goalModeService
  window.hybridModeService = hybridModeService
  window.knowledgeModeService = knowledgeModeService
  window.antiModeService = antiModeService
  window.connectionService = ConnectionService
  window.gameEngineService = GameEngineService
  window.zenModeService = zenModeService
  window.gameSettingsService = gameSettingsService
  window.searchService = SearchService
  window.uiService = uiService
  window.utilityService = utilityService
  window.gameModeManager = GameModeManager
}

// Add a global game debug object (dev only)
if (import.meta.env && import.meta.env.DEV) {
  window.gameDebug = {
    services: {
      tmdbCache: tmdbCache,
      physics: physicsService,
      cache: cacheService,
      goal: goalModeService,
      hybrid: hybridModeService,
      knowledge: knowledgeModeService,
      anti: antiModeService,
      connection: ConnectionService,
      engine: GameEngineService,
      zen: zenModeService,
      settings: gameSettingsService,
      search: SearchService,
      ui: uiService,
      state: gameStateStore,
      utility: utilityService,
      modeManager: GameModeManager,
    },
    help: () => {
      debug('Available services', { services: Object.keys(window.gameDebug.services) })
      debug('Use: window.gameDebug.services.[serviceName] to access services')
    },
    stores: {
      filters: filtersStore,
      gameState: gameStateStore,
    },
  }
}

createApp(App).use(pinia).mount('#app')
