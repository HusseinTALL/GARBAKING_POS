<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-900 text-gray-100">
    <!-- Header -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4 shadow-lg">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Time Clock
        </h1>
        <div class="text-3xl font-mono text-green-400">
          {{ currentTime }}
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <!-- Employee Selection -->
      <div class="max-w-2xl mx-auto mb-8">
        <label class="block text-sm font-medium text-gray-300 mb-2">Select Employee</label>
        <select
          v-model="selectedEmployeeId"
          @change="checkActiveTimeEntry"
          class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select Employee --</option>
          <option v-for="employee in employees" :key="employee.id" :value="employee.id">
            {{ employee.fullName }} ({{ employee.employeeNumber }})
          </option>
        </select>
      </div>

      <!-- Clock Status -->
      <div v-if="selectedEmployeeId" class="max-w-2xl mx-auto">
        <!-- Active Time Entry Card -->
        <div v-if="activeTimeEntry" class="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-8 mb-6 border border-green-500">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-2xl font-bold text-white mb-2">Currently Clocked In</h2>
              <p class="text-green-300">{{ selectedEmployee?.fullName }}</p>
            </div>
            <Clock class="w-16 h-16 text-green-400 animate-pulse" />
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-green-800 rounded-lg p-4">
              <p class="text-sm text-green-300 mb-1">Clock In Time</p>
              <p class="text-xl font-bold text-white">{{ formatTime(activeTimeEntry.clockInTime) }}</p>
            </div>
            <div class="bg-green-800 rounded-lg p-4">
              <p class="text-sm text-green-300 mb-1">Hours Worked</p>
              <p class="text-xl font-bold text-white">{{ activeTimeEntry.currentHours || '0.00' }} hrs</p>
            </div>
          </div>

          <div v-if="activeTimeEntry.location" class="mb-4">
            <p class="text-sm text-green-300">Location: {{ activeTimeEntry.location }}</p>
          </div>

          <!-- Clock Out Form -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-white mb-2">Break Minutes</label>
              <input
                v-model.number="clockOutForm.breakMinutes"
                type="number"
                min="0"
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-white mb-2">Notes (optional)</label>
              <textarea
                v-model="clockOutForm.notes"
                rows="2"
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              ></textarea>
            </div>
            <button
              @click="clockOut"
              :disabled="isProcessing"
              class="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
            >
              <LogOut class="w-6 h-6" />
              Clock Out
            </button>
          </div>
        </div>

        <!-- Clock In Card -->
        <div v-else class="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-8 border border-blue-500">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-2xl font-bold text-white mb-2">Ready to Clock In</h2>
              <p class="text-blue-300">{{ selectedEmployee?.fullName }}</p>
            </div>
            <LogIn class="w-16 h-16 text-blue-400" />
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-white mb-2">Location (optional)</label>
              <input
                v-model="clockInForm.location"
                type="text"
                placeholder="e.g., Main Store, Kitchen"
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-white mb-2">Notes (optional)</label>
              <textarea
                v-model="clockInForm.notes"
                rows="2"
                placeholder="Any notes for this shift..."
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            <button
              @click="clockIn"
              :disabled="isProcessing"
              class="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
            >
              <LogIn class="w-6 h-6" />
              Clock In
            </button>
          </div>
        </div>
      </div>

      <!-- Who's Working Now -->
      <div class="max-w-4xl mx-auto mt-8">
        <div class="bg-gray-800 rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-white flex items-center gap-2">
              <Users class="w-5 h-5 text-blue-400" />
              Who's Working Now
            </h3>
            <span class="px-3 py-1 bg-green-600 text-green-200 rounded-full font-bold">
              {{ whosWorking?.totalClockedIn || 0 }} employees
            </span>
          </div>

          <div v-if="whosWorking && whosWorking.activeEmployees && whosWorking.activeEmployees.length > 0" class="space-y-3">
            <div
              v-for="emp in whosWorking.activeEmployees"
              :key="emp.employeeId"
              class="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <p class="text-white font-medium">{{ emp.employeeName }}</p>
                <p class="text-sm text-gray-400">{{ emp.positionTitle }} • {{ emp.departmentName }}</p>
                <p class="text-xs text-gray-500 mt-1">Clocked in: {{ formatTime(emp.clockInTime) }}</p>
              </div>
              <div class="text-right">
                <p class="text-green-400 font-bold">{{ emp.currentHours || '0.00' }} hrs</p>
                <p v-if="emp.location" class="text-xs text-gray-400">{{ emp.location }}</p>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8">
            <Users class="w-12 h-12 mx-auto text-gray-600 mb-3" />
            <p class="text-gray-400">No employees currently clocked in</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Clock, LogIn, LogOut, Users } from 'lucide-vue-next'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

// State
const employees = ref<any[]>([])
const selectedEmployeeId = ref('')
const activeTimeEntry = ref<any>(null)
const whosWorking = ref<any>(null)
const isProcessing = ref(false)
const currentTime = ref('')

const clockInForm = ref({
  location: '',
  notes: ''
})

const clockOutForm = ref({
  breakMinutes: 0,
  notes: ''
})

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080'

// Computed
const selectedEmployee = computed(() => {
  return employees.value.find(e => e.id === Number(selectedEmployeeId.value))
})

// Methods
const updateCurrentTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
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

const checkActiveTimeEntry = async () => {
  if (!selectedEmployeeId.value) {
    activeTimeEntry.value = null
    return
  }

  try {
    const response = await axios.get(
      `${API_GATEWAY_URL}/api/employees/time-entries/active/${selectedEmployeeId.value}`
    )
    activeTimeEntry.value = response.data
  } catch (error: any) {
    if (error.response?.status === 204) {
      activeTimeEntry.value = null
    } else {
      console.error('Failed to check active time entry:', error)
    }
  }
}

const clockIn = async () => {
  if (!selectedEmployeeId.value) {
    toast.error('Please select an employee')
    return
  }

  isProcessing.value = true
  try {
    const response = await axios.post(`${API_GATEWAY_URL}/api/employees/time-entries/clock-in`, {
      employeeId: Number(selectedEmployeeId.value),
      location: clockInForm.value.location || null,
      notes: clockInForm.value.notes || null
    })

    activeTimeEntry.value = response.data
    toast.success('Clocked in successfully!')

    // Reset form
    clockInForm.value = {
      location: '',
      notes: ''
    }

    // Refresh who's working
    loadWhosWorking()
  } catch (error: any) {
    console.error('Failed to clock in:', error)
    toast.error(error.response?.data?.message || 'Failed to clock in')
  } finally {
    isProcessing.value = false
  }
}

const clockOut = async () => {
  if (!activeTimeEntry.value) {
    toast.error('No active time entry found')
    return
  }

  isProcessing.value = true
  try {
    const response = await axios.post(`${API_GATEWAY_URL}/api/employees/time-entries/clock-out`, {
      employeeId: Number(selectedEmployeeId.value),
      breakMinutes: clockOutForm.value.breakMinutes || 0,
      notes: clockOutForm.value.notes || null
    })

    toast.success(`Clocked out successfully! Total hours: ${response.data.totalHours}`)
    activeTimeEntry.value = null

    // Reset form
    clockOutForm.value = {
      breakMinutes: 0,
      notes: ''
    }

    // Refresh who's working
    loadWhosWorking()
  } catch (error: any) {
    console.error('Failed to clock out:', error)
    toast.error(error.response?.data?.message || 'Failed to clock out')
  } finally {
    isProcessing.value = false
  }
}

const loadWhosWorking = async () => {
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/employees/time-entries/whos-working`)
    whosWorking.value = response.data
  } catch (error: any) {
    console.error('Failed to load who\'s working:', error)
  }
}

const formatTime = (dateTime: string) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
let timeInterval: any = null
let refreshInterval: any = null

onMounted(() => {
  loadEmployees()
  loadWhosWorking()
  updateCurrentTime()

  // Update time every second
  timeInterval = setInterval(updateCurrentTime, 1000)

  // Refresh who's working every 30 seconds
  refreshInterval = setInterval(() => {
    loadWhosWorking()
    if (selectedEmployeeId.value && activeTimeEntry.value) {
      checkActiveTimeEntry()
    }
  }, 30000)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
  if (refreshInterval) clearInterval(refreshInterval)
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
