<!--
  Table List View - Tabular view of all tables with bulk actions
  Alternative to floor plan view for managing tables
-->

<template>
  <div class="space-y-6">
    <!-- Header Actions -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <h2 class="text-lg font-semibold text-gray-900">All Tables</h2>
        <div class="flex items-center space-x-2">
          <input
            v-model="selectAll"
            @change="handleSelectAll"
            type="checkbox"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label class="text-sm text-gray-700">Select All</label>
          <span v-if="selectedTables.length > 0" class="text-sm text-blue-600">
            ({{ selectedTables.length }} selected)
          </span>
        </div>
      </div>

      <!-- Bulk Actions -->
      <div v-if="selectedTables.length > 0" class="flex items-center space-x-2">
        <button
          @click="handleBulkAction('mark_available')"
          class="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
        >
          <Check class="w-4 h-4 mr-1 inline" />
          Mark Available
        </button>
        <button
          @click="handleBulkAction('mark_cleaning')"
          class="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors"
        >
          <Broom class="w-4 h-4 mr-1 inline" />
          Need Cleaning
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex items-center space-x-4">
      <!-- Status Filter -->
      <div>
        <select
          v-model="statusFilter"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Status</option>
          <option value="AVAILABLE">Available</option>
          <option value="OCCUPIED">Occupied</option>
          <option value="RESERVED">Reserved</option>
          <option value="NEEDS_CLEANING">Need Cleaning</option>
          <option value="OUT_OF_ORDER">Out of Order</option>
        </select>
      </div>

      <!-- Section Filter -->
      <div>
        <select
          v-model="sectionFilter"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Sections</option>
          <option v-for="section in sections" :key="section.id" :value="section.id">
            {{ section.name }}
          </option>
        </select>
      </div>

      <!-- Search -->
      <div class="flex-1">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search tables..."
            class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>

    <!-- Table List -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <!-- Header -->
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  v-model="selectAll"
                  @change="handleSelectAll"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Table
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacity
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Section
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Order
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <!-- Body -->
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="table in filteredTables"
              :key="table.id"
              @click="$emit('select', table)"
              class="hover:bg-gray-50 cursor-pointer"
            >
              <!-- Checkbox -->
              <td class="px-6 py-4 whitespace-nowrap" @click.stop>
                <input
                  v-model="selectedTables"
                  :value="table.id"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </td>

              <!-- Table Number -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div :class="getTableColorClass(table.status)" class="w-10 h-10 rounded-lg flex items-center justify-center">
                      <span class="text-white font-bold text-sm">{{ table.number }}</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">Table {{ table.number }}</div>
                    <div v-if="table.name" class="text-sm text-gray-500">{{ table.name }}</div>
                  </div>
                </div>
              </td>

              <!-- Status -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadgeClass(table.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ getStatusLabel(table.status) }}
                </span>
              </td>

              <!-- Capacity -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="flex items-center">
                  <Users class="w-4 h-4 text-gray-400 mr-1" />
                  {{ table.capacity }}
                </div>
              </td>

              <!-- Section -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ getSectionName(table.section) }}
              </td>

              <!-- Current Order -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="table.currentOrder" class="text-sm">
                  <div class="font-medium text-gray-900">#{{ table.currentOrder.orderNumber }}</div>
                  <div class="text-gray-500">{{ table.currentOrder.customerName || 'Walk-in' }}</div>
                  <div class="text-green-600 font-medium">{{ formatPrice(table.currentOrder.total) }}</div>
                </div>
                <span v-else class="text-sm text-gray-400">-</span>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" @click.stop>
                <div class="flex items-center space-x-2">
                  <!-- Status Actions -->
                  <button
                    v-if="table.status === 'AVAILABLE'"
                    @click="$emit('assign-order', table)"
                    class="text-blue-600 hover:text-blue-900"
                    title="Assign Order"
                  >
                    <Utensils class="w-4 h-4" />
                  </button>

                  <button
                    v-if="table.status === 'OCCUPIED'"
                    @click="$emit('clear-table', table.id)"
                    class="text-red-600 hover:text-red-900"
                    title="Clear Table"
                  >
                    <LogOut class="w-4 h-4" />
                  </button>

                  <button
                    v-if="table.status === 'NEEDS_CLEANING'"
                    @click="$emit('status-change', table.id, 'AVAILABLE')"
                    class="text-green-600 hover:text-green-900"
                    title="Mark Clean"
                  >
                    <Check class="w-4 h-4" />
                  </button>

                  <!-- More Actions -->
                  <div class="relative" v-if="openDropdown === table.id">
                    <button
                      @click="openDropdown = openDropdown === table.id ? null : table.id"
                      class="text-gray-400 hover:text-gray-600"
                    >
                      <MoreHorizontal class="w-4 h-4" />
                    </button>
                    <div
                      v-if="openDropdown === table.id"
                      class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                      @click.stop
                    >
                      <button
                        v-for="action in getTableActions(table)"
                        :key="action.label"
                        @click="handleTableAction(table, action.action)"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <component :is="action.icon" class="w-4 h-4 mr-2" />
                        {{ action.label }}
                      </button>
                    </div>
                  </div>
                  <button
                    v-else
                    @click="openDropdown = table.id"
                    class="text-gray-400 hover:text-gray-600"
                  >
                    <MoreHorizontal class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="filteredTables.length === 0" class="text-center py-12">
        <Grid3X3 class="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No tables found</h3>
        <p class="text-gray-500">No tables match your current filters.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Search,
  Check,
  Broom,
  Users,
  Utensils,
  LogOut,
  MoreHorizontal,
  Grid3X3,
  Calendar,
  Wrench,
  Info
} from 'lucide-vue-next'

interface Table {
  id: string
  number: string
  name?: string
  capacity: number
  status: string
  section: string
  currentOrder?: {
    orderNumber: string
    customerName?: string
    total: number
  }
}

interface Section {
  id: string
  name: string
}

interface Props {
  tables: Table[]
  sections: Section[]
}

interface Emits {
  (e: 'select', table: Table): void
  (e: 'status-change', tableId: string, newStatus: string): void
  (e: 'assign-order', table: Table): void
  (e: 'clear-table', tableId: string): void
  (e: 'bulk-action', tableIds: string[], action: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const searchQuery = ref('')
const statusFilter = ref('')
const sectionFilter = ref('')
const selectedTables = ref<string[]>([])
const selectAll = ref(false)
const openDropdown = ref<string | null>(null)

// Computed
const filteredTables = computed(() => {
  let filtered = [...props.tables]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(table =>
      table.number.toLowerCase().includes(query) ||
      table.name?.toLowerCase().includes(query) ||
      table.currentOrder?.customerName?.toLowerCase().includes(query)
    )
  }

  // Apply status filter
  if (statusFilter.value) {
    filtered = filtered.filter(table => table.status === statusFilter.value)
  }

  // Apply section filter
  if (sectionFilter.value) {
    filtered = filtered.filter(table => table.section === sectionFilter.value)
  }

  return filtered
})

// Methods
const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(amount)
}

const getStatusLabel = (status: string): string => {
  const labels = {
    'AVAILABLE': 'Available',
    'OCCUPIED': 'Occupied',
    'RESERVED': 'Reserved',
    'NEEDS_CLEANING': 'Need Cleaning',
    'OUT_OF_ORDER': 'Out of Order'
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status: string): string => {
  const classes = {
    'AVAILABLE': 'bg-green-100 text-green-800',
    'OCCUPIED': 'bg-red-100 text-red-800',
    'RESERVED': 'bg-blue-100 text-blue-800',
    'NEEDS_CLEANING': 'bg-yellow-100 text-yellow-800',
    'OUT_OF_ORDER': 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getTableColorClass = (status: string): string => {
  const classes = {
    'AVAILABLE': 'bg-green-500',
    'OCCUPIED': 'bg-red-500',
    'RESERVED': 'bg-blue-500',
    'NEEDS_CLEANING': 'bg-yellow-500',
    'OUT_OF_ORDER': 'bg-gray-500'
  }
  return classes[status] || 'bg-gray-500'
}

const getSectionName = (sectionId: string): string => {
  const section = props.sections.find(s => s.id === sectionId)
  return section?.name || 'Unknown'
}

const getTableActions = (table: Table) => {
  const actions = []

  if (table.status === 'AVAILABLE') {
    actions.push(
      { label: 'Reserve Table', action: 'reserve', icon: Calendar },
      { label: 'Mark Out of Order', action: 'out-of-order', icon: Wrench }
    )
  }

  if (table.status === 'OCCUPIED') {
    actions.push(
      { label: 'View Order Details', action: 'view-order', icon: Info }
    )
  }

  if (table.status === 'RESERVED') {
    actions.push(
      { label: 'Seat Customers', action: 'seat', icon: Users },
      { label: 'Cancel Reservation', action: 'cancel-reservation', icon: MoreHorizontal }
    )
  }

  if (table.status === 'OUT_OF_ORDER') {
    actions.push(
      { label: 'Mark Available', action: 'available', icon: Check }
    )
  }

  return actions
}

const handleSelectAll = () => {
  if (selectAll.value) {
    selectedTables.value = filteredTables.value.map(table => table.id)
  } else {
    selectedTables.value = []
  }
}

const handleBulkAction = (action: string) => {
  emit('bulk-action', selectedTables.value, action)
  selectedTables.value = []
  selectAll.value = false
}

const handleTableAction = (table: Table, action: string) => {
  openDropdown.value = null

  switch (action) {
    case 'reserve':
      // Handle reservation
      break
    case 'out-of-order':
      emit('status-change', table.id, 'OUT_OF_ORDER')
      break
    case 'view-order':
      // Handle view order
      break
    case 'seat':
      emit('status-change', table.id, 'OCCUPIED')
      break
    case 'cancel-reservation':
      emit('status-change', table.id, 'AVAILABLE')
      break
    case 'available':
      emit('status-change', table.id, 'AVAILABLE')
      break
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', () => {
  openDropdown.value = null
})
</script>

<style scoped>
/* Custom styling for table hover effects */
tbody tr:hover .relative > div {
  @apply block;
}
</style>