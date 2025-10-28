// enhancedCacheService.js - Advanced IndexedDB-based cache system with localStorage fallback

import { log } from '../ui/log.ts'
import { CACHE_CONFIG, CACHE_KEYS, DATA_STRUCTURES, ERROR_MESSAGES } from './cacheConfig.ts'

class EnhancedCacheService {
  constructor() {
    this.db = null
    this.isIndexedDBSupported = this.checkIndexedDBSupport()
    this.fallbackToLocalStorage = false
    this.init()
  }
  checkIndexedDBSupport() {
    return 'indexedDB' in window || 'webkitIndexedDB' in window || 'mozIndexedDB' in window
  }
  async init() {
    try {
      if (this.isIndexedDBSupported) {
        await this.initIndexedDB()
        await this.ensureSchemaVersion()
      } else {
        this.fallbackToLocalStorage = true
        log('warn', 'IndexedDB not supported, falling back to localStorage')
      }
    } catch (error) {
      log('error', `Failed to initialize IndexedDB: ${error.message}`)
      this.fallbackToLocalStorage = true
      log('info', 'Falling back to localStorage')
    }
  }
  async ensureSchemaVersion() {
    try {
      const stored = await this.get(CACHE_KEYS.STORAGE_INFO, CACHE_CONFIG.STORES.METADATA)
      const current = { schemaVersion: CACHE_CONFIG.SCHEMA_VERSION }
      if (!stored || stored.schemaVersion !== current.schemaVersion) {
        await this.clear(CACHE_CONFIG.STORES.ACTORS)
        await this.clear(CACHE_CONFIG.STORES.MOVIES)
        await this.clear(CACHE_CONFIG.STORES.TV_SHOWS)
        await this.set(CACHE_KEYS.STORAGE_INFO, current, CACHE_CONFIG.STORES.METADATA, 0)
        log('info', `Cache schema updated to v${current.schemaVersion}. Primary caches cleared.`)
      }
    } catch (error) {
      log('error', `Failed to ensure schema version: ${error.message}`)
    }
  }
  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(
        CACHE_CONFIG.STORAGE.DATABASE_NAME,
        CACHE_CONFIG.STORAGE.VERSION
      )
      request.onerror = () => {
        log('error', 'Failed to open IndexedDB')
        reject(new Error('Failed to open IndexedDB'))
      }
      request.onsuccess = (e) => {
        this.db = e.target.result
        log('info', 'IndexedDB opened successfully')
        resolve()
      }
      request.onupgradeneeded = (e) => {
        const db = e.target.result
        const stores = Object.values(CACHE_CONFIG.STORES)
        stores.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'key' })
            store.createIndex('timestamp', 'timestamp', { unique: false })
            store.createIndex('category', 'category', { unique: false })
          }
        })
        log('info', 'IndexedDB stores created/upgraded')
      }
    })
  }
  async set(key, data, category = 'general', expiration = null) {
    try {
      const cacheItem = {
        key,
        data,
        category,
        timestamp: Date.now(),
        expiration: expiration === 0 ? null : expiration || this.getDefaultExpiration(category),
      }
      if (this.isIndexedDBSupported && this.db) {
        await this.setIndexedDB(key, cacheItem, category)
      } else {
        this.setLocalStorage(key, cacheItem)
      }
      log('info', `Cached item: ${key} in category ${category}`)
      return true
    } catch (error) {
      log('error', `Failed to cache item ${key}: ${error.message}`)
      return false
    }
  }
  async get(key, category = 'general') {
    try {
      let cacheItem = null
      if (this.isIndexedDBSupported && this.db) cacheItem = await this.getIndexedDB(key, category)
      else cacheItem = this.getLocalStorage(key)
      if (!cacheItem) return null
      if (this.isExpired(cacheItem)) {
        await this.delete(key, category)
        return null
      }
      return cacheItem.data
    } catch (error) {
      log('error', `Failed to get cached item ${key}: ${error.message}`)
      return null
    }
  }
  async has(key, category = 'general') {
    try {
      let cacheItem = null
      if (this.isIndexedDBSupported && this.db) cacheItem = await this.getIndexedDB(key, category)
      else cacheItem = this.getLocalStorage(key)
      if (!cacheItem) return false
      return !this.isExpired(cacheItem)
    } catch {
      return false
    }
  }
  async delete(key, category = 'general') {
    try {
      if (this.isIndexedDBSupported && this.db) await this.deleteIndexedDB(key, category)
      else this.deleteLocalStorage(key)
      log('info', `Deleted cached item: ${key}`)
      return true
    } catch (error) {
      log('error', `Failed to delete cached item ${key}: ${error.message}`)
      return false
    }
  }
  async clear(category = null) {
    try {
      if (this.isIndexedDBSupported && this.db) await this.clearIndexedDB(category)
      else this.clearLocalStorage(category)
      log('info', `Cleared cache${category ? ` for ${category}` : ''}`)
      return true
    } catch (error) {
      log('error', `Failed to clear cache: ${error.message}`)
      return false
    }
  }
  async getStats() {
    try {
      if (this.isIndexedDBSupported && this.db) return await this.getStatsIndexedDB()
      else return this.getStatsLocalStorage()
    } catch (error) {
      log('error', `Failed to get cache stats: ${error.message}`)
      return { error: error.message }
    }
  }
  async cleanup() {
    try {
      if (this.isIndexedDBSupported && this.db) await this.cleanupIndexedDB()
      else this.cleanupLocalStorage()
    } catch (error) {
      log('error', `Failed to cleanup cache: ${error.message}`)
    }
  }
  async setIndexedDB(key, cacheItem, category) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([category], 'readwrite')
      const store = tx.objectStore(category)
      const req = store.put(cacheItem)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }
  async getIndexedDB(key, category) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([category], 'readonly')
      const store = tx.objectStore(category)
      const req = store.get(key)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }
  async deleteIndexedDB(key, category) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([category], 'readwrite')
      const store = tx.objectStore(category)
      const req = store.delete(key)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }
  async clearIndexedDB(category = null) {
    if (category) {
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction([category], 'readwrite')
        const store = tx.objectStore(category)
        const req = store.clear()
        req.onsuccess = () => resolve()
        req.onerror = () => reject(req.error)
      })
    } else {
      const stores = Object.values(CACHE_CONFIG.STORES)
      const promises = stores.map((s) => this.clearIndexedDB(s))
      await Promise.all(promises)
    }
  }
  async getStatsIndexedDB() {
    const stores = Object.values(CACHE_CONFIG.STORES)
    const stats = { total: 0, categories: {} }
    for (const s of stores) {
      try {
        if (s === 'popular') {
          stats.categories[s] = 0
          continue
        }
        const count = await this.getStoreCount(s)
        stats.categories[s] = count
        stats.total += count
      } catch {
        stats.categories[s] = 0
      }
    }
    return stats
  }
  async enforceArchiveLimits() {
    try {
      await this.enforceLimit(
        CACHE_CONFIG.STORES.ACTORS_ARCHIVE,
        CACHE_CONFIG.LIMITS.MAX_ARCHIVE_ACTORS
      )
      await this.enforceLimit(
        CACHE_CONFIG.STORES.MOVIES_ARCHIVE,
        CACHE_CONFIG.LIMITS.MAX_ARCHIVE_MOVIES
      )
      await this.enforceLimit(
        CACHE_CONFIG.STORES.TV_SHOWS_ARCHIVE,
        CACHE_CONFIG.LIMITS.MAX_ARCHIVE_TV_SHOWS
      )
    } catch (e) {
      log('error', `Failed to enforce archive limits: ${e.message}`)
    }
  }
  async enforceLimit(storeName, maxItems) {
    if (!this.isIndexedDBSupported || !this.db || !maxItems) return
    const count = await this.getStoreCount(storeName)
    if (count <= maxItems) return
    const toRemove = count - maxItems
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], 'readwrite')
      const store = tx.objectStore(storeName)
      const index = store.index('timestamp')
      const req = index.openCursor()
      let removed = 0
      req.onsuccess = (e) => {
        const cursor = e.target.result
        if (cursor && removed < toRemove) {
          cursor.delete()
          removed++
          cursor.continue()
        } else {
          resolve()
        }
      }
      req.onerror = () => reject(req.error)
    })
  }
  async getStoreCount(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], 'readonly')
      const store = tx.objectStore(storeName)
      const req = store.count()
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }
  async cleanupIndexedDB() {
    const stores = Object.values(CACHE_CONFIG.STORES)
    let totalCleaned = 0
    for (const s of stores) {
      try {
        const cleaned = await this.cleanupStore(s)
        totalCleaned += cleaned
      } catch (e) {
        log('error', `Failed to cleanup store ${s}: ${e.message}`)
      }
    }
    if (totalCleaned > 0) log('info', `Cleaned up ${totalCleaned} expired items from IndexedDB`)
  }
  async cleanupStore(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], 'readwrite')
      const store = tx.objectStore(storeName)
      const index = store.index('timestamp')
      const req = index.openCursor()
      let cleaned = 0
      req.onsuccess = (e) => {
        const cursor = e.target.result
        if (cursor) {
          const item = cursor.value
          if (this.isExpired(item)) {
            cursor.delete()
            cleaned++
          }
          cursor.continue()
        } else {
          resolve(cleaned)
        }
      }
      req.onerror = () => reject(req.error)
    })
  }
  setLocalStorage(key, cacheItem) {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem))
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        this.handleStorageQuotaExceeded()
        localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem))
      }
    }
  }
  getLocalStorage(key) {
    try {
      const item = localStorage.getItem(`cache_${key}`)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  }
  deleteLocalStorage(key) {
    try {
      localStorage.removeItem(`cache_${key}`)
    } catch {}
  }
  clearLocalStorage(category = null) {
    try {
      if (category) {
        const keys = Object.keys(localStorage)
        keys.forEach((key) => {
          if (key.startsWith('cache_')) {
            try {
              const item = JSON.parse(localStorage.getItem(key))
              if (item.category === category) localStorage.removeItem(key)
            } catch {
              localStorage.removeItem(key)
            }
          }
        })
      } else {
        const keys = Object.keys(localStorage)
        keys.forEach((key) => {
          if (key.startsWith('cache_')) localStorage.removeItem(key)
        })
      }
    } catch (e) {
      log('error', `Failed to clear localStorage: ${e.message}`)
    }
  }
  getStatsLocalStorage() {
    const keys = Object.keys(localStorage)
    const cacheKeys = keys.filter((k) => k.startsWith('cache_'))
    const stats = { total: cacheKeys.length, categories: {} }
    cacheKeys.forEach((key) => {
      try {
        const item = JSON.parse(localStorage.getItem(key))
        const category = item.category || 'general'
        stats.categories[category] = (stats.categories[category] || 0) + 1
      } catch {
        stats.categories.general = (stats.categories.general || 0) + 1
      }
    })
    return stats
  }
  cleanupLocalStorage() {
    const keys = Object.keys(localStorage)
    let cleaned = 0
    keys.forEach((key) => {
      if (key.startsWith('cache_')) {
        try {
          const item = JSON.parse(localStorage.getItem(key))
          if (this.isExpired(item)) {
            localStorage.removeItem(key)
            cleaned++
          }
        } catch {
          localStorage.removeItem(key)
          cleaned++
        }
      }
    })
    if (cleaned > 0) log('info', `Cleaned up ${cleaned} expired items from localStorage`)
  }
  isExpired(ci) {
    if (!ci.expiration) return false
    return Date.now() > ci.expiration
  }
  getDefaultExpiration(category) {
    switch (category) {
      case CACHE_CONFIG.CATEGORIES.ACTORS:
        return Date.now() + CACHE_CONFIG.EXPIRATION.ACTORS
      case CACHE_CONFIG.CATEGORIES.MOVIES:
        return Date.now() + CACHE_CONFIG.EXPIRATION.MOVIES
      case CACHE_CONFIG.CATEGORIES.TV_SHOWS:
        return Date.now() + CACHE_CONFIG.EXPIRATION.TV_SHOWS
      case CACHE_CONFIG.CATEGORIES.ACTORS_ARCHIVE:
      case CACHE_CONFIG.CATEGORIES.MOVIES_ARCHIVE:
      case CACHE_CONFIG.CATEGORIES.TV_SHOWS_ARCHIVE:
        return null
      case CACHE_CONFIG.CATEGORIES.SEARCH:
        return Date.now() + CACHE_CONFIG.EXPIRATION.SEARCH_RESULTS
      case CACHE_CONFIG.CATEGORIES.POPULAR:
        return Date.now() + CACHE_CONFIG.EXPIRATION.POPULAR_LISTS
      default:
        return Date.now() + CACHE_CONFIG.EXPIRATION.ACTORS
    }
  }
  handleStorageQuotaExceeded() {
    log('warn', ERROR_MESSAGES.STORAGE_QUOTA_EXCEEDED)
    this.removeOldestItems()
  }
  removeOldestItems() {
    try {
      if (this.isIndexedDBSupported && this.db) {
        this.removeOldestItemsIndexedDB()
      } else {
        this.removeOldestItemsLocalStorage()
      }
    } catch (e) {
      log('error', `Failed to remove oldest items: ${e.message}`)
    }
  }
  async removeOldestItemsIndexedDB() {
    const stores = Object.values(CACHE_CONFIG.STORES)
    for (const s of stores) {
      try {
        const tx = this.db.transaction([s], 'readwrite')
        const store = tx.objectStore(s)
        const index = store.index('timestamp')
        const req = index.openCursor()
        req.onsuccess = (e) => {
          const cursor = e.target.result
          if (cursor) {
            cursor.delete()
            cursor.continue()
          }
        }
      } catch (e) {
        log('error', `Failed to remove oldest items from ${s}: ${e.message}`)
      }
    }
  }
  removeOldestItemsLocalStorage() {
    const keys = Object.keys(localStorage)
    const cacheKeys = keys.filter((k) => k.startsWith('cache_'))
    const items = cacheKeys
      .map((key) => {
        try {
          const item = JSON.parse(localStorage.getItem(key))
          return { key, timestamp: item.timestamp || 0 }
        } catch {
          return { key, timestamp: 0 }
        }
      })
      .sort((a, b) => a.timestamp - b.timestamp)
    const toRemove = Math.ceil(items.length * 0.1)
    items.slice(0, toRemove).forEach((item) => {
      localStorage.removeItem(item.key)
    })
  }
  async getOrSet(key, apiCallFn, category = 'general', expiration = null) {
    if (await this.has(key, category)) return await this.get(key, category)
    try {
      const data = await apiCallFn()
      await this.set(key, data, category, expiration)
      return data
    } catch (e) {
      log('error', `API call failed for ${key}: ${e.message}`)
      throw e
    }
  }
  async batchGet(keys, apiCallFn, category = 'general') {
    const results = {},
      missing = []
    for (const k of keys) {
      if (await this.has(k, category)) results[k] = await this.get(k, category)
      else missing.push(k)
    }
    if (missing.length > 0) {
      log('info', `Batch API call for ${missing.length} missing items`)
      try {
        const apiResults = await apiCallFn(missing)
        for (const k of missing) {
          if (apiResults[k]) {
            await this.set(k, apiResults[k], category)
            results[k] = apiResults[k]
          }
        }
      } catch (e) {
        log('error', `Batch API call failed: ${e.message}`)
        throw e
      }
    }
    return results
  }
}

const enhancedCacheService = new EnhancedCacheService()
setInterval(
  () => {
    enhancedCacheService.cleanup()
  },
  60 * 60 * 1000
)
if (typeof window !== 'undefined' && import.meta.env && import.meta.env.DEV) {
  window.enhancedCacheService = enhancedCacheService
  log('info', 'Enhanced Cache Service exposed globally as window.enhancedCacheService')
}
export default enhancedCacheService
