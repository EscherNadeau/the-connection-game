import { ref, nextTick, type Ref } from 'vue'
import { error as logError } from '../services/ui/log.ts'
import { validate } from '../utils/validation.ts'
import type { ViewName } from './useTutorial.ts'

export function useShowImport() {
  const openBrowserOnLoad: Ref<boolean> = ref(false)

  /**
   * Check URL hash for show import data and handle import
   */
  function checkForShowImport(
    importShow: (showData: unknown) => void
  ): void {
    const hash = window.location.hash || ''
    
    // Check for ID-based import (new method)
    const idMatch = hash.match(/#import-show-id:(.+)/)
    if (idMatch) {
      const showId = idMatch[1]
      try {
        const showData = sessionStorage.getItem(`shared_show_${showId}`)
        if (showData) {
          const parsedShow = JSON.parse(showData)
          importShow(parsedShow)
          // Clean up the temporary data
          sessionStorage.removeItem(`shared_show_${showId}`)
        } else {
          alert('Shared show not found or has expired')
        }
      } catch (err) {
        logError('Error loading shared show', { error: err })
        alert('Invalid shared show data')
      }
      return
    }
    
    // Check for data-based import (fallback method)
    const importMatch = hash.match(/#import-show:(.+)/)
    if (importMatch) {
      try {
        const showData = JSON.parse(decodeURIComponent(importMatch[1]))
        importShow(showData)
      } catch (err) {
        logError('Error parsing show data from URL', { error: err })
        alert('Invalid show data in URL')
      }
    }
  }

  /**
   * Import show data and navigate to custom mode
   */
  function importShow(
    showData: unknown,
    currentView: Ref<ViewName>,
    customModePanelRef?: { value?: { importShowFromUrl?: (data: unknown) => void } } | null
  ): void {
    // Validate the show data
    const validationResult = validate.show(showData)
    if (!validationResult.valid) {
      logError('Invalid show data in URL', { errors: validationResult.errors })
      alert(`Invalid show data: ${validationResult.errors.join(', ')}`)
      return
    }
    
    // Navigate to custom mode and open browser
    currentView.value = 'custom-mode'
    openBrowserOnLoad.value = true
    
    // Store the show data to be imported
    nextTick(() => {
      customModePanelRef?.value?.importShowFromUrl?.(showData)
    })
    
    // Clear the hash to clean up the URL
    window.history.replaceState(null, null, window.location.pathname)
  }

  return {
    openBrowserOnLoad,
    checkForShowImport,
    importShow,
  }
}

