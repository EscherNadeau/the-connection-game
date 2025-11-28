import { debug } from '../ui/log'
import type { GameItem } from '../../types/game'

interface LayoutCenter {
  x: number
  y: number
}

interface Viewport {
  x: number
  y: number
  scale: number
}

type GetGameItemsCallback = () => GameItem[]
type OnUpdateCallback = () => void

// Spatial hash cell size - items within same/adjacent cells are checked
const CELL_SIZE = 150

class PhysicsService {
  private enabled: boolean = true
  private layoutCenter: LayoutCenter = { x: 0, y: 0 }
  private animationFrameId: number | null = null
  private isRunning: boolean = false
  private callbacks: OnUpdateCallback[] = []
  private itemsMoving: boolean = false
  private idleFrames: number = 0
  private maxIdleFrames: number = 20
  private lastUpdateTime: number = 0
  private targetFPS: number = 30 // Reduce to 30 FPS for physics
  private frameInterval: number = 1000 / 30
  
  // Spatial hashing for O(n) collision detection
  private spatialHash: Map<string, GameItem[]> = new Map()
  
  // Performance tuning
  private maxItemsForFullPhysics: number = 50
  private physicsEnabled: boolean = true

  start(getGameItems: GetGameItemsCallback, onUpdate: OnUpdateCallback): void {
    if (this.isRunning) return

    this.isRunning = true
    this.callbacks.push(onUpdate)
    this.lastUpdateTime = performance.now()

    this.updateLayoutCenter(800, 600)
    this.animate(getGameItems)

    debug('[Physics] Service started')
  }

  animate(getGameItems: GetGameItemsCallback): void {
    if (!this.isRunning) return

    const now = performance.now()
    const elapsed = now - this.lastUpdateTime

    // Throttle to target FPS
    if (elapsed >= this.frameInterval) {
      this.lastUpdateTime = now - (elapsed % this.frameInterval)

      if (this.enabled && this.physicsEnabled) {
        const gameItems = typeof getGameItems === 'function' ? getGameItems() : getGameItems
        
        if (gameItems && gameItems.length > 0) {
          // Disable full physics if too many items
          if (gameItems.length > this.maxItemsForFullPhysics) {
            this.updateLite(gameItems)
          } else {
            this.update(gameItems)
          }

          this.checkMovement(gameItems)

          if (this.itemsMoving) {
            this.callbacks.forEach((callback) => callback())
          }
        }
      }
    }

    this.animationFrameId = requestAnimationFrame(() => this.animate(getGameItems))
  }

  stop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    this.isRunning = false
    this.callbacks = []
    this.itemsMoving = false
    this.idleFrames = 0
    this.spatialHash.clear()
    debug('[Physics] Service stopped')
  }

  updateLayoutCenter(width: number, height: number): void {
    this.layoutCenter = { x: width / 2, y: height / 2 }
  }

  updateCenterFromViewport(viewport: Viewport): void {
    this.layoutCenter = {
      x: -viewport.x + window.innerWidth / 2 / viewport.scale,
      y: -viewport.y + window.innerHeight / 2 / viewport.scale,
    }
  }

  // Build spatial hash for efficient collision detection
  private buildSpatialHash(items: GameItem[]): void {
    this.spatialHash.clear()
    
    for (const item of items) {
      const cellX = Math.floor(item.x / CELL_SIZE)
      const cellY = Math.floor(item.y / CELL_SIZE)
      const key = `${cellX},${cellY}`
      
      if (!this.spatialHash.has(key)) {
        this.spatialHash.set(key, [])
      }
      this.spatialHash.get(key)!.push(item)
    }
  }

  // Get nearby items using spatial hash
  private getNearbyItems(item: GameItem): GameItem[] {
    const cellX = Math.floor(item.x / CELL_SIZE)
    const cellY = Math.floor(item.y / CELL_SIZE)
    const nearby: GameItem[] = []
    
    // Check 3x3 grid of cells around item
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${cellX + dx},${cellY + dy}`
        const cellItems = this.spatialHash.get(key)
        if (cellItems) {
          for (const other of cellItems) {
            if (other !== item) {
              nearby.push(other)
            }
          }
        }
      }
    }
    
    return nearby
  }

  update(gameItems: GameItem[]): void {
    if (gameItems.length === 0) return

    const activeItems = gameItems.filter((item) => !item.isDragging)
    if (activeItems.length === 0) return

    // Build spatial hash for efficient lookup
    this.buildSpatialHash(activeItems)
    
    const forces = this.calculateForces(activeItems)
    this.applyForces(activeItems, forces)
  }

  // Lite physics for many items - only resolve immediate overlaps
  updateLite(gameItems: GameItem[]): void {
    if (gameItems.length === 0) return

    const activeItems = gameItems.filter((item) => !item.isDragging)
    if (activeItems.length === 0) return

    // Simple overlap resolution without full physics
    this.buildSpatialHash(activeItems)
    
    for (const item of activeItems) {
      const nearby = this.getNearbyItems(item)
      
      for (const other of nearby) {
        const dx = other.x - item.x
        const dy = other.y - item.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        if (dist < 100 && dist > 0) {
          // Push apart gently
          const push = (100 - dist) * 0.1
          const nx = dx / dist
          const ny = dy / dist
          
          item.x -= nx * push * 0.5
          item.y -= ny * push * 0.5
          other.x += nx * push * 0.5
          other.y += ny * push * 0.5
        }
      }
    }
  }

  checkMovement(gameItems: GameItem[]): void {
    const activeItems = gameItems.filter((item) => !item.isDragging)
    let anyMoving = false

    for (const item of activeItems) {
      const velocity = Math.sqrt((item.vx || 0) ** 2 + (item.vy || 0) ** 2)
      if (velocity > 0.1) {
        anyMoving = true
        break
      }
    }

    if (anyMoving) {
      this.itemsMoving = true
      this.idleFrames = 0
    } else {
      this.idleFrames++
      if (this.idleFrames >= this.maxIdleFrames) {
        this.itemsMoving = false
      }
    }
  }

  calculateForces(gameItems: GameItem[]): { x: number; y: number }[] {
    const forces: { x: number; y: number }[] = []
    const itemWidth = 120
    const itemHeight = 200

    // Initialize forces
    for (let i = 0; i < gameItems.length; i++) {
      forces[i] = { x: 0, y: 0 }
    }

    // Use spatial hash for efficient collision detection
    for (let i = 0; i < gameItems.length; i++) {
      const item = gameItems[i]
      if (!item) continue
      
      const nearby = this.getNearbyItems(item)
      
      for (const other of nearby) {
        const j = gameItems.indexOf(other)
        if (j <= i) continue // Avoid duplicate pairs

        // Rectangular overlap check
        const left1 = item.x - itemWidth / 2
        const right1 = item.x + itemWidth / 2
        const top1 = item.y - itemHeight / 2
        const bottom1 = item.y + itemHeight / 2

        const left2 = other.x - itemWidth / 2
        const right2 = other.x + itemWidth / 2
        const top2 = other.y - itemHeight / 2
        const bottom2 = other.y + itemHeight / 2

        const overlapX = Math.max(0, Math.min(right1, right2) - Math.max(left1, left2))
        const overlapY = Math.max(0, Math.min(bottom1, bottom2) - Math.max(top1, top2))

        if (overlapX > 0 && overlapY > 0) {
          const dx = other.x - item.x
          const dy = other.y - item.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance > 0) {
            const pushForce = 2.5
            const unitX = dx / distance
            const unitY = dy / distance

            const forceI = forces[i]
            const forceJ = forces[j]
            if (forceI && forceJ) {
              forceI.x -= unitX * pushForce
              forceI.y -= unitY * pushForce
              forceJ.x += unitX * pushForce
              forceJ.y += unitY * pushForce
            }
          }
        }
      }
    }

    return forces
  }

  applyForces(gameItems: GameItem[], forces: { x: number; y: number }[]): void {
    for (let i = 0; i < gameItems.length; i++) {
      const item = gameItems[i]
      const force = forces[i]
      if (!item || !force) continue

      // Apply force with damping
      item.vx = (item.vx || 0) * 0.85 + force.x * 0.15
      item.vy = (item.vy || 0) * 0.85 + force.y * 0.15

      // Stop very slow movement
      if (Math.abs(item.vx) < 0.05) item.vx = 0
      if (Math.abs(item.vy) < 0.05) item.vy = 0

      // Update position
      item.x += item.vx
      item.y += item.vy
    }
  }

  // Pause physics during intensive operations
  pause(): void {
    this.physicsEnabled = false
  }

  resume(): void {
    this.physicsEnabled = true
  }

  enable(): void {
    this.enabled = true
  }

  disable(): void {
    this.enabled = false
  }

  // Set max items before switching to lite mode
  setMaxItemsForFullPhysics(count: number): void {
    this.maxItemsForFullPhysics = count
  }

  // Set target FPS
  setTargetFPS(fps: number): void {
    this.targetFPS = Math.min(60, Math.max(10, fps))
    this.frameInterval = 1000 / this.targetFPS
  }
}

export default new PhysicsService()
