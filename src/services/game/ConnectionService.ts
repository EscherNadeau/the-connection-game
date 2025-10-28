import { log } from '../ui/log.ts'
import {
  MEDIA_TYPES,
  normalizeMediaType,
  isPersonType,
  isMediaType,
} from '../../utils/constants.ts'
import tmdbCache from '../cache/tmdbCache.ts'
import { shortestPathLength } from '../../utils/graph.ts'
import type { GameItem, Connection, TMDBCredits } from '../../types/game'

class ConnectionService {
  private gameItems: GameItem[] = []
  private connections: Connection[] = []
  private gameOptions: any = null

  initialize(gameOptions: any, gameItems: GameItem[], connections: Connection[]): void {
    this.gameOptions = gameOptions
    this.gameItems = gameItems
    this.connections = connections
    log(602, { count: 'Connection Service initialized' })
  }

  updateGameState(gameItems: GameItem[], connections: Connection[]): void {
    this.gameItems = gameItems
    this.connections = connections
  }

  /**
   * Check if two items can be connected
   */
  canItemsConnect(item1: GameItem, item2: GameItem): boolean {
    if (!item1.type || !item2.type) {
      log(1004, { state: `Type check failed: item1.type=${item1.type}, item2.type=${item2.type}` })
      log(2001, { state: { item1, item2 } })
      return false
    }
    const type1 = normalizeMediaType(item1.type)
    const type2 = normalizeMediaType(item2.type)
    log(2000, {
      message: `Checking connection: ${item1.name} (${type1}) ↔ ${item2.name} (${type2})`,
    })
    const isPerson1 = isPersonType(type1)
    const isPerson2 = isPersonType(type2)
    const isMedia1 = isMediaType(type1)
    const isMedia2 = isMediaType(type2)
    const canConnect = (isPerson1 && isMedia2) || (isPerson2 && isMedia1)
    log(2000, {
      message: `Type check: Person1=${isPerson1}, Person2=${isPerson2}, Media1=${isMedia1}, Media2=${isMedia2}`,
    })
    log(2000, { message: `Result: ${canConnect ? 'CAN CONNECT' : 'CANNOT CONNECT'}` })
    return canConnect
  }

  /**
   * Check if two items are related (using TMDB data)
   */
  async checkIfItemsAreRelated(item1: GameItem, item2: GameItem): Promise<boolean> {
    if (!item1.type || !item2.type) {
      log(1004, { state: `Type check failed: item1.type=${item1.type}, item2.type=${item2.type}` })
      return false
    }
    const item1Id = item1.tmdbId || item1.tmdbData?.id
    const item2Id = item2.tmdbId || item2.tmdbData?.id
    if (!item1Id || !item2Id) {
      log(1004, { state: `TMDB ID check failed: item1.id=${item1Id}, item2.id=${item2Id}` })
      return false
    }
    try {
      const type1 = normalizeMediaType(item1.type)
      const type2 = normalizeMediaType(item2.type)
      log(2000, {
        message: `Checking relationship: ${item1.name} (${type1}) ↔ ${item2.name} (${type2})`,
      })
      const isPerson1 = isPersonType(type1)
      const isPerson2 = isPersonType(type2)
      const isMedia1 = isMediaType(type1)
      const isMedia2 = isMediaType(type2)
      if (!((isPerson1 && isMedia2) || (isPerson2 && isMedia1))) {
        log(2000, { message: `Type mismatch - cannot be related` })
        return false
      }
      let personItem, mediaItem
      if (isPerson1) {
        personItem = item1
        mediaItem = item2
      } else {
        personItem = item2
        mediaItem = item1
      }
      const personId = personItem.tmdbId || personItem.tmdbData?.id
      const mediaId = mediaItem.tmdbId || mediaItem.tmdbData?.id
      const mediaType = normalizeMediaType(mediaItem.type)
      log(2000, {
        message: `Checking relationship: Person ${personItem.name || personItem.title} (ID: ${personId}, Type: ${personItem.type}) ↔ Media ${mediaItem.name || mediaItem.title} (ID: ${mediaId}, Type: ${mediaType})`,
      })
      let areRelated = false

      // Fast path: person-centric check via filmography avoids fetching huge casts (e.g., long-running TV shows)
      try {
        const actorData =
          (await tmdbCache.getActorWithFilmographyCached(personId)) ||
          (await tmdbCache.getActorWithFilmography(personId, false))
        const filmography = Array.isArray(actorData?.filmography) ? actorData.filmography : []
        if (filmography.length > 0) {
          const found = filmography.some(
            (cr) => String(cr.id) === String(mediaId) && normalizeMediaType(cr.media_type) === mediaType
          )
          if (found) {
            log(2000, { message: 'Relationship confirmed via person filmography (fast path)' })
            areRelated = true
          }
        }
      } catch (_) {}

      // Fallback: fetch media cast if not confirmed via filmography
      if (!areRelated) {
        if (mediaType === 'movie') {
          const movieCached = await tmdbCache.getMovieWithCastCached(mediaId)
          if (movieCached && movieCached.cast && movieCached.cast.length > 0) {
            areRelated = !!movieCached.cast.some((c) => String(c.id) === String(personId))
          } else {
            const movieFresh = await tmdbCache.getMovieWithCast(mediaId)
            areRelated = !!movieFresh?.cast?.some((c) => String(c.id) === String(personId))
          }
        } else if (mediaType === 'tv') {
          const tvCached = await tmdbCache.getTVShowWithCastCached(mediaId)
          if (tvCached && tvCached.cast && tvCached.cast.length > 0) {
            areRelated = !!tvCached.cast.some((c) => String(c.id) === String(personId))
          } else {
            const tvFresh = await tmdbCache.getTVShowWithCast(mediaId)
            areRelated = !!tvFresh?.cast?.some((c) => String(c.id) === String(personId))
          }
        } else {
          areRelated = await this.checkPersonInMedia(personId, mediaId, mediaType)
        }
      }
      try {
        if (areRelated) {
          const fromId = String(personId)
          const toId = String(mediaId)
          await tmdbCache.findConnections(
            { id: fromId, media_type: 'person', name: personItem.name || personItem.title },
            {
              id: toId,
              media_type: mediaType === 'movie' ? 'movie' : 'tv',
              title: mediaItem.title || mediaItem.name,
            }
          )
        }
      } catch {}
      log(2000, { message: `Relationship check result: ${areRelated ? 'RELATED' : 'NOT RELATED'}` })
      return areRelated
    } catch (error) {
      log(1001, { error: `Error checking relationship: ${error.message}` })
      return false
    }
  }

  /**
   * Create a connection between two items
   * @param {GameItem} sourceItem - Source item
   * @param {GameItem} targetItem - Target item
   * @returns {Connection} Created connection
   */
  createConnection(sourceItem, targetItem) {
    const connection = {
      id: `conn-${Date.now()}-${Math.random()}`,
      from: sourceItem.id,
      to: targetItem.id,
      fromItem: sourceItem,
      toItem: targetItem,
    }
    log(602, { count: `Connection created: ${sourceItem.name} → ${targetItem.name}` })
    return connection
  }

  addConnection(connection) {
    this.connections.push(connection)
    log(602, { count: `Connection added to array. Total connections: ${this.connections.length}` })
  }
  removeConnection(connectionId) {
    const i = this.connections.findIndex((c) => c.id === connectionId)
    if (i !== -1) {
      const r = this.connections.splice(i, 1)[0]
      log(602, { count: `Connection removed: ${r.from} → ${r.to}` })
      return r
    }
    return null
  }
  areItemsDirectlyConnected(item1, item2) {
    return this.connections.some(
      (conn) =>
        (conn.from === item1.id && conn.to === item2.id) ||
        (conn.from === item2.id && conn.to === item1.id)
    )
  }
  checkPathBetweenItems(startItem, endItem) {
    log(3234, {
      message: 'Path check: Looking for path from',
      start: startItem.name,
      end: endItem.name,
    })
    const d = shortestPathLength(startItem.id, endItem.id, this.connections)
    const found = d >= 0
    log(found ? 3248 : 3249, { message: found ? 'Path found!' : 'No path found', length: d })
    return found
  }
  getConnectedItems(itemId) {
    const ids = new Set()
    this.connections.forEach((c) => {
      if (c.from === itemId) ids.add(c.to)
      else if (c.to === itemId) ids.add(c.from)
    })
    return this.gameItems.filter((i) => ids.has(i.id))
  }
  countConnectedItems() {
    const ids = new Set()
    this.connections.forEach((c) => {
      ids.add(c.from)
      ids.add(c.to)
    })
    return ids.size
  }
  countUnconnectedItems() {
    const ids = new Set()
    this.connections.forEach((c) => {
      ids.add(c.from)
      ids.add(c.to)
    })
    return this.gameItems.filter((i) => !ids.has(i.id)).length
  }
  getConnectionsForItem(itemId) {
    return this.connections.filter((c) => c.from === itemId || c.to === itemId)
  }
  async checkPersonInMedia(personId, mediaId, mediaType) {
    try {
      log(2000, { message: `Checking if person ${personId} was in ${mediaType} ${mediaId}` })
      let credits
      if (mediaType === 'movie' || mediaType === 'film') {
        const movie = await tmdbCache.getMovieWithCast(mediaId)
        credits = movie ? { cast: movie.cast || [] } : null
      } else if (mediaType === 'tv' || mediaType === 'tv show' || mediaType === 'tv-show') {
        const tv = await tmdbCache.getTVShowWithCast(mediaId)
        credits = tv ? { cast: tv.cast || [] } : null
      } else {
        log(1004, { state: `Unknown media type: ${mediaType}` })
        return false
      }
      if (!credits || !credits.cast) {
        log(2000, { message: `No credits found for ${mediaType} ${mediaId}` })
        return false
      }
      const personIdNum = parseInt(personId)
      const personInCast = credits.cast.some((c) => {
        const castId = c.id
        return (
          (personIdNum && !isNaN(personIdNum) && castId === personIdNum) ||
          castId.toString() === personId.toString()
        )
      })
      log(2000, { message: `Person ${personId} (${typeof personId}) in cast: ${personInCast}` })
      log(2000, {
        message: `Cast member IDs: ${credits.cast
          .slice(0, 5)
          .map((m) => m.id)
          .join(', ')}`,
      })
      return personInCast
    } catch (error) {
      log(1001, { error: `Error checking person in media: ${error.message}` })
      return false
    }
  }
  // normalizeMediaType helper is imported; no wrapper needed
  hasConnections(itemId) {
    return this.connections.some((c) => c.from === itemId || c.to === itemId)
  }
  getConnectionCount(itemId) {
    return this.getConnectionsForItem(itemId).length
  }
  wouldCreateCycle(sourceItem, targetItem) {
    const temp = this.createConnection(sourceItem, targetItem)
    this.connections.push(temp)
    const hasCycle = this.checkPathBetweenItems(targetItem, sourceItem)
    this.connections.pop()
    return hasCycle
  }
  getConnectedComponent(startItemId) {
    const visited = new Set()
    const component = []
    const queue = [startItemId]
    visited.add(startItemId)
    while (queue.length > 0) {
      const currentId = queue.shift()
      const currentItem = this.gameItems.find((item) => item.id === currentId)
      if (currentItem) component.push(currentItem)
      const conns = this.getConnectionsForItem(currentId)
      conns.forEach((conn) => {
        const nextId = conn.from === currentId ? conn.to : conn.from
        if (!visited.has(nextId)) {
          visited.add(nextId)
          queue.push(nextId)
        }
      })
    }
    return component
  }
  clearAllConnections() {
    const count = this.connections.length
    this.connections = []
    log(602, { count: `Cleared ${count} connections` })
  }
  getConnectionStats() {
    const totalItems = this.gameItems.length
    const connectedItems = this.countConnectedItems()
    const unconnectedItems = this.countUnconnectedItems()
    const totalConnections = this.connections.length
    return {
      totalItems,
      connectedItems,
      unconnectedItems,
      totalConnections,
      averageConnectionsPerItem: totalItems > 0 ? totalConnections / totalItems : 0,
      connectionDensity:
        totalItems > 1 ? totalConnections / ((totalItems * (totalItems - 1)) / 2) : 0,
    }
  }
  validateConnections() {
    const errors = []
    this.connections.forEach((conn, index) => {
      const fromItem = this.gameItems.find((item) => item.id === conn.from)
      const toItem = this.gameItems.find((item) => item.id === conn.to)
      if (!fromItem) errors.push(`Connection ${index}: from item ${conn.from} not found`)
      if (!toItem) errors.push(`Connection ${index}: to item ${conn.to} not found`)
      if (conn.from === conn.to) errors.push(`Connection ${index}: self-connection detected`)
    })
    const connectionStrings = this.connections.map((conn) => `${conn.from}-${conn.to}`)
    const unique = new Set(connectionStrings)
    if (connectionStrings.length !== unique.size) errors.push('Duplicate connections detected')
    return { isValid: errors.length === 0, errors }
  }
}

export default new ConnectionService()
