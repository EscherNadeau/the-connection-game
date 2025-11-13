import { debug, warn } from '../ui/log'
import type { GameItem, Connection, GameOptions } from '../../types/game'

class GameEngineService {
  private gameItems: GameItem[] = []
  private connections: Connection[] = []
  private gameOptions: GameOptions | null = null
  private canvasWidth: number = 50000
  private canvasHeight: number = 50000
  private centerX: number = 25000
  private centerY: number = 25000
  private physicsEnabled: boolean = true
  private collisionEnabled: boolean = true

  /**
   * Initialize the game engine service
   * @param gameOptions - Game configuration options
   * @param gameItems - Array of game items
   * @param connections - Array of connections
   */
  initialize(gameOptions: GameOptions, gameItems: GameItem[], connections: Connection[]): void {
    this.gameOptions = gameOptions
    this.gameItems = gameItems
    this.connections = connections
    debug('Game Engine Service initialized', { itemCount: gameItems.length, connectionCount: connections.length })
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
   * Set canvas dimensions and update center point
   * @param width - Canvas width
   * @param height - Canvas height
   */
  setCanvasDimensions(width: number, height: number): void {
    this.canvasWidth = width
    this.canvasHeight = height
    this.centerX = width / 2
    this.centerY = height / 2
    debug('Canvas dimensions set', { width, height, centerX: this.centerX, centerY: this.centerY })
  }

  /**
   * Place an item randomly on the canvas
   * @param item - Game item to place
   * @param avoidCenter - Whether to avoid placing near center
   * @returns Position coordinates
   */
  placeItemRandomly(item: GameItem, avoidCenter = false): { x: number; y: number } {
    let x, y
    let attempts = 0
    const maxAttempts = 50
    do {
      if (avoidCenter) {
        const angle = Math.random() * 2 * Math.PI
        const distance = 200 + Math.random() * 300
        x = this.centerX + Math.cos(angle) * distance
        y = this.centerY + Math.sin(angle) * distance
      } else {
        x = Math.random() * this.canvasWidth
        y = Math.random() * this.canvasHeight
      }
      attempts++
    } while (this.wouldCollideWithExistingItems(item, x, y) && attempts < maxAttempts)
    if (attempts >= maxAttempts) {
      x = this.centerX + (Math.random() - 0.5) * 100
      y = this.centerY + (Math.random() - 0.5) * 100
      warn('Max placement attempts reached, using fallback position', { item: item.name, attempts })
    }
    item.x = x
    item.y = y
    item.vx = 0
    item.vy = 0
    debug('Item placed randomly', { item: item.name, x, y })
    return { x, y }
  }

  /**
   * Place an item near a source item
   * @param sourceItem - Source item to place near
   * @param newItem - Item to place
   * @param offset - Distance offset from source
   * @returns Position coordinates
   */
  placeItemNearSource(sourceItem: GameItem, newItem: GameItem, offset = 250): { x: number; y: number } {
    const angle = Math.random() * 2 * Math.PI
    const distance = offset + Math.random() * 100
    let x = sourceItem.x + Math.cos(angle) * distance
    let y = sourceItem.y + Math.sin(angle) * distance
    x = Math.max(0, Math.min(x, this.canvasWidth))
    y = Math.max(0, Math.min(y, this.canvasHeight))
    if (this.wouldCollideWithExistingItems(newItem, x, y)) {
      const adjusted = this.findNearestFreePosition(newItem, x, y)
      x = adjusted.x
      y = adjusted.y
    }
    newItem.x = x
    newItem.y = y
    newItem.vx = 0
    newItem.vy = 0
    debug('Item placed near source', { item: newItem.name, source: sourceItem.name, x, y })
    return { x, y }
  }

  /**
   * Check if placing an item at given coordinates would collide with existing items
   * @param item - Game item to check
   * @param x - X coordinate
   * @param y - Y coordinate
   * @returns True if collision would occur
   */
  wouldCollideWithExistingItems(item: GameItem, x: number, y: number): boolean {
    if (!this.collisionEnabled) return false
    const itemRadius = this.getItemRadius(item)
    for (const existingItem of this.gameItems) {
      if (existingItem.id === item.id) continue
      const distance = Math.hypot(x - existingItem.x, y - existingItem.y)
      const minDistance = itemRadius + this.getItemRadius(existingItem) + 50
      if (distance < minDistance) return true
    }
    return false
  }

  /**
   * Find the nearest free position for an item near preferred coordinates
   * @param item - Game item to place
   * @param preferredX - Preferred X coordinate
   * @param preferredY - Preferred Y coordinate
   * @returns Position coordinates
   */
  findNearestFreePosition(item: GameItem, preferredX: number, preferredY: number): { x: number; y: number } {
    const itemRadius = this.getItemRadius(item)
    let bestX = preferredX
    let bestY = preferredY
    let bestDistance = Infinity
    for (let radius = 100; radius <= 500; radius += 50) {
      for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 8) {
        const x = preferredX + Math.cos(angle) * radius
        const y = preferredY + Math.sin(angle) * radius
        if (x < 0 || x > this.canvasWidth || y < 0 || y > this.canvasHeight) continue
        if (!this.wouldCollideWithExistingItems(item, x, y)) {
          const distance = Math.hypot(x - preferredX, y - preferredY)
          if (distance < bestDistance) {
            bestDistance = distance
            bestX = x
            bestY = y
          }
        }
      }
      if (bestDistance < Infinity) break
    }
    return { x: bestX, y: bestY }
  }

  /**
   * Get the radius for an item based on its type
   * @param item - Game item
   * @returns Radius in pixels
   */
  getItemRadius(item: GameItem): number {
    if (item.type === 'actor' || item.type === 'actress' || item.type === 'person') return 40
    if (item.type === 'movie' || item.type === 'film' || item.type === 'tv') return 60
    return 50
  }

  updatePhysics(deltaTime = 16) {
    if (!this.physicsEnabled) return
    for (const item of this.gameItems) {
      item.x += (item.vx * deltaTime) / 1000
      item.y += (item.vy * deltaTime) / 1000
      item.vx *= 0.95
      item.vy *= 0.95
      this.keepItemInBounds(item)
      this.checkItemCollisions(item)
    }
  }

  keepItemInBounds(item) {
    const radius = this.getItemRadius(item)
    if (item.x - radius < 0) {
      item.x = radius
      item.vx = Math.abs(item.vx) * 0.5
    } else if (item.x + radius > this.canvasWidth) {
      item.x = this.canvasWidth - radius
      item.vx = -Math.abs(item.vx) * 0.5
    }
    if (item.y - radius < 0) {
      item.y = radius
      item.vy = Math.abs(item.vy) * 0.5
    } else if (item.y + radius > this.canvasHeight) {
      item.y = this.canvasHeight - radius
      item.vy = -Math.abs(item.vy) * 0.5
    }
  }

  checkItemCollisions(item) {
    if (!this.collisionEnabled) return
    const itemRadius = this.getItemRadius(item)
    for (const otherItem of this.gameItems) {
      if (otherItem.id === item.id) continue
      const distance = Math.hypot(item.x - otherItem.x, item.y - otherItem.y)
      const minDistance = itemRadius + this.getItemRadius(otherItem)
      if (distance < minDistance) this.resolveCollision(item, otherItem, distance, minDistance)
    }
  }

  resolveCollision(item1, item2, distance, minDistance) {
    if (distance === 0) {
      const angle = Math.random() * 2 * Math.PI
      const separation = minDistance + 10
      item1.x += Math.cos(angle) * separation
      item1.y += Math.sin(angle) * separation
      item2.x -= Math.cos(angle) * separation
      item2.y -= Math.sin(angle) * separation
      return
    }
    const nx = (item2.x - item1.x) / distance
    const ny = (item2.y - item1.y) / distance
    const overlap = minDistance - distance
    const separation = overlap / 2
    item1.x -= nx * separation
    item1.y -= ny * separation
    item2.x += nx * separation
    item2.y += ny * separation
    const rvx = item1.vx - item2.vx
    const rvy = item1.vy - item2.vy
    const vAlong = rvx * nx + rvy * ny
    if (vAlong > 0) return
    const restitution = 0.8
    const impulse = -(1 + restitution) * vAlong
    item1.vx -= impulse * nx
    item1.vy -= impulse * ny
    item2.vx += impulse * nx
    item2.vy += impulse * ny
  }

  applyForce(item, fx, fy) {
    if (!this.physicsEnabled) return
    item.vx += fx
    item.vy += fy
    const maxV = 200
    const v = Math.hypot(item.vx, item.vy)
    if (v > maxV) {
      const s = maxV / v
      item.vx *= s
      item.vy *= s
    }
  }

  applyRepulsionForces() {
    if (!this.physicsEnabled) return
    for (let i = 0; i < this.gameItems.length; i++) {
      for (let j = i + 1; j < this.gameItems.length; j++) {
        const item1 = this.gameItems[i]
        const item2 = this.gameItems[j]
        const dx = item2.x - item1.x
        const dy = item2.y - item1.y
        const d = Math.hypot(dx, dy)
        if (d < 100 && d > 0) {
          const f = 1000 / (d * d)
          const fx = (dx / d) * f
          const fy = (dy / d) * f
          this.applyForce(item1, -fx, -fy)
          this.applyForce(item2, fx, fy)
        }
      }
    }
  }

  getItemsInRadius(cx, cy, r) {
    return this.gameItems.filter((i) => Math.hypot(i.x - cx, i.y - cy) <= r)
  }
  getItemsInRect(x1, y1, x2, y2) {
    return this.gameItems.filter((i) => i.x >= x1 && i.x <= x2 && i.y >= y1 && i.y <= y2)
  }
  findClosestItem(x, y, excludeItem = null) {
    let best = null,
      bestD = Infinity
    for (const it of this.gameItems) {
      if (excludeItem && it.id === excludeItem.id) continue
      const d = Math.hypot(it.x - x, it.y - y)
      if (d < bestD) {
        bestD = d
        best = it
      }
    }
    return best
  }
  spreadItemsOut() {
    if (!this.physicsEnabled) return
    for (const item of this.gameItems) {
      let fx = 0,
        fy = 0,
        n = 0
      for (const other of this.gameItems) {
        if (other.id === item.id) continue
        const dx = other.x - item.x
        const dy = other.y - item.y
        const d = Math.hypot(dx, dy)
        if (d < 200 && d > 0) {
          const f = 500 / (d * d)
          fx -= (dx / d) * f
          fy -= (dy / d) * f
          n++
        }
      }
      if (n > 0) this.applyForce(item, fx, fy)
    }
  }
  /**
   * Enable or disable physics simulation
   * @param enabled - Whether physics should be enabled
   */
  setPhysicsEnabled(enabled: boolean): void {
    this.physicsEnabled = enabled
    debug(`Physics ${enabled ? 'enabled' : 'disabled'}`)
  }

  /**
   * Enable or disable collision detection
   * @param enabled - Whether collision detection should be enabled
   */
  setCollisionEnabled(enabled: boolean): void {
    this.collisionEnabled = enabled
    debug(`Collision detection ${enabled ? 'enabled' : 'disabled'}`)
  }
  getEngineStats() {
    const active = this.gameItems.filter((i) => Math.abs(i.vx) > 0.1 || Math.abs(i.vy) > 0.1)
    return {
      totalItems: this.gameItems.length,
      activeItems: active.length,
      physicsEnabled: this.physicsEnabled,
      collisionEnabled: this.collisionEnabled,
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight,
      centerX: this.centerX,
      centerY: this.centerY,
    }
  }
  /**
   * Reset all item velocities to zero
   */
  resetVelocities(): void {
    for (const i of this.gameItems) {
      i.vx = 0
      i.vy = 0
    }
    debug('All item velocities reset', { itemCount: this.gameItems.length })
  }

  /**
   * Center items around a specific point
   * @param x - X coordinate of center point
   * @param y - Y coordinate of center point
   * @param radius - Radius around center point
   */
  centerItemsAround(x: number, y: number, radius = 1000): void {
    for (const i of this.gameItems) {
      const a = Math.random() * 2 * Math.PI
      const d = Math.random() * radius
      i.x = x + Math.cos(a) * d
      i.y = y + Math.sin(a) * d
      i.vx = 0
      i.vy = 0
    }
    debug('Items centered around point', { x, y, radius, itemCount: this.gameItems.length })
  }
}

export default new GameEngineService()
