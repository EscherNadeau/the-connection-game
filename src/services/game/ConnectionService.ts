import { log, debug, warn, error as logError } from '../ui/log'
import {
  MEDIA_TYPES,
  normalizeMediaType,
  isPersonType,
  isMediaType,
} from '../../utils/constants'
import tmdbCache from '../cache/tmdbCache'
import { shortestPathLength } from '../../utils/graph'
import type { GameItem, Connection, TMDBCredits, GameOptions } from '../../types/game'

class ConnectionService {
  private gameItems: GameItem[] = []
  private connections: Connection[] = []
  private gameOptions: GameOptions | null = null

  /**
   * Initialize the connection service with game state
   * @param gameOptions - Game configuration options
   * @param gameItems - Array of game items
   * @param connections - Array of connections
   */
  initialize(gameOptions: GameOptions, gameItems: GameItem[], connections: Connection[]): void {
    this.gameOptions = gameOptions
    this.gameItems = gameItems
    this.connections = connections
    debug('Connection Service initialized', { itemCount: gameItems.length, connectionCount: connections.length })
  }

  /**
   * Update game state with new items and connections
   * @param gameItems - Updated array of game items
   * @param connections - Updated array of connections
   */
  updateGameState(gameItems: GameItem[], connections: Connection[]): void {
    this.gameItems = gameItems
    this.connections = connections
  }

  /**
   * Check if two items can be connected based on their types
   * @param item1 - First game item
   * @param item2 - Second game item
   * @returns True if items can be connected (person ↔ media)
   */
  canItemsConnect(item1: GameItem, item2: GameItem): boolean {
    if (!item1.type || !item2.type) {
      warn('Type check failed', { item1Type: item1.type, item2Type: item2.type, item1, item2 })
      return false
    }
    const type1 = normalizeMediaType(item1.type)
    const type2 = normalizeMediaType(item2.type)
    debug('Checking connection', { 
      item1: item1.name, 
      type1, 
      item2: item2.name, 
      type2 
    })
    const isPerson1 = isPersonType(type1)
    const isPerson2 = isPersonType(type2)
    const isMedia1 = isMediaType(type1)
    const isMedia2 = isMediaType(type2)
    const canConnect = (isPerson1 && isMedia2) || (isPerson2 && isMedia1)
    debug('Connection type check', {
      isPerson1,
      isPerson2,
      isMedia1,
      isMedia2,
      canConnect
    })
    return canConnect
  }

  /**
   * Get character name for a person-media connection
   * @param personItem - Person item
   * @param mediaItem - Media item (movie/tv)
   * @returns Character name or null
   */
  async getCharacterName(personItem: GameItem, mediaItem: GameItem): Promise<string | null> {
    try {
      const personId = personItem.tmdbData?.id || personItem.tmdbId
      const mediaId = mediaItem.tmdbData?.id || mediaItem.tmdbId
      const mediaType = normalizeMediaType(mediaItem.type)

      if (!personId || !mediaId) return null

      // Try to get from movie cast
      if (mediaType === 'movie') {
        const movieData = await tmdbCache.getMovieWithCastCached(mediaId) || 
                          await tmdbCache.getMovieWithCast(mediaId)
        if (movieData?.cast) {
          const castMember = movieData.cast.find((c: { id: number; character?: string }) => 
            String(c.id) === String(personId)
          )
          if (castMember?.character) {
            return castMember.character
          }
        }
      } 
      // Try to get from TV cast
      else if (mediaType === 'tv') {
        const tvData = await tmdbCache.getTVShowWithCastCached(mediaId) || 
                       await tmdbCache.getTVShowWithCast(mediaId)
        if (tvData?.cast) {
          const castMember = tvData.cast.find((c: { id: number; character?: string }) => 
            String(c.id) === String(personId)
          )
          if (castMember?.character) {
            return castMember.character
          }
        }
      }

      // Fallback: check person's filmography
      const actorData = await tmdbCache.getActorWithFilmographyCached(personId) ||
                        await tmdbCache.getActorWithFilmography(personId, false)
      if (actorData?.filmography) {
        const credit = actorData.filmography.find(
          (cr: { id: number; media_type: string; character?: string }) => 
            String(cr.id) === String(mediaId) && normalizeMediaType(cr.media_type) === mediaType
        )
        if (credit?.character) {
          return credit.character
        }
      }

      return null
    } catch (err) {
      debug('Failed to get character name', { error: err })
      return null
    }
  }

  /**
   * Check if two items are related using TMDB data
   * @param item1 - First game item
   * @param item2 - Second game item
   * @returns True if items are related (person appears in media)
   */
  async checkIfItemsAreRelated(item1: GameItem, item2: GameItem): Promise<boolean> {
    if (!item1.type || !item2.type) {
      warn('Type check failed for relationship check', { item1Type: item1.type, item2Type: item2.type })
      return false
    }
    const item1Id = item1.tmdbId || item1.tmdbData?.id
    const item2Id = item2.tmdbId || item2.tmdbData?.id
    if (!item1Id || !item2Id) {
      warn('TMDB ID check failed', { item1Id, item2Id })
      return false
    }
    try {
      const type1 = normalizeMediaType(item1.type)
      const type2 = normalizeMediaType(item2.type)
      debug('Checking relationship', {
        item1: item1.name,
        type1,
        item2: item2.name,
        type2
      })
      const isPerson1 = isPersonType(type1)
      const isPerson2 = isPersonType(type2)
      const isMedia1 = isMediaType(type1)
      const isMedia2 = isMediaType(type2)
      if (!((isPerson1 && isMedia2) || (isPerson2 && isMedia1))) {
        debug('Type mismatch - cannot be related')
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
      debug('Checking relationship details', {
        person: personItem.name || personItem.title,
        personId,
        personType: personItem.type,
        media: mediaItem.name || mediaItem.title,
        mediaId,
        mediaType
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
            debug('Relationship confirmed via person filmography (fast path)')
            areRelated = true
          }
        }
      } catch (err) {
        debug('Filmography check failed, will try fallback', { error: err })
      }

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
      } catch (err) {
        debug('Failed to cache connection in TMDB cache', { error: err })
      }
      debug('Relationship check result', { areRelated })
      return areRelated
    } catch (err) {
      logError('Error checking relationship', { 
        error: err instanceof Error ? err.message : String(err),
        item1: item1.name,
        item2: item2.name
      })
      return false
    }
  }

  /**
   * Create a connection between two items
   * @param sourceItem - Source item
   * @param targetItem - Target item
   * @returns Created connection object
   */
  createConnection(sourceItem: GameItem, targetItem: GameItem): Connection {
    const connection: Connection = {
      id: `conn-${Date.now()}-${Math.random()}`,
      from: sourceItem.id,
      to: targetItem.id,
      fromItem: sourceItem,
      toItem: targetItem,
    }
    debug('Connection created', { 
      from: sourceItem.name, 
      to: targetItem.name,
      connectionId: connection.id
    })
    return connection
  }

  /**
   * Add a connection to the connections array
   * @param connection - Connection to add
   */
  addConnection(connection: Connection): void {
    this.connections.push(connection)
    debug('Connection added', { 
      totalConnections: this.connections.length,
      connectionId: connection.id
    })
  }

  /**
   * Remove a connection by ID
   * @param connectionId - ID of connection to remove
   * @returns Removed connection or null if not found
   */
  removeConnection(connectionId: string): Connection | null {
    const i = this.connections.findIndex((c) => c.id === connectionId)
    if (i !== -1) {
      const r = this.connections.splice(i, 1)[0]
      debug('Connection removed', { from: r.from, to: r.to, connectionId })
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
  /**
   * Check if a path exists between two items
   * @param startItem - Starting item
   * @param endItem - Ending item
   * @returns True if a path exists between the items
   */
  checkPathBetweenItems(startItem: GameItem, endItem: GameItem): boolean {
    debug('Path check', {
      start: startItem.name,
      end: endItem.name
    })
    const d = shortestPathLength(startItem.id, endItem.id, this.connections)
    const found = d >= 0
    debug(found ? 'Path found' : 'No path found', { length: d })
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
  /**
   * Check if a person appears in a media item's cast
   * @param personId - TMDB person ID
   * @param mediaId - TMDB media ID
   * @param mediaType - Type of media (movie, tv, etc.)
   * @returns True if person is in the media cast
   */
  async checkPersonInMedia(personId: string | number, mediaId: string | number, mediaType: string): Promise<boolean> {
    try {
      debug('Checking if person in media', { personId, mediaId, mediaType })
      let credits: TMDBCredits | null = null
      if (mediaType === 'movie' || mediaType === 'film') {
        const movie = await tmdbCache.getMovieWithCast(mediaId)
        credits = movie ? { cast: movie.cast || [] } : null
      } else if (mediaType === 'tv' || mediaType === 'tv show' || mediaType === 'tv-show') {
        const tv = await tmdbCache.getTVShowWithCast(mediaId)
        credits = tv ? { cast: tv.cast || [] } : null
      } else {
        warn('Unknown media type', { mediaType })
        return false
      }
      if (!credits || !credits.cast) {
        debug('No credits found', { mediaType, mediaId })
        return false
      }
      const personIdNum = typeof personId === 'string' ? parseInt(personId) : personId
      const personInCast = credits.cast.some((c) => {
        const castId = c.id
        return (
          (personIdNum && !isNaN(personIdNum) && castId === personIdNum) ||
          castId.toString() === personId.toString()
        )
      })
      debug('Person in cast check result', { 
        personId, 
        personInCast,
        sampleCastIds: credits.cast.slice(0, 5).map((m) => m.id)
      })
      return personInCast
    } catch (err) {
      logError('Error checking person in media', { 
        error: err instanceof Error ? err.message : String(err),
        personId,
        mediaId,
        mediaType
      })
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
  /**
   * Clear all connections
   */
  clearAllConnections(): void {
    const count = this.connections.length
    this.connections = []
    debug('Cleared all connections', { count })
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
