import { log } from '../services/ui/log.ts'
class UtilityService {
  constructor() {
    this.debounceTimers = new Map()
    this.throttleTimers = new Map()
    this.cache = new Map()
    this.cacheExpiry = 5 * 60 * 1000
  }
  initialize() {
    this.setupCacheCleanup()
    log(602, { count: 'Utility Service initialized' })
  }
  setupCacheCleanup() {
    setInterval(() => {
      this.cleanupExpiredCache()
    }, this.cacheExpiry)
  }
  cleanupExpiredCache() {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (value.expiry < now) this.cache.delete(key)
    }
  }
  debounce(key, func, delay = 300) {
    if (this.debounceTimers.has(key)) clearTimeout(this.debounceTimers.get(key))
    const t = setTimeout(() => {
      func()
      this.debounceTimers.delete(key)
    }, delay)
    this.debounceTimers.set(key, t)
  }
  throttle(key, func, delay = 300) {
    if (this.throttleTimers.has(key)) return
    func()
    const t = setTimeout(() => {
      this.throttleTimers.delete(key)
    }, delay)
    this.throttleTimers.set(key, t)
  }
  generateId(prefix = 'item') {
    const ts = Date.now()
    const r = Math.random().toString(36).substr(2, 9)
    return `${prefix}-${ts}-${r}`
  }
  generateShortId(prefix = 'item') {
    const ts = Date.now().toString(36)
    const r = Math.random().toString(36).substr(2, 4)
    return `${prefix}-${ts}-${r}`
  }
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime())
    if (Array.isArray(obj)) return obj.map((i) => this.deepClone(i))
    const c = {}
    for (const k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) c[k] = this.deepClone(obj[k])
    }
    return c
  }
  deepMerge(target, source) {
    const r = { ...target }
    for (const k in source) {
      if (Object.prototype.hasOwnProperty.call(source, k)) {
        if (source[k] && typeof source[k] === 'object' && !Array.isArray(source[k]))
          r[k] = this.deepMerge(r[k] || {}, source[k])
        else r[k] = source[k]
      }
    }
    return r
  }
  isEqual(a, b) {
    if (a === b) return true
    if (a == null || b == null) return false
    if (a.constructor !== b.constructor) return false
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false
      for (let i = 0; i < a.length; i++) {
        if (!this.isEqual(a[i], b[i])) return false
      }
      return true
    }
    if (typeof a === 'object' && typeof b === 'object') {
      const k1 = Object.keys(a),
        k2 = Object.keys(b)
      if (k1.length !== k2.length) return false
      for (const k of k1) {
        if (!k2.includes(k)) return false
        if (!this.isEqual(a[k], b[k])) return false
      }
      return true
    }
    return false
  }
  formatDate(date, format = 'medium') {
    if (!date) return 'Unknown'
    const d = new Date(date)
    if (isNaN(d.getTime())) return 'Invalid Date'
    switch (format) {
      case 'short':
        return d.toLocaleDateString()
      case 'medium':
        return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
      case 'long':
        return d.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      case 'time':
        return d.toLocaleTimeString()
      case 'datetime':
        return d.toLocaleString()
      default:
        return d.toLocaleDateString()
    }
  }
  formatDuration(ms, format = 'auto') {
    if (!ms || ms < 0) return '0s'
    const s = Math.floor(ms / 1000),
      m = Math.floor(s / 60),
      h = Math.floor(m / 60),
      d = Math.floor(h / 24)
    switch (format) {
      case 'seconds':
        return `${s}s`
      case 'minutes':
        return `${m}m ${s % 60}s`
      case 'hours':
        return `${h}h ${m % 60}m`
      case 'days':
        return `${d}d ${h % 24}h`
      case 'auto':
      default:
        if (d > 0) return `${d}d ${h % 24}h`
        if (h > 0) return `${h}h ${m % 60}m`
        if (m > 0) return `${m}m ${s % 60}s`
        return `${s}s`
    }
  }
  capitalize(str) {
    if (!str || typeof str !== 'string') return str
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }
  toTitleCase(str) {
    if (!str || typeof str !== 'string') return str
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
  }
  toKebabCase(str) {
    if (!str || typeof str !== 'string') return str
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase()
  }
  toCamelCase(str) {
    if (!str || typeof str !== 'string') return str
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (w, i) => (i === 0 ? w.toLowerCase() : w.toUpperCase()))
      .replace(/\s+/g, '')
  }
  toSnakeCase(str) {
    if (!str || typeof str !== 'string') return str
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase()
  }
  truncate(str, length = 50, suffix = '...') {
    if (!str || typeof str !== 'string') return str
    if (str.length <= length) return str
    return str.substring(0, length - suffix.length) + suffix
  }
  random(min = 0, max = 1) {
    return Math.random() * (max - min) + min
  }
  randomInt(min = 0, max = 100) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
  randomPick(array) {
    if (!Array.isArray(array) || array.length === 0) return null
    return array[Math.floor(Math.random() * array.length)]
  }
  shuffle(array) {
    if (!Array.isArray(array)) return array
    const s = [...array]
    for (let i = s.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[s[i], s[j]] = [s[j], s[i]]
    }
    return s
  }
  unique(array, key = null) {
    if (!Array.isArray(array)) return array
    if (key) {
      const seen = new Set()
      return array.filter((item) => {
        const v = item[key]
        if (seen.has(v)) return false
        seen.add(v)
        return true
      })
    }
    return [...new Set(array)]
  }
  groupBy(array, key) {
    if (!Array.isArray(array) || !key) return {}
    return array.reduce((g, item) => {
      const grp = item[key]
      if (!g[grp]) g[grp] = []
      g[grp].push(item)
      return g
    }, {})
  }
  sortBy(array, key, direction = 'asc') {
    if (!Array.isArray(array) || !key) return array
    const sorted = [...array].sort((a, b) => {
      let av = a[key],
        bv = b[key]
      if (av == null) av = direction === 'asc' ? Infinity : -Infinity
      if (bv == null) bv = direction === 'asc' ? Infinity : -Infinity
      if (av < bv) return direction === 'asc' ? -1 : 1
      if (av > bv) return direction === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }
  filterBy(array, filters) {
    if (!Array.isArray(array) || !filters) return array
    return array.filter((item) =>
      Object.entries(filters).every(([k, v]) => {
        if (v == null) return true
        if (typeof v === 'function') return v(item[k])
        if (Array.isArray(v)) return v.includes(item[k])
        if (typeof v === 'object') {
          return Object.entries(v).every(([op, val]) => {
            switch (op) {
              case 'eq':
                return item[k] === val
              case 'ne':
                return item[k] !== val
              case 'gt':
                return item[k] > val
              case 'gte':
                return item[k] >= val
              case 'lt':
                return item[k] < val
              case 'lte':
                return item[k] <= val
              case 'contains':
                return String(item[k]).includes(val)
              case 'startsWith':
                return String(item[k]).startsWith(val)
              case 'endsWith':
                return String(item[k]).endsWith(val)
              default:
                return true
            }
          })
        }
        return item[k] === v
      })
    )
  }
  memoize(func, keyGen = null) {
    return (...args) => {
      const key = keyGen ? keyGen(...args) : JSON.stringify(args)
      if (this.cache.has(key)) {
        const c = this.cache.get(key)
        if (c.expiry > Date.now()) return c.value
        this.cache.delete(key)
      }
      const result = func(...args)
      this.cache.set(key, { value: result, expiry: Date.now() + this.cacheExpiry })
      return result
    }
  }
  async retry(func, maxAttempts = 3, baseDelay = 1000) {
    let last
    for (let a = 1; a <= maxAttempts; a++) {
      try {
        return await func()
      } catch (e) {
        last = e
        if (a === maxAttempts) throw e
        const delay = baseDelay * Math.pow(2, a - 1)
        await this.sleep(delay)
      }
    }
    throw last
  }
  sleep(ms) {
    return new Promise((r) => setTimeout(r, ms))
  }
  getStats() {
    return {
      cacheSize: this.cache.size,
      debounceTimers: this.debounceTimers.size,
      throttleTimers: this.throttleTimers.size,
      cacheExpiry: this.cacheExpiry,
    }
  }
  clearAll() {
    for (const t of this.debounceTimers.values()) clearTimeout(t)
    this.debounceTimers.clear()
    for (const t of this.throttleTimers.values()) clearTimeout(t)
    this.throttleTimers.clear()
    this.cache.clear()
    log(602, { count: 'All utility caches and timers cleared' })
  }
  cleanup() {
    this.clearAll()
    log(602, { count: 'Utility Service cleaned up' })
  }
}

export default new UtilityService()
