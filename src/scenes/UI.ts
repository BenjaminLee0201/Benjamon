import Phaser from 'phaser'

export default class UI extends Phaser.Scene {
  private interactPrompt!: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'UI' })
  }

  create() {
    // Create interaction prompt (hidden initially)
    this.interactPrompt = this.add.text(120, 20, 'Press Z to interact', {
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    })
    this.interactPrompt.setOrigin(0.5, 0.5)
    this.interactPrompt.setVisible(false)

    // Setup Z key for interaction
    this.input.keyboard!.on('keydown-Z', () => {
      this.handleInteraction()
    })

    // Setup M key for music toggle
    this.input.keyboard!.on('keydown-M', () => {
      this.toggleMusic()
    })
  }

  private handleInteraction() {
    // Placeholder for interaction logic
    console.log('Interaction triggered!')
    
    // Show temporary feedback
    this.showInteractionFeedback()
  }

  private toggleMusic() {
    // Placeholder for music toggle logic
    console.log('Music toggled!')
    
    // Show temporary feedback
    this.showMusicFeedback()
  }

  private showInteractionFeedback() {
    const feedback = this.add.text(120, 60, 'Interacted!', {
      fontSize: '10px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 6, y: 3 }
    })
    feedback.setOrigin(0.5, 0.5)
    
    // Fade out after 1 second
    this.tweens.add({
      targets: feedback,
      alpha: 0,
      duration: 1000,
      onComplete: () => feedback.destroy()
    })
  }

  private showMusicFeedback() {
    const feedback = this.add.text(120, 80, 'Music: ON/OFF', {
      fontSize: '10px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 6, y: 3 }
    })
    feedback.setOrigin(0.5, 0.5)
    
    // Fade out after 1 second
    this.tweens.add({
      targets: feedback,
      alpha: 0,
      duration: 1000,
      onComplete: () => feedback.destroy()
    })
  }

  public showInteractPrompt(x: number, y: number) {
    this.interactPrompt.setPosition(x, y)
    this.interactPrompt.setVisible(true)
  }

  public hideInteractPrompt() {
    this.interactPrompt.setVisible(false)
  }
}