import { defineStore } from 'pinia'
import BackgroundsService from '@services/ui/BackgroundsService.ts'

export const useBackgroundStore = defineStore('background', {
  state: () => ({
    urls: [],
    idx: 0,
    intervalId: null,
    periodMs: 4000,
    ready: false,
    theme: 'dark',
  }),
  getters: {
    currentUrl(state) {
      if (!state.urls || state.urls.length === 0) return ''
      const i = state.idx % state.urls.length
      return state.urls[i]
    },
    currentImage(state) {
      if (!state.urls || state.urls.length === 0) return null
      const url = state.urls[state.idx % state.urls.length]
      const name = String(url).split('/').pop() || ''
      const m = name.match(/(19|20)\d{2}/)
      const year = m ? m[0] : ''
      const decade = year ? `${year.slice(0, 3)}0s` : ''
      return { url, year, decade }
    },
  },
  actions: {
    async init(theme) {
      if (this.ready && this.urls.length) return
      try {
        const storedIdx = parseInt(sessionStorage.getItem('bgIndex') || '', 10)
        if (Number.isFinite(storedIdx)) this.idx = Math.max(0, storedIdx)
      } catch (_) {}
      this.theme = theme || document.documentElement.getAttribute('data-theme') || 'dark'
      let urls = BackgroundsService.getAllBackgroundsSorted()
      if (!urls || !urls.length) {
        const dark = BackgroundsService.getBackgroundUrls('dark') || []
        const light = BackgroundsService.getBackgroundUrls('light') || []
        urls = [...dark, ...light]
      }
      if (!urls || !urls.length) {
        const [darkAsync, lightAsync] = await Promise.all([
          BackgroundsService.getBackgroundUrlsAsync('dark'),
          BackgroundsService.getBackgroundUrlsAsync('light'),
        ])
        urls = [...(darkAsync || []), ...(lightAsync || [])]
      }
      this.urls = Array.from(new Set(urls || []))
      this.ready = true
      if (!this.intervalId) this.start()
    },
    start() {
      if (this.intervalId || !this.urls.length) return
      this.intervalId = setInterval(() => {
        this.idx = (this.idx + 1) % this.urls.length
        try {
          sessionStorage.setItem('bgIndex', String(this.idx))
        } catch (_) {}
        try {
          // Notify UI shells to play a channel switch effect
          window.dispatchEvent(new CustomEvent('crt-channel-change'))
        } catch (_) {}
      }, this.periodMs)
    },
    stop() {
      if (this.intervalId) {
        clearInterval(this.intervalId)
        this.intervalId = null
      }
    },
    setTheme(theme) {
      this.theme = theme
    },
  },
})


