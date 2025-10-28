import { log } from './ui/log.ts'
import enhancedCacheService from './cache/enhancedCacheService.ts'

class CacheService {
  constructor() {
    this.backend = enhancedCacheService
  }

  has(key) {
    return this.backend.has(key, 'general')
  }

  async get(key) {
    return await this.backend.get(key, 'general')
  }

  async set(key, data) {
    return await this.backend.set(key, data, 'general')
  }

  async update(key, updateFn) {
    const currentData = await this.get(key)
    const updatedData = updateFn(currentData)
    await this.set(key, updatedData)
    return updatedData
  }

  async delete(key) {
    return await this.backend.delete(key, 'general')
  }

  async clear(category = null) {
    return await this.backend.clear(category)
  }

  async getStats() {
    return await this.backend.getStats()
  }

  async cleanup() {
    return await this.backend.cleanup()
  }

  async getOrSet(key, apiCallFn) {
    return await this.backend.getOrSet(key, apiCallFn, 'general')
  }

  async batchGet(keys, apiCallFn) {
    return await this.backend.batchGet(keys, apiCallFn, 'general')
  }

  // Removed legacy file persistence methods
}

// Create and export a single instance
const cacheService = new CacheService()

// Expose to global scope for debugging (dev only)
if (typeof window !== 'undefined' && import.meta.env && import.meta.env.DEV) {
  window.cacheService = cacheService
  window.enhancedCacheService = enhancedCacheService
}

export default cacheService
