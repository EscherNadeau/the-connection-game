import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { getBackgroundUrlsAsync } from '@/services/ui/BackgroundsService.ts'
import { info, error as logError } from '@/services/ui/log.ts'
import type { BackgroundData } from '@/types/game'

export function useBackgrounds() {
  const currentBackground: Ref<string> = ref('')
  const backgroundImages: Ref<BackgroundData[]> = ref([])

  /**
   * Get themed backgrounds based on current theme
   */
  const themedBackgrounds: ComputedRef<string[]> = computed(() => {
    // Deprecated in favor of filename-based preloading with fallback; kept for compatibility
    const theme = document.documentElement.getAttribute('data-theme') || 'dark'
    const base = theme === 'light' ? '/assets/backgrounds/light/' : '/assets/backgrounds/dark/'
    return (backgroundImages.value || []).map((p) => `${base}${String(p.url).split('/').pop() || ''}`)
  })

  /**
   * Get current background title from filename
   */
  const currentBackgroundTitle: ComputedRef<string | null> = computed(() => {
    if (!currentBackground.value) return null
    const filename = currentBackground.value.split('/').pop()
    if (!filename) return null
    
    const parts = filename.split('_')
    if (parts.length >= 2) {
      const decade = parts[0]
      const title = parts[1]?.replace('bd.jpg', '').replace(/([0-9]{4})/, ' ($1)') || ''
      return `${decade}: ${title}`
    }
    return filename.replace('.jpg', '')
  })

  /**
   * Get board style (currently disabled - using gradient with grain instead)
   */
  const boardStyle: ComputedRef<Record<string, any>> = computed(() => {
    // Background images disabled - using gradient with grain instead
    return {}
  })

  /**
   * Reload backgrounds for a specific theme
   */
  async function reloadBackgroundsForTheme(theme: string): Promise<void> {
    try {
      // Use contrast set: dark UI → light/color backgrounds; light UI → dark/BW backgrounds
      const contrastTheme = String(theme || 'dark').toLowerCase() === 'light' ? 'dark' : 'light'
      const urls = await getBackgroundUrlsAsync(contrastTheme)
      if (urls && urls.length) {
        // Convert string URLs to BackgroundData objects
        const backgroundData: BackgroundData[] = urls.map((url: string) => ({
          url,
          title: url.split('/').pop()?.replace('.jpg', '') || '',
          theme: contrastTheme as 'light' | 'dark'
        }))
        
        backgroundImages.value = backgroundData
        const randomIndex = Math.floor(Math.random() * urls.length)
        currentBackground.value = urls[randomIndex] || ''
        info( `🎨 Loaded ${urls.length} backgrounds for theme: ${contrastTheme}`)
      }
    } catch (error) {
      logError( 'Failed to reload backgrounds for theme:', error)
    }
  }

  /**
   * Change to a random background
   */
  function changeBackground(): void {
    const list = backgroundImages.value && backgroundImages.value.length ? backgroundImages.value.map(bg => bg.url) : themedBackgrounds.value
    if (!list || !list.length) return
    
    const randomIndex = Math.floor(Math.random() * list.length)
    currentBackground.value = list[randomIndex] || ''
    info('🎨 Changed background to:', currentBackground.value)
  }

  /**
   * Handle theme change events
   */
  function onThemeChange(e: Event): void {
    const customEvent = e as CustomEvent
    const theme = (customEvent && customEvent.detail && customEvent.detail.theme) || document.documentElement.getAttribute('data-theme') || 'dark'
    reloadBackgroundsForTheme(theme)
  }

  /**
   * Compute theme base path
   */
  function computeThemeBase(): string {
    const theme = document.documentElement.getAttribute('data-theme') || 'dark'
    return theme === 'light' ? '/assets/backgrounds/light/' : '/assets/backgrounds/dark/'
  }

  /**
   * Initialize backgrounds on mount
   */
  async function initializeBackgrounds(): Promise<void> {
    try {
      const theme = document.documentElement.getAttribute('data-theme') || 'dark'
      await reloadBackgroundsForTheme(theme)
      window.addEventListener('themeChange', onThemeChange)
      info('🎨 Backgrounds initialized for theme:', theme)
    } catch (error) {
      logError( 'Failed to initialize backgrounds:', error)
    }
  }

  /**
   * Cleanup event listeners
   */
  function cleanup(): void {
    window.removeEventListener('themeChange', onThemeChange)
  }

  return {
    // Reactive state
    currentBackground,
    backgroundImages,
    
    // Computed properties
    themedBackgrounds,
    currentBackgroundTitle,
    boardStyle,
    
    // Methods
    reloadBackgroundsForTheme,
    changeBackground,
    onThemeChange,
    computeThemeBase,
    initializeBackgrounds,
    cleanup
  }
}
