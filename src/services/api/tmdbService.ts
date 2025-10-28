// tmdbService.js - Simple, focused TMDB API service
// Just fetches data - no complex logic, no args system

import { log } from '../ui/log.ts'

class TMDBService {
  constructor() {
    this.apiKey = import.meta.env.VITE_TMDB_API_KEY
    this.baseUrl = 'https://api.themoviedb.org/3'
    this.imageBaseUrl = 'https://image.tmdb.org/t/p/'
    this.checkApiKey()
  }

  checkApiKey() {
    if (!this.apiKey) {
      log('TMDB API key not found. Please set VITE_TMDB_API_KEY in .env file')
      return false
    }
    log('TMDB API key found and ready')
    return true
  }

  async makeRequest(endpoint, params = {}) {
    if (!this.apiKey) throw new Error('TMDB API key not set')
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`)
      url.searchParams.append('api_key', this.apiKey)
      url.searchParams.append('language', 'en-US')
      Object.keys(params).forEach((key) => {
        url.searchParams.append(key, params[key])
      })
      const response = await fetch(url)
      if (!response.ok) {
        if (response.status === 401) throw new Error('Invalid API key')
        throw new Error(`TMDB API error: ${response.status} ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      log(`TMDB request failed: ${endpoint}`, { error: error.message })
      throw error
    }
  }

  async searchMulti(query, page = 1) {
    if (!query || query.trim().length === 0) return []
    try {
      const data = await this.makeRequest('/search/multi', {
        query: query.trim(),
        page,
        include_adult: false,
      })
      log(`Multi-search found ${data.results?.length || 0} results for "${query}"`)
      return data.results || []
    } catch (error) {
      log(`Multi-search failed for "${query}"`, { error: error.message })
      return []
    }
  }

  async getMovieCredits(movieId) {
    if (!movieId) throw new Error('Movie ID is required')
    try {
      const data = await this.makeRequest(`/movie/${movieId}/credits`)
      log(`Got movie credits for ID ${movieId}: ${data.cast?.length || 0} cast members`)
      return {
        id: movieId,
        cast: data.cast || [],
        crew: data.crew || [],
        totalCast: data.cast?.length || 0,
      }
    } catch (error) {
      log(`Failed to get movie credits for ID ${movieId}`, { error: error.message })
      return null
    }
  }

  async getTVCredits(tvId) {
    if (!tvId) throw new Error('TV show ID is required')
    try {
      const data = await this.makeRequest(`/tv/${tvId}/aggregate_credits`)
      log(`Got TV credits for ID ${tvId}: ${data.cast?.length || 0} cast members`)
      return {
        id: tvId,
        cast: data.cast || [],
        crew: data.crew || [],
        totalCast: data.cast?.length || 0,
      }
    } catch (error) {
      log(`Failed to get TV credits for ID ${tvId}`, { error: error.message })
      return null
    }
  }

  async getActorFilmography(actorId) {
    if (!actorId) throw new Error('Actor ID is required')
    try {
      const data = await this.makeRequest(`/person/${actorId}`, {
        append_to_response: 'movie_credits,tv_credits,images',
      })
      const cast = [
        ...(data.movie_credits?.cast || []).map((i) => ({ ...i, media_type: 'movie' })),
        ...(data.tv_credits?.cast || []).map((i) => ({ ...i, media_type: 'tv' })),
      ]
      log(`Got filmography for actor ID ${actorId}: ${cast.length} credits`)
      return {
        id: data.id,
        name: data.name,
        profile_path: data.profile_path,
        gender: data.gender,
        birthday: data.birthday,
        known_for_department: data.known_for_department,
        cast,
        totalMovies: data.movie_credits?.cast?.length || 0,
        totalTVShows: data.tv_credits?.cast?.length || 0,
        images: data.images,
        known_for: data.known_for,
      }
    } catch (error) {
      log(`Failed to get filmography for actor ID ${actorId}`, { error: error.message })
      return null
    }
  }

  async getPopularMovies(page = 1) {
    try {
      const data = await this.makeRequest('/movie/popular', { page })
      log(`Got ${data.results?.length || 0} popular movies`)
      return data.results || []
    } catch (error) {
      log('Failed to get popular movies', { error: error.message })
      return []
    }
  }

  async getPopularTVShows(page = 1) {
    try {
      const data = await this.makeRequest('/tv/popular', { page })
      log(`Got ${data.results?.length || 0} popular TV shows`)
      return data.results || []
    } catch (error) {
      log('Failed to get popular TV shows', { error: error.message })
      return []
    }
  }

  async getPopularPeople(page = 1) {
    try {
      const data = await this.makeRequest('/person/popular', { page })
      log(`Got ${data.results?.length || 0} popular people`)
      return data.results || []
    } catch (error) {
      log('Failed to get popular people', { error: error.message })
      return []
    }
  }

  async getMovieDetails(movieId) {
    if (!movieId) throw new Error('Movie ID is required')
    try {
      const data = await this.makeRequest(`/movie/${movieId}`)
      log(`Got movie details for ID ${movieId}: ${data.title}`)
      return data
    } catch (error) {
      log(`Failed to get movie details for ID ${movieId}`, { error: error.message })
      return null
    }
  }

  async getTVShowDetails(tvId) {
    if (!tvId) throw new Error('TV show ID is required')
    try {
      const data = await this.makeRequest(`/tv/${tvId}`)
      log(`Got TV show details for ID ${tvId}: ${data.name}`)
      return data
    } catch (error) {
      log(`Failed to get TV show details for ID ${tvId}`, { error: error.message })
      return null
    }
  }

  async testTMDBService() {
    log('🧪 Testing TMDB Service...')
    try {
      const hasKey = this.checkApiKey()
      if (!hasKey) return { success: false, error: 'No API key available' }
      const searchResults = await this.searchMulti('jack black', 1)
      const popularMovies = await this.getPopularMovies(1)
      const popularPeople = await this.getPopularPeople(1)
      log('🎉 All TMDB service tests completed!')
      return {
        success: true,
        message: 'TMDB service working correctly',
        searchResults: searchResults.length,
        popularMovies: popularMovies.length,
        popularPeople: popularPeople.length,
      }
    } catch (error) {
      log('❌ TMDB service test failed', { error: error.message })
      return { success: false, error: error.message }
    }
  }

  getStatus() {
    return { hasApiKey: !!this.apiKey, baseUrl: this.baseUrl, imageBaseUrl: this.imageBaseUrl }
  }
}

export default new TMDBService()
