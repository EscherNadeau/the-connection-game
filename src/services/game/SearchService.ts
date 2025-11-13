// SearchService.ts - Game logic layer for search functionality
// Transforms TMDB data into game-ready results
// Usage: import SearchService from './SearchService.ts' then call search(query, options)

import tmdbCache from '../cache/tmdbCache.ts'
import { normalizeMediaType, matchesGenderFilter, GENDERS } from '../../utils/constants.ts'
import { pinia } from '@store/pinia.ts'
import { useFiltersStore } from '@store/filters.store.ts'
import { warn } from '../ui/log.ts'
import type { SearchResult } from '../../types/game'

interface SearchOptions {
  castFilter?: string
  mediaType?: string
  limit?: number
}

interface SearchFilters {
  castFilter: string
  mediaType: string
}

interface SearchServiceResponse {
  success: boolean
  results: SearchResult[]
  error?: string
  query?: string
  totalFound?: number
  filteredCount?: number
}

class SearchService {
  private isSearching: boolean = false
  private lastQuery: string = ''
  private searchResults: SearchResult[] = []
  private currentFilters: SearchFilters = {
    castFilter: 'mixed', // 'actor', 'actress', 'mixed'
    mediaType: 'all', // 'movie', 'tv', 'person', 'all'
  }

  // Main search function - the "lego brick" that can be called from anywhere
  async search(query: string, options: SearchOptions = {}): Promise<SearchServiceResponse> {
    // Sanitize overly long or multi-line queries (e.g., pasted logs)
    let sanitized = (query || '').toString().split('\n')[0].trim().slice(0, 80)

    // Guard against accidental pasted logs or noise
    if (/\[vite\]|client:\d|http:\/\//i.test(sanitized)) {
      sanitized = ''
    }

    if (!sanitized) {
      warn('Search called with empty query')
      return { success: false, error: 'Query cannot be empty', results: [] }
    }

    try {
      this.isSearching = true
      this.lastQuery = sanitized

      // Merge options with defaults
      const searchOptions = { ...this.currentFilters, ...options }
      // Normalize and sync filters centrally
      const filtersStore = useFiltersStore(pinia)
      if (searchOptions.castFilter) filtersStore.setCast(searchOptions.castFilter)
      if (searchOptions.mediaType) filtersStore.setMediaType(searchOptions.mediaType)
      searchOptions.castFilter = filtersStore.cast
      searchOptions.mediaType = filtersStore.mediaType

      // Get raw results via cache layer (tmdbCache)
      const rawResults = await tmdbCache.searchMulti(this.lastQuery, 'multi')

      if (!rawResults || rawResults.length === 0) {
        this.searchResults = []
        return { success: true, results: [], query: this.lastQuery }
      }

      // Process and transform results
      const processedResults = this.processResults(rawResults, searchOptions)

      // Apply filters
      const filteredResults = this.applyFilters(processedResults, searchOptions)

      this.searchResults = filteredResults

      return {
        success: true,
        results: filteredResults,
        query: this.lastQuery,
        totalFound: rawResults.length,
        filteredCount: filteredResults.length,
      }
    } catch (error) {
      logError( `Search failed for "${query}":`, error.message)
      return { success: false, error: error.message, results: [] }
    } finally {
      this.isSearching = false
    }
  }

  // Process raw TMDB results into game-ready format
  processResults(results, options = {}) {
    info( `Processing ${results.length} raw results`)

    return results.map((result) => this.transformResult(result))
  }

  // Transform individual TMDB result into game format
  transformResult(result) {
    const transformed = {
      id: result.id,
      name: this.getName(result),
      type: normalizeMediaType(result.media_type),
      year: this.getYear(result),
      image: this.getImageUrl(result),
      overview: result.overview || '',
      popularity: result.popularity || 0,
      originalData: result, // Keep original for reference
    }

    // Add cast info if available
    if (result.media_type === 'person') {
      transformed.knownFor = result.known_for || []
      transformed.knownForCount = (result.known_for || []).length
    }

    return transformed
  }

  // Get display name based on media type
  getName(result) {
    if (result.media_type === 'person') {
      return result.name || 'Unknown Person'
    } else if (result.media_type === 'movie') {
      return result.title || 'Unknown Movie'
    } else if (result.media_type === 'tv') {
      return result.name || 'Unknown TV Show'
    }
    return 'Unknown'
  }

  // Removed: mapMediaType - use normalizeMediaType instead

  // Extract year from release date
  getYear(result) {
    let date = null

    if (result.media_type === 'movie' && result.release_date) {
      date = result.release_date
    } else if (result.media_type === 'tv' && result.first_air_date) {
      date = result.first_air_date
    }

    if (date) {
      return new Date(date).getFullYear()
    }

    return null
  }

  // Get image URL for the result
  getImageUrl(result) {
    if (result.media_type === 'person' && result.profile_path) {
      return `https://image.tmdb.org/t/p/w200${result.profile_path}`
    } else if (result.poster_path) {
      return `https://image.tmdb.org/t/p/w200${result.poster_path}`
    }

    return null
  }

  // Apply filters to processed results
  applyFilters(results, options) {
    let filtered = results

    // Apply cast filter
    if (options.castFilter && options.castFilter !== 'mixed') {
      const genderFilter = options.castFilter === 'male' ? GENDERS.MALE : GENDERS.FEMALE
      filtered = filtered.filter((result) => {
        if (result.type !== 'person') return true
        const gender = result?.originalData?.gender
        return matchesGenderFilter(gender, genderFilter)
      })
    }

    // Apply media type filter
    if (options.mediaType && options.mediaType !== 'all') {
      filtered = filtered.filter((result) => result.type === options.mediaType)
    }

    info( `Applied filters: ${results.length} → ${filtered.length} results`)
    return filtered
  }

  // Get current search state
  getSearchState() {
    return {
      isSearching: this.isSearching,
      lastQuery: this.lastQuery,
      resultsCount: this.searchResults.length,
      currentFilters: { ...this.currentFilters },
      hasResults: this.searchResults.length > 0,
    }
  }

  // Update filters
  updateFilters(newFilters) {
    this.currentFilters = { ...this.currentFilters, ...newFilters }
    info( 'Filters updated:', this.currentFilters)
  }

  // Clear search results
  clearResults() {
    this.searchResults = []
    this.lastQuery = ''
    info( 'Search results cleared')
  }

  // Get hint results (same as search but with different context)
  async getHint(query, options = {}) {
    info( `Getting hint for "${query}"`)
    return this.search(query, options)
  }

  // Test the search service
  async testSearch() {
    info( '🧪 Testing Search Service...')

    try {
      // Test 1: Basic search
      info( '🧪 Test 1: Basic search for "jack black"')
      const searchResult = await this.search('jack black')

      if (!searchResult.success) {
        return { success: false, error: 'Basic search failed', details: searchResult }
      }

      info( `✅ Basic search: Found ${searchResult.results.length} results`)

      // Test 2: Search with actor filter
      info( '🧪 Test 2: Search with actor filter')
      const actorResult = await this.search('jack black', { castFilter: 'actor' })

      if (!actorResult.success) {
        return { success: false, error: 'Actor filter search failed', details: actorResult }
      }

      info( `✅ Actor filter search: Found ${actorResult.results.length} results`)

      // Test 3: Get hint
      info( '🧪 Test 3: Get hint for "tom hanks"')
      const hintResult = await this.getHint('tom hanks')

      if (!hintResult.success) {
        return { success: false, error: 'Hint search failed', details: hintResult }
      }

      info( `✅ Hint search: Found ${hintResult.results.length} results`)

      // Test 4: Check search state
      const state = this.getSearchState()
      info( '🧪 Test 4: Search state check')
      info( 'Search state:', state)

      info( '🎉 All Search Service tests completed!')

      return {
        success: true,
        tests: {
          basicSearch: searchResult.results.length,
          actorFilter: actorResult.results.length,
          hintSearch: hintResult.results.length,
          searchState: state,
        },
      }
    } catch (error) {
      logError( 'Search service test failed:', error.message)
      return { success: false, error: error.message }
    }
  }
}

export default new SearchService()
