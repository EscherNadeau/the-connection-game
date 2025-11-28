/**
 * Sound Event Constants
 * Define all audio events used in the game
 */

export const SoundEvents = {
  // ==========================================
  // GAMEPLAY
  // ==========================================
  
  /** Item dropped/placed on the game board */
  ITEM_PLACED: 'item_placed',
  
  /** Two items successfully connected */
  CONNECTION_MADE: 'connection_made',
  
  /** Attempted invalid connection */
  CONNECTION_INVALID: 'connection_invalid',
  
  /** A goal has been completed */
  GOAL_COMPLETE: 'goal_complete',
  
  /** Item removed from board */
  ITEM_REMOVED: 'item_removed',

  // ==========================================
  // GAME STATE
  // ==========================================
  
  /** Game has started */
  GAME_START: 'game_start',
  
  /** Player won the game */
  GAME_WIN: 'game_win',
  
  /** Player lost the game */
  GAME_LOSE: 'game_lose',
  
  /** Timer is running low (warning) */
  TIMER_WARNING: 'timer_warning',
  
  /** Timer has expired */
  TIMER_EXPIRED: 'timer_expired',
  
  /** Round/level complete */
  ROUND_COMPLETE: 'round_complete',

  // ==========================================
  // MULTIPLAYER
  // ==========================================
  
  /** A player joined the room */
  PLAYER_JOINED: 'player_joined',
  
  /** A player left the room */
  PLAYER_LEFT: 'player_left',
  
  /** It's now your turn (PvP) */
  YOUR_TURN: 'your_turn',
  
  /** Opponent's turn started */
  OPPONENT_TURN: 'opponent_turn',
  
  /** All players ready */
  ALL_READY: 'all_ready',

  // ==========================================
  // UI / GENERAL
  // ==========================================
  
  /** Generic button click */
  BUTTON_CLICK: 'button_click',
  
  /** Menu/modal opened */
  MENU_OPEN: 'menu_open',
  
  /** Menu/modal closed */
  MENU_CLOSE: 'menu_close',
  
  /** Notification/toast appeared */
  NOTIFICATION: 'notification',
  
  /** Error notification */
  ERROR: 'error',
  
  /** Success notification */
  SUCCESS: 'success',
  
  /** Search result found */
  SEARCH_RESULT: 'search_result',

} as const

export type SoundEvent = typeof SoundEvents[keyof typeof SoundEvents]

// Sound categories for volume control
export const SoundCategories = {
  MASTER: 'master',
  SFX: 'sfx',
  UI: 'ui',
  MUSIC: 'music',
} as const

export type SoundCategory = typeof SoundCategories[keyof typeof SoundCategories]

// Map events to categories
export const eventCategoryMap: Record<SoundEvent, SoundCategory> = {
  // Gameplay - SFX
  [SoundEvents.ITEM_PLACED]: SoundCategories.SFX,
  [SoundEvents.CONNECTION_MADE]: SoundCategories.SFX,
  [SoundEvents.CONNECTION_INVALID]: SoundCategories.SFX,
  [SoundEvents.GOAL_COMPLETE]: SoundCategories.SFX,
  [SoundEvents.ITEM_REMOVED]: SoundCategories.SFX,
  
  // Game State - SFX
  [SoundEvents.GAME_START]: SoundCategories.SFX,
  [SoundEvents.GAME_WIN]: SoundCategories.SFX,
  [SoundEvents.GAME_LOSE]: SoundCategories.SFX,
  [SoundEvents.TIMER_WARNING]: SoundCategories.SFX,
  [SoundEvents.TIMER_EXPIRED]: SoundCategories.SFX,
  [SoundEvents.ROUND_COMPLETE]: SoundCategories.SFX,
  
  // Multiplayer - SFX
  [SoundEvents.PLAYER_JOINED]: SoundCategories.SFX,
  [SoundEvents.PLAYER_LEFT]: SoundCategories.SFX,
  [SoundEvents.YOUR_TURN]: SoundCategories.SFX,
  [SoundEvents.OPPONENT_TURN]: SoundCategories.SFX,
  [SoundEvents.ALL_READY]: SoundCategories.SFX,
  
  // UI - UI category
  [SoundEvents.BUTTON_CLICK]: SoundCategories.UI,
  [SoundEvents.MENU_OPEN]: SoundCategories.UI,
  [SoundEvents.MENU_CLOSE]: SoundCategories.UI,
  [SoundEvents.NOTIFICATION]: SoundCategories.UI,
  [SoundEvents.ERROR]: SoundCategories.UI,
  [SoundEvents.SUCCESS]: SoundCategories.UI,
  [SoundEvents.SEARCH_RESULT]: SoundCategories.UI,
}

