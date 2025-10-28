import { log } from './log.ts'
import { multiplayerService } from '../MultiplayerService.ts'

class UIService {
  constructor() {
    this.isAnimatingVictory = false
    this.isShowingWinMenu = false
    this.isShowingSettings = false
    this.isShowingHelp = false
    this.currentTheme = 'classic'
    this.animationsEnabled = true
    this.soundEnabled = true
    this.isMobile = false
    this.isTouchDevice = false
    this.screenSize = 'desktop'
    this.orientation = 'landscape'
  }

  initialize() {
    this.detectDeviceCapabilities()
    this.setupEventListeners()
    try {
      const saved = localStorage.getItem('theme')
      if (saved === 'dark' || saved === 'light') {
        this.setTheme(saved)
      } else {
        this.setTheme('dark')
      }
    } catch (_) {
      this.setTheme('dark')
    }
    log(602, { count: 'UI Service initialized' })
  }

  detectDeviceCapabilities() {
    this.isMobile = multiplayerService.isMobile
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    this.updateScreenSize()
    this.updateOrientation()
    log(602, {
      count: `Device detected: Mobile=${this.isMobile}, Touch=${this.isTouchDevice}, Size=${this.screenSize}`,
    })
  }

  updateScreenSize() {
    const width = window.innerWidth
    if (width < 768) this.screenSize = 'mobile'
    else if (width < 1024) this.screenSize = 'tablet'
    else this.screenSize = 'desktop'
  }

  updateOrientation() {
    this.orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.updateScreenSize()
      this.updateOrientation()
      this.onScreenChange()
    })
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.updateOrientation()
        this.onScreenChange()
      }, 100)
    })
    if (this.isTouchDevice) this.setupTouchHandlers()
  }

  setupTouchHandlers() {
    let lastTouchEnd = 0
    document.addEventListener(
      'touchend',
      (event) => {
        const now = new Date().getTime()
        if (now - lastTouchEnd <= 300) event.preventDefault()
        lastTouchEnd = now
      },
      false
    )
    this.setupSwipeHandlers()
  }

  setupSwipeHandlers() {
    let startX = 0,
      startY = 0
    document.addEventListener('touchstart', (event) => {
      startX = event.touches[0].clientX
      startY = event.touches[0].clientY
    })
    document.addEventListener('touchend', (event) => {
      const endX = event.changedTouches[0].clientX
      const endY = event.changedTouches[0].clientY
      this.handleSwipe(startX, startY, endX, endY)
    })
  }

  handleSwipe(startX, startY, endX, endY) {
    const deltaX = endX - startX
    const deltaY = endY - startY
    const minSwipeDistance = 50
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) this.onSwipeRight()
      else this.onSwipeLeft()
    } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minSwipeDistance) {
      if (deltaY > 0) this.onSwipeDown()
      else this.onSwipeUp()
    }
  }

  onSwipeRight() {
    log(602, { count: 'Swipe right detected' })
  }
  onSwipeLeft() {
    log(602, { count: 'Swipe left detected' })
  }
  onSwipeUp() {
    log(602, { count: 'Swipe up detected' })
  }
  onSwipeDown() {
    log(602, { count: 'Swipe down detected' })
  }

  onScreenChange() {
    log(602, { count: `Screen changed: ${this.screenSize} ${this.orientation}` })
    window.dispatchEvent(
      new CustomEvent('screenChange', {
        detail: {
          screenSize: this.screenSize,
          orientation: this.orientation,
          isMobile: this.isMobile,
          isTouchDevice: this.isTouchDevice,
        },
      })
    )
  }

  startVictoryAnimation() {
    if (!this.animationsEnabled) return
    this.isAnimatingVictory = true
    log(602, { count: 'Victory animation started' })
    document.body.classList.add('victory-animation')
    this.triggerVictoryEffects()
  }

  stopVictoryAnimation() {
    this.isAnimatingVictory = false
    document.body.classList.remove('victory-animation')
    log(602, { count: 'Victory animation stopped' })
  }

  triggerVictoryEffects() {
    if (this.soundEnabled) this.playVictorySound()
    this.addConfetti()
    this.triggerCelebrationAnimations()
  }

  addConfetti() {
    let confettiContainer = document.getElementById('confetti-container')
    if (!confettiContainer) {
      confettiContainer = document.createElement('div')
      confettiContainer.id = 'confetti-container'
      confettiContainer.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9999;`
      document.body.appendChild(confettiContainer)
    }
    for (let i = 0; i < 100; i++) this.createConfettiPiece(confettiContainer)
    setTimeout(() => {
      if (confettiContainer.parentNode) confettiContainer.parentNode.removeChild(confettiContainer)
    }, 5000)
  }

  createConfettiPiece(container) {
    const piece = document.createElement('div')
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
    const color = colors[Math.floor(Math.random() * colors.length)]
    piece.style.cssText = `position: absolute; width: 10px; height: 10px; background-color: ${color}; left: ${Math.random() * 100}%; top: -10px; animation: confetti-fall 5s linear forwards;`
    container.appendChild(piece)
    setTimeout(() => {
      if (piece.parentNode) piece.parentNode.removeChild(piece)
    }, 5000)
  }

  triggerCelebrationAnimations() {
    const gameElements = document.querySelectorAll('.game-item, .connection-line')
    gameElements.forEach((element) => {
      element.classList.add('celebrate')
      setTimeout(() => {
        element.classList.remove('celebrate')
      }, 2000)
    })
  }

  playVictorySound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2)
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.4)
      oscillator.frequency.setValueAtTime(1046.5, audioContext.currentTime + 0.6)
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.8)
    } catch (error) {
      log(1003, { error: 'Could not play victory sound', details: error.message })
    }
  }

  showWinMenu() {
    this.isShowingWinMenu = true
    this.startVictoryAnimation()
    log(602, { count: 'Win menu shown' })
  }
  hideWinMenu() {
    this.isShowingWinMenu = false
    this.stopVictoryAnimation()
    log(602, { count: 'Win menu hidden' })
  }
  showSettings() {
    this.isShowingSettings = true
    log(602, { count: 'Settings menu shown' })
  }
  hideSettings() {
    this.isShowingSettings = false
    log(602, { count: 'Settings menu hidden' })
  }
  showHelp() {
    this.isShowingHelp = true
    log(602, { count: 'Help menu shown' })
  }
  hideHelp() {
    this.isShowingHelp = false
    log(602, { count: 'Help menu hidden' })
  }

  toggleFullscreen() {
    if (!document.fullscreenElement)
      document.documentElement.requestFullscreen().catch((err) => {
        log(1003, { error: 'Error attempting to enable fullscreen', details: err.message })
      })
    else document.exitFullscreen()
  }

  setTheme(theme) {
    this.currentTheme = theme
    try { localStorage.setItem('theme', theme) } catch (_) {}
    document.documentElement.setAttribute('data-theme', theme)
    log(602, { count: `Theme set to: ${theme}` })
    try { window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme } })) } catch (_) {}
  }
  getTheme() {
    return this.currentTheme
  }
  toggleTheme() {
    this.setTheme(this.currentTheme === 'dark' ? 'light' : 'dark')
  }
  toggleAnimations() {
    this.animationsEnabled = !this.animationsEnabled
    document.body.classList.toggle('animations-disabled', !this.animationsEnabled)
    log(602, { count: `Animations ${this.animationsEnabled ? 'enabled' : 'disabled'}` })
  }
  toggleSound() {
    this.soundEnabled = !this.soundEnabled
    document.body.classList.toggle('sound-disabled', !this.soundEnabled)
    log(602, { count: `Sound ${this.soundEnabled ? 'enabled' : 'disabled'}` })
  }

  showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div')
    notification.className = `notification notification-${type}`
    notification.textContent = message
    notification.style.cssText = `position: fixed; top: 20px; right: 20px; background: ${this.getNotificationColor(type)}; color: white; padding: 12px 20px; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); z-index: 10000; transform: translateX(100%); transition: transform 0.3s ease;`
    document.body.appendChild(notification)
    setTimeout(() => {
      notification.style.transform = 'translateX(0)'
    }, 100)
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)'
      setTimeout(() => {
        if (notification.parentNode) notification.parentNode.removeChild(notification)
      }, 300)
    }, duration)
    log(602, { count: `Notification shown: ${message}` })
  }

  getNotificationColor(type) {
    switch (type) {
      case 'success':
        return '#4caf50'
      case 'error':
        return '#f44336'
      case 'warning':
        return '#ff9800'
      case 'info':
        return '#2196f3'
      default:
        return '#2196f3'
    }
  }

  showLoading(message = 'Loading...') {
    const loading = document.createElement('div')
    loading.id = 'loading-spinner'
    loading.innerHTML = `<div class="spinner"></div><div class="loading-message">${message}</div>`
    loading.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 10001;`
    document.body.appendChild(loading)
    log(602, { count: 'Loading spinner shown' })
  }

  hideLoading() {
    const loading = document.getElementById('loading-spinner')
    if (loading && loading.parentNode) {
      loading.parentNode.removeChild(loading)
      log(602, { count: 'Loading spinner hidden' })
    }
  }

  getResponsiveClasses() {
    return {
      mobile: this.screenSize === 'mobile',
      tablet: this.screenSize === 'tablet',
      desktop: this.screenSize === 'desktop',
      touch: this.isTouchDevice,
      portrait: this.orientation === 'portrait',
      landscape: this.orientation === 'landscape',
    }
  }

  isInViewport(element) {
    if (!element) return false
    const rect = element.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }

  scrollIntoView(element, options = {}) {
    if (!element) return
    const defaultOptions = { behavior: 'smooth', block: 'center', inline: 'center' }
    element.scrollIntoView({ ...defaultOptions, ...options })
  }

  getUIStats() {
    return {
      screenSize: this.screenSize,
      orientation: this.orientation,
      isMobile: this.isMobile,
      isTouchDevice: this.isTouchDevice,
      theme: this.currentTheme,
      animationsEnabled: this.animationsEnabled,
      soundEnabled: this.soundEnabled,
      isAnimatingVictory: this.isAnimatingVictory,
      isShowingWinMenu: this.isShowingWinMenu,
      isShowingSettings: this.isShowingSettings,
      isShowingHelp: this.isShowingHelp,
    }
  }

  reset() {
    this.isAnimatingVictory = false
    this.isShowingWinMenu = false
    this.isShowingSettings = false
    this.isShowingHelp = false
    document.body.classList.remove('victory-animation', 'animations-disabled', 'sound-disabled')
    this.hideLoading()
    log(602, { count: 'UI state reset' })
  }
}

export default new UIService()
