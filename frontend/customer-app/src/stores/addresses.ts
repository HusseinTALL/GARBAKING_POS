/**
 * Addresses Store - Manages user delivery addresses
 *
 * Handles:
 * - Address CRUD operations
 * - Default address management
 * - Address validation
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Address {
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
  createdAt: string
  updatedAt: string
}

export const useAddressesStore = defineStore('addresses', () => {
  // State
  const addresses = ref<Address[]>([
    {
      id: '1',
      type: 'home',
      name: 'Home',
      address: '123 Main Street, Apt 4B',
      city: 'New York',
      zipCode: '10001',
      phone: '+1 234 567 8900',
      instructions: 'Ring doorbell twice',
      coordinates: {
        lat: 40.7589,
        lng: -73.9851
      },
      isDefault: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      type: 'work',
      name: 'Office',
      address: '456 Business Ave, Floor 12',
      city: 'New York',
      zipCode: '10002',
      phone: '+1 234 567 8900',
      instructions: 'Call when you arrive',
      coordinates: {
        lat: 40.7614,
        lng: -73.9776
      },
      isDefault: false,
      createdAt: '2024-01-20T14:00:00Z',
      updatedAt: '2024-01-20T14:00:00Z'
    }
  ])

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const defaultAddress = computed(() =>
    addresses.value.find(a => a.isDefault) || addresses.value[0] || null
  )

  const homeAddress = computed(() =>
    addresses.value.find(a => a.type === 'home') || null
  )

  const workAddress = computed(() =>
    addresses.value.find(a => a.type === 'work') || null
  )

  const hasAddresses = computed(() => addresses.value.length > 0)

  // Actions
  async function fetchAddresses() {
    loading.value = true
    error.value = null
    try {
      // TODO: Implement API call
      // const response = await api.get('/addresses')
      // addresses.value = response.data

      // Simulated delay
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch addresses'
      console.error('Failed to fetch addresses:', err)
    } finally {
      loading.value = false
    }
  }

  async function addAddress(address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>) {
    loading.value = true
    error.value = null
    try {
      // TODO: Implement API call
      // const response = await api.post('/addresses', address)

      const newAddress: Address = {
        ...address,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // If this is the first address or marked as default, set it as default
      if (addresses.value.length === 0 || newAddress.isDefault) {
        // Remove default from other addresses
        addresses.value.forEach(a => {
          a.isDefault = false
        })
      }

      addresses.value.push(newAddress)
      return newAddress
    } catch (err: any) {
      error.value = err.message || 'Failed to add address'
      console.error('Failed to add address:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateAddress(id: string, updates: Partial<Address>) {
    loading.value = true
    error.value = null
    try {
      const index = addresses.value.findIndex(a => a.id === id)
      if (index === -1) {
        throw new Error('Address not found')
      }

      // If setting as default, remove default from others
      if (updates.isDefault) {
        addresses.value.forEach(a => {
          a.isDefault = false
        })
      }

      addresses.value[index] = {
        ...addresses.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }

      return addresses.value[index]
    } catch (err: any) {
      error.value = err.message || 'Failed to update address'
      console.error('Failed to update address:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteAddress(id: string) {
    loading.value = true
    error.value = null
    try {
      const index = addresses.value.findIndex(a => a.id === id)
      if (index === -1) {
        throw new Error('Address not found')
      }

      const wasDefault = addresses.value[index].isDefault
      addresses.value.splice(index, 1)

      // If deleted address was default, set first remaining address as default
      if (wasDefault && addresses.value.length > 0) {
        addresses.value[0].isDefault = true
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete address'
      console.error('Failed to delete address:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function setDefaultAddress(id: string) {
    addresses.value.forEach(a => {
      a.isDefault = a.id === id
    })
  }

  function reset() {
    addresses.value = []
    error.value = null
    loading.value = false
  }

  return {
    // State
    addresses,
    loading,
    error,
    // Getters
    defaultAddress,
    homeAddress,
    workAddress,
    hasAddresses,
    // Actions
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    reset
  }
}, {
  persist: true
})
