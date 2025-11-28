/**
 * useAudio Composable
 * Easy Vue integration for the audio service
 * 
 * USAGE:
 * const { play, toggleMute, isMuted } = useAudio()
 * play(SoundEvents.CONNECTION_MADE)
 */

import { ref, computed, onMounted } from 'vue'
import audioService, { 
  SoundEvents, 
  SoundCategories,
  type SoundEvent, 
  type SoundCategory 
} from '../services/audio/AudioService'

export function useAudio() {
  // Reactive state
  const muted = ref(audioService.isMuted())
  const masterVolume = ref(audioService.getMasterVolume())
  const sfxVolume = ref(audioService.getVolume(SoundCategories.SFX))
  const uiVolume = ref(audioService.getVolume(SoundCategories.UI))
  const musicVolume = ref(audioService.getVolume(SoundCategories.MUSIC))

  // Initialize on mount
  onMounted(() => {
    audioService.initialize()
    syncState()
  })

  // Sync reactive state with service
  function syncState(): void {
    muted.value = audioService.isMuted()
    masterVolume.value = audioService.getMasterVolume()
    sfxVolume.value = audioService.getVolume(SoundCategories.SFX)
    uiVolume.value = audioService.getVolume(SoundCategories.UI)
    musicVolume.value = audioService.getVolume(SoundCategories.MUSIC)
  }

  // ==========================================
  // PLAYBACK
  // ==========================================

  /**
   * Play a sound event
   */
  function play(event: SoundEvent, options?: { volume?: number; loop?: boolean }): void {
    audioService.play(event, options)
  }

  /**
   * Play with delay
   */
  function playDelayed(event: SoundEvent, delayMs: number): void {
    audioService.playDelayed(event, delayMs)
  }

  /**
   * Stop all sounds
   */
  function stopAll(): void {
    audioService.stopAll()
  }

  // ==========================================
  // QUICK PLAY HELPERS
  // ==========================================

  /** Play button click sound */
  function playClick(): void {
    play(SoundEvents.BUTTON_CLICK)
  }

  /** Play success sound */
  function playSuccess(): void {
    play(SoundEvents.SUCCESS)
  }

  /** Play error sound */
  function playError(): void {
    play(SoundEvents.ERROR)
  }

  /** Play notification sound */
  function playNotification(): void {
    play(SoundEvents.NOTIFICATION)
  }

  // ==========================================
  // VOLUME CONTROLS
  // ==========================================

  /**
   * Set volume for a category
   */
  function setVolume(category: SoundCategory, volume: number): void {
    audioService.setVolume(category, volume)
    syncState()
  }

  /**
   * Set master volume
   */
  function setMasterVolume(volume: number): void {
    audioService.setMasterVolume(volume)
    masterVolume.value = volume
  }

  /**
   * Set SFX volume
   */
  function setSfxVolume(volume: number): void {
    setVolume(SoundCategories.SFX, volume)
    sfxVolume.value = volume
  }

  /**
   * Set UI volume
   */
  function setUiVolume(volume: number): void {
    setVolume(SoundCategories.UI, volume)
    uiVolume.value = volume
  }

  /**
   * Set music volume
   */
  function setMusicVolume(volume: number): void {
    setVolume(SoundCategories.MUSIC, volume)
    musicVolume.value = volume
  }

  // ==========================================
  // MUTE CONTROLS
  // ==========================================

  /**
   * Toggle mute
   */
  function toggleMute(): boolean {
    const newState = audioService.toggleMute()
    muted.value = newState
    return newState
  }

  /**
   * Set mute state
   */
  function setMuted(value: boolean): void {
    audioService.setMuted(value)
    muted.value = value
  }

  // ==========================================
  // COMPUTED
  // ==========================================

  const isMuted = computed(() => muted.value)

  // ==========================================
  // RETURN
  // ==========================================

  return {
    // State
    muted,
    isMuted,
    masterVolume,
    sfxVolume,
    uiVolume,
    musicVolume,

    // Playback
    play,
    playDelayed,
    stopAll,

    // Quick helpers
    playClick,
    playSuccess,
    playError,
    playNotification,

    // Volume
    setVolume,
    setMasterVolume,
    setSfxVolume,
    setUiVolume,
    setMusicVolume,

    // Mute
    toggleMute,
    setMuted,

    // Constants (re-exported for convenience)
    SoundEvents,
    SoundCategories,
  }
}

export default useAudio

// Re-export for direct imports
export { SoundEvents, SoundCategories, type SoundEvent, type SoundCategory }

