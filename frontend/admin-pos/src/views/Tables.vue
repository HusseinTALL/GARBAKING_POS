<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-900 text-gray-100">
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4 shadow-lg">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Gestion des Tables
          </h1>
          <p class="text-sm text-gray-400 mt-1">
            Synchronisé avec l'Operations Service
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <button
            @click="handleRefresh"
            class="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-300 flex items-center space-x-2"
            :disabled="isLoading"
          >
            <RefreshCcw class="w-4 h-4" />
            <span>Actualiser</span>
          </button>
          <button
            @click="openReservationModal()"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
          >
            <CalendarPlus class="w-4 h-4" />
            <span>Nouvelle réservation</span>
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-auto p-6 space-y-6">
      <div
        v-if="error"
        class="bg-red-900/40 border border-red-600 text-red-200 rounded-lg p-4 flex items-start justify-between"
      >
        <div>
          <p class="font-medium">{{ error }}</p>
          <p class="text-sm text-red-200/70 mt-1">
            Vérifiez la connexion avec l'Operations Service puis réessayez.
          </p>
        </div>
        <button
          @click="handleDismissError"
          class="text-sm text-red-200 hover:text-white"
        >
          Fermer
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div class="text-sm text-gray-400">Tables</div>
          <div class="mt-2 text-2xl font-semibold text-gray-100">{{ tableStats.total }}</div>
        </div>
        <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div class="text-sm text-gray-400">Disponibles</div>
          <div class="mt-2 text-2xl font-semibold text-green-400">{{ tableStats.available }}</div>
        </div>
        <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div class="text-sm text-gray-400">Occupées</div>
          <div class="mt-2 text-2xl font-semibold text-red-400">{{ tableStats.occupied }}</div>
        </div>
        <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div class="text-sm text-gray-400">Réservées</div>
          <div class="mt-2 text-2xl font-semibold text-blue-400">{{ tableStats.reserved }}</div>
        </div>
        <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div class="text-sm text-gray-400">À nettoyer</div>
          <div class="mt-2 text-2xl font-semibold text-yellow-400">{{ tableStats.dirty }}</div>
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-center py-12">
        <Loader2 class="w-8 h-8 text-blue-400 animate-spin" />
      </div>

      <div v-else class="space-y-6">
        <section v-for="section in sectionsWithTables" :key="section.id" class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-100 flex items-center space-x-2">
              <LayoutGrid class="w-5 h-5 text-blue-400" />
              <span>{{ section.name }}</span>
            </h2>
            <span class="text-sm text-gray-400">{{ section.tables.length }} tables</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <article
              v-for="table in section.tables"
              :key="table.id"
              class="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4"
            >
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm text-gray-400">Table</div>
                  <div class="text-xl font-semibold text-gray-100">{{ table.label }}</div>
                </div>
                <span :class="['px-3 py-1 rounded-full text-xs font-semibold', getStatusBadgeClass(table.status)]">
                  {{ getStatusLabel(table.status) }}
                </span>
              </div>

              <div class="flex items-center space-x-4 text-sm text-gray-300">
                <div class="flex items-center space-x-2">
                  <Users class="w-4 h-4 text-gray-400" />
                  <span>{{ table.capacity }} couverts</span>
                </div>
                <div class="flex items-center space-x-2">
                  <MapPin class="w-4 h-4 text-gray-400" />
                  <span>{{ table.sectionName }}</span>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-xs uppercase tracking-wide text-gray-400">Statut</label>
                <select
                  :value="table.status"
                  @change="event => onStatusSelect(table.id, event)"
                  class="w-full bg-gray-900 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm text-gray-300">
                  <span>Réservations</span>
                  <button
                    class="text-blue-400 hover:text-blue-300 text-xs"
                    @click="openReservationModal(table.id)"
                  >
                    Ajouter
                  </button>
                </div>
                <div class="bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm text-gray-300 space-y-2">
                  <p v-if="tableReservations(table.id).length === 0" class="text-gray-500 text-sm">
                    Aucune réservation future
                  </p>
                  <div
                    v-for="reservation in tableReservations(table.id)"
                    :key="reservation.id"
                    class="flex items-center justify-between"
                  >
                    <div>
                      <div class="font-medium text-gray-100">{{ reservation.customerName }}</div>
                      <div class="text-xs text-gray-400">
                        {{ formatTimeRange(reservation.startTime, reservation.endTime) }} · {{ reservation.partySize }} pers.
                      </div>
                    </div>
                    <span class="text-xs text-gray-400">{{ getReservationStatusLabel(reservation.status) }}</span>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-100 flex items-center space-x-2">
              <Calendar class="w-5 h-5 text-blue-400" />
              <span>Réservations à venir</span>
            </h2>
            <span class="text-sm text-gray-400">{{ upcomingReservationsWithTable.length }} prochaines</span>
          </div>

          <div v-if="upcomingReservationsWithTable.length === 0" class="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <Calendar class="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p class="text-gray-400">Aucune réservation confirmée pour les prochaines heures.</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <ReservationCard
              v-for="reservation in upcomingReservationsWithTable"
              :key="reservation.id"
              :reservation="reservation"
              @seat="handleSeatReservation"
              @cancel="handleCancelReservation"
            />
          </div>
        </section>
      </div>
    </div>

    <ReservationModal
      v-if="showReservationModal"
      :tables="tables"
      :selected-table-id="selectedTableId"
      @close="showReservationModal = false"
      @submit="handleReservationSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import {
  useTablesStore,
  TableStatus,
  ReservationStatus,
  type Table,
  type Reservation,
  type CreateReservationPayload
} from '@/stores/tables'
import ReservationModal from '@/components/tables/ReservationModal.vue'
import ReservationCard from '@/components/tables/ReservationCard.vue'
import {
  Calendar,
  CalendarPlus,
  LayoutGrid,
  Loader2,
  MapPin,
  RefreshCcw,
  Users
} from 'lucide-vue-next'

const tablesStore = useTablesStore()
const {
  sections,
  tables,
  tableStats,
  upcomingReservations,
  isLoading,
  error
} = storeToRefs(tablesStore)

const showReservationModal = ref(false)
const selectedTableId = ref<number | null>(null)

onMounted(() => {
  tablesStore.fetchTables()
})

const sectionsWithTables = computed(() => {
  const grouped = new Map<number, Table[]>()
  tables.value.forEach(table => {
    if (!grouped.has(table.sectionId)) {
      grouped.set(table.sectionId, [])
    }
    grouped.get(table.sectionId)!.push(table)
  })

  return sections.value.map(section => ({
    ...section,
    tables: grouped.get(section.id) ?? []
  }))
})

const upcomingReservationsWithTable = computed(() =>
  upcomingReservations.value.map(reservation => {
    const table = tables.value.find(table => table.id === reservation.tableId)
    return {
      ...reservation,
      tableLabel: table?.label ?? `Table ${reservation.tableId}`,
      sectionName: table?.sectionName ?? ''
    }
  })
)

const statusOptions = [
  { value: TableStatus.AVAILABLE, label: 'Disponible' },
  { value: TableStatus.OCCUPIED, label: 'Occupée' },
  { value: TableStatus.RESERVED, label: 'Réservée' },
  { value: TableStatus.DIRTY, label: 'À nettoyer' }
]

const handleRefresh = () => {
  tablesStore.fetchTables()
}

const openReservationModal = (tableId?: number) => {
  selectedTableId.value = tableId ?? null
  showReservationModal.value = true
}

const handleReservationSubmit = async (payload: CreateReservationPayload) => {
  const success = await tablesStore.createReservation(payload)
  if (success) {
    showReservationModal.value = false
  }
}

const handleStatusChange = async (tableId: number, status: TableStatus) => {
  await tablesStore.updateTableStatus(tableId, status)
}

const onStatusSelect = (tableId: number, event: Event) => {
  const target = event.target as HTMLSelectElement
  handleStatusChange(tableId, target.value as TableStatus)
}

const handleSeatReservation = async (reservationId: number) => {
  await tablesStore.updateReservationStatus(reservationId, ReservationStatus.CHECKED_IN)
}

const handleCancelReservation = async (reservationId: number) => {
  await tablesStore.updateReservationStatus(reservationId, ReservationStatus.CANCELLED)
}

const handleDismissError = () => {
  tablesStore.clearError()
}

const tableReservations = (tableId: number): Reservation[] => {
  const now = new Date()
  return tablesStore
    .getReservationsForTable(tableId)
    .filter(reservation => {
      if (reservation.status === ReservationStatus.CANCELLED || reservation.status === ReservationStatus.COMPLETED) {
        return false
      }
      return new Date(reservation.endTime) >= now
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
}

const getStatusBadgeClass = (status: TableStatus): string => {
  const classes: Record<TableStatus, string> = {
    [TableStatus.AVAILABLE]: 'bg-green-500/20 text-green-300',
    [TableStatus.OCCUPIED]: 'bg-red-500/20 text-red-300',
    [TableStatus.RESERVED]: 'bg-blue-500/20 text-blue-300',
    [TableStatus.DIRTY]: 'bg-yellow-500/20 text-yellow-300'
  }
  return classes[status] || 'bg-gray-500/20 text-gray-300'
}

const getStatusLabel = (status: TableStatus): string => {
  const labels: Record<TableStatus, string> = {
    [TableStatus.AVAILABLE]: 'Disponible',
    [TableStatus.OCCUPIED]: 'Occupée',
    [TableStatus.RESERVED]: 'Réservée',
    [TableStatus.DIRTY]: 'À nettoyer'
  }
  return labels[status] || status
}

const getReservationStatusLabel = (status: ReservationStatus): string => {
  const labels: Record<ReservationStatus, string> = {
    [ReservationStatus.REQUESTED]: 'Demandée',
    [ReservationStatus.CONFIRMED]: 'Confirmée',
    [ReservationStatus.CHECKED_IN]: 'Installée',
    [ReservationStatus.COMPLETED]: 'Terminée',
    [ReservationStatus.CANCELLED]: 'Annulée'
  }
  return labels[status] || status
}

const formatTimeRange = (start: string, end: string): string => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  return `${startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
}
</script>
