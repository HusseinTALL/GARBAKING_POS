<!--
  Table management interface for restaurant floor plan and table operations
  Visual floor plan with drag-and-drop, real-time status updates
-->

<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-900 text-gray-100">
    <!-- Header -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4 shadow-lg">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Gestion des Tables
          </h1>
          <div class="flex items-center space-x-2">
            <div :class="[
              'w-3 h-3 rounded-full',
              isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
            ]"></div>
            <span class="text-sm text-gray-400">
              {{ isConnected ? 'Temps réel' : 'Hors ligne' }}
            </span>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <!-- View Toggle -->
          <div class="flex bg-gray-700 rounded-lg p-1">
            <button
              @click="currentView = 'floor'"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-all duration-300',
                currentView === 'floor'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-600'
              ]"
            >
              <LayoutGrid class="w-4 h-4 mr-2 inline-block" />
              Plan
            </button>
            <button
              @click="currentView = 'list'"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-all duration-300',
                currentView === 'list'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-600'
              ]"
            >
              <List class="w-4 h-4 mr-2 inline-block" />
              Liste
            </button>
          </div>

          <!-- Quick Actions -->
          <button
            @click="showReservationModal = true"
            class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <CalendarPlus class="w-4 h-4 mr-2 inline-block" />
            Réservation
          </button>

          <!-- Settings -->
          <button
            @click="showSettings = true"
            class="p-2 rounded-lg bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white transition-all duration-300"
          >
            <Settings class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        <div class="bg-gray-700 rounded-lg p-4 text-center border border-gray-600 hover:bg-gray-600 transition-all duration-300">
          <div class="text-2xl font-bold text-blue-400">{{ tableStats.total }}</div>
          <div class="text-sm text-gray-400">Total</div>
        </div>
        <div class="bg-gray-700 rounded-lg p-4 text-center border border-gray-600 hover:bg-gray-600 transition-all duration-300">
          <div class="text-2xl font-bold text-green-400">{{ tableStats.available }}</div>
          <div class="text-sm text-gray-400">Disponibles</div>
        </div>
        <div class="bg-gray-700 rounded-lg p-4 text-center border border-gray-600 hover:bg-gray-600 transition-all duration-300">
          <div class="text-2xl font-bold text-red-400">{{ tableStats.occupied }}</div>
          <div class="text-sm text-gray-400">Occupées</div>
        </div>
        <div class="bg-gray-700 rounded-lg p-4 text-center border border-gray-600 hover:bg-gray-600 transition-all duration-300">
          <div class="text-2xl font-bold text-blue-400">{{ tableStats.reserved }}</div>
          <div class="text-sm text-gray-400">Réservées</div>
        </div>
        <div class="bg-gray-700 rounded-lg p-4 text-center border border-gray-600 hover:bg-gray-600 transition-all duration-300">
          <div class="text-2xl font-bold text-yellow-400">{{ tableStats.needsCleaning }}</div>
          <div class="text-sm text-gray-400">À nettoyer</div>
        </div>
        <div class="bg-gray-700 rounded-lg p-4 text-center border border-gray-600 hover:bg-gray-600 transition-all duration-300">
          <div class="text-2xl font-bold text-gray-400">{{ tableStats.outOfOrder }}</div>
          <div class="text-sm text-gray-400">Hors service</div>
        </div>
        <div class="bg-gray-700 rounded-lg p-4 text-center border border-gray-600 hover:bg-gray-600 transition-all duration-300">
          <div class="text-2xl font-bold text-purple-400">{{ tableStats.occupancyRate }}%</div>
          <div class="text-sm text-gray-400">Taux d'occupation</div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-hidden">
      <!-- Floor Plan View -->
      <div v-if="currentView === 'floor'" class="h-full flex">
        <!-- Floor Plan Canvas -->
        <div class="flex-1 relative bg-gray-800 overflow-auto" ref="floorPlanContainer">
          <div
            class="relative"
            :style="{
              width: floorPlanSize.width + 'px',
              height: floorPlanSize.height + 'px',
              minWidth: '100%',
              minHeight: '100%',
              background: 'linear-gradient(45deg, #1f2937, #111827)'
            }"
            @click="handleFloorClick"
          >
            <!-- Sections -->
            <div
              v-for="section in sectionsWithTables"
              :key="section.id"
              class="absolute border-2 border-dashed border-gray-600 rounded-lg transition-all duration-300 hover:border-gray-500"
              :style="{
                left: section.bounds.x + 'px',
                top: section.bounds.y + 'px',
                width: section.bounds.width + 'px',
                height: section.bounds.height + 'px',
                backgroundColor: section.color + '33'
              }"
            >
              <div class="absolute top-2 left-2 text-sm font-medium text-gray-300">
                {{ section.name }}
              </div>
            </div>

            <!-- Tables -->
            <TableComponent
              v-for="table in tables"
              :key="table.id"
              :table="table"
              :selected="selectedTable?.id === table.id"
              :scale="floorPlanScale"
              @click="selectTable"
              @status-change="handleTableStatusChange"
              @move="handleTableMove"
              @assign-order="handleAssignOrder"
              class="hover:shadow-lg transition-all duration-300"
            />
          </div>
        </div>

        <!-- Side Panel -->
        <div class="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <!-- Selected Table Details -->
          <div v-if="selectedTable" class="flex-none p-6 border-b border-gray-700">
            <h3 class="text-lg font-semibold text-gray-100 mb-4">
              Table {{ selectedTable.number }}
            </h3>

            <TableDetailsPanel
              :table="selectedTable"
              @status-change="handleTableStatusChange"
              @assign-order="handleAssignOrder"
              @clear-table="handleClearTable"
              @add-reservation="showReservationModal = true"
              @close="selectedTable = null"
            />
          </div>

          <!-- Upcoming Reservations -->
          <div class="flex-1 overflow-auto p-6">
            <h4 class="text-sm font-medium text-gray-300 mb-4">Réservations à venir</h4>

            <div v-if="upcomingReservations.length === 0" class="text-center py-8">
              <Calendar class="w-12 h-12 text-gray-500 mx-auto mb-2" />
              <p class="text-gray-500">Aucune réservation</p>
            </div>

            <div v-else class="space-y-3">
              <ReservationCard
                v-for="reservation in upcomingReservations"
                :key="reservation.id"
                :reservation="reservation"
                @seat="handleSeatReservation"
                @edit="handleEditReservation"
                @cancel="handleCancelReservation"
                class="hover:bg-gray-700 transition-all duration-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="h-full overflow-auto p-6 bg-gray-900">
        <TableListView
          :tables="tables"
          :sections="floorPlan?.sections || []"
          @select="selectTable"
          @status-change="handleTableStatusChange"
          @assign-order="handleAssignOrder"
          @clear-table="handleClearTable"
          @bulk-action="handleBulkAction"
        />
      </div>
    </div>

    <!-- Modals -->
    <ReservationModal
      v-if="showReservationModal"
      :table="selectedTable"
      :tables="tables"
      @close="showReservationModal = false"
      @created="handleReservationCreated"
      class="bg-gray-800 text-gray-100"
    />

    <AssignOrderModal
      v-if="showAssignOrderModal"
      :table="assignOrderTable"
      @close="showAssignOrderModal = false"
      @assigned="handleOrderAssigned"
      class="bg-gray-800 text-gray-100"
    />

    <TableSettingsModal
      v-if="showSettings"
      :settings="floorPlanSettings"
      @close="showSettings = false"
      @update="updateSettings"
      class="bg-gray-800 text-gray-100"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useTablesStore, TableStatus, type Table, type Reservation } from '@/stores/tables'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import {
  LayoutGrid,
  List,
  CalendarPlus,
  Settings,
  Calendar
} from 'lucide-vue-next'

// Stores
const tablesStore = useTablesStore()
const authStore = useAuthStore()

// Destructure store state
const {
  tables,
  floorPlan,
  selectedTable,
  isLoading,
  tableStats,
  sectionsWithTables,
  upcomingReservations
} = storeToRefs(tablesStore)

// Local state
const currentView = ref<'floor' | 'list'>('floor')
const isConnected = ref(true)
const showReservationModal = ref(false)
const showAssignOrderModal = ref(false)
const showSettings = ref(false)
const assignOrderTable = ref<Table | null>(null)

// Floor plan state
const floorPlanContainer = ref<HTMLElement>()
const floorPlanSize = ref({ width: 1200, height: 800 })
const floorPlanScale = ref(1)

// Floor plan settings
const floorPlanSettings = ref({
  gridSize: 20,
  snapToGrid: true,
  showGrid: false,
  autoSave: true,
  defaultTableSize: { width: 80, height: 80 }
})

// Methods
const selectTable = (table: Table) => {
  selectedTable.value = table
}

const handleTableStatusChange = async (tableId: string, newStatus: TableStatus, notes?: string) => {
  const success = await tablesStore.updateTableStatus(tableId, newStatus, notes)
  if (success) {
    console.log(`Table status updated: ${tableId} -> ${newStatus}`)
  }
}

const handleAssignOrder = (table: Table) => {
  assignOrderTable.value = table
  showAssignOrderModal.value = true
}

const handleOrderAssigned = async (tableId: string, orderId: string) => {
  const success = await tablesStore.assignOrderToTable(tableId, orderId)
  if (success) {
    showAssignOrderModal.value = false
    assignOrderTable.value = null
  }
}

const handleClearTable = async (tableId: string) => {
  const success = await tablesStore.clearTable(tableId)
  if (success) {
    console.log(`Table cleared: ${tableId}`)
  }
}

const handleTableMove = async (tableId: string, newPosition: { x: number; y: number }) => {
  if (floorPlanSettings.value.snapToGrid) {
    const gridSize = floorPlanSettings.value.gridSize
    newPosition.x = Math.round(newPosition.x / gridSize) * gridSize
    newPosition.y = Math.round(newPosition.y / gridSize) * gridSize
  }

  const success = await tablesStore.moveTable(tableId, newPosition)
  if (!success) {
    await tablesStore.fetchTables()
  }
}

const handleSeatReservation = async (tableId: string, reservationId: string) => {
  const success = await tablesStore.seatReservation(tableId, reservationId)
  if (success) {
    console.log(`Reservation seated: ${reservationId}`)
  }
}

const handleEditReservation = (reservation: any) => {
  console.log('Edit reservation:', reservation)
}

const handleCancelReservation = async (tableId: string, reservationId: string) => {
  const success = await tablesStore.updateReservation(tableId, reservationId, {
    status: 'CANCELLED'
  })
  if (success) {
    console.log(`Reservation cancelled: ${reservationId}`)
  }
}

const handleReservationCreated = async (tableId: string, reservationData: any) => {
  const success = await tablesStore.createReservation(tableId, reservationData)
  if (success) {
    showReservationModal.value = false
    console.log('Reservation created')
  }
}

const handleBulkAction = async (tableIds: string[], action: string) => {
  if (action === 'mark_available') {
    await tablesStore.bulkUpdateStatus(tableIds, TableStatus.AVAILABLE)
  } else if (action === 'mark_cleaning') {
    await tablesStore.bulkUpdateStatus(tableIds, TableStatus.NEEDS_CLEANING)
  }
}

const handleFloorClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    selectedTable.value = null
  }
}

const updateSettings = (newSettings: any) => {
  floorPlanSettings.value = { ...floorPlanSettings.value, ...newSettings }
  localStorage.setItem('pos-floorplan-settings', JSON.stringify(floorPlanSettings.value))
}

const adjustFloorPlanSize = () => {
  if (!floorPlanContainer.value) return

  const container = floorPlanContainer.value
  const containerWidth = container.clientWidth
  const containerHeight = container.clientHeight

  const scaleX = containerWidth / floorPlanSize.value.width
  const scaleY = containerHeight / floorPlanSize.value.height
  floorPlanScale.value = Math.min(scaleX, scaleY, 1)
}

// Auto-refresh functionality
let refreshInterval: ReturnType<typeof setInterval> | null = null

const startAutoRefresh = () => {
  refreshInterval = setInterval(async () => {
    if (isConnected.value) {
      await tablesStore.fetchTables()
      tablesStore.checkReservationsStatus()
    }
  }, 30000)
}

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

// Lifecycle
onMounted(async () => {
  const savedSettings = localStorage.getItem('pos-floorplan-settings')
  if (savedSettings) {
    floorPlanSettings.value = { ...floorPlanSettings.value, ...JSON.parse(savedSettings) }
  }

  await Promise.all([
    tablesStore.fetchTables(),
    tablesStore.fetchFloorPlan()
  ])

  await nextTick()
  adjustFloorPlanSize()

  startAutoRefresh()
  window.addEventListener('resize', adjustFloorPlanSize)
})

onUnmounted(() => {
  stopAutoRefresh()
  window.removeEventListener('resize', adjustFloorPlanSize)
})
</script>

<style scoped>
/* Floor plan grid */
.floor-plan-grid {
  background-image:
    linear-gradient(to right, #374151 1px, transparent 1px),
    linear-gradient(to bottom, #374151 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Table drag styles */
.table-dragging {
  cursor: grabbing;
  z-index: 1000;
  transform: scale(1.05);
}

/* Selection styles */
.table-selected {
  box-shadow: 0 0 0 3px #60a5fa;
}

/* Smooth transitions */
.table-transition {
  transition: all 0.3s ease;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .w-80 {
    @apply w-full max-w-[300px];
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1f2937;
}

::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>