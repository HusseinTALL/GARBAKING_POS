<!--
  Table details panel component
  Shows comprehensive table information and actions
-->

<template>
  <div class="space-y-6">
    <!-- Table Status -->
    <div class="bg-gray-50 rounded-lg p-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="font-medium text-gray-900">Statut</h4>
        <div :class="['px-3 py-1 rounded-full text-sm font-medium', statusBadgeClass]">
          <component :is="statusIcon" class="mr-2 w-4 h-4" />
          {{ statusLabel }}
        </div>
      </div>

      <!-- Status Actions -->
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="action in availableStatusActions"
          :key="action.status"
          @click="$emit('status-change', table.id, action.status)"
          :class="[
            'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            action.primary
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          ]"
        >
          <component :is="action.icon" class="mr-2 w-4 h-4" />
          {{ action.label }}
        </button>
      </div>
    </div>

    <!-- Current Order -->
    <div v-if="table.currentOrder" class="bg-blue-50 rounded-lg p-4">
      <h4 class="font-medium text-gray-900 mb-3">Commande actuelle</h4>

      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-600">Numéro:</span>
          <span class="font-medium">#{{ table.currentOrder.orderNumber }}</span>
        </div>
        <div v-if="table.currentOrder.customerName" class="flex justify-between">
          <span class="text-gray-600">Client:</span>
          <span class="font-medium">{{ table.currentOrder.customerName }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Articles:</span>
          <span class="font-medium">{{ table.currentOrder.items }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Total:</span>
          <span class="font-medium text-indigo-600">{{ formatPrice(table.currentOrder.total) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Durée:</span>
          <span class="font-medium">{{ formatDuration(table.currentOrder.startTime) }}</span>
        </div>
      </div>

      <div class="mt-4 flex space-x-2">
        <button
          @click="$emit('clear-table', table.id)"
          class="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          <Check class="mr-2 w-4 h-4" />
          Libérer
        </button>
        <button
          @click="printBill"
          class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <Printer class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Assign Order -->
    <div v-else-if="table.status === TableStatus.AVAILABLE" class="bg-green-50 rounded-lg p-4">
      <h4 class="font-medium text-gray-900 mb-3">Assigner une commande</h4>
      <p class="text-sm text-gray-600 mb-4">Cette table est disponible pour une nouvelle commande.</p>

      <button
        @click="$emit('assign-order', table)"
        class="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        <Utensils class="mr-2 w-4 h-4" />
        Assigner une commande
      </button>
    </div>

    <!-- Table Information -->
    <div class="bg-gray-50 rounded-lg p-4">
      <h4 class="font-medium text-gray-900 mb-3">Informations</h4>

      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-600">Capacité:</span>
          <span class="font-medium">{{ table.capacity }} personnes</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Section:</span>
          <span class="font-medium">{{ getSectionName(table.section) }}</span>
        </div>
        <div v-if="table.assignedStaff" class="flex justify-between">
          <span class="text-gray-600">Serveur:</span>
          <span class="font-medium">{{ table.assignedStaff.name }}</span>
        </div>
        <div v-if="table.lastCleaned" class="flex justify-between">
          <span class="text-gray-600">Dernier nettoyage:</span>
          <span class="font-medium">{{ formatLastCleaned(table.lastCleaned) }}</span>
        </div>
      </div>
    </div>

    <!-- Reservations -->
    <div v-if="table.reservations.length > 0" class="bg-yellow-50 rounded-lg p-4">
      <h4 class="font-medium text-gray-900 mb-3">Réservations</h4>

      <div class="space-y-3">
        <div
          v-for="reservation in activeReservations"
          :key="reservation.id"
          class="bg-white rounded-lg p-3 border border-yellow-200"
        >
          <div class="flex justify-between items-start mb-2">
            <div>
              <p class="font-medium text-gray-900">{{ reservation.customerName }}</p>
              <p class="text-sm text-gray-600">{{ reservation.partySize }} personnes</p>
            </div>
            <div :class="['px-2 py-1 rounded text-xs font-medium', getReservationStatusClass(reservation.status)]">
              {{ getReservationStatusLabel(reservation.status) }}
            </div>
          </div>

          <div class="text-sm text-gray-600 mb-3">
            {{ formatReservationTime(reservation.reservationTime) }}
          </div>

          <div v-if="reservation.status === 'CONFIRMED'" class="flex space-x-2">
            <button
              @click="seatReservation(reservation)"
              class="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Installer
            </button>
            <button
              @click="cancelReservation(reservation)"
              class="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>

      <button
        @click="$emit('add-reservation')"
        class="w-full mt-3 bg-white border border-yellow-300 text-yellow-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-50 transition-colors"
      >
        <CalendarPlus class="mr-2 w-4 h-4" />
        Nouvelle réservation
      </button>
    </div>

    <!-- Notes -->
    <div v-if="table.notes" class="bg-amber-50 rounded-lg p-4">
      <h4 class="font-medium text-gray-900 mb-2">Notes</h4>
      <p class="text-sm text-amber-800">{{ table.notes }}</p>
    </div>

    <!-- Actions -->
    <div class="pt-4 border-t border-gray-200">
      <button
        @click="$emit('close')"
        class="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
      >
        Fermer
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TableStatus, type Table, type Reservation } from '@/stores/tables'
import { Check, User, Calendar, Broom, Wrench, LogOut, UserCheck, X, Printer, Utensils, CalendarPlus } from 'lucide-vue-next'

// Props
interface Props {
  table: Table
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'status-change': [tableId: string, status: TableStatus, notes?: string]
  'assign-order': [table: Table]
  'clear-table': [tableId: string]
  'add-reservation': []
  'close': []
}>()

// Computed
const statusLabel = computed(() => {
  const labels = {
    [TableStatus.AVAILABLE]: 'Disponible',
    [TableStatus.OCCUPIED]: 'Occupée',
    [TableStatus.RESERVED]: 'Réservée',
    [TableStatus.NEEDS_CLEANING]: 'À nettoyer',
    [TableStatus.OUT_OF_ORDER]: 'Hors service'
  }
  return labels[props.table.status]
})

const statusIcon = computed(() => {
  const icons = {
    [TableStatus.AVAILABLE]: Check,
    [TableStatus.OCCUPIED]: User,
    [TableStatus.RESERVED]: Calendar,
    [TableStatus.NEEDS_CLEANING]: Broom,
    [TableStatus.OUT_OF_ORDER]: Wrench
  }
  return icons[props.table.status]
})

const statusBadgeClass = computed(() => {
  const classes = {
    [TableStatus.AVAILABLE]: 'bg-green-100 text-green-800',
    [TableStatus.OCCUPIED]: 'bg-red-100 text-red-800',
    [TableStatus.RESERVED]: 'bg-blue-100 text-blue-800',
    [TableStatus.NEEDS_CLEANING]: 'bg-yellow-100 text-yellow-800',
    [TableStatus.OUT_OF_ORDER]: 'bg-gray-100 text-gray-800'
  }
  return classes[props.table.status]
})

const availableStatusActions = computed(() => {
  const actions = []

  switch (props.table.status) {
    case TableStatus.AVAILABLE:
      actions.push(
        { status: TableStatus.RESERVED, label: 'Réserver', icon: Calendar, primary: false },
        { status: TableStatus.OUT_OF_ORDER, label: 'Hors service', icon: Wrench, primary: false }
      )
      break

    case TableStatus.OCCUPIED:
      actions.push(
        { status: TableStatus.NEEDS_CLEANING, label: 'Libérer', icon: LogOut, primary: true }
      )
      break

    case TableStatus.RESERVED:
      actions.push(
        { status: TableStatus.OCCUPIED, label: 'Installer', icon: UserCheck, primary: true },
        { status: TableStatus.AVAILABLE, label: 'Libérer', icon: X, primary: false }
      )
      break

    case TableStatus.NEEDS_CLEANING:
      actions.push(
        { status: TableStatus.AVAILABLE, label: 'Nettoyer', icon: Check, primary: true }
      )
      break

    case TableStatus.OUT_OF_ORDER:
      actions.push(
        { status: TableStatus.AVAILABLE, label: 'Réparer', icon: Check, primary: true }
      )
      break
  }

  return actions
})

const activeReservations = computed(() => {
  return props.table.reservations.filter(r =>
    r.status === 'CONFIRMED' || r.status === 'SEATED'
  )
})

// Methods
const formatPrice = (amount: number): string => {
  return `${amount.toLocaleString()} FCFA`
}

const formatDuration = (startTime: string): string => {
  const start = new Date(startTime)
  const now = new Date()
  const diffMs = now.getTime() - start.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))

  if (diffMins < 60) {
    return `${diffMins} min`
  }

  const hours = Math.floor(diffMins / 60)
  const minutes = diffMins % 60
  return `${hours}h ${minutes}min`
}

const formatLastCleaned = (timestamp: string): string => {
  const cleaned = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - cleaned.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours < 1) {
    return 'Il y a moins d\'1h'
  }

  return `Il y a ${diffHours}h`
}

const formatReservationTime = (timeString: string): string => {
  const time = new Date(timeString)
  return time.toLocaleString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getSectionName = (sectionId: string): string => {
  // This would normally come from the store
  const sectionNames = {
    'main': 'Salle principale',
    'terrace': 'Terrasse',
    'private': 'Salon privé',
    'bar': 'Bar'
  }
  return sectionNames[sectionId] || sectionId
}

const getReservationStatusLabel = (status: string): string => {
  const labels = {
    'CONFIRMED': 'Confirmée',
    'SEATED': 'Installée',
    'CANCELLED': 'Annulée',
    'NO_SHOW': 'Absent'
  }
  return labels[status] || status
}

const getReservationStatusClass = (status: string): string => {
  const classes = {
    'CONFIRMED': 'bg-blue-100 text-blue-800',
    'SEATED': 'bg-green-100 text-green-800',
    'CANCELLED': 'bg-red-100 text-red-800',
    'NO_SHOW': 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const seatReservation = (_reservation: Reservation) => {
  emit('status-change', props.table.id, TableStatus.OCCUPIED)
  // Additional logic for seating reservation
}

const cancelReservation = (reservation: Reservation) => {
  // Logic for cancelling reservation
  console.log('Cancel reservation:', reservation.id)
}

const printBill = () => {
  // Logic for printing bill
  console.log('Print bill for table:', props.table.number)
}
</script>
