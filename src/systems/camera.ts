import Phaser from 'phaser'

export function setupLockedCenterCamera(
  scene: Phaser.Scene,
  map: Phaser.Tilemaps.Tilemap,
  player: Phaser.GameObjects.Sprite | Phaser.Physics.Arcade.Sprite,
  viewW = 240,
  viewH = 160
) {
  const cam = scene.cameras.main
  const mw = map.widthInPixels
  const mh = map.heightInPixels

  // World & camera bounds
  scene.physics.world.setBounds(0, 0, mw, mh)
  cam.setBounds(0, 0, mw, mh)

  // Follow the player with no smoothing (snaps to center)
  cam.startFollow(player, true, 1, 1) // roundPixels = true, lerpX=1, lerpY=1
  cam.setRoundPixels(true)

  // If map is smaller than the view, just center once (prevents jitter)
  if (mw <= viewW && mh <= viewH) {
    cam.stopFollow()
    cam.centerOn(Math.floor(mw / 2), Math.floor(mh / 2))
  }

  // Optional: keep player under 'Above' layer if it exists
  const aboveIdx = map.getLayerIndex('Above')
  if (aboveIdx !== -1) {
    const aboveLayer = map.getLayer('Above')
    if (aboveLayer && aboveLayer.tilemapLayer) {
      aboveLayer.tilemapLayer.setDepth(10)
    }
  }
  player.setDepth(5)
}
