<script setup lang="ts">
/**
 * RestaurantLocator - Find restaurants on map (Page 14 - UI/UX 4.4)
 *
 * Features:
 * - Interactive map with restaurant markers
 * - Current location detection
 * - Distance calculations
 * - Filter and search
 * - List/Map toggle view
 * - Restaurant details on marker click
 */

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Map as MapIcon, List, Navigation, Search, SlidersHorizontal, X } from 'lucide-vue-next'
import MapView from '@/components/MapView.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import {
  getCurrentLocation,
  calculateDistance,
  formatDistance,
  createRestaurantIcon,
  createUserLocationIcon,
  type Location,
  type Restaurant
} from '@/composables/useMap'

const router = useRouter()

// State
const viewMode = ref<'map' | 'list'>('map')
const userLocation = ref<Location | null>(null)
const loading = ref(false)
const searchQuery = ref('')
const selectedRestaurant = ref<Restaurant | null>(null)
const mapCenter = ref<Location>({ lat: 9.5092, lng: -13.7122 })
const mapZoom = ref(13)

// Mock restaurant data - replace with real API call
const restaurants = ref<Restaurant[]>([
  {
    id: '1',
    name: 'Garbaking Main',
    location: { lat: 9.5092, lng: -13.7122 },
    address: '123 Boulevard du Commerce, Conakry',
    rating: 4.8,
    isOpen: true
  },
  {
    id: '2',
    name: 'Garbaking Express',
    location: { lat: 9.5150, lng: -13.7050 },
    address: '45 Avenue de la République, Kaloum',
    rating: 4.6,
    isOpen: true
  },
  {
    id: '3',
    name: 'Garbaking Downtown',
    location: { lat: 9.5020, lng: -13.7200 },
    address: '78 Rue KA 028, Kipé',
    rating: 4.7,
    isOpen: false
  },
  {
    id: '4',
    name: 'Garbaking Beach',
    location: { lat: 9.5180, lng: -13.6950 },
    address: '90 Corniche Sud, Landréah',
    rating: 4.9,
    isOpen: true
  },
  {
    id: '5',
    name: 'Garbaking Plaza',
    location: { lat: 9.5050, lng: -13.7100 },
    address: '12 Avenue Transversale, Taouyah',
    rating: 4.5,
    isOpen: true
  }
])

// Computed
const filteredRestaurants = computed(() => {
  let filtered = restaurants.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(r =>
      r.name.toLowerCase().includes(query) ||
      r.address.toLowerCase().includes(query)
    )
  }

  // Calculate distances if user location is available
  if (userLocation.value) {
    filtered = filtered.map(r => ({
      ...r,
      distance: calculateDistance(userLocation.value!, r.location)
    }))

    // Sort by distance
    filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0))
  }

  return filtered
})

// Map markers
const mapMarkers = computed(() => {
  return filteredRestaurants.value.map(restaurant => ({
    location: restaurant.location,
    icon: createRestaurantIcon(),
    popup: createPopupContent(restaurant)
  }))
})

// Methods
async function getUserLocation() {
  loading.value = true
  try {
    const location = await getCurrentLocation()
    userLocation.value = location
    mapCenter.value = location
    mapZoom.value = 14
  } catch (error) {
    console.error('Failed to get user location:', error)
    // Fallback to default location
  } finally {
    loading.value = false
  }
}

function createPopupContent(restaurant: Restaurant): string {
  return `
    <div class="p-2 min-w-[200px]">
      <h3 class="font-bold text-lg mb-1">${restaurant.name}</h3>
      <div class="flex items-center gap-1 mb-2">
        <span class="text-yellow-500">⭐</span>
        <span class="text-sm">${restaurant.rating}</span>
        ${restaurant.distance ? `<span class="text-sm text-gray-600">• ${formatDistance(restaurant.distance)}</span>` : ''}
      </div>
      <p class="text-sm text-gray-600 mb-3">${restaurant.address}</p>
      <div class="flex items-center gap-2 mb-2">
        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          restaurant.isOpen
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }">
          ${restaurant.isOpen ? '🟢 Open' : '🔴 Closed'}
        </span>
      </div>
      <button
        onclick="window.viewRestaurant('${restaurant.id}')"
        class="w-full bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors"
      >
        View Menu
      </button>
    </div>
  `
}

function viewRestaurant(id: string) {
  router.push(`/restaurant/${id}`)
}

function handleMapReady(map: any) {
  // Fit map to show all restaurants
  if (filteredRestaurants.value.length > 0) {
    const bounds = filteredRestaurants.value.map(r => [r.location.lat, r.location.lng])
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
  }
}

// Lifecycle
onMounted(() => {
  getUserLocation()

  // Make viewRestaurant available globally for popup buttons
  ;(window as any).viewRestaurant = viewRestaurant
})
</script>

<template>
  <div class="restaurant-locator min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm">
      <div class="p-4">
        <div class="flex items-center gap-4 mb-4">
          <button
            @click="router.back()"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X :size="24" class="text-gray-700 dark:text-gray-300" />
          </button>
          <h1 class="text-xl font-bold dark:text-white flex-1">Find Restaurants</h1>

          <!-- View Toggle -->
          <button
            @click="viewMode = viewMode === 'map' ? 'list' : 'map'"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <MapIcon v-if="viewMode === 'list'" :size="24" class="text-gray-700 dark:text-gray-300" />
            <List v-else :size="24" class="text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <!-- Search and Filters -->
        <div class="flex gap-2">
          <div class="flex-1">
            <BaseInput
              v-model="searchQuery"
              type="text"
              placeholder="Search restaurants..."
              :icon="Search"
            />
          </div>
          <button
            class="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <SlidersHorizontal :size="20" class="text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>

      <!-- Location Button -->
      <div class="px-4 pb-4">
        <BaseButton
          variant="outline"
          size="sm"
          @click="getUserLocation"
          :loading="loading"
          class="w-full"
        >
          <template #icon-left>
            <Navigation :size="18" />
          </template>
          {{ userLocation ? 'Update Location' : 'Use Current Location' }}
        </BaseButton>
      </div>

      <!-- Results Count -->
      <div class="px-4 pb-3">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ filteredRestaurants.length }} restaurant{{ filteredRestaurants.length !== 1 ? 's' : '' }} found
        </p>
      </div>
    </div>

    <!-- Map View -->
    <div v-if="viewMode === 'map'" class="p-4">
      <MapView
        :center="mapCenter"
        :zoom="mapZoom"
        :markers="mapMarkers"
        :user-location="userLocation"
        height="calc(100vh - 280px)"
        @map-ready="handleMapReady"
      >
        <template #controls>
          <!-- Custom controls can go here -->
        </template>
      </MapView>
    </div>

    <!-- List View -->
    <div v-else class="p-4 space-y-3">
      <div
        v-for="restaurant in filteredRestaurants"
        :key="restaurant.id"
        class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        @click="viewRestaurant(restaurant.id)"
      >
        <div class="flex items-start gap-4">
          <!-- Restaurant Icon -->
          <div class="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <span class="text-3xl">🍕</span>
          </div>

          <!-- Restaurant Info -->
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-lg mb-1 dark:text-white">{{ restaurant.name }}</h3>

            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <div class="flex items-center gap-1">
                <span class="text-yellow-500">⭐</span>
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ restaurant.rating }}</span>
              </div>
              <span v-if="restaurant.distance" class="text-sm text-gray-500 dark:text-gray-400">
                • {{ formatDistance(restaurant.distance) }}
              </span>
              <span
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                :class="restaurant.isOpen ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'"
              >
                {{ restaurant.isOpen ? 'Open' : 'Closed' }}
              </span>
            </div>

            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {{ restaurant.address }}
            </p>

            <div class="flex gap-2">
              <BaseButton
                variant="primary"
                size="sm"
                @click.stop="viewRestaurant(restaurant.id)"
              >
                View Menu
              </BaseButton>
              <BaseButton
                variant="outline"
                size="sm"
                @click.stop="mapCenter = restaurant.location; viewMode = 'map'"
              >
                Show on Map
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredRestaurants.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">🗺️</div>
        <h3 class="text-lg font-semibold mb-2 dark:text-white">No restaurants found</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Try adjusting your search or location
        </p>
        <BaseButton variant="primary" @click="searchQuery = ''; getUserLocation()">
          Reset Search
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles if needed */
</style>
