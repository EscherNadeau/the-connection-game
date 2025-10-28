import { defineStore } from 'pinia'
import { normalizeGenderFilter, GENDERS } from '../utils/constants.ts'

function normalizeCast(raw) {
  const result = normalizeGenderFilter(raw)
  if (result === GENDERS.MALE) return 'male'
  if (result === GENDERS.FEMALE) return 'female'
  return 'mixed'
}

function normalizeMediaType(raw) {
  const value = String(raw || '').toLowerCase()
  if (['movie', 'film', 'movies_only', 'm'].includes(value)) return 'movie'
  if (['tv', 'tv_show', 'tv-show', 'show', 'shows_only', 't'].includes(value)) return 'tv'
  if (['person', 'people', 'persons_only', 'p'].includes(value)) return 'person'
  return 'all'
}

function normalizeDecade(raw) {
  const value = String(raw || '').toLowerCase()
  if (/^[12][0-9]{3}s$/.test(value)) return value
  if (value === 'all' || value === '') return 'all'
  return 'all'
}

export const useFiltersStore = defineStore('filters', {
  state: () => ({
    cast: 'mixed', // 'mixed' | 'male' | 'female'
    mediaType: 'all', // 'all' | 'movie' | 'tv' | 'person'
    decade: 'all',
    hints: true,
  }),
  getters: {
    getFilters(state) {
      return { ...state }
    },
  },
  actions: {
    setCast(raw) {
      this.cast = normalizeCast(raw)
    },
    setMediaType(raw) {
      this.mediaType = normalizeMediaType(raw)
    },
    setDecade(raw) {
      this.decade = normalizeDecade(raw)
    },
    setHints(val) {
      this.hints = !!val
    },
    setFilters(partial) {
      if (!partial) return
      if (Object.prototype.hasOwnProperty.call(partial, 'cast')) this.setCast(partial.cast)
      if (Object.prototype.hasOwnProperty.call(partial, 'mediaType'))
        this.setMediaType(partial.mediaType)
      if (Object.prototype.hasOwnProperty.call(partial, 'decade')) this.setDecade(partial.decade)
      if (Object.prototype.hasOwnProperty.call(partial, 'hints')) this.setHints(partial.hints)
    },
  },
})

export default useFiltersStore
