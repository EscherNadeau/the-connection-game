// tmdbCache.js - Specialized TMDB caching with full filmography and connection data

import { info, warn, error as logError } from '../ui/log.ts'
import tmdbService from '../api/tmdbService.ts'
import enhancedCacheService from './enhancedCacheService.ts'
import { CACHE_CONFIG, CACHE_KEYS } from './cacheConfig.ts'

class TMDBCache {
  constructor() {
    this.isInitialized = false
    this.init()
  }
  async init() {
    try {
      await enhancedCacheService.init()
      const tmdbStatus = tmdbService.getStatus()
      if (!tmdbStatus.hasApiKey) {
        warn( 'TMDB API key not available - cache will work with existing data only')
      }
      this.isInitialized = true
      await this.prePopulateCache()
    } catch (e) {
      logError( `Failed to initialize TMDB Cache: ${e.message}`)
    }
  }
  async getActorWithFilmographyCached(actorId) {
    const key = CACHE_KEYS.ACTOR_FILMOGRAPHY(actorId)
    const primary = await enhancedCacheService.get(key, CACHE_CONFIG.CATEGORIES.ACTORS)
    if (primary) return primary
    return await enhancedCacheService.get(key, CACHE_CONFIG.CATEGORIES.ACTORS_ARCHIVE)
  }
  async getMovieWithCastCached(movieId) {
    const key = CACHE_KEYS.MOVIE(movieId)
    const primary = await enhancedCacheService.get(key, CACHE_CONFIG.CATEGORIES.MOVIES)
    if (primary) return primary
    return await enhancedCacheService.get(key, CACHE_CONFIG.CATEGORIES.MOVIES_ARCHIVE)
  }
  async getTVShowWithCastCached(tvId) {
    const key = CACHE_KEYS.TV_SHOW(tvId)
    const primary = await enhancedCacheService.get(key, CACHE_CONFIG.CATEGORIES.TV_SHOWS)
    if (primary) return primary
    return await enhancedCacheService.get(key, CACHE_CONFIG.CATEGORIES.TV_SHOWS_ARCHIVE)
  }
  async prePopulateCache() {
    try {
    } catch (e) {
      logError( `Cache pre-population failed: ${e.message}`)
    }
  }
  async cacheItemForGame(item, type) {
    try {
      if (type === 'person' || type === 'actor') {
        const actor = await this.getActorWithFilmography(item.id, true)
        if (!actor || !actor.filmography || actor.filmography.length === 0) {
          const fresh = await this.getActorWithFilmography(item.id, false)
          if (fresh)
            await enhancedCacheService.set(
              CACHE_KEYS.ACTOR_FILMOGRAPHY(item.id),
              fresh,
              CACHE_CONFIG.CATEGORIES.ACTORS
            )
        }
      } else if (type === 'movie') {
        const movie = await this.getMovieWithCast(item.id, true)
        if (!movie || !movie.cast || movie.cast.length === 0) {
          const fresh = await this.getMovieWithCast(item.id, false)
          if (fresh)
            await enhancedCacheService.set(
              CACHE_KEYS.MOVIE(item.id),
              fresh,
              CACHE_CONFIG.CATEGORIES.MOVIES
            )
        }
      } else if (type === 'tv') {
        const tv = await this.getTVShowWithCast(item.id, true)
        if (!tv || !tv.cast || tv.cast.length === 0) {
          const fresh = await this.getTVShowWithCast(item.id, false)
          if (fresh)
            await enhancedCacheService.set(
              CACHE_KEYS.TV_SHOW(item.id),
              fresh,
              CACHE_CONFIG.CATEGORIES.TV_SHOWS
            )
        }
      } else {
        if (item.filmography) {
          const actor = await this.getActorWithFilmography(item.id, true)
          if (!actor || !actor.filmography || actor.filmography.length === 0) {
            const fresh = await this.getActorWithFilmography(item.id, false)
            if (fresh)
              await enhancedCacheService.set(
                CACHE_KEYS.ACTOR_FILMOGRAPHY(item.id),
                fresh,
                CACHE_CONFIG.CATEGORIES.ACTORS
              )
          }
        } else if (item.cast) {
          const movie = await this.getMovieWithCast(item.id, true)
          if (!movie || !movie.cast || movie.cast.length === 0) {
            const fresh = await this.getMovieWithCast(item.id, false)
            if (fresh)
              await enhancedCacheService.set(
                CACHE_KEYS.MOVIE(item.id),
                fresh,
                CACHE_CONFIG.CATEGORIES.MOVIES
              )
          }
        } else {
          throw new Error(`Cannot determine type for item: ${item.name || item.title}`)
        }
      }
    } catch (e) {
      logError( `Failed to cache game item: ${e.message}`)
      throw e
    }
  }
  async getRandomActor() {
    const popularActors = await this.getPopularActors(1)
    if (!popularActors || popularActors.length === 0) throw new Error('No popular actors available')
    const randomActor = popularActors[Math.floor(Math.random() * popularActors.length)]
    const fullActor = await this.getActorWithFilmography(randomActor.id, false)
    info(
      `Selected random actor: ${fullActor.name} with ${fullActor.filmography.length} credits (not cached yet)`
    )
    return fullActor
  }
  async getActorWithFilmography(actorId, shouldCache = true) {
    const cacheKey = CACHE_KEYS.ACTOR_FILMOGRAPHY(actorId)
    if (!shouldCache) {
      info( `Fetching full filmography for actor ID: ${actorId} (not caching)`)
      const filmography = await tmdbService.getActorFilmography(actorId)
      if (!filmography) throw new Error(`Failed to fetch filmography for actor ID: ${actorId}`)
      return {
        ...filmography,
        media_type: 'person',
        filmography: filmography.cast || [],
        totalCredits: (filmography.cast || []).length,
        last_updated: new Date().toISOString(),
      }
    }
    const actorData = await enhancedCacheService.getOrSet(
      cacheKey,
      async () => {
        info( `Fetching full filmography for actor ID: ${actorId}`)
        const filmography = await tmdbService.getActorFilmography(actorId)
        if (!filmography) throw new Error(`Failed to fetch filmography for actor ID: ${actorId}`)
        return {
          ...filmography,
          media_type: 'person',
          filmography: filmography.cast || [],
          totalCredits: (filmography.cast || []).length,
          last_updated: new Date().toISOString(),
        }
      },
      CACHE_CONFIG.CATEGORIES.ACTORS
    )
    try {
      await enhancedCacheService.set(cacheKey, actorData, CACHE_CONFIG.CATEGORIES.ACTORS_ARCHIVE, 0)
      await enhancedCacheService.enforceArchiveLimits()
    } catch {}
    return actorData
  }
  async getPopularActors(page = 1) {
    const cacheKey = CACHE_KEYS.ACTOR_POPULAR(page)
    const cached = await enhancedCacheService.getOrSet(
      cacheKey,
      async () => {
        info( `Fetching popular actors page ${page}`)
        const actors = await tmdbService.getPopularPeople(page)
        return actors.map((actor) => ({
          ...actor,
          media_type: 'person',
          last_updated: new Date().toISOString(),
        }))
      },
      CACHE_CONFIG.CATEGORIES.POPULAR
    )
    if (!Array.isArray(cached) || cached.length === 0) {
      info( `Popular actors cache empty; fetching fresh page ${page}`)
      const actors = await tmdbService.getPopularPeople(page)
      const enhanced = (actors || []).map((actor) => ({
        ...actor,
        media_type: 'person',
        last_updated: new Date().toISOString(),
      }))
      if (enhanced.length > 0)
        await enhancedCacheService.set(cacheKey, enhanced, CACHE_CONFIG.CATEGORIES.POPULAR)
      return enhanced
    }
    return cached
  }
  async getRandomMovie() {
    const popularMovies = await this.getPopularMovies(1)
    if (!popularMovies || popularMovies.length === 0) throw new Error('No popular movies available')
    const randomMovie = popularMovies[Math.floor(Math.random() * popularMovies.length)]
    const fullMovie = await this.getMovieWithCast(randomMovie.id, false)
    info(
      `Selected random movie: ${fullMovie.title} with ${fullMovie.cast.length} cast members (not cached yet)`
    )
    return fullMovie
  }
  async getMovieWithCast(movieId, shouldCache = true) {
    const cacheKey = CACHE_KEYS.MOVIE(movieId)
    if (!shouldCache) {
      info( `Fetching full cast for movie ID: ${movieId} (not caching)`)
      const credits = await tmdbService.getMovieCredits(movieId)
      if (!credits) throw new Error(`Failed to fetch credits for movie ID: ${movieId}`)
      const movieInfo = await this.getMovieInfo(movieId, false)
      return {
        ...movieInfo,
        cast: credits.cast || [],
        crew: credits.crew || [],
        totalCast: credits.totalCast || 0,
        last_updated: new Date().toISOString(),
      }
    }
    const movieData = await enhancedCacheService.getOrSet(
      cacheKey,
      async () => {
        info( `Fetching full cast for movie ID: ${movieId}`)
        const credits = await tmdbService.getMovieCredits(movieId)
        if (!credits) throw new Error(`Failed to fetch credits for movie ID: ${movieId}`)
        const movieInfo = await this.getMovieInfo(movieId, false)
        return {
          ...movieInfo,
          cast: credits.cast || [],
          crew: credits.crew || [],
          totalCast: credits.totalCast || 0,
          last_updated: new Date().toISOString(),
        }
      },
      CACHE_CONFIG.CATEGORIES.MOVIES
    )
    try {
      await enhancedCacheService.set(cacheKey, movieData, CACHE_CONFIG.CATEGORIES.MOVIES_ARCHIVE, 0)
    } catch {}
    return movieData
  }
  async getMovieInfo(movieId, shouldCache = true) {
    const cacheKey = CACHE_KEYS.MOVIE(movieId)
    if (!shouldCache) {
      info( `Fetching movie info for ID: ${movieId} (not caching)`)
      const movieDetails = await tmdbService.getMovieDetails(movieId)
      if (!movieDetails) throw new Error(`Failed to fetch movie details for ID: ${movieId}`)
      return { ...movieDetails, media_type: 'movie', last_updated: new Date().toISOString() }
    }
    const movieInfoData = await enhancedCacheService.getOrSet(
      cacheKey,
      async () => {
        info( `Fetching movie info for ID: ${movieId}`)
        const movieDetails = await tmdbService.getMovieDetails(movieId)
        if (!movieDetails) throw new Error(`Failed to fetch movie details for ID: ${movieId}`)
        return { ...movieDetails, media_type: 'movie', last_updated: new Date().toISOString() }
      },
      CACHE_CONFIG.CATEGORIES.MOVIES
    )
    try {
      await enhancedCacheService.set(
        cacheKey,
        movieInfoData,
        CACHE_CONFIG.CATEGORIES.MOVIES_ARCHIVE,
        0
      )
    } catch {}
    return movieInfoData
  }
  async getPopularMovies(page = 1) {
    const cacheKey = CACHE_KEYS.MOVIE_POPULAR(page)
    const cached = await enhancedCacheService.getOrSet(
      cacheKey,
      async () => {
        info( `Fetching popular movies page ${page}`)
        const movies = await tmdbService.getPopularMovies(page)
        return movies.map((m) => ({
          ...m,
          media_type: 'movie',
          last_updated: new Date().toISOString(),
        }))
      },
      CACHE_CONFIG.CATEGORIES.POPULAR
    )
    if (!Array.isArray(cached) || cached.length === 0) {
      info( `Popular movies cache empty; fetching fresh page ${page}`)
      const movies = await tmdbService.getPopularMovies(page)
      const enhanced = (movies || []).map((m) => ({
        ...m,
        media_type: 'movie',
        last_updated: new Date().toISOString(),
      }))
      if (enhanced.length > 0)
        await enhancedCacheService.set(cacheKey, enhanced, CACHE_CONFIG.CATEGORIES.POPULAR)
      return enhanced
    }
    return cached
  }
  async getRandomTVShow() {
    const popularTVShows = await this.getPopularTVShows(1)
    if (!popularTVShows || popularTVShows.length === 0)
      throw new Error('No popular TV shows available')
    const randomTVShow = popularTVShows[Math.floor(Math.random() * popularTVShows.length)]
    const fullTVShow = await this.getTVShowWithCast(randomTVShow.id, false)
    info(
      `Selected random TV show: ${fullTVShow.name} with ${fullTVShow.cast.length} cast members (not cached yet)`
    )
    return fullTVShow
  }
  async getRandomItem(type) {
    try {
      info( `Getting random ${type} item`)
      switch (type) {
        case 'person':
        case 'actor':
          return await this.getRandomActor()
        case 'movie':
          return await this.getRandomMovie()
        case 'tv':
        case 'tvshow':
          return await this.getRandomTVShow()
        default:
          throw new Error(`Unknown type: ${type}`)
      }
    } catch (error) {
      logError( `Failed to get random ${type} item: ${error.message}`)
      return null
    }
  }
  async getTVShowWithCast(tvId, shouldCache = true) {
    const cacheKey = CACHE_KEYS.TV_SHOW(tvId)
    if (!shouldCache) {
      const credits = await tmdbService.getTVCredits(tvId)
      if (!credits) throw new Error(`Failed to fetch credits for TV show ID: ${tvId}`)
      const tvInfo = await this.getTVShowInfo(tvId, false)
      return {
        ...tvInfo,
        cast: credits.cast || [],
        crew: credits.crew || [],
        totalCast: credits.totalCast || 0,
        last_updated: new Date().toISOString(),
      }
    }
    const tvData = await enhancedCacheService.getOrSet(
      cacheKey,
      async () => {
        const credits = await tmdbService.getTVCredits(tvId)
        if (!credits) throw new Error(`Failed to fetch credits for TV show ID: ${tvId}`)
        const tvInfo = await this.getTVShowInfo(tvId, false)
        return {
          ...tvInfo,
          cast: credits.cast || [],
          crew: credits.crew || [],
          totalCast: credits.totalCast || 0,
          last_updated: new Date().toISOString(),
        }
      },
      CACHE_CONFIG.CATEGORIES.TV_SHOWS
    )
    try {
      await enhancedCacheService.set(cacheKey, tvData, CACHE_CONFIG.CATEGORIES.TV_SHOWS_ARCHIVE, 0)
    } catch {}
    return tvData
  }
  async getTVShowInfo(tvId, shouldCache = true) {
    const cacheKey = CACHE_KEYS.TV_SHOW(tvId)
    if (!shouldCache) {
      info( `Fetching TV show info for ID: ${tvId} (not caching)`)
      const tvDetails = await tmdbService.getTVShowDetails(tvId)
      if (!tvDetails) throw new Error(`Failed to fetch TV show details for ID: ${tvId}`)
      return { ...tvDetails, media_type: 'tv', last_updated: new Date().toISOString() }
    }
    const tvInfoData = await enhancedCacheService.getOrSet(
      cacheKey,
      async () => {
        info( `Fetching TV show info for ID: ${tvId}`)
        const tvDetails = await tmdbService.getTVShowDetails(tvId)
        if (!tvDetails) throw new Error(`Failed to fetch TV show details for ID: ${tvId}`)
        return { ...tvDetails, media_type: 'tv', last_updated: new Date().toISOString() }
      },
      CACHE_CONFIG.CATEGORIES.TV_SHOWS
    )
    try {
      await enhancedCacheService.set(
        cacheKey,
        tvInfoData,
        CACHE_CONFIG.CATEGORIES.TV_SHOWS_ARCHIVE,
        0
      )
    } catch {}
    return tvInfoData
  }
  async getPopularTVShows(page = 1) {
    const cacheKey = CACHE_KEYS.TV_POPULAR(page)
    const cached = await enhancedCacheService.getOrSet(
      cacheKey,
      async () => {
        info( `Fetching popular TV shows page ${page}`)
        const tvShows = await tmdbService.getPopularTVShows(page)
        return tvShows.map((tv) => ({
          ...tv,
          media_type: 'tv',
          last_updated: new Date().toISOString(),
        }))
      },
      CACHE_CONFIG.CATEGORIES.POPULAR
    )
    if (!Array.isArray(cached) || cached.length === 0) {
      info( `Popular TV shows cache empty; fetching fresh page ${page}`)
      const tvShows = await tmdbService.getPopularTVShows(page)
      const enhanced = (tvShows || []).map((tv) => ({
        ...tv,
        media_type: 'tv',
        last_updated: new Date().toISOString(),
      }))
      if (enhanced.length > 0)
        await enhancedCacheService.set(cacheKey, enhanced, CACHE_CONFIG.CATEGORIES.POPULAR)
      return enhanced
    }
    return cached
  }
  async searchMulti(query, type = 'multi') {
    const cacheKey = CACHE_KEYS.SEARCH(query, type)
    
    // First check if we have cached results
    const cached = await enhancedCacheService.get(cacheKey, CACHE_CONFIG.CATEGORIES.SEARCH)
    
    // If cached results exist and are non-empty, return them
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached
    }
    
    // If no cache or empty cache, always fetch fresh (don't trust empty cached results)
    info(`Searching for: ${query} (type: ${type})`)
    const results = await tmdbService.searchMulti(query)
    const enhanced = results.map((item) => ({ ...item, last_updated: new Date().toISOString() }))
    
    // Only cache if we got results (don't cache empty results)
    if (enhanced.length > 0) {
      await enhancedCacheService.set(cacheKey, enhanced, CACHE_CONFIG.CATEGORIES.SEARCH)
    }
    
    return enhanced
  }
  async findConnections(item1, item2) {
    try {
      const connectionKey = CACHE_KEYS.CONNECTION(item1.id, item2.id)
      return await enhancedCacheService.getOrSet(
        connectionKey,
        async () => {
          info(
            `Finding connections between ${item1.name || item1.title} and ${item2.name || item2.title}`
          )
          const connections = []
          if (item1.media_type === 'person' && item2.media_type === 'person') {
            const sharedMovies = await this.findSharedMovies(item1, item2)
            connections.push(...sharedMovies)
          }
          if (
            (item1.media_type === 'person' && item2.media_type === 'movie') ||
            (item1.media_type === 'movie' && item2.media_type === 'person')
          ) {
            const actor = item1.media_type === 'person' ? item1 : item2
            const movie = item1.media_type === 'movie' ? item1 : item2
            const isInMovie = await this.checkActorInMovie(actor, movie)
            if (isInMovie) {
              connections.push({
                type: 'appearance',
                description: `${actor.name} appears in ${movie.title}`,
                strength: 'direct',
              })
            }
          }
          const now = new Date().toISOString()
          return connections.map((c) => ({ ...c, lastVerifiedAt: now }))
        },
        CACHE_CONFIG.CATEGORIES.CONNECTIONS,
        CACHE_CONFIG.EXPIRATION.CONNECTIONS
      )
    } catch (e) {
      logError( `Failed to find connections: ${e.message}`)
      return []
    }
  }
  async findSharedMovies(actor1, actor2) {
    try {
      const f1 = await this.getActorWithFilmography(actor1.id)
      const f2 = await this.getActorWithFilmography(actor2.id)
      const movies1 = f1.filmography.filter((i) => i.media_type === 'movie')
      const movies2 = f2.filmography.filter((i) => i.media_type === 'movie')
      const shared = movies1.filter((m) => movies2.some((n) => n.id === m.id))
      return shared.map((movie) => ({
        type: 'shared_movie',
        description: `Both ${actor1.name} and ${actor2.name} appeared in ${movie.title}`,
        movie,
        strength: 'direct',
      }))
    } catch (e) {
      logError( `Failed to find shared movies: ${e.message}`)
      return []
    }
  }
  async checkActorInMovie(actor, movie) {
    try {
      const movieWithCast = await this.getMovieWithCast(movie.id)
      return movieWithCast.cast.some((c) => c.id === actor.id)
    } catch (e) {
      logError( `Failed to check actor in movie: ${e.message}`)
      return false
    }
  }
  async fetchAndCachePopularActors(pages = 1) {
    try {
      info( `Fetching and caching ${pages} pages of popular actors`)
      for (let p = 1; p <= pages; p++) await this.getPopularActors(p)
      info( `Successfully cached ${pages} pages of popular actors`)
    } catch (e) {
      logError( `Failed to fetch and cache popular actors: ${e.message}`)
    }
  }
  async fetchAndCachePopularMovies(pages = 1) {
    try {
      info( `Fetching and caching ${pages} pages of popular movies`)
      for (let p = 1; p <= pages; p++) await this.getPopularMovies(p)
      info( `Successfully cached ${pages} pages of popular movies`)
    } catch (e) {
      logError( `Failed to fetch and cache popular movies: ${e.message}`)
    }
  }
  async fetchAndCachePopularTVShows(pages = 1) {
    try {
      info( `Fetching and caching ${pages} pages of popular TV shows`)
      for (let p = 1; p <= pages; p++) await this.getPopularTVShows(p)
      info( `Successfully cached ${pages} pages of popular TV shows`)
    } catch (e) {
      logError( `Failed to fetch and cache popular TV shows: ${e.message}`)
    }
  }
  async getCacheStats() {
    try {
      const stats = await enhancedCacheService.getStats()
      info( 'Cache statistics retrieved', stats)
      return stats
    } catch (e) {
      logError( `Failed to get cache stats: ${e.message}`)
      return { error: e.message }
    }
  }
  async clearCache(category = null) {
    try {
      await enhancedCacheService.clear(category)
      info( `Cache cleared${category ? ` for ${category}` : ''}`)
      return true
    } catch (e) {
      logError( `Failed to clear cache: ${e.message}`)
      return false
    }
  }
  async refreshCache(items = []) {
    try {
      info( `Refreshing cache for ${items.length} items`)
      for (const item of items) {
        if (item.media_type === 'person') await this.getActorWithFilmography(item.id)
        else if (item.media_type === 'movie') await this.getMovieWithCast(item.id)
        else if (item.media_type === 'tv') await this.getTVShowWithCast(item.id)
      }
      info( 'Cache refresh completed')
      return true
    } catch (e) {
      logError( `Failed to refresh cache: ${e.message}`)
      return false
    }
  }
  async clearSearchCache() {
    info("Clearing all search cache entries...")
    try {
      await enhancedCacheService.clear(CACHE_CONFIG.CATEGORIES.SEARCH)
      info("Search cache cleared successfully")
      return true
    } catch (e) {
      logError("Failed to clear search cache: " + e.message)
      return false
    }
  }
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      tmdbStatus: tmdbService.getStatus(),
      cacheStats: enhancedCacheService.getStats(),
    }
  }
}

const tmdbCache = new TMDBCache()
if (typeof window !== 'undefined' && import.meta.env && import.meta.env.DEV) {
  window.tmdbCache = tmdbCache
  info('TMDB Cache exposed globally as window.tmdbCache')
}
export default tmdbCache
