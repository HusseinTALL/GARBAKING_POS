<!--
  LocationSelector.vue
  Location dropdown selector with current location display
-->
<template>
  <div class="relative">
    <!-- Location Button -->
    <button
      @click="toggleDropdown"
      class="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors max-w-[200px]"
    >
      <svg class="w-5 h-5 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
      </svg>
      <div class="flex-1 min-w-0 text-left">
        <div class="text-xs text-gray-500">Deliver to</div>
        <div class="text-sm font-semibold text-gray-900 truncate">
          {{ currentLocation }}
        </div>
      </div>
      <svg
        class="w-4 h-4 text-gray-400 transition-transform flex-shrink-0"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
      >
        <!-- Current Location -->
        <div class="p-3 border-b border-gray-100">
          <button
            @click="handleUseCurrentLocation"
            :disabled="loadingLocation"
            class="w-full flex items-center space-x-3 p-3 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="flex-1 text-left">
              <div class="font-semibold text-gray-900">
                {{ loadingLocation ? 'Getting location...' : 'Use current location' }}
              </div>
              <div class="text-xs text-gray-500">Enable location services</div>
            </div>
          </button>
        </div>

        <!-- Saved Addresses -->
        <div v-if="savedAddresses.length > 0" class="p-2">
          <div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Saved Addresses</div>
          <button
            v-for="address in savedAddresses"
            :key="address.id"
            @click="selectAddress(address)"
            class="w-full flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
          >
            <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg v-if="address.type === 'home'" class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <svg v-else-if="address.type === 'work'" class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <svg v-else class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-gray-900 capitalize">{{ address.type }}</div>
              <div class="text-sm text-gray-600 truncate">{{ address.address }}</div>
            </div>
          </button>
        </div>

        <!-- Add New Address -->
        <div class="p-2 border-t border-gray-100">
          <router-link
            to="/address/new"
            @click="closeDropdown"
            class="w-full flex items-center justify-center space-x-2 p-3 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors font-medium"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add New Address</span>
          </router-link>
        </div>
      </div>
    </Transition>

    <!-- Backdrop -->
    <div
      v-if="isOpen"
      @click="closeDropdown"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Types
interface Address {
  id: string
  type: 'home' | 'work' | 'other'
  address: string
  coordinates?: {
    latitude: number
    longitude: number
  }
}

// State
const isOpen = ref(false)
const loadingLocation = ref(false)
const currentLocation = ref('Select location')
const savedAddresses = ref<Address[]>([])

// Load saved addresses from localStorage
onMounted(() => {
  const stored = localStorage.getItem('saved_addresses')
  if (stored) {
    savedAddresses.value = JSON.parse(stored)
  }

  // Load current location from localStorage
  const location = localStorage.getItem('user_location')
  if (location) {
    const loc = JSON.parse(location)
    if (loc.address) {
      currentLocation.value = loc.address
    } else {
      currentLocation.value = 'Current Location'
    }
  }

  // Sample addresses if none exist
  if (savedAddresses.value.length === 0) {
    savedAddresses.value = [
      {
        id: '1',
        type: 'home',
        address: '123 Main Street, New York, NY 10001'
      },
      {
        id: '2',
        type: 'work',
        address: '456 Office Plaza, New York, NY 10002'
      }
    ]
  }
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const handleUseCurrentLocation = async () => {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser')
    return
  }

  loadingLocation.value = true

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      })
    })

    // Store location
    localStorage.setItem('user_location', JSON.stringify({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: Date.now(),
      address: 'Current Location'
    }))

    currentLocation.value = 'Current Location'
    closeDropdown()
  } catch (error: any) {
    console.error('Location error:', error)
    alert('Failed to get your location. Please check your location settings.')
  } finally {
    loadingLocation.value = false
  }
}

const selectAddress = (address: Address) => {
  currentLocation.value = address.address.split(',')[0] // Show first part
  localStorage.setItem('user_location', JSON.stringify({
    ...address.coordinates,
    timestamp: Date.now(),
    address: address.address
  }))
  closeDropdown()
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
