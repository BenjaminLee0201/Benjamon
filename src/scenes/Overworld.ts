import Phaser from 'phaser'
import { setupLockedCenterCamera } from '../systems/camera'

export default class Overworld extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: any
  private isMoving = false
  private layer!: Phaser.Tilemaps.TilemapLayer
  private currentDirection: 'down' | 'up' | 'left' | 'right' = 'down'
  private currentStep: 'idle' | 'stepA' | 'stepB' = 'idle'
  private inputState: {
    pressedDirection: 'down' | 'up' | 'left' | 'right' | null
    pressStartTime: number
    hasTurned: boolean
    isMovingContinuously: boolean
    queuedDirection: 'down' | 'up' | 'left' | 'right' | null
    wasKeyPressed: boolean
    justTurned: boolean
    hasMovedThisTap: boolean
  } = {
    pressedDirection: null,
    pressStartTime: 0,
    hasTurned: false,
    isMovingContinuously: false,
    queuedDirection: null,
    wasKeyPressed: false,
    justTurned: false,
    hasMovedThisTap: false
  }
  private readonly HOLD_THRESHOLD = 200 // ms to hold before moving

  constructor() {
    super({ key: 'Overworld' })
  }

  preload() {
    // Load custom tilemap assets
    this.load.image('worldTiles', '/assets/tiles/tilesets/world.png')
    this.load.tilemapTiledJSON('map', '/assets/maps/testMap.json')
    
    // Load all directional character sprites (16x32) - 3 frames per direction
    // Down direction
    this.load.image('player-down-idle', '/assets/sprites/character_facedown_idle_16x32.png')
    this.load.image('player-down-stepA', '/assets/sprites/character_facedown_Lfoot_16x32.png')
    this.load.image('player-down-stepB', '/assets/sprites/character_facedown_Rfoot_16x32.png')
    
    // Left direction
    this.load.image('player-left-idle', '/assets/sprites/character_faceleft_idle_16x32.png')
    this.load.image('player-left-stepA', '/assets/sprites/character_faceleft_Lfoot_16x32.png')
    this.load.image('player-left-stepB', '/assets/sprites/character_faceleft_Rfoot_16x32.png')
    
    // Right direction
    this.load.image('player-right-idle', '/assets/sprites/character_faceright_idle_16x32.png')
    this.load.image('player-right-stepA', '/assets/sprites/character_faceright_Lfoot_16x32.png')
    this.load.image('player-right-stepB', '/assets/sprites/character_faceright_Rfoot_16x32.png')
    
    // Up direction
    this.load.image('player-up-idle', '/assets/sprites/character_faceup_idle_16x32.png')
    this.load.image('player-up-stepA', '/assets/sprites/character_faceup_Lfoot_16x32.png')
    this.load.image('player-up-stepB', '/assets/sprites/character_faceup_Rfoot_16x32.png')
  }

  create() {
    // Create tilemap
    const map = this.make.tilemap({ key: 'map' })
    
    // Resolve tileset name dynamically
    const tilesetName = map.tilesets[0]?.name ?? 'world'
    console.log('Using tileset name:', tilesetName)
    
    const tiles = map.addTilesetImage(tilesetName, 'worldTiles')
    console.log('Tileset added:', tiles)
    
    // Create the layer by index (more reliable)
    const layer = tiles ? map.createLayer(0, tiles, 0, 0) : null
    console.log('Layer created by index:', layer)
    
    if (layer) {
      this.layer = layer // Store reference for collision checking
      layer.setDepth(0)
      
      // Set collision for specific tiles
      // Tile 121 = water (impassable)
      layer.setCollisionByProperty({ collides: true })
      layer.setCollisionBetween(121, 121) // Only tile 121 (water) is solid
      
      console.log('Water collision set on tile 121')
      console.log('Layer collision set, visible:', layer.visible)
      console.log('Layer alpha:', layer.alpha)
      console.log('Layer tiles:', layer.layer.data.length)
    }
    
    // Find a safe grass tile to spawn on (prefer center area)
    const tileSize = 16
    let startTileX = Math.floor(map.width / 2)
    let startTileY = Math.floor(map.height / 2)
    let safeTileFound = false
    
    if (layer) {
      // Look for a non-water tile starting from center, then spiral outward
      const centerX = Math.floor(map.width / 2)
      const centerY = Math.floor(map.height / 2)
      
      for (let radius = 0; radius < Math.max(map.width, map.height) && !safeTileFound; radius++) {
        for (let y = centerY - radius; y <= centerY + radius && !safeTileFound; y++) {
          for (let x = centerX - radius; x <= centerX + radius && !safeTileFound; x++) {
            // Only check tiles on the current radius (border of the square)
            if (x === centerX - radius || x === centerX + radius || 
                y === centerY - radius || y === centerY + radius) {
              if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
                const tile = layer.getTileAt(x, y)
                if (tile && tile.index !== 121) { // 121 is water
                  startTileX = x
                  startTileY = y
                  safeTileFound = true
                  console.log('Found safe spawn tile at:', x, y, 'tile index:', tile.index)
                }
              }
            }
          }
        }
      }
    }
    
    this.player = this.physics.add.sprite(
      (startTileX * tileSize) + (tileSize / 2), // Center on tile
      (startTileY * tileSize) + (tileSize / 2), // Center on tile
      'player-down-idle' // Start with down-facing idle sprite
    )
    this.player.setCollideWorldBounds(true)
    this.player.setOrigin(0.5, 1) // Set origin to bottom-center for feet alignment
    
    // Set up physics body for tile-based movement with smaller collision box
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setImmovable(true)
    body.setVelocity(0, 0)
    body.setSize(12, 12) // Smaller collision box for feet alignment
    body.setOffset(2, 20) // Offset to position collision box at character's feet
    
    // Create Pokémon Emerald-style walking animations
    this.createPlayerAnimations()
    
    console.log('Player created:', this.player)
    console.log('Player body:', this.player.body)
    console.log('Player physics enabled:', this.player.body?.enable)
    
    // Debug: Check what tile the player is on and map boundaries
    console.log('Map boundaries:', map.widthInPixels, 'x', map.heightInPixels)
    console.log('Map grid size:', map.width, 'x', map.height)
    if (layer) {
      const tileX = Math.floor(this.player.x / 16)
      const tileY = Math.floor(this.player.y / 16)
      const tile = layer.getTileAt(tileX, tileY)
      console.log('Player spawn tile:', tile?.index, 'at grid position:', tileX, tileY)
      console.log('Player world position:', this.player.x, this.player.y)
    }
    
    // Add collision between player and layer
    if (layer) {
      // Temporarily disable collision to test movement
      // this.physics.add.collider(this.player, layer)
      console.log('Player collision temporarily disabled for testing')
    }
    
    // Setup camera
    setupLockedCenterCamera(this, map, this.player, 240, 160)
    
    // Add debug HUD
    const info = `map: ${map.width}x${map.height}  px: ${map.widthInPixels}x${map.heightInPixels}`
    this.add.text(2, 2, info, { fontFamily: 'monospace', fontSize: '10px', color: '#fff' })
      .setScrollFactor(0)
      .setDepth(1000)
    
    // Setup controls
    this.setupControls()
    
    console.log('Scene created successfully')
  }

  update() {
    this.handlePlayerMovement()
  }

  private setupControls() {
    // Cursor keys
    this.cursors = this.input.keyboard!.createCursorKeys()
    
    // WASD keys
    this.wasd = this.input.keyboard!.addKeys('W,S,A,D')
  }

  private createPlayerAnimations() {
    // For now, just use idle down frame (frame 0)
    // No animations - Brendan stays in idle down pose
  }

  private handlePlayerMovement() {
    // Only allow input if not currently moving
    if (this.isMoving) return
    
    const currentTime = this.time.now
    let inputDirection: 'down' | 'up' | 'left' | 'right' | null = null
    
    // Check for current input
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      inputDirection = 'left'
    }
    else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      inputDirection = 'right'
    }
    else if (this.cursors.up.isDown || this.wasd.W.isDown) {
      inputDirection = 'up'
    }
    else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      inputDirection = 'down'
    }
    
    // Handle input state changes
    if (inputDirection !== this.inputState.pressedDirection) {
      // New direction pressed or released
      if (inputDirection !== null) {
        // New direction pressed
        if (this.isMoving) {
          // Queue the input if currently moving
          this.inputState.queuedDirection = inputDirection
        } else {
          // Apply input immediately if not moving
          this.inputState.pressedDirection = inputDirection
          this.inputState.pressStartTime = currentTime
          this.inputState.hasTurned = false
          this.inputState.isMovingContinuously = false
          this.inputState.wasKeyPressed = true
          this.inputState.hasMovedThisTap = false
        }
      } else {
        // All inputs released - ensure character is idle
        this.inputState.pressedDirection = null
        this.inputState.hasTurned = false
        this.inputState.isMovingContinuously = false
        this.inputState.wasKeyPressed = false
        this.inputState.justTurned = false
        this.inputState.hasMovedThisTap = false
        this.currentStep = 'idle'
        this.updateSprite()
      }
    }
    
    // Handle movement logic
    if (this.inputState.pressedDirection !== null) {
      const pressDuration = currentTime - this.inputState.pressStartTime
      
      if (!this.inputState.hasTurned) {
        // Check if we need to turn or if already facing this direction
        if (this.inputState.pressedDirection !== this.currentDirection) {
          // Need to turn to face the direction
          this.changeDirection(this.inputState.pressedDirection)
          this.inputState.hasTurned = true
          this.inputState.justTurned = true
          // Don't move yet - just turn
        } else {
          // Already facing this direction, move immediately on tap
          this.inputState.hasTurned = true
          this.inputState.justTurned = false
          if (!this.inputState.hasMovedThisTap) {
            this.inputState.hasMovedThisTap = true
            this.startContinuousMovement(this.inputState.pressedDirection)
          }
        }
      } else if (this.inputState.pressedDirection === this.currentDirection && !this.inputState.justTurned && pressDuration >= this.HOLD_THRESHOLD) {
        // Key held in same direction for threshold time (and we didn't just turn)
        if (!this.inputState.isMovingContinuously) {
          // Start continuous movement
          this.inputState.isMovingContinuously = true
          this.startContinuousMovement(this.inputState.pressedDirection)
        }
      }
    }
    
    // Handle continuous movement
    if (this.inputState.isMovingContinuously && !this.isMoving && this.inputState.pressedDirection === this.currentDirection) {
      this.startContinuousMovement(this.inputState.pressedDirection)
    }
  }

  private changeDirection(direction: 'down' | 'up' | 'left' | 'right') {
    if (this.currentDirection !== direction) {
      this.currentDirection = direction
      this.updateSprite()
    }
  }

  private updateSprite() {
    this.player.setTexture(`player-${this.currentDirection}-${this.currentStep}`)
  }

  private startContinuousMovement(direction: 'down' | 'up' | 'left' | 'right') {
    if (direction === 'left') {
      this.movePlayer(-16, 0, direction)
    } else if (direction === 'right') {
      this.movePlayer(16, 0, direction)
    } else if (direction === 'up') {
      this.movePlayer(0, -16, direction)
    } else if (direction === 'down') {
      this.movePlayer(0, 16, direction)
    }
  }
  
  private movePlayer(deltaX: number, deltaY: number, direction: 'down' | 'up' | 'left' | 'right') {
    if (this.isMoving) return
    
    const tileSize = 16
    const newX = this.player.x + deltaX
    const newY = this.player.y + deltaY
    
    // Convert new position to tile coordinates
    const newTileX = Math.floor(newX / tileSize)
    const newTileY = Math.floor(newY / tileSize)
    
    // Get map reference for bounds checking
    const map = this.layer.tilemap
    
    // Check bounds - ensure we don't go outside the map
    if (newTileX < 0 || newTileY < 0 || newTileX >= map.width || newTileY >= map.height) {
      console.log('Cannot move: out of bounds at tile:', newTileX, newTileY, 'map size:', map.width, 'x', map.height)
      return
    }
    
    // Check collision with water tiles
    if (this.layer) {
      const tile = this.layer.getTileAt(newTileX, newTileY)
      if (tile && tile.index === 121) { // 121 is water
        console.log('Cannot move to water tile at:', newTileX, newTileY)
        return // Don't move if target tile is water
      }
    }
    
    // Update direction if changed
    this.changeDirection(direction)
    
    this.isMoving = true
    
    // Emerald-style walking: split 16px movement into two 8px half-steps
    // First half-step: stepA
    this.currentStep = 'stepA'
    this.updateSprite()
    
    this.tweens.add({
      targets: this.player,
      x: this.player.x + (deltaX / 2),
      y: this.player.y + (deltaY / 2),
      duration: 125, // Half of total duration
      ease: 'Linear',
      onComplete: () => {
        // Second half-step: stepB
        this.currentStep = 'stepB'
        this.updateSprite()
        
        this.tweens.add({
          targets: this.player,
          x: newX,
          y: newY,
          duration: 125, // Second half of total duration
          ease: 'Linear',
          onComplete: () => {
            // Only return to idle if not moving continuously and no input is pressed
            if (!this.inputState.isMovingContinuously && this.inputState.pressedDirection === null) {
              this.currentStep = 'idle'
              this.updateSprite()
            }
            this.isMoving = false
            
            // Process queued input for smooth corners
            if (this.inputState.queuedDirection !== null) {
              this.inputState.pressedDirection = this.inputState.queuedDirection
              this.inputState.pressStartTime = this.time.now
              this.inputState.hasTurned = false
              this.inputState.isMovingContinuously = false
              this.inputState.wasKeyPressed = true
              this.inputState.justTurned = false
              this.inputState.hasMovedThisTap = false
              this.inputState.queuedDirection = null
            }
          }
        })
      }
    })
  }
}