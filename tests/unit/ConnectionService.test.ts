/**
 * ConnectionService Tests
 * Tests for connection logic, path finding, and validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock types for testing
interface TestGameItem {
  id: string
  name: string
  type: string
  x: number
  y: number
  vx: number
  vy: number
  tmdbId?: number
  tmdbData?: { id: number }
}

interface TestConnection {
  id: string
  from: string
  to: string
  fromItem?: TestGameItem
  toItem?: TestGameItem
}

// Helper to create test items
function createPerson(id: string, name: string, tmdbId = 12345): TestGameItem {
  return {
    id,
    name,
    type: 'person',
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    tmdbId
  }
}

function createMovie(id: string, name: string, tmdbId = 67890): TestGameItem {
  return {
    id,
    name,
    type: 'movie',
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    tmdbId
  }
}

function createTVShow(id: string, name: string, tmdbId = 11111): TestGameItem {
  return {
    id,
    name,
    type: 'tv',
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    tmdbId
  }
}

function createConnection(from: string, to: string): TestConnection {
  return {
    id: `conn-${Date.now()}-${Math.random()}`,
    from,
    to
  }
}

describe('ConnectionService', () => {
  describe('canItemsConnect algorithm', () => {
    const PERSON_TYPES = ['person', 'actor', 'actress']
    const MEDIA_TYPES = ['movie', 'film', 'tv', 'tv show']

    function canItemsConnect(item1: TestGameItem, item2: TestGameItem): boolean {
      if (!item1.type || !item2.type) return false
      
      const type1 = item1.type.toLowerCase()
      const type2 = item2.type.toLowerCase()
      
      const isPerson1 = PERSON_TYPES.includes(type1)
      const isPerson2 = PERSON_TYPES.includes(type2)
      const isMedia1 = MEDIA_TYPES.includes(type1)
      const isMedia2 = MEDIA_TYPES.includes(type2)
      
      // Can only connect person ↔ media
      return (isPerson1 && isMedia2) || (isPerson2 && isMedia1)
    }

    it('should allow person to movie connection', () => {
      const person = createPerson('p1', 'Tom Hanks')
      const movie = createMovie('m1', 'Forrest Gump')
      expect(canItemsConnect(person, movie)).toBe(true)
    })

    it('should allow movie to person connection (order independent)', () => {
      const person = createPerson('p1', 'Tom Hanks')
      const movie = createMovie('m1', 'Forrest Gump')
      expect(canItemsConnect(movie, person)).toBe(true)
    })

    it('should allow person to TV show connection', () => {
      const person = createPerson('p1', 'Bryan Cranston')
      const tv = createTVShow('t1', 'Breaking Bad')
      expect(canItemsConnect(person, tv)).toBe(true)
    })

    it('should NOT allow person to person connection', () => {
      const person1 = createPerson('p1', 'Tom Hanks')
      const person2 = createPerson('p2', 'Meg Ryan')
      expect(canItemsConnect(person1, person2)).toBe(false)
    })

    it('should NOT allow movie to movie connection', () => {
      const movie1 = createMovie('m1', 'Forrest Gump')
      const movie2 = createMovie('m2', 'Cast Away')
      expect(canItemsConnect(movie1, movie2)).toBe(false)
    })

    it('should NOT allow TV to TV connection', () => {
      const tv1 = createTVShow('t1', 'Breaking Bad')
      const tv2 = createTVShow('t2', 'Better Call Saul')
      expect(canItemsConnect(tv1, tv2)).toBe(false)
    })

    it('should return false for items without types', () => {
      const item1 = { ...createPerson('p1', 'Test'), type: '' }
      const item2 = createMovie('m1', 'Movie')
      expect(canItemsConnect(item1, item2)).toBe(false)
    })

    it('should handle actor/actress type as person', () => {
      const actor = { ...createPerson('a1', 'Actor'), type: 'actor' }
      const actress = { ...createPerson('a2', 'Actress'), type: 'actress' }
      const movie = createMovie('m1', 'Film')
      
      expect(canItemsConnect(actor, movie)).toBe(true)
      expect(canItemsConnect(actress, movie)).toBe(true)
      expect(canItemsConnect(actor, actress)).toBe(false)
    })
  })

  describe('areItemsDirectlyConnected algorithm', () => {
    function areItemsDirectlyConnected(
      item1: TestGameItem,
      item2: TestGameItem,
      connections: TestConnection[]
    ): boolean {
      return connections.some(
        conn =>
          (conn.from === item1.id && conn.to === item2.id) ||
          (conn.from === item2.id && conn.to === item1.id)
      )
    }

    it('should return true for directly connected items', () => {
      const person = createPerson('p1', 'Actor')
      const movie = createMovie('m1', 'Movie')
      const connections = [createConnection('p1', 'm1')]
      
      expect(areItemsDirectlyConnected(person, movie, connections)).toBe(true)
    })

    it('should return true regardless of connection direction', () => {
      const person = createPerson('p1', 'Actor')
      const movie = createMovie('m1', 'Movie')
      const connections = [createConnection('m1', 'p1')] // Reversed direction
      
      expect(areItemsDirectlyConnected(person, movie, connections)).toBe(true)
    })

    it('should return false for unconnected items', () => {
      const person = createPerson('p1', 'Actor')
      const movie = createMovie('m1', 'Movie')
      const connections: TestConnection[] = []
      
      expect(areItemsDirectlyConnected(person, movie, connections)).toBe(false)
    })

    it('should return false when items are indirectly connected', () => {
      const person = createPerson('p1', 'Actor')
      const movie1 = createMovie('m1', 'Movie 1')
      const movie2 = createMovie('m2', 'Movie 2')
      // p1 → m1, but checking p1 ↔ m2
      const connections = [createConnection('p1', 'm1')]
      
      expect(areItemsDirectlyConnected(person, movie2, connections)).toBe(false)
    })
  })

  describe('getConnectedItems algorithm', () => {
    function getConnectedItems(
      itemId: string,
      items: TestGameItem[],
      connections: TestConnection[]
    ): TestGameItem[] {
      const connectedIds = new Set<string>()
      
      connections.forEach(c => {
        if (c.from === itemId) connectedIds.add(c.to)
        else if (c.to === itemId) connectedIds.add(c.from)
      })
      
      return items.filter(i => connectedIds.has(i.id))
    }

    it('should return all directly connected items', () => {
      const person = createPerson('p1', 'Actor')
      const movie1 = createMovie('m1', 'Movie 1')
      const movie2 = createMovie('m2', 'Movie 2')
      const movie3 = createMovie('m3', 'Movie 3')
      
      const items = [person, movie1, movie2, movie3]
      const connections = [
        createConnection('p1', 'm1'),
        createConnection('p1', 'm2')
      ]
      
      const connected = getConnectedItems('p1', items, connections)
      expect(connected.length).toBe(2)
      expect(connected.map(i => i.id)).toContain('m1')
      expect(connected.map(i => i.id)).toContain('m2')
      expect(connected.map(i => i.id)).not.toContain('m3')
    })

    it('should return empty array for unconnected item', () => {
      const person = createPerson('p1', 'Actor')
      const items = [person]
      const connections: TestConnection[] = []
      
      expect(getConnectedItems('p1', items, connections)).toEqual([])
    })
  })

  describe('countConnectedItems algorithm', () => {
    function countConnectedItems(connections: TestConnection[]): number {
      const ids = new Set<string>()
      connections.forEach(c => {
        ids.add(c.from)
        ids.add(c.to)
      })
      return ids.size
    }

    it('should return 0 for no connections', () => {
      expect(countConnectedItems([])).toBe(0)
    })

    it('should count unique connected items', () => {
      const connections = [
        createConnection('p1', 'm1'),
        createConnection('p1', 'm2'),
        createConnection('p2', 'm1')
      ]
      // p1, p2, m1, m2 = 4 unique items
      expect(countConnectedItems(connections)).toBe(4)
    })

    it('should not double count items', () => {
      const connections = [
        createConnection('p1', 'm1'),
        createConnection('m1', 'p2') // m1 appears again
      ]
      // p1, m1, p2 = 3 unique items
      expect(countConnectedItems(connections)).toBe(3)
    })
  })

  describe('getConnectionStats algorithm', () => {
    function getConnectionStats(
      items: TestGameItem[],
      connections: TestConnection[]
    ) {
      const connectedIds = new Set<string>()
      connections.forEach(c => {
        connectedIds.add(c.from)
        connectedIds.add(c.to)
      })
      
      const totalItems = items.length
      const connectedItems = connectedIds.size
      const unconnectedItems = items.filter(i => !connectedIds.has(i.id)).length
      const totalConnections = connections.length
      
      return {
        totalItems,
        connectedItems,
        unconnectedItems,
        totalConnections,
        averageConnectionsPerItem: totalItems > 0 ? totalConnections / totalItems : 0,
        connectionDensity: totalItems > 1 
          ? totalConnections / ((totalItems * (totalItems - 1)) / 2) 
          : 0
      }
    }

    it('should return correct stats for empty game', () => {
      const stats = getConnectionStats([], [])
      expect(stats.totalItems).toBe(0)
      expect(stats.connectedItems).toBe(0)
      expect(stats.totalConnections).toBe(0)
    })

    it('should correctly count connected and unconnected items', () => {
      const items = [
        createPerson('p1', 'Actor 1'),
        createMovie('m1', 'Movie 1'),
        createPerson('p2', 'Actor 2') // Unconnected
      ]
      const connections = [createConnection('p1', 'm1')]
      
      const stats = getConnectionStats(items, connections)
      expect(stats.totalItems).toBe(3)
      expect(stats.connectedItems).toBe(2)
      expect(stats.unconnectedItems).toBe(1)
      expect(stats.totalConnections).toBe(1)
    })

    it('should calculate average connections correctly', () => {
      const items = [
        createPerson('p1', 'Actor'),
        createMovie('m1', 'Movie 1'),
        createMovie('m2', 'Movie 2')
      ]
      const connections = [
        createConnection('p1', 'm1'),
        createConnection('p1', 'm2')
      ]
      
      const stats = getConnectionStats(items, connections)
      expect(stats.averageConnectionsPerItem).toBeCloseTo(2/3, 5)
    })
  })

  describe('validateConnections algorithm', () => {
    function validateConnections(
      items: TestGameItem[],
      connections: TestConnection[]
    ): { isValid: boolean; errors: string[] } {
      const errors: string[] = []
      const itemIds = new Set(items.map(i => i.id))
      
      connections.forEach((conn, index) => {
        if (!itemIds.has(conn.from)) {
          errors.push(`Connection ${index}: from item ${conn.from} not found`)
        }
        if (!itemIds.has(conn.to)) {
          errors.push(`Connection ${index}: to item ${conn.to} not found`)
        }
        if (conn.from === conn.to) {
          errors.push(`Connection ${index}: self-connection detected`)
        }
      })
      
      // Check for duplicates
      const connectionStrings = connections.map(c => `${c.from}-${c.to}`)
      const unique = new Set(connectionStrings)
      if (connectionStrings.length !== unique.size) {
        errors.push('Duplicate connections detected')
      }
      
      return { isValid: errors.length === 0, errors }
    }

    it('should validate correct connections', () => {
      const items = [
        createPerson('p1', 'Actor'),
        createMovie('m1', 'Movie')
      ]
      const connections = [createConnection('p1', 'm1')]
      
      const result = validateConnections(items, connections)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should detect missing from item', () => {
      const items = [createMovie('m1', 'Movie')]
      const connections = [createConnection('missing', 'm1')]
      
      const result = validateConnections(items, connections)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('from item'))).toBe(true)
    })

    it('should detect missing to item', () => {
      const items = [createPerson('p1', 'Actor')]
      const connections = [createConnection('p1', 'missing')]
      
      const result = validateConnections(items, connections)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('to item'))).toBe(true)
    })

    it('should detect self-connections', () => {
      const items = [createPerson('p1', 'Actor')]
      const connections = [{ ...createConnection('p1', 'p1') }]
      
      const result = validateConnections(items, connections)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('self-connection'))).toBe(true)
    })

    it('should detect duplicate connections', () => {
      const items = [
        createPerson('p1', 'Actor'),
        createMovie('m1', 'Movie')
      ]
      const connections = [
        createConnection('p1', 'm1'),
        { ...createConnection('p1', 'm1'), id: 'different-id' }
      ]
      
      const result = validateConnections(items, connections)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('Duplicate'))).toBe(true)
    })
  })

  describe('getConnectionsForItem algorithm', () => {
    function getConnectionsForItem(
      itemId: string,
      connections: TestConnection[]
    ): TestConnection[] {
      return connections.filter(c => c.from === itemId || c.to === itemId)
    }

    it('should return all connections for an item', () => {
      const connections = [
        createConnection('p1', 'm1'),
        createConnection('p1', 'm2'),
        createConnection('p2', 'm1')
      ]
      
      const p1Connections = getConnectionsForItem('p1', connections)
      expect(p1Connections.length).toBe(2)
    })

    it('should return connections regardless of direction', () => {
      const connections = [
        createConnection('p1', 'm1'),
        createConnection('m2', 'p1')
      ]
      
      const p1Connections = getConnectionsForItem('p1', connections)
      expect(p1Connections.length).toBe(2)
    })

    it('should return empty array for unconnected item', () => {
      const connections = [createConnection('p1', 'm1')]
      expect(getConnectionsForItem('p2', connections)).toEqual([])
    })
  })

  describe('hasConnections algorithm', () => {
    function hasConnections(itemId: string, connections: TestConnection[]): boolean {
      return connections.some(c => c.from === itemId || c.to === itemId)
    }

    it('should return true when item has connections', () => {
      const connections = [createConnection('p1', 'm1')]
      expect(hasConnections('p1', connections)).toBe(true)
      expect(hasConnections('m1', connections)).toBe(true)
    })

    it('should return false when item has no connections', () => {
      const connections = [createConnection('p1', 'm1')]
      expect(hasConnections('p2', connections)).toBe(false)
    })
  })

  describe('getConnectedComponent algorithm', () => {
    function getConnectedComponent(
      startItemId: string,
      items: TestGameItem[],
      connections: TestConnection[]
    ): TestGameItem[] {
      const visited = new Set<string>()
      const component: TestGameItem[] = []
      const queue = [startItemId]
      visited.add(startItemId)
      
      while (queue.length > 0) {
        const currentId = queue.shift()!
        const currentItem = items.find(item => item.id === currentId)
        if (currentItem) component.push(currentItem)
        
        const conns = connections.filter(c => c.from === currentId || c.to === currentId)
        conns.forEach(conn => {
          const nextId = conn.from === currentId ? conn.to : conn.from
          if (!visited.has(nextId)) {
            visited.add(nextId)
            queue.push(nextId)
          }
        })
      }
      
      return component
    }

    it('should return single item for isolated node', () => {
      const items = [createPerson('p1', 'Solo Actor')]
      const connections: TestConnection[] = []
      
      const component = getConnectedComponent('p1', items, connections)
      expect(component.length).toBe(1)
      expect(component[0].id).toBe('p1')
    })

    it('should return all connected items', () => {
      const items = [
        createPerson('p1', 'Actor 1'),
        createMovie('m1', 'Movie 1'),
        createPerson('p2', 'Actor 2'),
        createMovie('m2', 'Movie 2') // Separate component
      ]
      const connections = [
        createConnection('p1', 'm1'),
        createConnection('m1', 'p2')
      ]
      
      const component = getConnectedComponent('p1', items, connections)
      expect(component.length).toBe(3)
      expect(component.map(i => i.id)).toContain('p1')
      expect(component.map(i => i.id)).toContain('m1')
      expect(component.map(i => i.id)).toContain('p2')
      expect(component.map(i => i.id)).not.toContain('m2')
    })

    it('should work starting from any node in component', () => {
      const items = [
        createPerson('p1', 'Actor'),
        createMovie('m1', 'Movie 1'),
        createMovie('m2', 'Movie 2')
      ]
      const connections = [
        createConnection('p1', 'm1'),
        createConnection('p1', 'm2')
      ]
      
      const fromP1 = getConnectedComponent('p1', items, connections)
      const fromM1 = getConnectedComponent('m1', items, connections)
      const fromM2 = getConnectedComponent('m2', items, connections)
      
      expect(fromP1.length).toBe(3)
      expect(fromM1.length).toBe(3)
      expect(fromM2.length).toBe(3)
    })
  })

  describe('createConnection algorithm', () => {
    function createConnectionWithItems(
      sourceItem: TestGameItem,
      targetItem: TestGameItem
    ): TestConnection {
      return {
        id: `conn-${Date.now()}-${Math.random()}`,
        from: sourceItem.id,
        to: targetItem.id,
        fromItem: sourceItem,
        toItem: targetItem
      }
    }

    it('should create connection with correct structure', () => {
      const person = createPerson('p1', 'Actor')
      const movie = createMovie('m1', 'Movie')
      
      const conn = createConnectionWithItems(person, movie)
      
      expect(conn.id).toMatch(/^conn-/)
      expect(conn.from).toBe('p1')
      expect(conn.to).toBe('m1')
      expect(conn.fromItem).toBe(person)
      expect(conn.toItem).toBe(movie)
    })

    it('should create unique IDs for different connections', () => {
      const person = createPerson('p1', 'Actor')
      const movie = createMovie('m1', 'Movie')
      
      const conn1 = createConnectionWithItems(person, movie)
      const conn2 = createConnectionWithItems(person, movie)
      
      expect(conn1.id).not.toBe(conn2.id)
    })
  })
})

