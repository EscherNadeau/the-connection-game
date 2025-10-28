// PopupService.js - Unified popup system for PC and mobile
import notify from './NotifyService.ts'

class PopupService {
  constructor() {
    this.listeners = []
    this.activePopups = new Map()
  }

  // Subscribe to popup events
  on(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  // Emit popup event to all listeners
  emit(popupData) {
    this.listeners.forEach((listener) => listener(popupData))
  }

  // Show connection success popup
  showConnectionSuccess(fromItem, toItem) {
    const popupData = {
      type: 'connection_success',
      title: 'Connection Made!',
      message: `${fromItem.title || fromItem.name} → ${toItem.title || toItem.name}`,
      icon: '✅',
      duration: 2000,
      data: { fromItem, toItem }
    }
    this.emit(popupData)
    // Don't show notify.success to avoid duplicate popups
  }

  // Show connection error popup
  showConnectionError(fromItem, toItem, reason = 'Invalid connection') {
    const popupData = {
      type: 'connection_error',
      title: 'Cannot Connect',
      message: `${fromItem.title || fromItem.name} → ${toItem.title || toItem.name}: ${reason}`,
      icon: '❌',
      duration: 3000,
      data: { fromItem, toItem, reason }
    }
    this.emit(popupData)
    // Don't show notify.error to avoid duplicate popups
  }

  // Show win popup
  showWin(title = 'You Win!', subtitle = '', stats = {}) {
    const popupData = {
      type: 'win',
      title,
      subtitle,
      stats,
      icon: '🎉',
      duration: 0, // Persistent until dismissed
      data: { stats }
    }
    this.emit(popupData)
  }

  // Show lose popup
  showLose(title = 'Game Over', subtitle = '', stats = {}) {
    const popupData = {
      type: 'lose',
      title,
      subtitle,
      stats,
      icon: '💀',
      duration: 0, // Persistent until dismissed
      data: { stats }
    }
    this.emit(popupData)
  }

  // Show game end popup
  showGameEnd(title = 'Game Ended', subtitle = '') {
    const popupData = {
      type: 'game_end',
      title,
      subtitle,
      icon: '🏁',
      duration: 3000,
      data: {}
    }
    this.emit(popupData)
    // Don't show notify.info to avoid duplicate popups
  }

  // Show custom popup
  showCustom(type, title, message, icon = 'ℹ️', duration = 3000, data = {}) {
    console.log('PopupService.showCustom called:', { type, title, message, icon, duration })
    const popupData = {
      type,
      title,
      message,
      icon,
      duration,
      data
    }
    this.emit(popupData)
    // Don't show notify to avoid duplicate popups
  }

  // Dismiss popup by type
  dismiss(type) {
    const popupData = {
      type: 'dismiss',
      dismissType: type,
      data: {}
    }
    this.emit(popupData)
  }

  // Clear all popups
  clearAll() {
    const popupData = {
      type: 'clear_all',
      data: {}
    }
    this.emit(popupData)
  }
}

export default new PopupService()
