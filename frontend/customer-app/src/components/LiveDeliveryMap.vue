<script setup lang="ts">
/**
 * LiveDeliveryMap - Real-time delivery tracking map
 *
 * Features:
 * - Live driver location updates
 * - Delivery route visualization
 * - ETA calculation
 * - Restaurant and delivery address markers
 */

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import MapView from './MapView.vue'
import {
  watchLocation,
  clearLocationWatch,
  drawRoute,
  calculateDistance,
  formatDistance,
  createDriverIcon,
  createRestaurantIcon,
  createUserLocationIcon,
  fitBoundsToMarkers,
  type Location,
  type DeliveryDriver
} from '@/composables/useMap'
import { Navigation2, Phone, Clock } from 'lucide-vue-next'

interface LiveDeliveryMapProps {
  restaurantLocation: Location
  deliveryLocation: Location
  driver?: DeliveryDriver | null
  orderId?: string
}

const props = withDefaults(defineProps<LiveDeliveryMapProps>(), {
  driver: null,
  orderId: ''
})

const emit = defineEmits<{
  driverLocationUpdate: [location: Location]
  etaUpdate: [minutes: number]
}>()

// State
const mapInstance = ref<any>(null)
const driverLocation = ref<Location | null>(props.driver?.location || null)
const locationWatchId = ref<number | null>(null)
const routeLine = ref<any>(null)
const estimatedTime = ref<number>(0)

// Computed
const mapCenter = computed(() => {
  if (driverLocation.value) {
    return driverLocation.value
  }
  return props.restaurantLocation
})

const mapMarkers = computed(() => {
  const markers = []

  // Restaurant marker
  markers.push({
    location: props.restaurantLocation,
    icon: createRestaurantIcon(),
    popup: '<div class="p-2"><strong>Restaurant</strong><br/>Preparing your order</div>'
  })

  // Delivery location marker
  markers.push({
    location: props.deliveryLocation,
    icon: createUserLocationIcon(),
    popup: '<div class="p-2"><strong>Delivery Address</strong><br/>Your destination</div>'
  })

  // Driver marker
  if (driverLocation.value) {
    markers.push({
      location: driverLocation.value,
      icon: createDriverIcon(),
      popup: props.driver
        ? `<div class="p-2"><strong>${props.driver.name}</strong><br/>Your delivery driver</div>`
        : '<div class="p-2"><strong>Driver</strong><br/>On the way</div>'
    })
  }

  return markers
})

const distanceToDelivery = computed(() => {
  if (!driverLocation.value) return null
  return calculateDistance(driverLocation.value, props.deliveryLocation)
})

// Methods
function handleMapReady(map: any) {
  mapInstance.value = map

  // Fit bounds to show all markers
  const locations = [props.restaurantLocation, props.deliveryLocation]
  if (driverLocation.value) {
    locations.push(driverLocation.value)
  }
  fitBoundsToMarkers(map, locations)

  // Draw route
  updateRoute()
}

function updateRoute() {
  if (!mapInstance.value) return

  // Remove existing route
  if (routeLine.value) {
    routeLine.value.remove()
  }

  // Draw route from driver to delivery location
  if (driverLocation.value) {
    const points = [driverLocation.value, props.deliveryLocation]
    routeLine.value = drawRoute(mapInstance.value, points, '#FF6B00')
  } else {
    // Draw route from restaurant to delivery location
    const points = [props.restaurantLocation, props.deliveryLocation]
    routeLine.value = drawRoute(mapInstance.value, points, '#FF6B00')
  }
}

function updateDriverLocation(location: Location) {
  driverLocation.value = location
  emit('driverLocationUpdate', location)

  // Update route
  updateRoute()

  // Calculate ETA (simple estimation: distance / average speed)
  // Assuming average speed of 30 km/h in city
  if (distanceToDelivery.value) {
    const averageSpeed = 30 // km/h
    const timeInHours = distanceToDelivery.value / averageSpeed
    const timeInMinutes = Math.ceil(timeInHours * 60)
    estimatedTime.value = timeInMinutes
    emit('etaUpdate', timeInMinutes)
  }
}

function simulateDriverMovement() {
  // Simulate driver moving towards delivery location (for demo purposes)
  // In production, this would receive real updates from WebSocket/API

  let currentLat = props.restaurantLocation.lat
  let currentLng = props.restaurantLocation.lng

  const targetLat = props.deliveryLocation.lat
  const targetLng = props.deliveryLocation.lng

  const interval = setInterval(() => {
    // Move driver slightly towards destination
    const latDiff = targetLat - currentLat
    const lngDiff = targetLng - currentLng

    currentLat += latDiff * 0.05 // Move 5% closer each update
    currentLng += lngDiff * 0.05

    updateDriverLocation({ lat: currentLat, lng: currentLng })

    // Stop when close enough to destination
    const distance = calculateDistance({ lat: currentLat, lng: currentLng }, props.deliveryLocation)
    if (distance < 0.1) { // Less than 100m
      clearInterval(interval)
    }
  }, 3000) // Update every 3 seconds

  return interval
}

// Watch for driver prop changes
watch(() => props.driver, (newDriver) => {
  if (newDriver?.location) {
    updateDriverLocation(newDriver.location)
  }
}, { deep: true })

// Lifecycle
let simulationInterval: any = null

onMounted(() => {
  // Start simulated driver movement (in production, use WebSocket)
  simulationInterval = simulateDriverMovement()

  // In production, subscribe to driver location updates via WebSocket:
  // socket.on('driver-location-update', (data) => {
  //   if (data.orderId === props.orderId) {
  //     updateDriverLocation(data.location)
  //   }
  // })
})

onUnmounted(() => {
  // Clean up
  if (locationWatchId.value !== null) {
    clearLocationWatch(locationWatchId.value)
  }

  if (simulationInterval) {
    clearInterval(simulationInterval)
  }

  // In production, unsubscribe from WebSocket:
  // socket.off('driver-location-update')
})
</script>

<template>
  <div class="live-delivery-map">
    <!-- Map -->
    <MapView
      :center="mapCenter"
      :zoom="14"
      :markers="mapMarkers"
      height="400px"
      @map-ready="handleMapReady"
    >
      <template #controls>
        <!-- ETA Display -->
        <div
          v-if="estimatedTime > 0"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 mb-2"
        >
          <div class="flex items-center gap-2 text-sm">
            <Clock :size="16" class="text-orange-500" />
            <span class="font-semibold dark:text-white">{{ estimatedTime }} min</span>
          </div>
          <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Estimated Time</p>
        </div>

        <!-- Distance Display -->
        <div
          v-if="distanceToDelivery"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3"
        >
          <div class="flex items-center gap-2 text-sm">
            <Navigation2 :size="16" class="text-blue-500" />
            <span class="font-semibold dark:text-white">{{ formatDistance(distanceToDelivery) }}</span>
          </div>
          <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Distance Away</p>
        </div>
      </template>
    </MapView>

    <!-- Driver Info Card (if driver data available) -->
    <div
      v-if="driver"
      class="mt-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
    >
      <div class="flex items-center gap-4">
        <!-- Driver Photo -->
        <div class="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
          <img
            v-if="driver.photo"
            :src="driver.photo"
            :alt="driver.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-2xl">
            👤
          </div>
        </div>

        <!-- Driver Details -->
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-lg dark:text-white">{{ driver.name }}</h3>
          <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span v-if="driver.vehicle">{{ driver.vehicle }}</span>
            <span v-if="distanceToDelivery">• {{ formatDistance(distanceToDelivery) }} away</span>
          </div>
        </div>

        <!-- Call Button -->
        <a
          :href="`tel:${driver.phone}`"
          class="p-3 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
          aria-label="Call driver"
        >
          <Phone :size="20" />
        </a>
      </div>

      <!-- Status -->
      <div class="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
        <p class="text-sm text-orange-800 dark:text-orange-300">
          🚚 Your driver is on the way with your order!
        </p>
      </div>
    </div>

    <!-- Legend -->
    <div class="mt-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <h4 class="font-semibold text-sm mb-3 dark:text-white">Map Legend</h4>
      <div class="space-y-2 text-sm">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">
            🍕
          </div>
          <span class="dark:text-gray-300">Restaurant Location</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
            🚚
          </div>
          <span class="dark:text-gray-300">Delivery Driver</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
            📍
          </div>
          <span class="dark:text-gray-300">Your Location</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-6 h-1 bg-orange-500 rounded"></div>
          <span class="dark:text-gray-300">Delivery Route</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles if needed */
</style>
