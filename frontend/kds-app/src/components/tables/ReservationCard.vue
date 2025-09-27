<!--
  Reservation Card - Display upcoming table reservations
  Shows reservation details with quick action buttons
-->

<template>
  <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
    <!-- Reservation Header -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center space-x-2">
        <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
          <Users class="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h4 class="font-medium text-gray-900">{{ reservation.customerName }}</h4>
          <p class="text-sm text-gray-500">Table {{ reservation.tableNumber }}</p>
        </div>
      </div>
      <div :class="getStatusBadgeClass(reservation.status)" class="px-2 py-1 rounded-full text-xs font-medium">
        {{ getStatusLabel(reservation.status) }}
      </div>
    </div>

    <!-- Reservation Details -->
    <div class="space-y-2 mb-4">
      <div class="flex items-center space-x-2 text-sm text-gray-600">
        <Calendar class="w-4 h-4" />
        <span>{{ formatDate(reservation.reservationTime) }}</span>
      </div>
      <div class="flex items-center space-x-2 text-sm text-gray-600">
        <Clock class="w-4 h-4" />
        <span>{{ formatTime(reservation.reservationTime) }}</span>
        <span class="text-gray-400">•</span>
        <span>{{ reservation.duration }} hours</span>
      </div>
      <div class="flex items-center space-x-2 text-sm text-gray-600">
        <Users class="w-4 h-4" />
        <span>{{ reservation.partySize }} guests</span>
      </div>
      <div v-if="reservation.customerPhone" class="flex items-center space-x-2 text-sm text-gray-600">
        <Phone class="w-4 h-4" />
        <span>{{ reservation.customerPhone }}</span>
      </div>
    </div>

    <!-- Special Requests -->
    <div v-if="reservation.specialRequests && reservation.specialRequests.length > 0" class="mb-4">
      <div class="flex flex-wrap gap-1">
        <span
          v-for="request in reservation.specialRequests.slice(0, 2)"
          :key="request"
          class="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
        >
          {{ request }}
        </span>
        <span
          v-if="reservation.specialRequests.length > 2"
          class="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
        >
          +{{ reservation.specialRequests.length - 2 }} more
        </span>
      </div>
    </div>

    <!-- Notes -->
    <div v-if="reservation.notes" class="mb-4">
      <p class="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
        {{ reservation.notes }}
      </p>
    </div>

    <!-- Time Until Reservation -->
    <div class="mb-4">
      <div class="flex items-center space-x-2">
        <div :class="getTimeStatusClass(timeUntil)" class="w-2 h-2 rounded-full"></div>
        <span :class="getTimeStatusTextClass(timeUntil)" class="text-sm font-medium">
          {{ getTimeUntilText(timeUntil) }}
        </span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex space-x-2">
      <button
        v-if="reservation.status === 'CONFIRMED' && isNearTime"
        @click="$emit('seat', reservation.tableId, reservation.id)"
        class="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
      >
        <UserCheck class="w-4 h-4 mr-1 inline" />
        Seat Now
      </button>

      <button
        v-if="reservation.status === 'CONFIRMED'"
        @click="$emit('edit', reservation)"
        class="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
      >
        <Edit class="w-4 h-4" />
      </button>

      <button
        v-if="reservation.status === 'CONFIRMED'"
        @click="handleCancel"
        class="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
      >
        <X class="w-4 h-4" />
      </button>

      <button
        @click="callCustomer"
        class="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
        title="Call customer"
      >
        <Phone class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Users,
  Calendar,
  Clock,
  Phone,
  UserCheck,
  Edit,
  X
} from 'lucide-vue-next'

interface Reservation {
  id: string
  tableId: string
  tableNumber: string
  customerName: string
  customerPhone?: string
  partySize: number
  reservationTime: string
  duration: number
  status: string
  specialRequests?: string[]
  notes?: string
}

interface Props {
  reservation: Reservation
}

interface Emits {
  (e: 'seat', tableId: string, reservationId: string): void
  (e: 'edit', reservation: Reservation): void
  (e: 'cancel', tableId: string, reservationId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Computed
const timeUntil = computed(() => {
  const now = new Date().getTime()
  const reservationTime = new Date(props.reservation.reservationTime).getTime()
  return reservationTime - now
})

const isNearTime = computed(() => {
  return timeUntil.value <= 30 * 60 * 1000 && timeUntil.value > 0 // Within 30 minutes
})

// Methods
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow'
  } else {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }
}

const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

const getStatusLabel = (status: string): string => {
  const labels = {
    'CONFIRMED': 'Confirmed',
    'SEATED': 'Seated',
    'CANCELLED': 'Cancelled',
    'NO_SHOW': 'No Show'
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status: string): string => {
  const classes = {
    'CONFIRMED': 'bg-blue-100 text-blue-800',
    'SEATED': 'bg-green-100 text-green-800',
    'CANCELLED': 'bg-red-100 text-red-800',
    'NO_SHOW': 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getTimeStatusClass = (timeUntil: number): string => {
  if (timeUntil <= 0) return 'bg-red-500' // Past due
  if (timeUntil <= 15 * 60 * 1000) return 'bg-red-500' // Within 15 minutes
  if (timeUntil <= 30 * 60 * 1000) return 'bg-yellow-500' // Within 30 minutes
  if (timeUntil <= 60 * 60 * 1000) return 'bg-blue-500' // Within 1 hour
  return 'bg-gray-400' // More than 1 hour
}

const getTimeStatusTextClass = (timeUntil: number): string => {
  if (timeUntil <= 0) return 'text-red-600' // Past due
  if (timeUntil <= 15 * 60 * 1000) return 'text-red-600' // Within 15 minutes
  if (timeUntil <= 30 * 60 * 1000) return 'text-yellow-600' // Within 30 minutes
  if (timeUntil <= 60 * 60 * 1000) return 'text-blue-600' // Within 1 hour
  return 'text-gray-600' // More than 1 hour
}

const getTimeUntilText = (timeUntil: number): string => {
  if (timeUntil <= 0) {
    const overdue = Math.abs(timeUntil)
    const minutes = Math.floor(overdue / (1000 * 60))
    if (minutes < 60) {
      return `${minutes}m overdue`
    } else {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours}h ${remainingMinutes}m overdue`
    }
  }

  const minutes = Math.floor(timeUntil / (1000 * 60))
  if (minutes < 60) {
    return `in ${minutes}m`
  } else {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) {
      return `in ${hours}h`
    } else {
      return `in ${hours}h ${remainingMinutes}m`
    }
  }
}

const handleCancel = () => {
  if (confirm(`Are you sure you want to cancel the reservation for ${props.reservation.customerName}?`)) {
    emit('cancel', props.reservation.tableId, props.reservation.id)
  }
}

const callCustomer = () => {
  if (props.reservation.customerPhone) {
    window.open(`tel:${props.reservation.customerPhone}`)
  } else {
    alert('No phone number available for this customer')
  }
}
</script>

<style scoped>
/* Add any specific styling if needed */
</style>