import { log } from '../ui/log.ts'
import type { GameItem } from '../../types/game'

interface LayoutCenter {
  x: number
  y: number
}

type GetGameItemsCallback = () => GameItem[]
type OnUpdateCallback = () => void

class PhysicsService {
  private enabled: boolean = true
  private layoutCenter: LayoutCenter = { x: 0, y: 0 }
  private repulsionStrength: number = 20 // Reduced for smoother movement
  private centerAttractionStrength: number = 0.1 // Reduced center attraction
  private animationFrameId: number | null = null
  private isRunning: boolean = false
  private callbacks: OnUpdateCallback[] = []
  private itemsMoving: boolean = false
  private idleFrames: number = 0
  private maxIdleFrames: number = 30 // Pause after 30 frames of no movement

  start(getGameItems: GetGameItemsCallback, onUpdate: OnUpdateCallback): void {
    if (this.isRunning) return

    this.isRunning = true
    this.callbacks.push(onUpdate)

    // Initialize layout center with reasonable default values
    this.updateLayoutCenter(800, 600) // Default viewport size

    // Use requestAnimationFrame for better performance
    this.animate(getGameItems)

    log(2000, { message: 'Physics service started' })
  }

  animate(getGameItems) {
    if (!this.isRunning) return

    if (this.enabled) {
      const gameItems = typeof getGameItems === 'function' ? getGameItems() : getGameItems
      if (gameItems && gameItems.length > 0) {
        const wasMoving = this.itemsMoving
        this.update(gameItems)
        
        // Check if items are still moving
        this.checkMovement(gameItems)
        
        // Only call callbacks if something changed or items are moving
        if (this.itemsMoving || wasMoving) {
          this.callbacks.forEach((callback) => callback())
        }
      }
    }

    // Continue animation loop
    this.animationFrameId = requestAnimationFrame(() => this.animate(getGameItems))
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    this.isRunning = false
    this.callbacks = []
    this.itemsMoving = false
    this.idleFrames = 0
    log(2000, { message: 'Physics service stopped' })
  }

  updateLayoutCenter(width, height) {
    this.layoutCenter = {
      x: width / 2,
      y: height / 2,
    }
  }

  // Method to update center when viewport changes
  updateCenterFromViewport(viewport) {
    // Calculate the center of the current viewport
    this.layoutCenter = {
      x: -viewport.x + window.innerWidth / 2 / viewport.scale,
      y: -viewport.y + window.innerHeight / 2 / viewport.scale,
    }
  }

  update(gameItems) {
    if (gameItems.length === 0) return

    // Only apply physics to items that aren't being dragged
    const activeItems = gameItems.filter((item) => !item.isDragging)

    if (activeItems.length === 0) return

    const forces = this.calculateForces(activeItems)
    this.applyForces(activeItems, forces)
  }

  checkMovement(gameItems) {
    // Check if any items are moving
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

  calculateForces(gameItems) {
    const forces = []
    const minDistance = 120 // Reduced distance - closer together
    const itemWidth = 120 // Actual item width
    const itemHeight = 200 // Actual item height

    // Initialize forces array for all items
    for (let i = 0; i < gameItems.length; i++) {
      forces[i] = { x: 0, y: 0 }
    }

    // Check for rectangular overlaps - proper hitbox detection
    for (let i = 0; i < gameItems.length; i++) {
      for (let j = i + 1; j < gameItems.length; j++) {
        const item1 = gameItems[i]
        const item2 = gameItems[j]

        // Calculate rectangular boundaries
        const left1 = item1.x - itemWidth / 2
        const right1 = item1.x + itemWidth / 2
        const top1 = item1.y - itemHeight / 2
        const bottom1 = item1.y + itemHeight / 2

        const left2 = item2.x - itemWidth / 2
        const right2 = item2.x + itemWidth / 2
        const top2 = item2.y - itemHeight / 2
        const bottom2 = item2.y + itemHeight / 2

        // Check if rectangles overlap
        const overlapX = Math.max(0, Math.min(right1, right2) - Math.max(left1, left2))
        const overlapY = Math.max(0, Math.min(bottom1, bottom2) - Math.max(top1, top2))

        if (overlapX > 0 && overlapY > 0) {
          // Items are overlapping - push them apart with consistent force
          const dx = item2.x - item1.x
          const dy = item2.y - item1.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance > 0) {
            const pushForce = 3.0 // Gentler push force for smoother movement

            // Calculate direction
            const unitX = dx / distance
            const unitY = dy / distance

            // Apply equal and opposite forces
            forces[i].x -= unitX * pushForce
            forces[i].y -= unitY * pushForce
            forces[j].x += unitX * pushForce
            forces[j].y += unitY * pushForce
          }
        }
      }
    }

    return forces
  }

  applyForces(gameItems, forces) {
    for (let i = 0; i < gameItems.length; i++) {
      const item = gameItems[i]
      const force = forces[i]

      // Very simple physics - just apply force and dampen
      item.vx = (item.vx || 0) * 0.9 + force.x * 0.1
      item.vy = (item.vy || 0) * 0.9 + force.y * 0.1

      // Stop very slow movement
      if (Math.abs(item.vx) < 0.1) {
        item.vx = 0
      }
      if (Math.abs(item.vy) < 0.1) {
        item.vy = 0
      }

      // Update position
      item.x += item.vx
      item.y += item.vy
    }
  }

  setRepulsionStrength(strength) {
    this.repulsionStrength = strength
  }

  setCenterAttractionStrength(strength) {
    this.centerAttractionStrength = strength
  }

  enable() {
    this.enabled = true
  }

  disable() {
    this.enabled = false
  }
}

export default new PhysicsService()
