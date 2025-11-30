import { ref, type Ref } from 'vue'
import { debug } from '../services/ui/log.ts'

export type ViewName = 'start' | 'join-room' | 'mode-selection' | 'settings' | 'waiting-room' | 'phone-waiting-room' | 'game' | 'controller' | 'custom-mode'

export function useTutorial() {
  const showTutorial: Ref<boolean> = ref(false)
  const tutorialStep: Ref<number> = ref(0)
  const tutorialJustCompleted: Ref<boolean> = ref(false)

  function startTutorial(): void {
    showTutorial.value = true
    tutorialStep.value = 0
  }

  function startTutorialFromHowToPlay(): void {
    showTutorial.value = true
    tutorialStep.value = 2
  }

  function nextTutorialStep(): void {
    if (tutorialStep.value === 0) {
      tutorialStep.value = 1
    } else if (tutorialStep.value === 5) {
      return // Wait for user action
    } else if (tutorialStep.value === 5.1) {
      tutorialStep.value = 7
    } else if (tutorialStep.value === 5.2) {
      tutorialStep.value = 5.4
    } else if (tutorialStep.value === 5.4) {
      tutorialStep.value = 5.5
    } else if (tutorialStep.value === 5.5) {
      tutorialStep.value = 5.6
    } else if (tutorialStep.value === 5.6) {
      tutorialStep.value = 5.7
    } else if (tutorialStep.value === 5.7) {
      tutorialStep.value = 5.8
    } else if (tutorialStep.value === 5.8) {
      tutorialStep.value = 5.9
    } else if (tutorialStep.value === 5.9) {
      tutorialStep.value = 5.10
    } else if (tutorialStep.value === 5.10) {
      tutorialStep.value = 5.11
    } else if (tutorialStep.value === 5.11) {
      tutorialStep.value = 5.12
    } else if (tutorialStep.value === 5.12) {
      tutorialStep.value = 5.13
    } else if (tutorialStep.value === 5.13) {
      tutorialStep.value = 5.14
    } else if (tutorialStep.value === 5.14) {
      tutorialStep.value = 5.15
    } else if (tutorialStep.value === 5.15) {
      tutorialStep.value = 5.16
    } else if (tutorialStep.value === 5.16) {
      tutorialStep.value = 5.17
    } else if (tutorialStep.value === 5.17) {
      tutorialStep.value = 5.18
    } else if (tutorialStep.value === 5.18) {
      tutorialStep.value = 5.19
    } else if (tutorialStep.value === 5.19) {
      tutorialStep.value = 6
    } else if (tutorialStep.value === 6) {
      tutorialStep.value = 6.1
    } else if (tutorialStep.value === 6.1) {
      tutorialStep.value = 7
    // Mode Selection steps (updated for new layout)
    } else if (tutorialStep.value === 7) {
      tutorialStep.value = 7.1  // Goal Mode explanation
    } else if (tutorialStep.value === 7.1) {
      tutorialStep.value = 7.5  // Skip to Zen Mode (skip old 7.2-7.4)
    } else if (tutorialStep.value === 7.5) {
      tutorialStep.value = 7.7  // Oddities button
    } else if (tutorialStep.value === 7.7) {
      tutorialStep.value = 7.8  // Knowledge Mode (after clicking Oddities)
    } else if (tutorialStep.value === 7.8) {
      tutorialStep.value = 7.9  // Anti Mode
    } else if (tutorialStep.value === 7.9) {
      tutorialStep.value = 7.6  // Ready to click Goal Mode
    } else if (tutorialStep.value === 7.6) {
      tutorialStep.value = 8    // Continue to settings
    // Settings steps
    } else if (tutorialStep.value === 8) {
      tutorialStep.value = 9
    } else if (tutorialStep.value === 9) {
      tutorialStep.value = 10
    } else if (tutorialStep.value === 10) {
      tutorialStep.value = 11
    } else if (tutorialStep.value === 11) {
      tutorialStep.value = 12
    } else if (tutorialStep.value === 12) {
      tutorialStep.value = 13
    } else if (tutorialStep.value === 13) {
      tutorialStep.value = 14
    } else if (tutorialStep.value === 14) {
      tutorialStep.value = 15
    } else if (tutorialStep.value === 15) {
      tutorialStep.value = 16
    } else if (tutorialStep.value === 16) {
      tutorialStep.value = 17
    } else if (tutorialStep.value === 17) {
      tutorialStep.value = 18
    } else if (tutorialStep.value === 18) {
      tutorialStep.value = 19
    } else if (tutorialStep.value === 19) {
      tutorialStep.value = 19.1
    } else if (tutorialStep.value === 19.1) {
      tutorialStep.value = 19.2
    } else if (tutorialStep.value === 19.2) {
      tutorialStep.value = 19.3
    } else if (tutorialStep.value === 19.3) {
      tutorialStep.value = 19.4
    } else if (tutorialStep.value === 19.4) {
      tutorialStep.value = 19.5
    } else if (tutorialStep.value === 19.5) {
      tutorialStep.value = 19.55
    } else if (tutorialStep.value === 19.55) {
      tutorialStep.value = 19.6
    } else if (tutorialStep.value === 19.6) {
      return // Wait for user to press start
    } else if (tutorialStep.value === 20) {
      tutorialStep.value = 21
    } else if (tutorialStep.value === 21) {
      tutorialStep.value = 22
    } else if (tutorialStep.value === 22) {
      tutorialStep.value = 23
    } else if (tutorialStep.value === 23) {
      tutorialStep.value = 24
    } else if (tutorialStep.value === 24) {
      tutorialStep.value = 25
    } else if (tutorialStep.value === 25) {
      tutorialStep.value = 26
    } else if (tutorialStep.value === 26) {
      tutorialStep.value = 26.5
    } else if (tutorialStep.value === 26.5) {
      tutorialStep.value = 26.6
    } else if (tutorialStep.value === 26.6) {
      tutorialStep.value = 27
    } else if (tutorialStep.value === 27) {
      tutorialStep.value = 28
    } else if (tutorialStep.value === 28) {
      tutorialStep.value = 29
    } else if (tutorialStep.value === 29) {
      showTutorial.value = false
      tutorialStep.value = 0
      tutorialJustCompleted.value = true
    } else {
      tutorialStep.value++
    }
  }

  function setTutorialStep(step: number): void {
    debug('setTutorialStep called', { step, currentStep: tutorialStep.value })
    tutorialStep.value = step
    debug('tutorialStep set', { step: tutorialStep.value })
  }

  function jumpToTutorialStep(step: number, currentView?: Ref<ViewName>): void {
    tutorialStep.value = step
    if (step === 20 && currentView) {
      currentView.value = 'game'
    }
  }

  function markTutorialCompleted(): void {
    tutorialJustCompleted.value = true
  }

  function resetTutorial(): void {
    showTutorial.value = false
    tutorialStep.value = 0
  }

  return {
    showTutorial,
    tutorialStep,
    tutorialJustCompleted,
    startTutorial,
    startTutorialFromHowToPlay,
    nextTutorialStep,
    setTutorialStep,
    jumpToTutorialStep,
    markTutorialCompleted,
    resetTutorial,
  }
}
