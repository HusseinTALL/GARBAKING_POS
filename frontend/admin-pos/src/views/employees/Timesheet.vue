<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-900 text-gray-100">
    <!-- Header -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4 shadow-lg">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Timesheets
        </h1>
        <button
          @click="loadTimeEntries"
          :disabled="isLoading"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <RotateCw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Employee</label>
          <select
            v-model="filterEmployeeId"
            @change="loadTimeEntries"
            class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Employees</option>
            <option v-for="employee in employees" :key="employee.id" :value="employee.id">
              {{ employee.fullName }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
          <input
            v-model="filterStartDate"
            @change="loadTimeEntries"
            type="date"
            class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">End Date</label>
          <input
            v-model="filterEndDate"
            @change="loadTimeEntries"
            type="date"
            class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="flex items-end">
          <button
            @click="setCurrentWeek"
            class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors w-full"
          >
            Current Week
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <!-- Summary Cards -->
      <div v-if="timeEntries.length > 0" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6 border border-blue-500">
          <p class="text-blue-400 text-sm font-medium mb-1">Total Entries</p>
          <p class="text-3xl font-bold text-blue-400">{{ timeEntries.length }}</p>
        </div>

        <div class="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-6 border border-green-500">
          <p class="text-green-400 text-sm font-medium mb-1">Total Hours</p>
          <p class="text-3xl font-bold text-green-400">{{ totalHours.toFixed(2) }}</p>
        </div>

        <div class="bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-lg p-6 border border-yellow-500">
          <p class="text-yellow-400 text-sm font-medium mb-1">Overtime Hours</p>
          <p class="text-3xl font-bold text-yellow-400">{{ totalOvertimeHours.toFixed(2) }}</p>
        </div>

        <div class="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-6 border border-purple-500">
          <p class="text-purple-400 text-sm font-medium mb-1">Pending Approval</p>
          <p class="text-3xl font-bold text-purple-400">{{ pendingEntries }}</p>
        </div>
      </div>

      <!-- Time Entries Table -->
      <div v-if="isLoading" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <div v-else-if="timeEntries.length > 0" class="bg-gray-800 rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Employee
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Clock In
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Clock Out
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Break (min)
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Total Hours
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Overtime
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700">
              <tr v-for="entry in timeEntries" :key="entry.id" class="hover:bg-gray-750">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p class="text-white font-medium">{{ entry.employeeName }}</p>
                    <p class="text-sm text-gray-400">{{ entry.employeeNumber }}</p>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <p class="text-white">{{ formatDateTime(entry.clockInTime) }}</p>
                  <p v-if="entry.location" class="text-xs text-gray-400">{{ entry.location }}</p>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <p v-if="entry.clockOutTime" class="text-white">{{ formatDateTime(entry.clockOutTime) }}</p>
                  <span v-else class="px-2 py-1 text-xs rounded-full bg-green-600 text-green-200">
                    Active
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-white">
                  {{ entry.breakMinutes || 0 }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span v-if="entry.totalHours" class="text-white font-bold">
                    {{ entry.totalHours }} hrs
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span v-if="entry.overtimeHours && entry.overtimeHours > 0" class="text-yellow-400 font-bold">
                    {{ entry.overtimeHours }} hrs
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusColor(entry.status)" class="px-2 py-1 text-xs rounded-full">
                    {{ formatStatus(entry.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <button
                    v-if="entry.status === 'COMPLETED' || entry.status === 'PENDING_APPROVAL'"
                    @click="approveEntry(entry)"
                    class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors mr-2"
                  >
                    Approve
                  </button>
                  <button
                    @click="viewDetails(entry)"
                    class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                  >
                    Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center h-64">
        <Clock class="w-16 h-16 text-gray-600 mb-4" />
        <p class="text-xl text-gray-400 mb-2">No time entries found</p>
        <p class="text-sm text-gray-500">Adjust filters or select a different date range</p>
      </div>

      <!-- Details Modal -->
      <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-gray-800 rounded-lg max-w-2xl w-full">
          <div class="border-b border-gray-700 px-6 py-4 flex items-center justify-between">
            <h2 class="text-xl font-bold text-white">Time Entry Details</h2>
            <button @click="closeDetailsModal" class="text-gray-400 hover:text-white">
              <X class="w-6 h-6" />
            </button>
          </div>

          <div v-if="selectedEntry" class="p-6">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <p class="text-sm text-gray-400 mb-1">Employee</p>
                <p class="text-white font-medium">{{ selectedEntry.employeeName }}</p>
                <p class="text-sm text-gray-400">{{ selectedEntry.employeeNumber }}</p>
              </div>

              <div>
                <p class="text-sm text-gray-400 mb-1">Status</p>
                <span :class="getStatusColor(selectedEntry.status)" class="px-2 py-1 text-xs rounded-full">
                  {{ formatStatus(selectedEntry.status) }}
                </span>
              </div>

              <div>
                <p class="text-sm text-gray-400 mb-1">Clock In</p>
                <p class="text-white">{{ formatDateTime(selectedEntry.clockInTime) }}</p>
              </div>

              <div>
                <p class="text-sm text-gray-400 mb-1">Clock Out</p>
                <p class="text-white">{{ selectedEntry.clockOutTime ? formatDateTime(selectedEntry.clockOutTime) : 'Still Active' }}</p>
              </div>

              <div>
                <p class="text-sm text-gray-400 mb-1">Break Minutes</p>
                <p class="text-white">{{ selectedEntry.breakMinutes || 0 }} minutes</p>
              </div>

              <div>
                <p class="text-sm text-gray-400 mb-1">Total Hours</p>
                <p class="text-white font-bold">{{ selectedEntry.totalHours || '0.00' }} hrs</p>
              </div>

              <div>
                <p class="text-sm text-gray-400 mb-1">Overtime Hours</p>
                <p class="text-yellow-400 font-bold">{{ selectedEntry.overtimeHours || '0.00' }} hrs</p>
              </div>

              <div v-if="selectedEntry.location">
                <p class="text-sm text-gray-400 mb-1">Location</p>
                <p class="text-white">{{ selectedEntry.location }}</p>
              </div>

              <div v-if="selectedEntry.notes" class="col-span-2">
                <p class="text-sm text-gray-400 mb-1">Notes</p>
                <p class="text-white">{{ selectedEntry.notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RotateCw, Clock, X } from 'lucide-vue-next'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

// State
const employees = ref<any[]>([])
const timeEntries = ref<any[]>([])
const isLoading = ref(false)
const showDetailsModal = ref(false)
const selectedEntry = ref<any>(null)

const filterEmployeeId = ref('')
const filterStartDate = ref('')
const filterEndDate = ref('')

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080'

// Computed
const totalHours = computed(() => {
  return timeEntries.value.reduce((sum, entry) => {
    return sum + (parseFloat(entry.totalHours) || 0)
  }, 0)
})

const totalOvertimeHours = computed(() => {
  return timeEntries.value.reduce((sum, entry) => {
    return sum + (parseFloat(entry.overtimeHours) || 0)
  }, 0)
})

const pendingEntries = computed(() => {
  return timeEntries.value.filter(e =>
    e.status === 'PENDING_APPROVAL' || e.status === 'COMPLETED'
  ).length
})

// Methods
const setCurrentWeek = () => {
  const today = new Date()
  const firstDay = new Date(today.setDate(today.getDate() - today.getDay()))
  const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 6))

  filterStartDate.value = firstDay.toISOString().split('T')[0]
  filterEndDate.value = lastDay.toISOString().split('T')[0]

  loadTimeEntries()
}

const loadEmployees = async () => {
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/employees?activeOnly=true`)
    employees.value = response.data
  } catch (error: any) {
    console.error('Failed to load employees:', error)
    toast.error('Failed to load employees')
  }
}

const loadTimeEntries = async () => {
  if (!filterStartDate.value || !filterEndDate.value) {
    return
  }

  isLoading.value = true
  try {
    const startDateTime = `${filterStartDate.value}T00:00:00`
    const endDateTime = `${filterEndDate.value}T23:59:59`

    let url = `${API_GATEWAY_URL}/api/employees/time-entries`

    if (filterEmployeeId.value) {
      url = `${API_GATEWAY_URL}/api/employees/time-entries/employee/${filterEmployeeId.value}`
    }

    const response = await axios.get(url, {
      params: {
        startDate: startDateTime,
        endDate: endDateTime
      }
    })

    timeEntries.value = response.data
  } catch (error: any) {
    console.error('Failed to load time entries:', error)
    toast.error('Failed to load time entries')
  } finally {
    isLoading.value = false
  }
}

const approveEntry = async (entry: any) => {
  if (confirm(`Approve time entry for ${entry.employeeName}?`)) {
    try {
      await axios.post(
        `${API_GATEWAY_URL}/api/employees/time-entries/${entry.id}/approve`,
        null,
        { params: { approverId: 1 } } // TODO: Use actual logged-in manager ID
      )
      toast.success('Time entry approved')
      loadTimeEntries()
    } catch (error: any) {
      console.error('Failed to approve entry:', error)
      toast.error('Failed to approve time entry')
    }
  }
}

const viewDetails = (entry: any) => {
  selectedEntry.value = entry
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedEntry.value = null
}

const getStatusColor = (status: string) => {
  const colors: any = {
    ACTIVE: 'bg-green-600 text-green-200',
    COMPLETED: 'bg-blue-600 text-blue-200',
    PENDING_APPROVAL: 'bg-yellow-600 text-yellow-200',
    APPROVED: 'bg-green-700 text-green-200',
    DISPUTED: 'bg-red-600 text-red-200',
    REJECTED: 'bg-red-700 text-red-200'
  }
  return colors[status] || 'bg-gray-600 text-gray-200'
}

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ')
}

const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  loadEmployees()
  setCurrentWeek()
})
</script>

<style scoped>
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
