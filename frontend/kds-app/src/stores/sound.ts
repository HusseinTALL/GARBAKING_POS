/**
 * Sound notification store for Kitchen Display System
 * Manages audio notifications for new orders and status changes
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSoundStore = defineStore('sound', () => {
  const enabled = ref(true)
  const volume = ref(0.8)

  const playNewOrder = () => {
    if (enabled.value && window.playNewOrderSound) {
      window.playNewOrderSound()
    }
  }

  const playOrderComplete = () => {
    if (enabled.value && window.playOrderCompleteSound) {
      window.playOrderCompleteSound()
    }
  }

  const toggle = () => {
    enabled.value = !enabled.value
    localStorage.setItem('kds-sound-enabled', enabled.value.toString())
  }

  const setVolume = (newVolume: number) => {
    volume.value = Math.max(0, Math.min(1, newVolume))
    localStorage.setItem('kds-sound-volume', volume.value.toString())
  }

  // Load saved preferences
  const loadPreferences = () => {
    const savedEnabled = localStorage.getItem('kds-sound-enabled')
    const savedVolume = localStorage.getItem('kds-sound-volume')

    if (savedEnabled !== null) {
      enabled.value = savedEnabled === 'true'
    }

    if (savedVolume !== null) {
      volume.value = parseFloat(savedVolume)
    }
  }

  return {
    enabled,
    volume,
    playNewOrder,
    playOrderComplete,
    toggle,
    setVolume,
    loadPreferences
  }
})