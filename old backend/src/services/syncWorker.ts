/**
 * Sync worker for offline-first functionality
 * Handles synchronization of local data with cloud backend
 */

import cron from 'node-cron'
import { backOff } from 'exponential-backoff'
import { getDB } from '../database/init'
import axios from 'axios'

interface SyncPayload {
  clientOrderId: string
  storeId: string
  createdAt: string
  orderData: any
  idempotencyKey: string
}

interface SyncResult {
  success: boolean
  cloudOrderId?: string
  error?: string
}

class SyncWorker {
  private isRunning = false
  private syncInterval: number
  private cloudApiUrl: string
  private maxRetries: number
  private retryDelay: number

  constructor() {
    this.syncInterval = parseInt(process.env.SYNC_INTERVAL_MINUTES || '5')
    this.cloudApiUrl = process.env.CLOUD_API_URL || 'https://api.garbaking.com'
    this.maxRetries = parseInt(process.env.MAX_RETRY_ATTEMPTS || '3')
    this.retryDelay = 1000 // Start with 1 second delay
  }

  /**
   * Start the sync worker with cron scheduling
   */
  start(): void {
    if (this.isRunning) {
      console.log('Sync worker is already running')
      return
    }

    this.isRunning = true

    // Schedule sync every N minutes
    const cronExpression = `*/${this.syncInterval} * * * *`

    cron.schedule(cronExpression, async () => {
      try {
        await this.performSync()
      } catch (error) {
        console.error('Sync worker error:', error)
      }
    })

    console.log(`✅ Sync worker started - running every ${this.syncInterval} minutes`)

    // Perform initial sync
    setTimeout(() => this.performSync(), 5000) // Wait 5 seconds after startup
  }

  /**
   * Stop the sync worker
   */
  stop(): void {
    this.isRunning = false
    console.log('Sync worker stopped')
  }

  /**
   * Perform synchronization of pending orders
   */
  async performSync(): Promise<void> {
    if (!this.isRunning) return

    try {
      const db = getDB()

      // Check internet connectivity
      const isOnline = await this.checkConnectivity()
      if (!isOnline) {
        console.log('No internet connection - skipping sync')
        return
      }

      // Get pending orders to sync
      const pendingOrders = await db.order.findMany({
        where: {
          syncStatus: 'PENDING'
        },
        include: {
          orderItems: {
            include: {
              menuItem: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      if (pendingOrders.length === 0) {
        console.log('No pending orders to sync')
        return
      }

      console.log(`Starting sync for ${pendingOrders.length} pending orders`)

      let successCount = 0
      let failureCount = 0

      // Sync orders one by one
      for (const order of pendingOrders) {
        try {
          const result = await this.syncOrder(order)

          if (result.success) {
            // Update order as synced
            await db.order.update({
              where: { id: order.id },
              data: {
                syncStatus: 'SYNCED',
                cloudOrderId: result.cloudOrderId
              }
            })
            successCount++
            console.log(`✅ Order ${order.orderNumber} synced successfully`)
          } else {
            // Mark as failed
            await db.order.update({
              where: { id: order.id },
              data: {
                syncStatus: 'FAILED'
              }
            })
            failureCount++
            console.log(`❌ Order ${order.orderNumber} sync failed: ${result.error}`)
          }

          // Small delay between requests to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 100))

        } catch (error) {
          console.error(`Error syncing order ${order.orderNumber}:`, error)
          failureCount++
        }
      }

      console.log(`Sync completed: ${successCount} success, ${failureCount} failures`)

      // Update daily sales if any orders were synced
      if (successCount > 0) {
        await this.updateDailySales()
      }

    } catch (error) {
      console.error('Sync process error:', error)
    }
  }

  /**
   * Sync individual order to cloud
   */
  private async syncOrder(order: any): Promise<SyncResult> {
    const syncPayload: SyncPayload = {
      clientOrderId: order.clientOrderId || order.id,
      storeId: order.storeId,
      createdAt: order.createdAt.toISOString(),
      idempotencyKey: order.idempotencyKey,
      orderData: {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        tableNumber: order.tableNumber,
        orderType: order.orderType,
        status: order.status,
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        paymentReference: order.paymentReference,
        notes: order.notes,
        kitchenNotes: order.kitchenNotes,
        estimatedTime: order.estimatedTime,
        actualTime: order.actualTime,
        orderItems: order.orderItems.map((item: any) => ({
          menuItemSku: item.menuItem.sku,
          menuItemName: item.menuItem.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          notes: item.notes
        }))
      }
    }

    try {
      const response = await backOff(
        () => this.sendToCloud(syncPayload),
        {
          numOfAttempts: this.maxRetries,
          delayFirstAttempt: true,
          startingDelay: this.retryDelay,
          timeMultiple: 2,
          maxDelay: 30000 // Max 30 seconds
        }
      )

      return {
        success: true,
        cloudOrderId: response.data.cloudOrderId
      }

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown sync error'
      }
    }
  }

  /**
   * Send order data to cloud API
   */
  private async sendToCloud(payload: SyncPayload): Promise<any> {
    const cloudEndpoint = `${this.cloudApiUrl}/api/orders/sync`

    // Get authentication token
    const authToken = await this.getAuthToken()

    const response = await axios.post(cloudEndpoint, payload, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'X-Store-ID': payload.storeId,
        'X-Sync-Source': 'local-pos'
      },
      timeout: 30000 // 30 second timeout
    })

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Cloud API error: ${response.status} ${response.statusText}`)
    }

    return response
  }

  /**
   * Get authentication token for cloud API
   */
  private async getAuthToken(): Promise<string> {
    // In a real implementation, this would authenticate with the cloud service
    // For now, return a placeholder token
    return process.env.CLOUD_API_TOKEN || 'placeholder-token'
  }

  /**
   * Check internet connectivity
   */
  private async checkConnectivity(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.cloudApiUrl}/health`, {
        timeout: 5000
      })
      return response.status === 200
    } catch (error) {
      return false
    }
  }

  /**
   * Update daily sales summary
   */
  private async updateDailySales(): Promise<void> {
    try {
      const db = getDB()
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const storeId = process.env.STORE_ID || 'store_001'

      // Calculate daily totals
      const dailyStats = await db.order.aggregate({
        where: {
          storeId,
          createdAt: {
            gte: today,
            lt: tomorrow
          },
          status: {
            not: 'CANCELLED'
          }
        },
        _count: true,
        _sum: {
          total: true,
          tax: true,
          discount: true
        },
        _avg: {
          total: true
        }
      })

      // Calculate payment method breakdowns
      const cashSales = await db.order.aggregate({
        where: {
          storeId,
          createdAt: {
            gte: today,
            lt: tomorrow
          },
          paymentStatus: 'PAID'
        },
        _sum: {
          total: true
        }
      })

      const cardSales = await db.order.aggregate({
        where: {
          storeId,
          createdAt: {
            gte: today,
            lt: tomorrow
          },
          paymentStatus: 'PAID'
        },
        _sum: {
          total: true
        }
      })

      // Upsert daily sales record
      await db.dailySales.upsert({
        where: {
          date: today
        },
        update: {
          totalOrders: dailyStats._count,
          totalRevenue: dailyStats._sum.total || 0,
          totalTax: dailyStats._sum.tax || 0,
          totalDiscount: dailyStats._sum.discount || 0,
          averageOrder: dailyStats._avg.total || 0,
          cashSales: cashSales._sum?.total || 0,
          cardSales: cardSales._sum?.total || 0
        },
        create: {
          date: today,
          storeId,
          totalOrders: dailyStats._count,
          totalRevenue: dailyStats._sum.total || 0,
          totalTax: dailyStats._sum.tax || 0,
          totalDiscount: dailyStats._sum.discount || 0,
          averageOrder: dailyStats._avg.total || 0,
          cashSales: cashSales._sum?.total || 0,
          cardSales: cardSales._sum?.total || 0
        }
      })

      console.log('Daily sales summary updated')

    } catch (error) {
      console.error('Error updating daily sales:', error)
    }
  }

  /**
   * Manually trigger sync (for testing or immediate sync needs)
   */
  async triggerSync(): Promise<void> {
    console.log('Manual sync triggered')
    await this.performSync()
  }

  /**
   * Get sync status information
   */
  async getSyncStatus(): Promise<{
    isRunning: boolean
    pendingOrders: number
    lastSyncAttempt?: Date
    nextSyncIn?: number
  }> {
    const db = getDB()

    const pendingCount = await db.order.count({
      where: {
        syncStatus: 'PENDING'
      }
    })

    return {
      isRunning: this.isRunning,
      pendingOrders: pendingCount,
      lastSyncAttempt: new Date(), // Would track this in a real implementation
      nextSyncIn: this.syncInterval * 60 * 1000 // milliseconds
    }
  }
}

// Export singleton instance
const syncWorker = new SyncWorker()

export function startSyncWorker(): void {
  syncWorker.start()
}

export function stopSyncWorker(): void {
  syncWorker.stop()
}

export function triggerManualSync(): Promise<void> {
  return syncWorker.triggerSync()
}

export function getSyncStatus(): Promise<any> {
  return syncWorker.getSyncStatus()
}

export default syncWorker