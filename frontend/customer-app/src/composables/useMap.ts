/**
 * useMap - Leaflet map utilities and helpers
 *
 * Provides utilities for:
 * - Distance calculations
 * - Geocoding helpers
 * - Map marker management
 * - Route drawing
 */

import { ref, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import L from 'leaflet'
import type { Map, Marker, LatLngExpression, LatLngBounds } from 'leaflet'

// Fix Leaflet default icon issue with Vite
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl
})

export interface Location {
  lat: number
  lng: number
}

export interface Restaurant {
  id: string
  name: string
  location: Location
  address: string
  rating?: number
  distance?: number
  isOpen?: boolean
}

export interface DeliveryDriver {
  id: string
  name: string
  phone: string
  photo?: string
  location: Location
  vehicle?: string
}

/**
 * Calculate distance between two coordinates (in kilometers)
 * Uses Haversine formula
 */
export function calculateDistance(loc1: Location, loc2: Location): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRadians(loc2.lat - loc1.lat)
  const dLon = toRadians(loc2.lng - loc1.lng)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(loc1.lat)) * Math.cos(toRadians(loc2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance * 10) / 10 // Round to 1 decimal
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`
  }
  return `${km.toFixed(1)}km`
}

/**
 * Get user's current location
 */
export async function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  })
}

/**
 * Watch user's location for live tracking
 */
export function watchLocation(callback: (location: Location) => void): number {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported')
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      })
    },
    (error) => {
      console.error('Location watch error:', error)
    },
    {
      enableHighAccuracy: true,
      maximumAge: 10000
    }
  )
}

/**
 * Stop watching location
 */
export function clearLocationWatch(watchId: number): void {
  navigator.geolocation.clearWatch(watchId)
}

/**
 * Create custom marker icon
 */
export function createCustomIcon(
  iconUrl: string,
  size: [number, number] = [40, 40],
  anchor: [number, number] = [20, 40]
): L.Icon {
  return L.icon({
    iconUrl,
    iconSize: size,
    iconAnchor: anchor,
    popupAnchor: [0, -40]
  })
}

/**
 * Create restaurant marker icon (orange)
 */
export function createRestaurantIcon(): L.DivIcon {
  return L.divIcon({
    className: 'restaurant-marker',
    html: `
      <div class="relative">
        <div class="absolute -inset-2 bg-orange-500 rounded-full opacity-25 animate-ping"></div>
        <div class="relative bg-orange-500 w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
          <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  })
}

/**
 * Create driver marker icon (blue)
 */
export function createDriverIcon(): L.DivIcon {
  return L.divIcon({
    className: 'driver-marker',
    html: `
      <div class="relative">
        <div class="absolute -inset-2 bg-blue-500 rounded-full opacity-25 animate-pulse"></div>
        <div class="relative bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
          <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48]
  })
}

/**
 * Create user location marker icon (green)
 */
export function createUserLocationIcon(): L.DivIcon {
  return L.divIcon({
    className: 'user-location-marker',
    html: `
      <div class="relative">
        <div class="absolute -inset-3 bg-green-500 rounded-full opacity-20"></div>
        <div class="relative bg-green-500 w-8 h-8 rounded-full border-4 border-white shadow-lg"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  })
}

/**
 * Draw route on map between points
 */
export function drawRoute(
  map: Map,
  points: Location[],
  color: string = '#FF6B00'
): L.Polyline {
  const latLngs: LatLngExpression[] = points.map(p => [p.lat, p.lng])

  return L.polyline(latLngs, {
    color,
    weight: 4,
    opacity: 0.8,
    smoothFactor: 1
  }).addTo(map)
}

/**
 * Fit map bounds to show all markers
 */
export function fitBoundsToMarkers(map: Map, locations: Location[]): void {
  if (locations.length === 0) return

  const bounds = L.latLngBounds(
    locations.map(loc => [loc.lat, loc.lng] as LatLngExpression)
  )

  map.fitBounds(bounds, {
    padding: [50, 50],
    maxZoom: 15
  })
}

/**
 * Reverse geocode: Convert coordinates to address
 * Using Nominatim (OpenStreetMap)
 */
export async function reverseGeocode(location: Location): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`
    )
    const data = await response.json()
    return data.display_name || 'Address not found'
  } catch (error) {
    console.error('Reverse geocoding failed:', error)
    return 'Address not found'
  }
}

/**
 * Forward geocode: Convert address to coordinates
 */
export async function forwardGeocode(address: string): Promise<Location | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    )
    const data = await response.json()

    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      }
    }
    return null
  } catch (error) {
    console.error('Forward geocoding failed:', error)
    return null
  }
}

/**
 * Composable for managing a Leaflet map instance
 */
export function useMap() {
  const mapInstance: Ref<Map | null> = ref(null)
  const markers: Ref<Marker[]> = ref([])

  /**
   * Initialize map
   */
  const initMap = (
    containerId: string,
    center: Location = { lat: 9.5092, lng: -13.7122 }, // Conakry, Guinea
    zoom: number = 13
  ): Map => {
    const map = L.map(containerId).setView([center.lat, center.lng], zoom)

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map)

    mapInstance.value = map
    return map
  }

  /**
   * Add marker to map
   */
  const addMarker = (
    location: Location,
    icon?: L.Icon | L.DivIcon,
    popup?: string
  ): Marker => {
    if (!mapInstance.value) {
      throw new Error('Map not initialized')
    }

    const marker = L.marker([location.lat, location.lng], icon ? { icon } : undefined)
      .addTo(mapInstance.value)

    if (popup) {
      marker.bindPopup(popup)
    }

    markers.value.push(marker)
    return marker
  }

  /**
   * Remove all markers
   */
  const clearMarkers = () => {
    markers.value.forEach(marker => marker.remove())
    markers.value = []
  }

  /**
   * Center map on location
   */
  const centerOn = (location: Location, zoom?: number) => {
    if (!mapInstance.value) return
    mapInstance.value.setView([location.lat, location.lng], zoom)
  }

  /**
   * Cleanup on unmount
   */
  onUnmounted(() => {
    clearMarkers()
    if (mapInstance.value) {
      mapInstance.value.remove()
      mapInstance.value = null
    }
  })

  return {
    mapInstance,
    markers,
    initMap,
    addMarker,
    clearMarkers,
    centerOn
  }
}
