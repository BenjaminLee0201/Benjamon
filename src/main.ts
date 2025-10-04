import Phaser from 'phaser'
import Overworld from './scenes/Overworld'
import './styles.css'

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 240,
  height: 160,
  parent: 'game',
  backgroundColor: '#0066cc',
  pixelArt: true,
  antialias: false,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 240,
    height: 160
  },
  scene: [Overworld]
}

// Initialize the game
const game = new Phaser.Game(config)

export default game