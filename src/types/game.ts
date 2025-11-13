// Core game types
export interface GameItem {
  id: string
  name: string
  type: 'movie' | 'tv' | 'person'
  imageUrl?: string
  image?: string
  title?: string
  year?: number
  x: number
  y: number
  connections: string[]
  tmdbData?: {
    id: number
    media_type: string
    gender?: number
    title?: string
    name?: string
  }
  tmdbId?: number
  isStartingItem?: boolean
  isDragging?: boolean
  accentColor?: string
  addedBy?: string
}

export interface Connection {
  id: string
  from: string
  to: string
  type: 'cast' | 'crew' | 'genre' | 'year' | 'studio' | 'custom'
  description?: string
  fromItem?: GameItem
  toItem?: GameItem
}

export interface SearchResult {
  id: string | number
  name: string
  title?: string
  type: 'movie' | 'tv' | 'person'
  image?: string | null
  year?: number | null
  originalData?: {
    id: number
    gender?: number
    title?: string
    name?: string
    media_type: string
  }
  tmdbData?: {
    id: number
    media_type: string
    gender?: number
    title?: string
    name?: string
    [key: string]: unknown
  }
  tmdbId?: number
}

export interface GameMode {
  id: string
  name: string
  description: string
  rules: GameRule[]
  settings: GameSettings
  winCondition: WinCondition
  timeLimit?: number
  gameOptions?: GameOptions
  modeSettings?: {
    castFilter?: string
    commonCastFilter?: string
  }
}

export interface GameRule {
  id: string
  name: string
  description: string
  enabled: boolean
  value?: string | number | boolean | unknown
}

export interface GameSettings {
  timer?: {
    enabled: boolean
    duration: number
  }
  castFilter?: {
    enabled: boolean
    value: string
  }
  difficulty?: 'easy' | 'medium' | 'hard'
}

export interface GameOptions {
  playType?: 'single' | 'pvp' | 'collaborative'
  roomCode?: string
  mode?: string
  timer?: {
    enabled: boolean
    duration: number
  }
  castFilter?: {
    enabled: boolean
    value: string
  }
  difficulty?: 'easy' | 'medium' | 'hard'
  goals?: GoalData[]
  [key: string]: unknown // Allow additional properties with unknown type
}

export interface WinCondition {
  type: 'connections' | 'items' | 'time' | 'custom'
  target: number
  description: string
}

// Background types
export interface BackgroundData {
  url: string
  title: string
  theme: 'light' | 'dark'
}

export interface BackgroundTheme {
  light: BackgroundData[]
  dark: BackgroundData[]
}

// PvP types
export interface PvPGameState {
  isPvP: boolean
  players: PvPPlayer[]
  currentPlayer: string
  gameStarted: boolean
  results?: PvPResults
}

export interface PvPPlayer {
  id: string
  name: string
  score: number
  completedGoals: number
  isConnected: boolean
  time: number
  playerId?: string // For backward compatibility
}

export interface PvPResults {
  winner: PvPPlayer
  players: PvPPlayer[]
  gameDuration: number
  totalConnections: number
}

// Collaboration types
export interface CollabMessage {
  type: 'move' | 'add_item' | 'connection' | 'game_start' | 'state_sync'
  data: GameItem | Connection | GameState | unknown
  timestamp: number
  playerId?: string
}

export interface CollabState {
  connected: boolean
  roomCode?: string
  players: string[]
  lastSync: number
}

// Goal management types
export interface GoalData {
  id: string
  description: string
  type: 'connection' | 'item' | 'custom'
  target: string | number | GameItem | GoalData | unknown
  completed: boolean
  progress: number
  status?: 'completed' | 'in-progress' | 'pending'
  mode?: string
  stats?: {
    score?: number
    time?: number
    connections?: number
    unconnectedCount?: number
  }
  pathLength?: number
  pathIds?: string[]
  message?: string
  lost?: boolean
  losingPair?: { from: string; to: string } | unknown
  newGoalIndex?: number
  newGoal?: GoalData
  title?: string
  image?: string
  year?: number
  subGoals?: GoalData[]
  knowledgeCount?: number
}

export interface GoalAdvancementData {
  newGoalIndex?: number
  newGoal?: GoalData
  message?: string
}

export interface ResultModal {
  value: {
    visible: boolean
    type: 'win' | 'lose' | 'info'
    title: string
    subtitle: string
    stats?: any
    losingPair?: any
  }
}

export interface GameBoard {
  gameItems: GameItem[]
  connections: Connection[]
  addItem: (item: GameItem) => void
  createConnection: (from: GameItem, to: GameItem) => void
  checkGoalCompletion?: () => void
  $forceUpdate: () => void
}

export interface StartingItem extends GameItem {
  isStartingItem: boolean
  isGoal: boolean
  source: string
  title: string
  image?: string
  year?: number
}

export interface MoveData {
  id: string
  x: number
  y: number
}

// Tutorial types
export interface TutorialProps {
  showTutorial: boolean
  tutorialStep: number
  resultModalVisible: boolean
}

export interface TutorialEmits {
  (e: 'tutorial-next'): void
  (e: 'open-win-modal'): void
  (e: 'return-to-start'): void
}

// GameSearchPanel types
export interface GameSearchPanelProps {
  gameMode: GameMode
  gameOptions: GameOptions
  showTutorial: boolean
  tutorialStep: number
}

export interface GameSearchPanelEmits {
  (e: 'item-added', data: { item: GameItem, tmdbId: string, itemType: string, hintSourceItem: GameItem | null }): void
  (e: 'connection-created', data: any): void
  (e: 'show-error', message: string): void
  (e: 'hint-requested', item: GameItem): void
}

// GameBoard types
export interface GameBoardProps {
  startingItems: GameItem[]
  gameMode: GameMode
  gameOptions?: GameOptions
  highlightPathIds: string[]
  goalQueue: GoalData[]
  currentGoalIndex: number
  gameType: string
  isPvPMode?: boolean
}

export interface GameBoardEmits {
  (e: 'game-started'): void
  (e: 'connection-created', data: any): void
  (e: 'check-goals', connections: Connection[]): void
  (e: 'goal-completed', data: any): void
  (e: 'viewport-changed', viewport: any): void
  (e: 'item-moved', data: any): void
  (e: 'hint-requested', item: GameItem): void
  (e: 'item-added', data: any): void
  (e: 'show-error', message: string): void
}

// GameItem types
export interface GameItemProps {
  item: GameItem
  index: number
  hintsEnabled: boolean
  highlightPathIds: string[]
  itemState: string
  isQueueMode: boolean
}

export interface GameItemEmits {
  (e: 'mousedown', event: MouseEvent, item: GameItem, index: number): void
  (e: 'mouseup', event: MouseEvent, item: GameItem, index: number): void
  (e: 'mousemove', event: MouseEvent, item: GameItem, index: number): void
  (e: 'hint-click', item: GameItem): void
}

// ConnectionLayer types
export interface ConnectionLayerProps {
  connections: Connection[]
  highlightPathIds: string[]
}

export interface ConnectionWithItems extends Connection {
  fromItem: GameItem
  toItem: GameItem
}

// GameStats types
export interface GameStatsProps {
  gameMode: string
  isMobile: boolean
}

// GoalsContainer types
export interface GoalsContainerProps {
  goals: GoalData[]
  selectedType: string
  goalQueue: GoalData[]
  currentGoal: GoalData | null
  goalProgress: string
  boardItems: GameItem[]
  useIndividualSettings: boolean
  globalKnowledgeFilms: number
}

export interface GoalsContainerEmits {
  (e: 'drop-gap', index: number): void
  (e: 'drag-start-sub', data: any): void
  (e: 'update-goal-settings', data: any): void
  (e: 'remove-goal', goal: GoalData): void
  (e: 'add-goal', goal: GoalData): void
  (e: 'update-goal', goal: GoalData): void
  (e: 'reorder-goals', goals: GoalData[]): void
}

// GoalItem types
export interface GoalItemProps {
  goal: GoalData
  index: number
  goalNumber: number
  isHybridMode: boolean
  isKnowledgeMode: boolean
  useIndividualSettings: boolean
  isDragging: boolean
  isDragOver: boolean
  isDraggedOver: boolean
}

export interface GoalItemEmits {
  (e: 'drag-start', event: DragEvent, goal: GoalData, index: number): void
  (e: 'drop', event: DragEvent, index: number): void
  (e: 'drag-enter', event: DragEvent, index: number): void
  (e: 'drag-leave', event: DragEvent): void
  (e: 'remove', goal: GoalData): void
  (e: 'promote-sub-goal', subGoal: GoalData, subIndex: number): void
  (e: 'remove-sub-goal', subIndex: number): void
  (e: 'drag-start-sub', subGoal: GoalData, event: DragEvent): void
  (e: 'update-goal-settings', data: any): void
}

// CastFilter types
export interface CastFilterProps {
  modelValue: string
}

export interface CastFilterEmits {
  (e: 'update:modelValue', value: string): void
}

// ControllerView types
export interface ControllerViewProps {
  modeTitle: string
  roomCode: string
  playerName: string
  isMobile: boolean
  playType: string
  currentUrl: string
  itemsAdded: number
  maxItems: number
  searchResults: SearchResult[]
  recentItems: SearchResult[]
  currentTurnPlayer: string
  turnTimeLeft: number
  playerItems: number
  isMyTurn: boolean
  playerBoardItems: SearchResult[]
}

export interface ControllerViewEmits {
  (e: 'search-input', query: string): void
  (e: 'add-item', item: SearchResult): void
  (e: 'clear-search'): void
}

// CustomModeFlow types
export interface CustomSong {
  id: string
  name: string
  description: string
  icon: string
  modeType: string
  goals: string[]
  settings: Record<string, any>
}

export interface CustomModeFlowProps {
  showTutorial: boolean
  tutorialStep: number
}

export interface CustomModeFlowEmits {
  (e: 'play-playlist'): void
  (e: 'save-show'): void
  (e: 'open-browser'): void
  (e: 'clear-playlist'): void
  (e: 'create-new-song'): void
  (e: 'edit-song', song: CustomSong): void
  (e: 'song-drag-start', song: CustomSong): void
  (e: 'playlist-drop', event: DragEvent): void
  (e: 'move-song-up', index: number): void
  (e: 'move-song-down', index: number): void
  (e: 'remove-from-playlist', index: number): void
  (e: 'close-song-editor'): void
  (e: 'select-mode-type', modeId: string): void
  (e: 'add-goal', goal: any): void
  (e: 'remove-goal', index: number): void
  (e: 'add-hybrid-goal', goal: any): void
  (e: 'swap-with-main', index: number): void
  (e: 'remove-hybrid-goal', index: number): void
}

// CustomModePanel types
export interface CustomModePanelProps {
  openBrowserOnLoad: boolean
  showTutorial: boolean
  tutorialStep: number
}

export interface CustomModePanelEmits {
  (e: 'back'): void
  (e: 'start-game', gameData: any): void
  (e: 'browser-opened'): void
  (e: 'tutorial-next'): void
}

// CustomModeSettings types
export interface CustomModeSettingsProps {
  backgroundImage: string
}

export interface CustomModeSettingsEmits {
  (e: 'back'): void
  (e: 'start-custom-game', gameData: { goals: CustomGoal[]; gameType: string; castFilter: string; timerMinutes: number; knowledgeTarget: number }): void
  (e: 'import-game'): void
}

export interface CustomGoal {
  id: string | number
  name: string
  type: string
  year?: number | null | undefined
  image?: string | null | undefined
  index: number
}

export interface GameType {
  id: string
  name: string
  description: string
}

// CustomGameData types
export interface CustomGameShowData {
  episodes: unknown[]
  currentEpisodeIndex: number
  totalEpisodes: number
}

export interface CustomGameData {
  id: string
  name: string
  icon?: string
  description?: string
  modeType?: string
  goals?: unknown[]
  settings?: Record<string, unknown>
  isAntiMode?: boolean
  showData?: CustomGameShowData
  gameOptions?: {
    playType?: string
    startingItems?: unknown[]
    [key: string]: unknown
  }
}

// SearchPanel types
export interface SearchPanelProps {
  modelValue: string
  disabled?: boolean
  placeholder?: string
  autofocus?: boolean
  getType: (result: any) => string
  results?: SearchResult[] | null
}

export interface SearchPanelEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'select', result: SearchResult): void
  (e: 'clear'): void
  (e: 'image-error', event: Event): void
  (e: 'input-keyup'): void
}

// StartScreen types
export interface StartScreenProps {
  showTutorial?: boolean
  tutorialStep?: number
  tutorialJustCompleted?: boolean
}

export interface StartScreenEmits {
  (e: 'start-game', data: { action: string, mode?: string, code?: string }): void
  (e: 'how-to-play'): void
  (e: 'tutorial-start'): void
  (e: 'tutorial-next'): void
  (e: 'tutorial-completion-shown'): void
  (e: 'tutorial-step', step: number): void
}

// SettingsScreen types
export interface SettingsScreenProps {
  mode: {
    title: string
    [key: string]: any
  }
  showTutorial?: boolean
  tutorialStep?: number
}

export interface SettingsScreenEmits {
  (e: 'start-game', data: any): void
  (e: 'go-back'): void
  (e: 'tutorial-next'): void
  (e: 'tutorial-jump-to-step', step: number): void
}

// WaitingRoom types
export interface WaitingRoomProps {
  showTutorial?: boolean
  tutorialStep?: number
  gameMode?: {
    [key: string]: any
  } | null
  gameOptions?: {
    playType?: string
    roomCode?: string
    [key: string]: any
  }
}

export interface WaitingRoomEmits {
  (e: 'back'): void
  (e: 'start', gameData: any): void
  (e: 'tutorial-next'): void
  (e: 'player-joined', player: any): void
  (e: 'player-left', player: any): void
}

// SettingsScreen types
export interface SettingsScreenProps {
  openBrowserOnLoad?: boolean
  showTutorial?: boolean
  tutorialStep?: number
}

export interface SettingsScreenEmits {
  (e: 'tutorial-next'): void
  (e: 'back'): void
  (e: 'start-game', gameData: any): void
  (e: 'browser-opened'): void
}

// HowToPlayOverlay types
export interface HowToPlayOverlayProps {
  isVisible?: boolean
}

export interface HowToPlayOverlayEmits {
  (e: 'close'): void
  (e: 'start-tutorial'): void
}

// PhoneWaitingRoom types
export interface PhoneWaitingRoomProps {
  gameMode?: {
    [key: string]: any
  } | null
  gameOptions?: {
    playType?: string
    roomCode?: string
    [key: string]: any
  }
}

export interface PhoneWaitingRoomEmits {
  // No emits defined in the original component
}

// GameHeader types
export interface GameHeaderProps {
  backgroundTitle?: string
  viewport: {
    scale: number
    x: number
    y: number
  }
  gameMode?: string
  showStats?: boolean
  goalQueue?: any[]
  currentGoalIndex?: number
  gameType?: string
}

export interface GameHeaderEmits {
  (e: 'back'): void
  (e: 'reset-zoom'): void
  (e: 'reset-pan'): void
}

// UnifiedPopup types
export interface UnifiedPopupProps {
  gameMode?: {
    showData?: {
      episodes?: any[]
      currentEpisodeIndex?: number
      totalEpisodes?: number
    }
    [key: string]: any
  } | null
}

export interface UnifiedPopupEmits {
  (e: 'show-path'): void
  (e: 'next-episode'): void
  (e: 'finish-show'): void
  (e: 'enter-zen'): void
  (e: 'new-game'): void
}

// WinLoseModal types
export interface WinLoseModalProps {
  visible?: boolean
  type?: 'win' | 'lose' | 'pvp_results'
  title?: string
  subtitle?: string
  stats?: {
    unconnectedCount?: number
    results?: Array<{
      playerId: string
      score: number
      time: number
    }>
    [key: string]: any
  } | null
  gameMode?: {
    showData?: {
      episodes?: any[]
      currentEpisodeIndex?: number
      totalEpisodes?: number
    }
    [key: string]: any
  } | null
}

export interface WinLoseModalEmits {
  (e: 'new-game'): void
  (e: 'show-path'): void
  (e: 'freeplay'): void
  (e: 'next-episode'): void
  (e: 'finish-show'): void
}

// ScreenWrapper types
export interface ScreenWrapperProps {
  innerGradient?: string
  outerColor?: string
}

// TimerSettings types
export interface TimerSettingsProps {
  modelValue: {
    timerSetting: string
    customTimerMinutes: number
    customTimerSeconds: number
  }
}

export interface TimerSettingsEmits {
  (e: 'update:modelValue', value: {
    timerSetting: string
    customTimerMinutes: number
    customTimerSeconds: number
  }): void
}

// ModeCard types
export interface ModeCardProps {
  mode: {
    title: string
    [key: string]: any
  }
}

export interface ModeCardEmits {
  (e: 'select', mode: any): void
}

// BoardShell types
export interface BoardShellProps {
  boardStyle: Record<string, string | number | boolean>
}

export interface GoalAdvancement {
  currentGoal: GoalData
  nextGoal?: GoalData
  completedGoals: GoalData[]
  totalGoals: number
}

// Search types
export interface SearchOptions {
  query: string
  filters?: {
    type?: 'movie' | 'tv' | 'person'
    year?: number
    genre?: string
  }
  limit?: number
}

// Tutorial types
export interface TutorialStep {
  id: string
  title: string
  description: string
  target?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  action?: 'click' | 'drag' | 'type'
  completed: boolean
}

export interface TutorialState {
  active: boolean
  currentStep: number
  steps: TutorialStep[]
  completed: boolean
}

// Store types
export interface GameState {
  gameMode: GameMode | null
  gameOptions: GameOptions
  gameItems: GameItem[]
  connections: Connection[]
  isGameActive: boolean
  currentGoal?: GoalData
  score: number
}

export interface BackgroundState {
  currentBackground: string
  backgroundImages: BackgroundData[]
  currentTheme: 'light' | 'dark'
}

export interface FilterState {
  castFilter: string
  genreFilter: string
  yearFilter: string
  typeFilter: string
}
