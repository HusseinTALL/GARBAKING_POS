/**
 * Pinia store for order management
 * Handles order creation, payment processing, and order status tracking
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Order, PaymentMethod } from '@/types'
import apiService from '@/services/api'
import { useCartStore } from './cart'
import { useSettingsStore } from './settings'

export const useOrderStore = defineStore('order', () => {
  const currentOrder = ref<Order | null>(null)
  const processing = ref(false)
  const error = ref<string | null>(null)

  async function createOrder(paymentMethod: PaymentMethod): Promise<Order | null> {
    const cartStore = useCartStore()
    const settingsStore = useSettingsStore()

    if (cartStore.items.length === 0) {
      error.value = 'Cart is empty'
      return null
    }

    processing.value = true
    error.value = null

    try {
      const orderData = {
        mode: settingsStore.orderMode,
        items: cartStore.items.map((item) => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          customizations: item.customizations.map((c) => ({
            customizationId: c.customizationId,
            optionId: c.optionId
          })),
          notes: item.notes
        })),
        paymentMethod
      }

      currentOrder.value = await apiService.createOrder(orderData)
      return currentOrder.value
    } catch (e) {
      error.value = 'Failed to create order'
      console.error('Error creating order:', e)
      return null
    } finally {
      processing.value = false
    }
  }

  async function processPayment(
    orderId: string,
    method: PaymentMethod,
    amount: number
  ): Promise<boolean> {
    processing.value = true
    error.value = null

    try {
      const result = await apiService.processPayment({
        orderId,
        method,
        amount
      })

      if (!result.success) {
        error.value = result.error || 'Payment failed'
        return false
      }

      return true
    } catch (e) {
      error.value = 'Payment processing failed'
      console.error('Error processing payment:', e)
      return false
    } finally {
      processing.value = false
    }
  }

  async function getOrderStatus(orderId: string) {
    try {
      return await apiService.getOrderStatus(orderId)
    } catch (e) {
      console.error('Error fetching order status:', e)
      return null
    }
  }

  function clearOrder() {
    currentOrder.value = null
    error.value = null
  }

  return {
    currentOrder,
    processing,
    error,
    createOrder,
    processPayment,
    getOrderStatus,
    clearOrder
  }
})
