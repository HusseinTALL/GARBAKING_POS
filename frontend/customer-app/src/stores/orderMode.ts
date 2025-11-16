/**
 * Order Mode Store - Manages delivery/takeaway/dine-in selection
 *
 * Handles:
 * - Order type selection (delivery, takeaway, dine-in)
 * - Delivery address management
 * - Table selection for dine-in
 * - Pickup time for takeaway
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type OrderType = 'delivery' | 'takeaway' | 'dine-in'

export interface DeliveryAddress {
  id: string
  type: 'home' | 'work' | 'other'
  name: string
  address: string
  city: string
  zipCode: string
  phone: string
  instructions?: string
  coordinates?: {
    lat: number
    lng: number
  }
  isDefault: boolean
}

export const useOrderModeStore = defineStore('orderMode', () => {
  // State
  const currentMode = ref<OrderType>('delivery')
  const deliveryAddress = ref<DeliveryAddress | null>(null)
  const tableNumber = ref<string | null>(null)
  const pickupTime = ref<string | null>(null)

  // Getters
  const isDelivery = computed(() => currentMode.value === 'delivery')
  const isTakeaway = computed(() => currentMode.value === 'takeaway')
  const isDineIn = computed(() => currentMode.value === 'dine-in')

  const modeIcon = computed(() => {
    switch (currentMode.value) {
      case 'delivery':
        return 'fa-motorcycle'
      case 'takeaway':
        return 'fa-shopping-bag'
      case 'dine-in':
        return 'fa-utensils'
      default:
        return 'fa-motorcycle'
    }
  })

  const modeColor = computed(() => {
    switch (currentMode.value) {
      case 'delivery':
        return 'amber'
      case 'takeaway':
        return 'green'
      case 'dine-in':
        return 'purple'
      default:
        return 'amber'
    }
  })

  const estimatedTime = computed(() => {
    switch (currentMode.value) {
      case 'delivery':
        return '20-30 min'
      case 'takeaway':
        return '15-20 min'
      case 'dine-in':
        return 'Immediate'
      default:
        return '20-30 min'
    }
  })

  // Actions
  function setMode(mode: OrderType) {
    currentMode.value = mode

    // Reset mode-specific data
    if (mode !== 'delivery') {
      deliveryAddress.value = null
    }
    if (mode !== 'dine-in') {
      tableNumber.value = null
    }
    if (mode !== 'takeaway') {
      pickupTime.value = null
    }
  }

  function setDeliveryAddress(address: DeliveryAddress) {
    if (currentMode.value === 'delivery') {
      deliveryAddress.value = address
    }
  }

  function setTableNumber(table: string) {
    if (currentMode.value === 'dine-in') {
      tableNumber.value = table
    }
  }

  function setPickupTime(time: string) {
    if (currentMode.value === 'takeaway') {
      pickupTime.value = time
    }
  }

  function reset() {
    currentMode.value = 'delivery'
    deliveryAddress.value = null
    tableNumber.value = null
    pickupTime.value = null
  }

  return {
    // State
    currentMode,
    deliveryAddress,
    tableNumber,
    pickupTime,
    // Getters
    isDelivery,
    isTakeaway,
    isDineIn,
    modeIcon,
    modeColor,
    estimatedTime,
    // Actions
    setMode,
    setDeliveryAddress,
    setTableNumber,
    setPickupTime,
    reset
  }
}, {
  persist: true
})
