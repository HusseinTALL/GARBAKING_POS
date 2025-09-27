/**
 * Network store for managing connectivity status
 * Handles online/offline states and sync operations
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNetworkStore = defineStore('network', () => {
  // State
  const isOnline = ref(navigator.onLine)
  const lastSyncTime = ref<Date | null>(null)
  const pendingSyncItems = ref<string[]>([])

  // Getters
  const connectionStatus = computed(() => {
    return isOnline.value ? 'connected' : 'offline'
  })

  const hasPendingSync = computed(() => {
    return pendingSyncItems.value.length > 0
  })

  const timeSinceLastSync = computed(() => {
    if (!lastSyncTime.value) return null

    const now = new Date()
    const diff = now.getTime() - lastSyncTime.value.getTime()
    const minutes = Math.floor(diff / (1000 * 60))

    if (minutes < 1) return 'À l\'instant'
    if (minutes < 60) return `Il y a ${minutes} min`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Il y a ${hours}h`

    const days = Math.floor(hours / 24)
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`
  })

  // Actions
  const setOnline = (online: boolean) => {
    isOnline.value = online

    if (online && hasPendingSync.value) {
      // Trigger sync when coming back online
      syncPendingItems()
    }
  }

  const addPendingSync = (itemId: string) => {
    if (!pendingSyncItems.value.includes(itemId)) {
      pendingSyncItems.value.push(itemId)
    }
  }

  const removePendingSync = (itemId: string) => {
    const index = pendingSyncItems.value.indexOf(itemId)
    if (index > -1) {
      pendingSyncItems.value.splice(index, 1)
    }
  }

  const updateLastSyncTime = () => {
    lastSyncTime.value = new Date()
  }

  const syncPendingItems = async () => {
    if (!isOnline.value || !hasPendingSync.value) {
      return
    }

    console.log('Syncing pending items:', pendingSyncItems.value)

    try {
      // Request service worker to sync pending orders
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_PENDING_ORDERS'
        })
      }

      // Also try direct sync for immediate feedback
      await Promise.all(pendingSyncItems.value.map(async (itemId) => {
        try {
          // This would be actual API calls to sync specific items
          console.log(`Syncing item: ${itemId}`)
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500))
          removePendingSync(itemId)
        } catch (error) {
          console.error(`Failed to sync item ${itemId}:`, error)
        }
      }))

      updateLastSyncTime()
      console.log('Sync completed successfully')
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }

  const checkConnectivity = async (): Promise<boolean> => {
    try {
      // Try to fetch a small resource to check actual connectivity
      const response = await fetch('/local/menu', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })

      const online = response.ok
      setOnline(online)
      return online
    } catch (error) {
      setOnline(false)
      return false
    }
  }

  const enableOfflineMode = () => {
    // Cache current menu data for offline use
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'ENABLE_OFFLINE_MODE'
      })
    }

    console.log('Offline mode enabled')
  }

  const getOfflineData = async () => {
    try {
      // Request cached data from service worker
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel()

        return new Promise((resolve) => {
          messageChannel.port1.onmessage = (event) => {
            resolve(event.data)
          }

          navigator.serviceWorker.controller!.postMessage(
            { type: 'GET_OFFLINE_DATA' },
            [messageChannel.port2]
          )
        })
      }

      return null
    } catch (error) {
      console.error('Failed to get offline data:', error)
      return null
    }
  }

  const clearOfflineData = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_OFFLINE_DATA'
      })
    }

    pendingSyncItems.value = []
    console.log('Offline data cleared')
  }

  // Initialize event listeners
  const initializeEventListeners = () => {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('Browser detected online status')
      setOnline(true)
    })

    window.addEventListener('offline', () => {
      console.log('Browser detected offline status')
      setOnline(false)
    })

    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, data } = event.data

        switch (type) {
          case 'SYNC_STATUS_UPDATE':
            if (data.success) {
              removePendingSync(data.itemId)
              updateLastSyncTime()
            }
            break

          case 'CONNECTIVITY_CHANGED':
            setOnline(data.isOnline)
            break

          default:
            console.log('Unknown SW message:', type, data)
        }
      })
    }
  }

  // Initialize on store creation
  initializeEventListeners()

  return {
    // State
    isOnline,
    lastSyncTime,
    pendingSyncItems,

    // Getters
    connectionStatus,
    hasPendingSync,
    timeSinceLastSync,

    // Actions
    setOnline,
    addPendingSync,
    removePendingSync,
    updateLastSyncTime,
    syncPendingItems,
    checkConnectivity,
    enableOfflineMode,
    getOfflineData,
    clearOfflineData,
    initializeEventListeners
  }
})