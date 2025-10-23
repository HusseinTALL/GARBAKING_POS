/**
 * Audio Notifications Utility
 * Generates and plays notification sounds using Web Audio API
 */

export type NotificationType = 'order' | 'payment' | 'warning' | 'error' | 'success' | 'info'

export interface AudioSettings {
  enabled: boolean
  volume: number // 0-1
  orderSound: boolean
  paymentSound: boolean
  warningSound: boolean
  errorSound: boolean
}

class AudioNotificationService {
  private audioContext: AudioContext | null = null
  private settings: AudioSettings = {
    enabled: true,
    volume: 0.5,
    orderSound: true,
    paymentSound: true,
    warningSound: true,
    errorSound: true
  }

  constructor() {
    // Initialize AudioContext on first user interaction
    this.initAudioContext()
  }

  private initAudioContext() {
    if (typeof window !== 'undefined' && !this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch (error) {
        console.error('Web Audio API not supported', error)
      }
    }
  }

  /**
   * Resume audio context (required after page load)
   */
  public async resumeContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
  }

  /**
   * Update audio settings
   */
  public updateSettings(newSettings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...newSettings }
    this.saveSettings()
  }

  /**
   * Get current settings
   */
  public getSettings(): AudioSettings {
    return { ...this.settings }
  }

  /**
   * Load settings from localStorage
   */
  public loadSettings() {
    try {
      const saved = localStorage.getItem('garbaking_audio_settings')
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.error('Failed to load audio settings:', error)
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings() {
    try {
      localStorage.setItem('garbaking_audio_settings', JSON.stringify(this.settings))
    } catch (error) {
      console.error('Failed to save audio settings:', error)
    }
  }

  /**
   * Play notification sound based on type
   */
  public async playNotification(type: NotificationType) {
    if (!this.settings.enabled || !this.audioContext) {
      return
    }

    // Check if specific sound type is enabled
    const typeKey = `${type}Sound` as keyof AudioSettings
    if (typeKey in this.settings && !this.settings[typeKey]) {
      return
    }

    await this.resumeContext()

    switch (type) {
      case 'order':
        await this.playOrderSound()
        break
      case 'payment':
        await this.playPaymentSound()
        break
      case 'warning':
        await this.playWarningSound()
        break
      case 'error':
        await this.playErrorSound()
        break
      case 'success':
        await this.playSuccessSound()
        break
      case 'info':
        await this.playInfoSound()
        break
    }
  }

  /**
   * Generate and play order notification sound (double beep)
   */
  private async playOrderSound() {
    await this.playBeep(800, 0.15, 'sine')
    await this.delay(100)
    await this.playBeep(1000, 0.15, 'sine')
  }

  /**
   * Generate and play payment success sound (ascending tones)
   */
  private async playPaymentSound() {
    await this.playBeep(523.25, 0.1, 'sine') // C5
    await this.delay(80)
    await this.playBeep(659.25, 0.1, 'sine') // E5
    await this.delay(80)
    await this.playBeep(783.99, 0.15, 'sine') // G5
  }

  /**
   * Generate and play warning sound (repeated mid-tone)
   */
  private async playWarningSound() {
    for (let i = 0; i < 3; i++) {
      await this.playBeep(600, 0.08, 'square')
      await this.delay(100)
    }
  }

  /**
   * Generate and play error sound (descending harsh tones)
   */
  private async playErrorSound() {
    await this.playBeep(400, 0.15, 'sawtooth')
    await this.delay(100)
    await this.playBeep(300, 0.2, 'sawtooth')
  }

  /**
   * Generate and play success sound (cheerful ascending)
   */
  private async playSuccessSound() {
    await this.playBeep(523.25, 0.08, 'sine') // C5
    await this.delay(50)
    await this.playBeep(659.25, 0.08, 'sine') // E5
    await this.delay(50)
    await this.playBeep(783.99, 0.1, 'sine') // G5
  }

  /**
   * Generate and play info sound (single gentle beep)
   */
  private async playInfoSound() {
    await this.playBeep(800, 0.1, 'sine')
  }

  /**
   * Generate and play a beep sound
   */
  private async playBeep(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine'
  ): Promise<void> {
    if (!this.audioContext) return

    return new Promise((resolve) => {
      const oscillator = this.audioContext!.createOscillator()
      const gainNode = this.audioContext!.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext!.destination)

      oscillator.frequency.value = frequency
      oscillator.type = type

      // Apply volume and envelope
      gainNode.gain.setValueAtTime(0, this.audioContext!.currentTime)
      gainNode.gain.linearRampToValueAtTime(
        this.settings.volume * 0.3,
        this.audioContext!.currentTime + 0.01
      )
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext!.currentTime + duration
      )

      oscillator.start(this.audioContext!.currentTime)
      oscillator.stop(this.audioContext!.currentTime + duration)

      oscillator.onended = () => resolve()
    })
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Test all sounds
   */
  public async testAllSounds() {
    const types: NotificationType[] = ['order', 'payment', 'success', 'warning', 'error', 'info']

    for (const type of types) {
      console.log(`Playing ${type} sound...`)
      await this.playNotification(type)
      await this.delay(800)
    }
  }
}

// Create singleton instance
export const audioService = new AudioNotificationService()

// Load settings on init
audioService.loadSettings()

export default audioService
