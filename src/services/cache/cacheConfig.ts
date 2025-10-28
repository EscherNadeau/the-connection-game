// cacheConfig.js - Configuration for the enhanced cache system

export const CACHE_CONFIG = {
  SCHEMA_VERSION: 1,
  STORAGE: {
    PRIMARY: 'indexeddb',
    FALLBACK: 'localStorage',
    DATABASE_NAME: 'GameCacheDB',
    VERSION: 2,
  },
  EXPIRATION: {
    ACTORS: Number(import.meta?.env?.VITE_CACHE_TTL_ACTORS_MS) || 7 * 24 * 60 * 60 * 1000,
    MOVIES: Number(import.meta?.env?.VITE_CACHE_TTL_MOVIES_MS) || 7 * 24 * 60 * 60 * 1000,
    TV_SHOWS: Number(import.meta?.env?.VITE_CACHE_TTL_TV_MS) || 7 * 24 * 60 * 60 * 1000,
    SEARCH_RESULTS: Number(import.meta?.env?.VITE_CACHE_TTL_SEARCH_MS) || 24 * 60 * 60 * 1000,
    POPULAR_LISTS: Number(import.meta?.env?.VITE_CACHE_TTL_POPULAR_MS) || 3 * 24 * 60 * 60 * 1000,
    CONNECTIONS:
      Number(import.meta?.env?.VITE_CACHE_TTL_CONNECTIONS_MS) || 30 * 24 * 60 * 60 * 1000,
  },
  LIMITS: {
    MAX_ACTORS: 1000,
    MAX_MOVIES: 2000,
    MAX_TV_SHOWS: 1000,
    MAX_SEARCH_RESULTS: 500,
    MAX_ARCHIVE_ACTORS: Number(import.meta?.env?.VITE_CACHE_MAX_ARCHIVE_ACTORS) || 5000,
    MAX_ARCHIVE_MOVIES: Number(import.meta?.env?.VITE_CACHE_MAX_ARCHIVE_MOVIES) || 10000,
    MAX_ARCHIVE_TV_SHOWS: Number(import.meta?.env?.VITE_CACHE_MAX_ARCHIVE_TV) || 5000,
    MAX_STORAGE_SIZE: 100 * 1024 * 1024,
  },
  TMDB: { BATCH_SIZE: 20, MAX_PAGES: 5, RETRY_ATTEMPTS: 3, RETRY_DELAY: 1000 },
  CATEGORIES: {
    ACTORS: 'actors',
    MOVIES: 'movies',
    TV_SHOWS: 'tv_shows',
    ACTORS_ARCHIVE: 'actors_archive',
    MOVIES_ARCHIVE: 'movies_archive',
    TV_SHOWS_ARCHIVE: 'tv_shows_archive',
    SEARCH: 'search',
    POPULAR: 'popular',
    CONNECTIONS: 'connections',
  },
  STORES: {
    ACTORS: 'actors',
    MOVIES: 'movies',
    TV_SHOWS: 'tv_shows',
    ACTORS_ARCHIVE: 'actors_archive',
    MOVIES_ARCHIVE: 'movies_archive',
    TV_SHOWS_ARCHIVE: 'tv_shows_archive',
    SEARCH: 'search',
    POPULAR: 'popular',
    CONNECTIONS: 'connections',
    METADATA: 'metadata',
  },
}

export const CACHE_KEYS = {
  ACTOR: (id) => `actor_${id}`,
  ACTOR_FILMOGRAPHY: (id) => `actor_filmography_${id}`,
  ACTOR_POPULAR: (page) => `actor_popular_${page}`,
  MOVIE: (id) => `movie_${id}`,
  MOVIE_CREDITS: (id) => `movie_credits_${id}`,
  MOVIE_POPULAR: (page) => `movie_popular_${page}`,
  TV_SHOW: (id) => `tv_${id}`,
  TV_CREDITS: (id) => `tv_credits_${id}`,
  TV_POPULAR: (page) => `tv_popular_${page}`,
  SEARCH: (query, type) => `search_${type}_${query}`,
  CONNECTION: (item1, item2) => `connection_${item1}_${item2}`,
  LAST_UPDATE: 'last_update',
  CACHE_STATS: 'cache_stats',
  STORAGE_INFO: 'storage_info',
}

export const DATA_STRUCTURES = {
  ACTOR: {
    id: null,
    name: '',
    profile_path: '',
    known_for_department: '',
    popularity: 0,
    filmography: [],
    last_updated: null,
  },
  MOVIE: {
    id: null,
    title: '',
    original_title: '',
    overview: '',
    release_date: '',
    poster_path: '',
    backdrop_path: '',
    cast: [],
    crew: [],
    genres: [],
    last_updated: null,
  },
  TV_SHOW: {
    id: null,
    name: '',
    original_name: '',
    overview: '',
    first_air_date: '',
    poster_path: '',
    backdrop_path: '',
    cast: [],
    crew: [],
    genres: [],
    last_updated: null,
  },
}

export const ERROR_MESSAGES = {
  INDEXEDDB_NOT_SUPPORTED: 'IndexedDB is not supported in this browser',
  STORAGE_QUOTA_EXCEEDED: 'Storage quota exceeded. Clearing old cache items.',
  API_CALL_FAILED: 'API call failed. Using cached data if available.',
  CACHE_CORRUPTED: 'Cache data corrupted. Clearing and rebuilding.',
  INVALID_DATA: 'Invalid data received from API. Skipping cache update.',
}

export const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 }
