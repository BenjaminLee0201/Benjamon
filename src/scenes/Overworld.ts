import Phaser from 'phaser'

export default class Overworld extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: any

  constructor() {
    super({ key: 'Overworld' })
  }

  preload() {
    // Create player sprite (blue square)
    const playerGraphics = this.add.graphics()
    playerGraphics.fillStyle(0x3498db)
    playerGraphics.fillRect(0, 0, 16, 16)
    playerGraphics.generateTexture('player', 16, 16)
    playerGraphics.destroy()
  }

  create() {
    // Create player sprite at center of game area
    this.player = this.physics.add.sprite(120, 80, 'player')
    this.player.setCollideWorldBounds(true)
    this.player.setScale(1)
    
    // Setup camera
    this.setupCamera()
    
    // Setup controls
    this.setupControls()
  }

  update() {
    this.handlePlayerMovement()
  }

  private setupCamera() {
    // Camera follows player with pixel-perfect positioning
    this.cameras.main.startFollow(this.player)
    this.cameras.main.setBounds(0, 0, 240, 160)
    this.cameras.main.setZoom(1)
    
    // Round camera position to maintain pixel-perfect rendering
    this.cameras.main.roundPixels = true
  }

  private setupControls() {
    // Cursor keys
    this.cursors = this.input.keyboard!.createCursorKeys()
    
    // WASD keys
    this.wasd = this.input.keyboard!.addKeys('W,S,A,D')
  }

  private handlePlayerMovement() {
    const speed = 80
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setVelocity(0)
    
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      body.setVelocityX(-speed)
    }
    if (this.cursors.right.isDown || this.wasd.D.isDown) {
      body.setVelocityX(speed)
    }
    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      body.setVelocityY(-speed)
    }
    if (this.cursors.down.isDown || this.wasd.S.isDown) {
      body.setVelocityY(speed)
    }
    
    // Clamp to screen (0..240, 0..160) assuming 16x16 square centered on origin
    this.player.x = Phaser.Math.Clamp(this.player.x, 8, 240 - 8)
    this.player.y = Phaser.Math.Clamp(this.player.y, 8, 160 - 8)
  }
}