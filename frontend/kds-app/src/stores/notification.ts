/**
 * Notification store for managing app-wide notifications
 * Handles success, warning, error, and info messages
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Notification {
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message?: string
  duration?: number
}

export const useNotificationStore = defineStore('notification', () => {
  const notification = ref<Notification | null>(null)
  let timeoutId: number | null = null

  const show = (config: Notification) => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    notification.value = config

    // Auto-clear notification after duration
    const duration = config.duration || 5000
    timeoutId = window.setTimeout(() => {
      clear()
    }, duration)
  }

  const clear = () => {
    notification.value = null
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const success = (title: string, message?: string) => {
    show({ type: 'success', title, message })
  }

  const warning = (title: string, message?: string) => {
    show({ type: 'warning', title, message })
  }

  const error = (title: string, message?: string) => {
    show({ type: 'error', title, message, duration: 8000 })
  }

  const info = (title: string, message?: string) => {
    show({ type: 'info', title, message })
  }

  return {
    notification,
    show,
    clear,
    success,
    warning,
    error,
    info
  }
})