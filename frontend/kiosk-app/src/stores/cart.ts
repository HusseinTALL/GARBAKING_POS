/**
 * Pinia store for shopping cart management
 * Handles cart items, calculations, and checkout logic for the kiosk
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { CartItem, MenuItem, SelectedCustomization, Cart } from '@/types'
import { useSettingsStore } from './settings'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const settingsStore = useSettingsStore()

  const subtotal = computed(() => {
    return items.value.reduce((sum, item) => sum + item.subtotal, 0)
  })

  const tax = computed(() => {
    return subtotal.value * settingsStore.settings.taxRate
  })

  const total = computed(() => {
    return subtotal.value + tax.value
  })

  const itemCount = computed(() => {
    return items.value.reduce((count, item) => count + item.quantity, 0)
  })

  const cart = computed<Cart>(() => ({
    items: items.value,
    subtotal: subtotal.value,
    tax: tax.value,
    total: total.value
  }))

  function addItem(
    menuItem: MenuItem,
    quantity: number = 1,
    customizations: SelectedCustomization[] = [],
    notes?: string
  ) {
    // Calculate item subtotal
    const customizationTotal = customizations.reduce(
      (sum, c) => sum + c.priceModifier,
      0
    )
    const itemSubtotal = (menuItem.price + customizationTotal) * quantity

    // Check if identical item already exists
    const existingItemIndex = items.value.findIndex(
      (item) =>
        item.menuItem.id === menuItem.id &&
        JSON.stringify(item.customizations) === JSON.stringify(customizations) &&
        item.notes === notes
    )

    if (existingItemIndex !== -1) {
      // Update existing item quantity
      items.value[existingItemIndex].quantity += quantity
      items.value[existingItemIndex].subtotal += itemSubtotal
    } else {
      // Add new item
      items.value.push({
        id: uuidv4(),
        menuItem,
        quantity,
        customizations,
        subtotal: itemSubtotal,
        notes
      })
    }
  }

  function removeItem(itemId: string) {
    const index = items.value.findIndex((item) => item.id === itemId)
    if (index !== -1) {
      items.value.splice(index, 1)
    }
  }

  function updateItemQuantity(itemId: string, quantity: number) {
    const item = items.value.find((i) => i.id === itemId)
    if (item) {
      if (quantity <= 0) {
        removeItem(itemId)
      } else {
        const unitPrice = item.subtotal / item.quantity
        item.quantity = quantity
        item.subtotal = unitPrice * quantity
      }
    }
  }

  function clearCart() {
    items.value = []
  }

  function getItem(itemId: string): CartItem | undefined {
    return items.value.find((item) => item.id === itemId)
  }

  return {
    items,
    subtotal,
    tax,
    total,
    itemCount,
    cart,
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
    getItem
  }
})
