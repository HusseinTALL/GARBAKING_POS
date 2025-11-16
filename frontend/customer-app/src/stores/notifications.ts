/**
 * Notifications Store - Manages app notifications
 *
 * Handles:
 * - In-app notifications
 * - Notification types (order, promo, system)
 * - Read/unread state
 * - Notification history
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type NotificationType = 'order' | 'promo' | 'system' | 'delivery'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  time: string
  read: boolean
  actionUrl?: string
  icon?: string
  color?: string
}

export const useNotificationsStore = defineStore('notifications', () => {
  // State
  const notifications = ref<Notification[]>([
    {
      id: '1',
      type: 'order',
      title: 'Order Delivered!',
      message: 'Your order #12345 has been delivered successfully',
      time: '2 minutes ago',
      read: false,
      icon: 'fa-check-circle',
      color: 'green'
    },
    {
      id: '2',
      type: 'promo',
      title: '30% Off Today!',
      message: 'Get 30% discount on your next order. Valid until midnight!',
      time: '1 hour ago',
      read: false,
      icon: 'fa-tag',
      color: 'amber'
    },
    {
      id: '3',
      type: 'delivery',
      title: 'Your order is on the way',
      message: 'Driver will arrive in 10 minutes',
      time: '5 hours ago',
      read: true,
      icon: 'fa-motorcycle',
      color: 'blue'
    },
    {
      id: '4',
      type: 'system',
      title: 'Welcome to FoodHub!',
      message: 'Thank you for joining us. Enjoy your first order!',
      time: 'Yesterday',
      read: true,
      icon: 'fa-info-circle',
      color: 'gray'
    }
  ])

  // Getters
  const unreadCount = computed(() =>
    notifications.value.filter(n => !n.read).length
  )

  const unreadNotifications = computed(() =>
    notifications.value.filter(n => !n.read)
  )

  const readNotifications = computed(() =>
    notifications.value.filter(n => n.read)
  )

  const groupedByDate = computed(() => {
    const groups: Record<string, Notification[]> = {
      'Today': [],
      'Yesterday': [],
      'Earlier': []
    }

    notifications.value.forEach(notification => {
      if (notification.time.includes('minute') || notification.time.includes('hour')) {
        groups['Today'].push(notification)
      } else if (notification.time.includes('Yesterday')) {
        groups['Yesterday'].push(notification)
      } else {
        groups['Earlier'].push(notification)
      }
    })

    return groups
  })

  // Actions
  function markAsRead(id: string) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  function markAllAsRead() {
    notifications.value.forEach(n => {
      n.read = true
    })
  }

  function deleteNotification(id: string) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  function addNotification(notification: Omit<Notification, 'id' | 'read' | 'time'>) {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      time: 'Just now'
    }
    notifications.value.unshift(newNotification)
  }

  function clearAll() {
    notifications.value = []
  }

  return {
    // State
    notifications,
    // Getters
    unreadCount,
    unreadNotifications,
    readNotifications,
    groupedByDate,
    // Actions
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    clearAll
  }
}, {
  persist: true
})
