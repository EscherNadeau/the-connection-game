class NotifyService {
  constructor() {
    this.listeners = []
  }

  on(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  success(message) {
    this.emit({ type: 'success', message })
  }
  error(message) {
    this.emit({ type: 'error', message })
  }
  info(message) {
    this.emit({ type: 'info', message })
  }

  emit(payload) {
    this.listeners.forEach((l) => l(payload))
  }
}

export default new NotifyService()
