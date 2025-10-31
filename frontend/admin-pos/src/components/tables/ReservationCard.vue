<template>
  <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center space-x-2">
        <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
          <Users class="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h4 class="font-medium text-gray-900">{{ reservation.customerName }}</h4>
          <p class="text-sm text-gray-500">Table {{ reservation.tableLabel }}</p>
        </div>
      </div>
      <div :class="getStatusBadgeClass(reservation.status)" class="px-2 py-1 rounded-full text-xs font-medium">
        {{ getStatusLabel(reservation.status) }}
      </div>
    </div>

    <div class="space-y-2 mb-4 text-sm text-gray-600">
      <div class="flex items-center space-x-2">
        <Calendar class="w-4 h-4" />
        <span>{{ formatDate(reservation.startTime) }}</span>
      </div>
      <div class="flex items-center space-x-2">
        <Clock class="w-4 h-4" />
        <span>{{ formatTimeRange(reservation.startTime, reservation.endTime) }}</span>
      </div>
      <div class="flex items-center space-x-2">
        <Users class="w-4 h-4" />
        <span>{{ reservation.partySize }} personnes</span>
      </div>
      <div class="flex items-center space-x-2" v-if="reservation.contact">
        <Phone class="w-4 h-4" />
        <span>{{ reservation.contact }}</span>
      </div>
    </div>

    <div class="flex items-center justify-between text-xs text-gray-500 mb-4">
      <span>{{ reservation.sectionName }}</span>
      <span>{{ timeUntilText }}</span>
    </div>

    <div class="flex space-x-2">
      <button
        v-if="reservation.status === ReservationStatus.CONFIRMED"
        @click="$emit('seat', reservation.id)"
        class="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
      >
        Installer
      </button>
      <button
        v-if="reservation.status === ReservationStatus.CONFIRMED"
        @click="$emit('cancel', reservation.id)"
        class="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
      >
        Annuler
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
  Phone
} from 'lucide-vue-next'
import { ReservationStatus, type Reservation } from '@/stores/tables'

interface ReservationCardData extends Reservation {
  tableLabel: string
  sectionName?: string
}

interface Props {
  reservation: ReservationCardData
}

interface Emits {
  (e: 'seat', reservationId: number): void
  (e: 'cancel', reservationId: number): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const now = computed(() => new Date())

const timeUntilText = computed(() => {
  const start = new Date(props.reservation.startTime)
  const diff = start.getTime() - now.value.getTime()

  if (diff <= 0) {
    return 'En cours'
  }

  const minutes = Math.round(diff / 60000)
  if (minutes < 60) {
    return `Dans ${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes === 0
    ? `Dans ${hours} h`
    : `Dans ${hours} h ${remainingMinutes} min`
})

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

const formatTimeRange = (start: string, end: string): string => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  return `${startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
}

const getStatusLabel = (status: ReservationStatus): string => {
  const labels: Record<ReservationStatus, string> = {
    [ReservationStatus.REQUESTED]: 'Demandée',
    [ReservationStatus.CONFIRMED]: 'Confirmée',
    [ReservationStatus.CHECKED_IN]: 'Installée',
    [ReservationStatus.COMPLETED]: 'Terminée',
    [ReservationStatus.CANCELLED]: 'Annulée'
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status: ReservationStatus): string => {
  const classes: Record<ReservationStatus, string> = {
    [ReservationStatus.REQUESTED]: 'bg-gray-100 text-gray-700',
    [ReservationStatus.CONFIRMED]: 'bg-blue-100 text-blue-700',
    [ReservationStatus.CHECKED_IN]: 'bg-green-100 text-green-700',
    [ReservationStatus.COMPLETED]: 'bg-purple-100 text-purple-700',
    [ReservationStatus.CANCELLED]: 'bg-red-100 text-red-700'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}
</script>
