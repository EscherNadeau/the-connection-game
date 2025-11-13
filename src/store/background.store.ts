import { defineStore } from 'pinia'
import BackgroundsService from '@services/ui/BackgroundsService.ts'
import { debug } from '../services/ui/log.ts'

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
      } catch (err) {
        // Failed to load stored background index - continue with default
        debug('Failed to load stored background index', { error: err })
      }
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
        } catch (err) {
          // localStorage may be unavailable - continue without persistence
          debug('Failed to save background index', { error: err })
        }
        try {
          // Notify UI shells to play a channel switch effect
          window.dispatchEvent(new CustomEvent('crt-channel-change'))
        } catch (err) {
          // Event dispatch failed - non-critical
          debug('Failed to dispatch crt-channel-change event', { error: err })
        }
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


