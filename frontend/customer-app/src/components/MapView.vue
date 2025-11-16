<script setup lang="ts">
/**
 * MapView - Base map component using Leaflet
 *
 * Reusable map component that can be customized for different use cases
 */

import { ref, onMounted, watch } from 'vue'
import { useMap, type Location } from '@/composables/useMap'
import 'leaflet/dist/leaflet.css'

interface MapViewProps {
  center?: Location
  zoom?: number
  height?: string
  markers?: Array<{
    location: Location
    popup?: string
    icon?: any
  }>
  userLocation?: Location | null
  showControls?: boolean
}

const props = withDefaults(defineProps<MapViewProps>(), {
  center: () => ({ lat: 9.5092, lng: -13.7122 }), // Conakry, Guinea
  zoom: 13,
  height: '400px',
  markers: () => [],
  userLocation: null,
  showControls: true
})

const emit = defineEmits<{
  mapReady: [map: any]
  mapClick: [location: Location]
}>()

const mapId = `map-${Math.random().toString(36).substring(7)}`
const { mapInstance, initMap, addMarker, clearMarkers, centerOn } = useMap()

// Initialize map on mount
onMounted(() => {
  const map = initMap(mapId, props.center, props.zoom)

  // Add click listener
  map.on('click', (e: any) => {
    emit('mapClick', { lat: e.latlng.lat, lng: e.latlng.lng })
  })

  // Add initial markers
  updateMarkers()

  // Add user location marker if provided
  if (props.userLocation) {
    addUserLocationMarker(props.userLocation)
  }

  emit('mapReady', map)
})

// Watch for marker changes
watch(() => props.markers, updateMarkers, { deep: true })

// Watch for user location changes
watch(() => props.userLocation, (newLocation) => {
  if (newLocation) {
    addUserLocationMarker(newLocation)
  }
}, { deep: true })

// Watch for center changes
watch(() => props.center, (newCenter) => {
  centerOn(newCenter, props.zoom)
}, { deep: true })

function updateMarkers() {
  clearMarkers()
  props.markers.forEach(marker => {
    addMarker(marker.location, marker.icon, marker.popup)
  })
}

function addUserLocationMarker(location: Location) {
  // Remove existing user location marker (if any)
  // Then add new one
  addMarker(location, undefined, 'Your Location')
  centerOn(location)
}
</script>

<template>
  <div class="map-container relative" :style="{ height }">
    <div :id="mapId" class="w-full h-full rounded-lg"></div>

    <!-- Zoom controls overlay (optional) -->
    <div v-if="showControls" class="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <slot name="controls"></slot>
    </div>

    <!-- Loading overlay -->
    <div v-if="!mapInstance" class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p class="text-sm text-gray-600 dark:text-gray-400">Loading map...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-container :deep(.leaflet-container) {
  border-radius: 0.5rem;
}

/* Custom marker styles */
.map-container :deep(.restaurant-marker),
.map-container :deep(.driver-marker),
.map-container :deep(.user-location-marker) {
  background: transparent;
  border: none;
}

/* Ensure proper stacking */
.map-container :deep(.leaflet-pane) {
  z-index: 400;
}

.map-container :deep(.leaflet-top),
.map-container :deep(.leaflet-bottom) {
  z-index: 1000;
}
</style>
