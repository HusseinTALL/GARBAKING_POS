<script setup lang="ts">
/**
 * LocationPicker - Interactive map-based address selection
 *
 * Features:
 * - Draggable pin for precise location
 * - Current location detection
 * - Address search with autocomplete
 * - Reverse geocoding
 * - Save address with label
 */

import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { MapPin, Navigation, Search, Save, X } from 'lucide-vue-next'
import MapView from '@/components/MapView.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import {
  getCurrentLocation,
  reverseGeocode,
  forwardGeocode,
  type Location
} from '@/composables/useMap'

const router = useRouter()
const route = useRoute()

// State
const selectedLocation = ref<Location>({ lat: 9.5092, lng: -13.7122 })
const selectedAddress = ref<string>('')
const addressLabel = ref<string>('') // e.g., "Home", "Work", "Other"
const addressDetails = ref<string>('') // Apartment, floor, etc.
const searchQuery = ref<string>('')
const loading = ref(false)
const loadingAddress = ref(false)
const markerDraggable = ref(true)

// Computed
const mapMarkers = computed(() => [{
  location: selectedLocation.value,
  icon: undefined, // Use default marker
  popup: 'Selected Location'
}])

const canSave = computed(() => {
  return selectedAddress.value && addressLabel.value
})

// Methods
async function getCurrentLocationClick() {
  loading.value = true
  try {
    const location = await getCurrentLocation()
    selectedLocation.value = location
    await updateAddressFromLocation(location)
  } catch (error) {
    console.error('Failed to get location:', error)
    alert('Unable to access your location. Please check permissions.')
  } finally {
    loading.value = false
  }
}

async function updateAddressFromLocation(location: Location) {
  loadingAddress.value = true
  try {
    const address = await reverseGeocode(location)
    selectedAddress.value = address
    searchQuery.value = address
  } catch (error) {
    console.error('Failed to reverse geocode:', error)
    selectedAddress.value = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
  } finally {
    loadingAddress.value = false
  }
}

async function handleSearchAddress() {
  if (!searchQuery.value.trim()) return

  loading.value = true
  try {
    const location = await forwardGeocode(searchQuery.value)
    if (location) {
      selectedLocation.value = location
      selectedAddress.value = searchQuery.value
    } else {
      alert('Address not found. Please try a different search.')
    }
  } catch (error) {
    console.error('Failed to geocode address:', error)
    alert('Failed to find address. Please try again.')
  } finally {
    loading.value = false
  }
}

function handleMapClick(location: Location) {
  selectedLocation.value = location
  updateAddressFromLocation(location)
}

function saveAddress() {
  if (!canSave.value) return

  const addressData = {
    location: selectedLocation.value,
    address: selectedAddress.value,
    label: addressLabel.value,
    details: addressDetails.value,
    formatted: selectedAddress.value
  }

  // In production, save to backend via API
  console.log('Saving address:', addressData)

  // For now, save to localStorage
  const savedAddresses = JSON.parse(localStorage.getItem('savedAddresses') || '[]')
  savedAddresses.push(addressData)
  localStorage.setItem('savedAddresses', JSON.stringify(savedAddresses))

  // Navigate back or to checkout
  const returnTo = route.query.returnTo as string
  if (returnTo) {
    router.push(returnTo)
  } else {
    router.back()
  }
}

// Watch for location changes
watch(selectedLocation, (newLocation) => {
  if (newLocation) {
    updateAddressFromLocation(newLocation)
  }
}, { deep: true })
</script>

<template>
  <div class="location-picker min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm p-4">
      <div class="flex items-center gap-4 mb-4">
        <button
          @click="router.back()"
          class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X :size="24" class="text-gray-700 dark:text-gray-300" />
        </button>
        <h1 class="text-xl font-bold dark:text-white flex-1">Select Location</h1>
      </div>

      <!-- Search Address -->
      <form @submit.prevent="handleSearchAddress" class="mb-3">
        <BaseInput
          v-model="searchQuery"
          type="text"
          placeholder="Search for an address..."
          :icon="Search"
        />
      </form>

      <!-- Current Location Button -->
      <BaseButton
        variant="outline"
        size="sm"
        @click="getCurrentLocationClick"
        :loading="loading"
        class="w-full"
      >
        <template #icon-left>
          <Navigation :size="18" />
        </template>
        Use Current Location
      </BaseButton>
    </div>

    <!-- Map -->
    <div class="flex-1 relative">
      <MapView
        :center="selectedLocation"
        :zoom="15"
        :markers="mapMarkers"
        height="100%"
        @map-click="handleMapClick"
      />

      <!-- Center Pin Indicator -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-[1000]">
        <MapPin :size="48" class="text-orange-500 drop-shadow-lg" />
      </div>

      <!-- Instructions -->
      <div class="absolute top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2 text-sm z-[1000]">
        <p class="text-gray-700 dark:text-gray-300 text-center">
          📍 Tap on the map or drag to set your location
        </p>
      </div>
    </div>

    <!-- Address Details Form -->
    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-t-3xl p-6">
      <!-- Selected Address -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Selected Address
        </label>
        <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div v-if="loadingAddress" class="flex items-center gap-2 text-gray-500">
            <div class="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-sm">Getting address...</span>
          </div>
          <p v-else class="text-sm dark:text-gray-200">
            {{ selectedAddress || 'Move the pin to select a location' }}
          </p>
        </div>
      </div>

      <!-- Address Label -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Label <span class="text-red-500">*</span>
        </label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="label in ['Home', 'Work', 'Other']"
            :key="label"
            @click="addressLabel = label"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="addressLabel === label
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
          >
            {{ label }}
          </button>
        </div>
      </div>

      <!-- Address Details -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Additional Details (Optional)
        </label>
        <BaseInput
          v-model="addressDetails"
          type="text"
          placeholder="Apartment, floor, building name..."
        />
      </div>

      <!-- Save Button -->
      <BaseButton
        variant="primary"
        size="lg"
        @click="saveAddress"
        :disabled="!canSave"
        class="w-full"
      >
        <template #icon-left>
          <Save :size="20" />
        </template>
        Save Address
      </BaseButton>

      <!-- Coordinates (for debugging) -->
      <p class="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
        Coordinates: {{ selectedLocation.lat.toFixed(6) }}, {{ selectedLocation.lng.toFixed(6) }}
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Ensure map takes full height of flex container */
.location-picker {
  height: 100vh;
  height: 100dvh; /* Use dynamic viewport height on mobile */
}
</style>
