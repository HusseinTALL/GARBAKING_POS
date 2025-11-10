/**
 * Backend Health Check Service
 * Monitors backend connectivity and provides auto-reconnection
 */

import axios from 'axios'

export interface HealthStatus {
  isHealthy: boolean
  lastCheck: Date
  responseTime?: number
  error?: string
  retryCount: number
}

class HealthCheckService {
  private checkInterval: number = 30000 // 30 seconds
  private retryInterval: number = 5000 // 5 seconds when down
  private maxRetries: number = 10
  private intervalId: NodeJS.Timeout | null = null
  private retryTimeoutId: NodeJS.Timeout | null = null
  private baseURL: string
  private listeners: Array<(_status: HealthStatus) => void> = []
  private currentStatus: HealthStatus = {
    isHealthy: false,
    lastCheck: new Date(),
    retryCount: 0
  }

  constructor() {
    // Use API Gateway URL (Spring Boot) instead of old Node.js backend
    this.baseURL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080'
  }

  /**
   * Start monitoring backend health
   */
  startMonitoring(): void {
    console.log('[HealthCheck] Starting backend health monitoring...')

    // Initial check
    this.checkHealth()

    // Regular checks
    this.intervalId = setInterval(() => {
      this.checkHealth()
    }, this.checkInterval)
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
      this.retryTimeoutId = null
    }
    console.log('[HealthCheck] Stopped backend health monitoring')
  }

  /**
   * Perform health check
   */
  private async checkHealth(): Promise<void> {
    const startTime = Date.now()

    try {
      const response = await axios.get(`${this.baseURL}/actuator/health`, {
        timeout: 5000,
        headers: {
          'Cache-Control': 'no-cache'
        }
      })

      const responseTime = Date.now() - startTime

      if (response.status === 200 && (response.data.status === 'UP' || response.data.status === 'ok')) {
        const wasDown = !this.currentStatus.isHealthy

        this.currentStatus = {
          isHealthy: true,
          lastCheck: new Date(),
          responseTime,
          retryCount: 0
        }

        if (wasDown) {
          console.log('[HealthCheck] ✅ Backend is now healthy!')
          this.notifyListeners()
        }
      } else {
        throw new Error('Unexpected health check response')
      }
    } catch (error: any) {
      this.handleHealthCheckFailure(error)
    }
  }

  /**
   * Handle failed health check
   */
  private handleHealthCheckFailure(error: any): void {
    const wasHealthy = this.currentStatus.isHealthy

    this.currentStatus = {
      isHealthy: false,
      lastCheck: new Date(),
      error: error.message || 'Backend unreachable',
      retryCount: this.currentStatus.retryCount + 1
    }

    if (wasHealthy) {
      console.error('[HealthCheck] ❌ Backend is down!')
      this.notifyListeners()
    }

    // Auto-retry with exponential backoff
    if (this.currentStatus.retryCount < this.maxRetries) {
      const retryDelay = Math.min(
        this.retryInterval * Math.pow(1.5, this.currentStatus.retryCount),
        60000 // Max 1 minute
      )

      console.log(
        `[HealthCheck] Retrying in ${Math.round(retryDelay / 1000)}s... (Attempt ${this.currentStatus.retryCount}/${this.maxRetries})`
      )

      this.retryTimeoutId = setTimeout(() => {
        this.checkHealth()
      }, retryDelay)
    } else {
      console.error('[HealthCheck] ⚠️  Max retries reached. Backend may be offline.')
    }
  }

  /**
   * Register a listener for health status changes
   */
  onStatusChange(callback: (status: HealthStatus) => void): () => void {
    this.listeners.push(callback)

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentStatus)
      } catch (error) {
        console.error('[HealthCheck] Error in listener:', error)
      }
    })
  }

  /**
   * Get current health status
   */
  getStatus(): HealthStatus {
    return { ...this.currentStatus }
  }

  /**
   * Force a health check
   */
  async forceCheck(): Promise<HealthStatus> {
    await this.checkHealth()
    return this.getStatus()
  }

  /**
   * Reset retry counter
   */
  resetRetries(): void {
    this.currentStatus.retryCount = 0
  }
}

export const healthCheckService = new HealthCheckService()
