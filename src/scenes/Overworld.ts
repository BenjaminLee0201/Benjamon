import Phaser from 'phaser'
import { setupLockedCenterCamera } from '../systems/camera'

export default class Overworld extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: any
  private isMoving = false
  private layer!: Phaser.Tilemaps.TilemapLayer

  constructor() {
    super({ key: 'Overworld' })
  }

  preload() {
    // Load custom tilemap assets
    this.load.image('worldTiles', '/assets/tiles/tilesets/world.png')
    this.load.tilemapTiledJSON('map', '/assets/maps/testMap.json')
    
    // Create player sprite (blue square)
    const playerGraphics = this.add.graphics()
    playerGraphics.fillStyle(0x3498db)
    playerGraphics.fillRect(0, 0, 16, 16)
    playerGraphics.generateTexture('player', 16, 16)
    playerGraphics.destroy()
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
      'player'
    )
    this.player.setCollideWorldBounds(true)
    this.player.setScale(1)
    
    // Disable physics body since we're using tile-based movement
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setImmovable(true)
    body.setVelocity(0, 0)
    
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

  private handlePlayerMovement() {
    // Only allow movement if not currently moving
    if (this.isMoving) return
    
    // Check for input and move one tile at a time
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      this.movePlayer(-16, 0) // Move left one tile
    }
    else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      this.movePlayer(16, 0) // Move right one tile
    }
    else if (this.cursors.up.isDown || this.wasd.W.isDown) {
      this.movePlayer(0, -16) // Move up one tile
    }
    else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      this.movePlayer(0, 16) // Move down one tile
    }
  }
  
  private movePlayer(deltaX: number, deltaY: number) {
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
    
    this.isMoving = true
    
    // Move to new position with animation
    this.tweens.add({
      targets: this.player,
      x: newX,
      y: newY,
      duration: 200, // 200ms per tile movement (Emerald-like speed)
      ease: 'Linear',
      onComplete: () => {
        this.isMoving = false
      }
    })
  }
}