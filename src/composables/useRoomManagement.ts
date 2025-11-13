import { ref, type Ref } from 'vue'
import { debug, warn, error as logError } from '../services/ui/log'
import { multiplayerService } from '../services/MultiplayerService'
import { generateRoomCode, generateRoomCodeSync, type RoomCodePayload } from '../utils/roomCodeGenerator'

export function useRoomManagement() {
  const suppressAutoJoin: Ref<boolean> = ref(false)

  /**
   * Generate room code for couch multiplayer modes
   * @param mode - Game mode object with id, title/name
   * @param playType - Play type (couch-multiplayer, couch-pvp, etc.)
   */
  function generateRoomCodeForCouch(
    mode: { id: string; title?: string; name?: string },
    playType: string
  ): void {
    try {
      const payload: RoomCodePayload = {
        modeId: mode.id,
        modeTitle: mode.title || mode.name || 'Mode',
        modeSettings: {},
        startingItems: [],
        playType: playType
      }
      
      generateRoomCodeSync(
        payload,
        (result) => {
          debug('Generated room code for couch', { code: result.code })
        },
        (err) => {
          warn('Error generating room code for couch', { error: err })
        }
      )
    } catch (err) {
      logError('Error generating room code for couch', { error: err })
    }
  }

  /**
   * Generate room code for PC multiplayer modes
   * @param mode - Game mode object with id, title/name
   * @param playType - Play type (multi, pvp, etc.)
   */
  async function generateRoomCodeForPCMultiplayer(
    mode: { id: string; title?: string; name?: string },
    playType: string
  ): Promise<void> {
    try {
      const payload: RoomCodePayload = {
        modeId: mode.id,
        modeTitle: mode.title || mode.name || 'Mode',
        modeSettings: {},
        startingItems: [],
        playType: playType
      }
      
      await generateRoomCode(payload)
      debug('PC Multiplayer: Generated room code', { modeId: mode.id, playType })
    } catch (err) {
      logError('PC Multiplayer: Error generating room code', { error: err })
    }
  }

  /**
   * Join a room by code
   */
  function joinByCode(code: string): void {
    try {
      const cleaned = String(code || '').trim()
      if (!cleaned) return
      window.location.hash = `room=${encodeURIComponent(cleaned)}`
    } catch (err) {
      logError('Failed to join room by code', { error: err, code })
    }
  }

  /**
   * Handle auto-join from URL hash
   * Attempts to join a game room based on room code in URL hash
   * @param currentView - Current view ref to update
   * @param gameMode - Game mode ref to populate
   * @param gameOptions - Game options ref to populate
   * @param config - Optional config object
   */
  async function tryJoinFromHash(
    currentView: Ref<string>,
    gameMode: Ref<{ id: string; name?: string; title?: string; modeSettings?: Record<string, unknown> } | null>,
    gameOptions: Ref<Record<string, unknown>>,
    config?: Record<string, unknown>
  ): Promise<void> {
    debug('tryJoinFromHash called', { 
      currentView: currentView.value, 
      suppressAutoJoin: suppressAutoJoin.value 
    })
    
    if (suppressAutoJoin.value || currentView.value === 'waiting-room' || currentView.value === 'phone-waiting-room') {
      debug('tryJoinFromHash skipped due to guard clause')
      return
    }
    
    const hash = window.location.hash || ''
    const m = hash.match(/room=([A-Za-z0-9_-]+)/)
    if (m) {
      const code = m[1]
      // Mark that we're joining a room (for phone detection later)
      sessionStorage.setItem('isJoiningRoom', 'true')
      debug('Phone: Room code from URL hash', { code, hash })
      
      // Provide minimal mode/options so GameScreen can mount and Collab can join
      const sm = hash.match(/s=([^&]+)/)
      let decoded = null
      if (sm && sm[1]) {
        try { 
          decoded = JSON.parse(decodeURIComponent(escape(atob(sm[1])))) 
        } catch (err) { 
          warn('Failed to decode room data from URL', { error: err })
          decoded = null 
        }
      } else {
        // Try snapshot server with short code
        try {
          const resp = await fetch(`http://${location.hostname}:3011/api/snapshots/${code}`, { cache: 'no-store' })
          if (resp.ok) {
            const json = await resp.json()
            decoded = json.data || null
          }
        } catch (err) {
          debug('Snapshot server fetch failed', { error: err })
        }
      }
      
      let playType = 'multi'
      if (decoded && decoded.modeId) {
        // Get playType from decoded data (snapshot server)
        playType = decoded.playType || 'multi'
        debug('Phone: Using snapshot data', { playType })
        gameMode.value = {
          id: decoded.modeId,
          name: decoded.modeTitle || 'Shared Game',
          title: decoded.modeTitle || 'Shared Game',
          modeSettings: decoded.modeSettings || { timerType: 'none' },
        }
        gameOptions.value = { roomCode: code, startingItems: decoded.startingItems || [], playType: playType }
      } else {
        // Fallback to URL hash for playType
        const playTypeMatch = hash.match(/play=(solo|multi|pvp|couch-multiplayer|couch-pvp)/)
        playType = playTypeMatch ? playTypeMatch[1] : 'multi'
        debug('Phone: Using fallback', { playType, decoded })
        // Don't overwrite gameMode if it was already set from snapshot data
        gameOptions.value = { ...(gameOptions.value || {}), roomCode: code, playType: playType }
      }
      const modeId = gameMode.value?.id || 'zen'
      
      // Initialize multiplayer and get appropriate view
      const multiplayerConfig = multiplayerService.initializeMultiplayer(modeId, playType, gameOptions.value)
      
      debug('Phone: MultiplayerConfig result', { 
        config: multiplayerConfig, 
        isMobile: multiplayerService.isMobile, 
        playType, 
        suggestedView: multiplayerConfig.view 
      })
      
      // Override view for couch modes - if someone scans QR to join couch mode, they're on a phone
      let targetView = multiplayerConfig.view
      if ((playType === 'couch-multiplayer' || playType === 'couch-pvp') && targetView === 'waiting-room') {
        debug('Phone: Couch mode detected, forcing phone-waiting-room')
        targetView = 'phone-waiting-room'
      }
      
      debug('Phone: Setting currentView', { targetView })
      
      // Ensure gameMode is set BEFORE changing view for proper prop binding
      if (targetView === 'controller' && !gameMode.value) {
        gameMode.value = { id: modeId, name: decoded?.modeTitle || 'Unknown Mode', title: decoded?.modeTitle || 'Unknown Mode' }
      }
      
      currentView.value = targetView as any
    }
  }

  return {
    suppressAutoJoin,
    generateRoomCodeForCouch,
    generateRoomCodeForPCMultiplayer,
    joinByCode,
    tryJoinFromHash,
  }
}

