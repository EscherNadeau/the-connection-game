/**
 * Graph Utilities Tests
 * Tests for graph.ts - BFS, path finding, and adjacency utilities
 */

import { describe, it, expect } from 'vitest'
import {
  buildAdjacency,
  bfsReachable,
  pathExists,
  shortestPathLength,
  shortestPathNodes,
  degreeMap
} from '@/utils/graph'

describe('buildAdjacency', () => {
  it('should build empty adjacency for empty connections', () => {
    const adj = buildAdjacency([])
    expect(adj.size).toBe(0)
  })

  it('should build undirected adjacency from connections', () => {
    const connections = [
      { from: 'A', to: 'B' },
      { from: 'B', to: 'C' }
    ]
    const adj = buildAdjacency(connections)
    
    expect(adj.has('A')).toBe(true)
    expect(adj.has('B')).toBe(true)
    expect(adj.has('C')).toBe(true)
    expect(adj.get('A')?.has('B')).toBe(true)
    expect(adj.get('B')?.has('A')).toBe(true)
    expect(adj.get('B')?.has('C')).toBe(true)
    expect(adj.get('C')?.has('B')).toBe(true)
  })

  it('should handle null/undefined connections', () => {
    const connections = [
      { from: 'A', to: 'B' },
      null,
      { from: null, to: 'C' },
      { from: 'D', to: undefined }
    ] as any[]
    
    const adj = buildAdjacency(connections)
    expect(adj.get('A')?.has('B')).toBe(true)
    expect(adj.get('B')?.has('A')).toBe(true)
  })

  it('should handle self-referential connections', () => {
    const connections = [
      { from: 'A', to: 'A' }
    ]
    const adj = buildAdjacency(connections)
    expect(adj.get('A')?.has('A')).toBe(true)
  })
})

describe('bfsReachable', () => {
  it('should return empty set for null startId', () => {
    const connections = [{ from: 'A', to: 'B' }]
    const reachable = bfsReachable(null as any, connections)
    expect(reachable.size).toBe(0)
  })

  it('should return only start node when isolated', () => {
    const connections = [{ from: 'A', to: 'B' }]
    const reachable = bfsReachable('C', connections)
    expect(reachable.size).toBe(1)
    expect(reachable.has('C')).toBe(true)
  })

  it('should find all reachable nodes in connected component', () => {
    const connections = [
      { from: 'A', to: 'B' },
      { from: 'B', to: 'C' },
      { from: 'C', to: 'D' },
      { from: 'X', to: 'Y' } // Separate component
    ]
    
    const reachableFromA = bfsReachable('A', connections)
    expect(reachableFromA.has('A')).toBe(true)
    expect(reachableFromA.has('B')).toBe(true)
    expect(reachableFromA.has('C')).toBe(true)
    expect(reachableFromA.has('D')).toBe(true)
    expect(reachableFromA.has('X')).toBe(false)
    expect(reachableFromA.has('Y')).toBe(false)
  })

  it('should work with pre-built adjacency map', () => {
    const adj = new Map([
      ['A', new Set(['B', 'C'])],
      ['B', new Set(['A'])],
      ['C', new Set(['A'])]
    ])
    
    const reachable = bfsReachable('A', adj)
    expect(reachable.size).toBe(3)
    expect(reachable.has('A')).toBe(true)
    expect(reachable.has('B')).toBe(true)
    expect(reachable.has('C')).toBe(true)
  })
})

describe('pathExists', () => {
  it('should return true for same node', () => {
    const connections = [{ from: 'A', to: 'B' }]
    expect(pathExists('A', 'A', connections)).toBe(true)
  })

  it('should return true for directly connected nodes', () => {
    const connections = [{ from: 'A', to: 'B' }]
    expect(pathExists('A', 'B', connections)).toBe(true)
    expect(pathExists('B', 'A', connections)).toBe(true)
  })

  it('should return true for indirectly connected nodes', () => {
    const connections = [
      { from: 'A', to: 'B' },
      { from: 'B', to: 'C' },
      { from: 'C', to: 'D' }
    ]
    expect(pathExists('A', 'D', connections)).toBe(true)
    expect(pathExists('D', 'A', connections)).toBe(true)
  })

  it('should return false for disconnected nodes', () => {
    const connections = [
      { from: 'A', to: 'B' },
      { from: 'X', to: 'Y' }
    ]
    expect(pathExists('A', 'X', connections)).toBe(false)
    expect(pathExists('B', 'Y', connections)).toBe(false)
  })

  it('should handle empty connections', () => {
    expect(pathExists('A', 'A', [])).toBe(true)
    expect(pathExists('A', 'B', [])).toBe(false)
  })
})

describe('shortestPathLength', () => {
  it('should return 0 for same node', () => {
    expect(shortestPathLength('A', 'A', [])).toBe(0)
  })

  it('should return 1 for directly connected nodes', () => {
    const connections = [{ from: 'A', to: 'B' }]
    expect(shortestPathLength('A', 'B', connections)).toBe(1)
  })

  it('should return correct length for longer paths', () => {
    const connections = [
      { from: 'A', to: 'B' },
      { from: 'B', to: 'C' },
      { from: 'C', to: 'D' }
    ]
    expect(shortestPathLength('A', 'D', connections)).toBe(3)
    expect(shortestPathLength('A', 'C', connections)).toBe(2)
    expect(shortestPathLength('B', 'D', connections)).toBe(2)
  })

  it('should find shortest path when multiple paths exist', () => {
    // A -> B -> C -> D (length 3)
    // A -> E -> D (length 2)
    const connections = [
      { from: 'A', to: 'B' },
      { from: 'B', to: 'C' },
      { from: 'C', to: 'D' },
      { from: 'A', to: 'E' },
      { from: 'E', to: 'D' }
    ]
    expect(shortestPathLength('A', 'D', connections)).toBe(2)
  })

  it('should return -1 for disconnected nodes', () => {
    const connections = [
      { from: 'A', to: 'B' },
      { from: 'X', to: 'Y' }
    ]
    expect(shortestPathLength('A', 'X', connections)).toBe(-1)
  })
})

describe('shortestPathNodes', () => {
  it('should return single node array for same start and end', () => {
    expect(shortestPathNodes('A', 'A', [])).toEqual(['A'])
  })

  it('should return path for directly connected nodes', () => {
    const connections = [{ from: 'A', to: 'B' }]
    const path = shortestPathNodes('A', 'B', connections)
    expect(path).toEqual(['A', 'B'])
  })

  it('should return correct path for longer routes', () => {
    const connections = [
      { from: 'A', to: 'B' },
      { from: 'B', to: 'C' },
      { from: 'C', to: 'D' }
    ]
    const path = shortestPathNodes('A', 'D', connections)
    expect(path).toEqual(['A', 'B', 'C', 'D'])
  })

  it('should return shortest path when multiple paths exist', () => {
    const connections = [
      { from: 'A', to: 'B' },
      { from: 'B', to: 'C' },
      { from: 'C', to: 'D' },
      { from: 'A', to: 'E' },
      { from: 'E', to: 'D' }
    ]
    const path = shortestPathNodes('A', 'D', connections)
    expect(path.length).toBe(3) // A -> E -> D
    expect(path[0]).toBe('A')
    expect(path[path.length - 1]).toBe('D')
  })

  it('should return empty array for disconnected nodes', () => {
    const connections = [
      { from: 'A', to: 'B' },
      { from: 'X', to: 'Y' }
    ]
    expect(shortestPathNodes('A', 'X', connections)).toEqual([])
  })
})

describe('degreeMap', () => {
  it('should return empty map for empty connections', () => {
    const degrees = degreeMap([])
    expect(degrees.size).toBe(0)
  })

  it('should calculate correct degrees', () => {
    const connections = [
      { from: 'A', to: 'B' },
      { from: 'A', to: 'C' },
      { from: 'B', to: 'C' }
    ]
    const degrees = degreeMap(connections)
    
    expect(degrees.get('A')).toBe(2) // Connected to B and C
    expect(degrees.get('B')).toBe(2) // Connected to A and C
    expect(degrees.get('C')).toBe(2) // Connected to A and B
  })

  it('should handle nodes with different degrees', () => {
    // Star topology: A in center
    const connections = [
      { from: 'A', to: 'B' },
      { from: 'A', to: 'C' },
      { from: 'A', to: 'D' },
      { from: 'A', to: 'E' }
    ]
    const degrees = degreeMap(connections)
    
    expect(degrees.get('A')).toBe(4) // Center node
    expect(degrees.get('B')).toBe(1)
    expect(degrees.get('C')).toBe(1)
    expect(degrees.get('D')).toBe(1)
    expect(degrees.get('E')).toBe(1)
  })

  it('should filter by nodeSet when provided', () => {
    const connections = [
      { from: 'A', to: 'B' },
      { from: 'B', to: 'C' },
      { from: 'C', to: 'D' }
    ]
    const nodeSet = new Set(['A', 'B', 'C'])
    const degrees = degreeMap(connections, nodeSet)
    
    // Only count edges within the nodeSet
    expect(degrees.get('A')).toBe(1) // A-B
    expect(degrees.get('B')).toBe(2) // A-B, B-C
    expect(degrees.get('C')).toBe(1) // B-C (C-D excluded because D not in set)
    expect(degrees.has('D')).toBe(false)
  })

  it('should handle null/undefined in connections', () => {
    const connections = [
      { from: 'A', to: 'B' },
      { from: null, to: 'C' },
      { from: 'D', to: undefined },
      null
    ] as any[]
    
    const degrees = degreeMap(connections)
    expect(degrees.get('A')).toBe(1)
    expect(degrees.get('B')).toBe(1)
  })
})

