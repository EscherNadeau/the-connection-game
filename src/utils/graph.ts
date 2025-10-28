// Graph helpers shared across rules and board

// Build undirected adjacency from connections [{ from, to }]
export function buildAdjacency(connections = []) {
  const adj = new Map()
  const add = (u, v) => {
    if (!u || !v) return
    if (!adj.has(u)) adj.set(u, new Set())
    adj.get(u).add(v)
  }
  for (const c of connections) {
    if (!c || !c.from || !c.to) continue
    add(c.from, c.to)
    add(c.to, c.from)
  }
  return adj
}

// Accepts connections array or a prebuilt adjacency Map
function toAdjacency(connectionsOrAdj) {
  return connectionsOrAdj instanceof Map ? connectionsOrAdj : buildAdjacency(connectionsOrAdj)
}

export function bfsReachable(startId, connectionsOrAdj) {
  const adj = toAdjacency(connectionsOrAdj)
  const visited = new Set()
  if (startId == null) return visited
  const queue = [startId]
  visited.add(startId)
  while (queue.length) {
    const u = queue.shift()
    const nbrs = adj.get(u)
    if (!nbrs) continue
    for (const v of nbrs) {
      if (!visited.has(v)) {
        visited.add(v)
        queue.push(v)
      }
    }
  }
  return visited
}

export function pathExists(aId, bId, connectionsOrAdj) {
  if (aId === bId) return true
  const adj = toAdjacency(connectionsOrAdj)
  const visited = new Set([aId])
  const queue = [aId]
  while (queue.length) {
    const u = queue.shift()
    if (u === bId) return true
    const nbrs = adj.get(u)
    if (!nbrs) continue
    for (const v of nbrs) {
      if (!visited.has(v)) {
        visited.add(v)
        queue.push(v)
      }
    }
  }
  return false
}

export function shortestPathLength(aId, bId, connectionsOrAdj) {
  if (aId === bId) return 0
  const adj = toAdjacency(connectionsOrAdj)
  const visited = new Set([aId])
  const queue = [{ id: aId, d: 0 }]
  while (queue.length) {
    const { id, d } = queue.shift()
    const nbrs = adj.get(id)
    if (!nbrs) continue
    for (const v of nbrs) {
      if (v === bId) return d + 1
      if (!visited.has(v)) {
        visited.add(v)
        queue.push({ id: v, d: d + 1 })
      }
    }
  }
  return -1
}

// Return the node id sequence for the shortest path from aId to bId.
// If none exists, returns an empty array.
export function shortestPathNodes(aId, bId, connectionsOrAdj) {
  if (aId === bId) return [aId]
  const adj = toAdjacency(connectionsOrAdj)
  const visited = new Set([aId])
  const queue = [aId]
  const parent = new Map()
  let found = false
  while (queue.length) {
    const u = queue.shift()
    const nbrs = adj.get(u)
    if (!nbrs) continue
    for (const v of nbrs) {
      if (!visited.has(v)) {
        visited.add(v)
        parent.set(v, u)
        if (v === bId) { found = true; break }
        queue.push(v)
      }
    }
    if (found) break
  }
  if (!found) return []
  const path = [bId]
  let cur = bId
  while (parent.has(cur)) {
    cur = parent.get(cur)
    path.push(cur)
    if (cur === aId) break
  }
  path.reverse()
  return path
}

export function degreeMap(connections = [], nodeSet = null) {
  const degrees = new Map()
  const countEdge = (u) => degrees.set(u, (degrees.get(u) || 0) + 1)
  for (const c of connections) {
    const { from, to } = c || {}
    if (!from || !to) continue
    if (nodeSet) {
      if (nodeSet.has(from) && nodeSet.has(to)) {
        countEdge(from)
        countEdge(to)
      }
    } else {
      countEdge(from)
      countEdge(to)
    }
  }
  return degrees
}
