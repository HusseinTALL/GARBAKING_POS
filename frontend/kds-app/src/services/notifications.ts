/**
 * Notification service for system alerts and user notifications
 * Handles toast notifications, browser notifications, and sound alerts
 */

import { ref, reactive } from 'vue'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  duration: number
  persistent?: boolean
  actions?: NotificationAction[]
  timestamp: string
  read: boolean
  category?: string
  data?: any
}

export interface NotificationAction {
  label: string
  action: string
  style?: 'primary' | 'secondary' | 'danger'
}

export interface NotificationConfig {
  enableSound: boolean
  enableBrowser: boolean
  enableToast: boolean
  soundVolume: number
  autoClose: boolean
  defaultDuration: number
  maxNotifications: number
}

export interface SoundConfig {
  newOrder: string
  orderReady: string
  payment: string
  error: string
  warning: string
  info: string
}

class NotificationService {
  // Reactive state
  public notifications = ref<Notification[]>([])
  public unreadCount = ref(0)
  public isPermissionGranted = ref(false)

  // Configuration
  public config = reactive<NotificationConfig>({
    enableSound: true,
    enableBrowser: true,
    enableToast: true,
    soundVolume: 0.5,
    autoClose: true,
    defaultDuration: 5000,
    maxNotifications: 50
  })

  // Sound configuration
  private sounds: SoundConfig = {
    newOrder: '/sounds/new-order.mp3',
    orderReady: '/sounds/order-ready.mp3',
    payment: '/sounds/payment.mp3',
    error: '/sounds/error.mp3',
    warning: '/sounds/warning.mp3',
    info: '/sounds/info.mp3'
  }

  // Audio elements
  private audioElements = new Map<string, HTMLAudioElement>()

  // Event listeners
  private eventListeners = new Map<string, Set<Function>>()

  constructor() {
    this.initializeAudio()
    this.requestPermission()
    this.loadConfig()
  }

  /**
   * Initialize audio elements
   */
  private initializeAudio(): void {
    Object.entries(this.sounds).forEach(([key, src]) => {
      const audio = new Audio(src)
      audio.volume = this.config.soundVolume
      audio.preload = 'auto'
      this.audioElements.set(key, audio)
    })
  }

  /**
   * Request browser notification permission
   */
  private async requestPermission(): Promise<void> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      this.isPermissionGranted.value = permission === 'granted'
    }
  }

  /**
   * Load configuration from localStorage
   */
  private loadConfig(): void {
    const saved = localStorage.getItem('pos-notification-config')
    if (saved) {
      try {
        const config = JSON.parse(saved)
        Object.assign(this.config, config)
      } catch (error) {
        console.warn('Failed to load notification config:', error)
      }
    }
  }

  /**
   * Save configuration to localStorage
   */
  private saveConfig(): void {
    localStorage.setItem('pos-notification-config', JSON.stringify(this.config))
  }

  /**
   * Generate unique notification ID
   */
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Show notification
   */
  public show(
    type: Notification['type'],
    title: string,
    message: string,
    options: Partial<Pick<Notification, 'duration' | 'persistent' | 'actions' | 'category' | 'data'>> = {}
  ): string {
    const notification: Notification = {
      id: this.generateId(),
      type,
      title,
      message,
      duration: options.duration ?? this.config.defaultDuration,
      persistent: options.persistent ?? false,
      actions: options.actions,
      timestamp: new Date().toISOString(),
      read: false,
      category: options.category,
      data: options.data
    }

    // Add to notifications list
    this.notifications.value.unshift(notification)
    this.unreadCount.value++

    // Limit notifications count
    if (this.notifications.value.length > this.config.maxNotifications) {
      this.notifications.value = this.notifications.value.slice(0, this.config.maxNotifications)
    }

    // Show toast notification
    if (this.config.enableToast) {
      this.showToast(notification)
    }

    // Show browser notification
    if (this.config.enableBrowser && this.isPermissionGranted.value) {
      this.showBrowserNotification(notification)
    }

    // Play sound
    if (this.config.enableSound) {
      this.playSound(type)
    }

    // Auto remove if not persistent
    if (!notification.persistent && this.config.autoClose) {
      setTimeout(() => {
        this.remove(notification.id)
      }, notification.duration)
    }

    // Emit event
    this.emit('notification:show', notification)

    return notification.id
  }

  /**
   * Show specific notification types
   */
  public info(title: string, message: string, options?: any): string {
    return this.show('info', title, message, options)
  }

  public success(title: string, message: string, options?: any): string {
    return this.show('success', title, message, options)
  }

  public warning(title: string, message: string, options?: any): string {
    return this.show('warning', title, message, options)
  }

  public error(title: string, message: string, options?: any): string {
    return this.show('error', title, message, { ...options, persistent: true })
  }

  /**
   * Show order-specific notifications
   */
  public newOrder(orderNumber: string, tableNumber?: string): string {
    return this.show('info', 'Nouvelle commande',
      `Commande #${orderNumber}${tableNumber ? ` - Table ${tableNumber}` : ''}`, {
        category: 'orders',
        data: { orderNumber, tableNumber },
        actions: [
          { label: 'Voir', action: 'view_order', style: 'primary' },
          { label: 'Ignorer', action: 'dismiss', style: 'secondary' }
        ]
      })
  }

  public orderReady(orderNumber: string, tableNumber?: string): string {
    return this.show('success', 'Commande prête',
      `Commande #${orderNumber}${tableNumber ? ` - Table ${tableNumber}` : ''} est prête`, {
        category: 'orders',
        data: { orderNumber, tableNumber },
        persistent: true,
        actions: [
          { label: 'Marquer servie', action: 'mark_served', style: 'primary' }
        ]
      })
  }

  public paymentSuccess(amount: number, method: string): string {
    return this.show('success', 'Paiement confirmé',
      `Paiement de ${amount.toLocaleString()} FCFA par ${method}`, {
        category: 'payments',
        data: { amount, method }
      })
  }

  public paymentFailed(error: string): string {
    return this.show('error', 'Échec du paiement', error, {
      category: 'payments',
      data: { error }
    })
  }

  public lowStock(productName: string, quantity: number): string {
    return this.show('warning', 'Stock faible',
      `${productName} - ${quantity} restant(s)`, {
        category: 'inventory',
        data: { productName, quantity },
        persistent: true,
        actions: [
          { label: 'Réapprovisionner', action: 'restock', style: 'primary' }
        ]
      })
  }

  /**
   * Remove notification
   */
  public remove(id: string): void {
    const index = this.notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      const notification = this.notifications.value[index]
      if (!notification.read) {
        this.unreadCount.value--
      }
      this.notifications.value.splice(index, 1)
      this.emit('notification:remove', notification)
    }
  }

  /**
   * Mark notification as read
   */
  public markAsRead(id: string): void {
    const notification = this.notifications.value.find(n => n.id === id)
    if (notification && !notification.read) {
      notification.read = true
      this.unreadCount.value--
      this.emit('notification:read', notification)
    }
  }

  /**
   * Mark all notifications as read
   */
  public markAllAsRead(): void {
    this.notifications.value.forEach(notification => {
      if (!notification.read) {
        notification.read = true
      }
    })
    this.unreadCount.value = 0
    this.emit('notification:read_all', null)
  }

  /**
   * Clear all notifications
   */
  public clear(): void {
    this.notifications.value = []
    this.unreadCount.value = 0
    this.emit('notification:clear', null)
  }

  /**
   * Clear notifications by category
   */
  public clearByCategory(category: string): void {
    const removed = this.notifications.value.filter(n => n.category === category)
    this.notifications.value = this.notifications.value.filter(n => n.category !== category)

    // Update unread count
    const unreadRemoved = removed.filter(n => !n.read).length
    this.unreadCount.value -= unreadRemoved

    this.emit('notification:clear_category', { category, removed })
  }

  /**
   * Get notifications by category
   */
  public getByCategory(category: string): Notification[] {
    return this.notifications.value.filter(n => n.category === category)
  }

  /**
   * Get unread notifications
   */
  public getUnread(): Notification[] {
    return this.notifications.value.filter(n => !n.read)
  }

  /**
   * Handle notification action
   */
  public handleAction(notificationId: string, action: string): void {
    const notification = this.notifications.value.find(n => n.id === notificationId)
    if (!notification) return

    this.emit('notification:action', { notification, action })

    // Handle common actions
    switch (action) {
      case 'dismiss':
        this.remove(notificationId)
        break

      case 'mark_read':
        this.markAsRead(notificationId)
        break

      default:
        // Let the application handle custom actions
        break
    }
  }

  /**
   * Show toast notification (visual overlay)
   */
  private showToast(notification: Notification): void {
    // This would integrate with a toast notification library
    // For now, we'll emit an event that the UI can listen to
    this.emit('toast:show', notification)
  }

  /**
   * Show browser notification
   */
  private showBrowserNotification(notification: Notification): void {
    if (!this.isPermissionGranted.value) return

    const browserNotif = new Notification(notification.title, {
      body: notification.message,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: notification.id,
      requireInteraction: notification.persistent
    })

    browserNotif.onclick = () => {
      window.focus()
      this.emit('notification:click', notification)
      browserNotif.close()
    }

    // Auto close if not persistent
    if (!notification.persistent) {
      setTimeout(() => {
        browserNotif.close()
      }, notification.duration)
    }
  }

  /**
   * Play notification sound
   */
  private playSound(type: Notification['type']): void {
    let soundKey: string

    switch (type) {
      case 'success':
        soundKey = 'payment'
        break
      case 'warning':
        soundKey = 'warning'
        break
      case 'error':
        soundKey = 'error'
        break
      default:
        soundKey = 'info'
    }

    const audio = this.audioElements.get(soundKey)
    if (audio) {
      audio.volume = this.config.soundVolume
      audio.play().catch(error => {
        console.warn('Failed to play notification sound:', error)
      })
    }
  }

  /**
   * Play custom sound
   */
  public playCustomSound(soundKey: keyof SoundConfig): void {
    if (!this.config.enableSound) return

    const audio = this.audioElements.get(soundKey)
    if (audio) {
      audio.volume = this.config.soundVolume
      audio.play().catch(error => {
        console.warn('Failed to play custom sound:', error)
      })
    }
  }

  /**
   * Update configuration
   */
  public updateConfig(updates: Partial<NotificationConfig>): void {
    Object.assign(this.config, updates)
    this.saveConfig()

    // Update audio volume
    if ('soundVolume' in updates) {
      this.audioElements.forEach(audio => {
        audio.volume = this.config.soundVolume
      })
    }

    this.emit('config:update', this.config)
  }

  /**
   * Test notification
   */
  public test(): void {
    this.show('info', 'Test de notification', 'Ceci est un test de notification', {
      duration: 3000
    })
  }

  /**
   * Subscribe to events
   */
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(callback)
  }

  /**
   * Unsubscribe from events
   */
  public off(event: string, callback: Function): void {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)!.delete(callback)
    }
  }

  /**
   * Emit event
   */
  private emit(event: string, data: any): void {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)!.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in notification event listener:', error)
        }
      })
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): NotificationConfig {
    return { ...this.config }
  }

  /**
   * Reset configuration to defaults
   */
  public resetConfig(): void {
    const defaults: NotificationConfig = {
      enableSound: true,
      enableBrowser: true,
      enableToast: true,
      soundVolume: 0.5,
      autoClose: true,
      defaultDuration: 5000,
      maxNotifications: 50
    }

    Object.assign(this.config, defaults)
    this.saveConfig()
  }
}

// Create singleton instance
export const notificationService = new NotificationService()

export default notificationService