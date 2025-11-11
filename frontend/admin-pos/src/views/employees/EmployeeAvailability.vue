<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-900 text-gray-100">
    <!-- Header -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4 shadow-lg">
      <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
        Employee Availability
      </h1>
    </div>

    <!-- Employee Selection -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div class="max-w-md">
        <label class="block text-sm font-medium text-gray-300 mb-2">Select Employee</label>
        <select
          v-model="selectedEmployeeId"
          @change="loadEmployeeAvailability"
          class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select Employee --</option>
          <option v-for="emp in employees" :key="emp.id" :value="emp.id">
            {{ emp.fullName }} ({{ emp.employeeNumber }})
          </option>
        </select>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <div v-if="selectedEmployeeId" class="max-w-4xl mx-auto">
        <!-- Employee Info -->
        <div class="bg-gray-800 rounded-lg p-6 mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold text-white mb-1">
                {{ selectedEmployee?.fullName }}
              </h2>
              <p class="text-gray-400">{{ selectedEmployee?.positionTitle }} • {{ selectedEmployee?.departmentName }}</p>
            </div>
            <button
              @click="clearAllAvailability"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        <!-- Availability Grid -->
        <div class="bg-gray-800 rounded-lg p-6">
          <h3 class="text-lg font-bold text-white mb-4">Weekly Availability</h3>

          <div class="space-y-4">
            <div
              v-for="day in daysOfWeek"
              :key="day.value"
              class="bg-gray-700 rounded-lg p-4"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <Calendar class="w-5 h-5 text-blue-400" />
                  <span class="text-lg font-semibold text-white">{{ day.label }}</span>
                </div>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="getAvailabilityForDay(day.value)?.isAvailable ?? true"
                    @change="(e: any) => toggleAvailability(day.value, e.target.checked)"
                    class="w-5 h-5 rounded bg-gray-600 border-gray-500 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span class="text-sm text-gray-300">Available</span>
                </label>
              </div>

              <div
                v-if="getAvailabilityForDay(day.value)?.isAvailable ?? true"
                class="grid grid-cols-3 gap-4 pl-8"
              >
                <div>
                  <label class="block text-xs text-gray-400 mb-1">Start Time</label>
                  <input
                    :value="getAvailabilityForDay(day.value)?.startTime || '09:00'"
                    @change="(e: any) => updateAvailabilityTime(day.value, 'startTime', e.target.value)"
                    type="time"
                    class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-400 mb-1">End Time</label>
                  <input
                    :value="getAvailabilityForDay(day.value)?.endTime || '17:00'"
                    @change="(e: any) => updateAvailabilityTime(day.value, 'endTime', e.target.value)"
                    type="time"
                    class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div class="flex items-end">
                  <button
                    @click="setAllDayAvailability(day.value)"
                    class="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                  >
                    All Day
                  </button>
                </div>
              </div>

              <div v-else class="pl-8">
                <p class="text-sm text-red-400">Not available on this day</p>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button
              @click="loadEmployeeAvailability"
              class="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              Reset
            </button>
            <button
              @click="saveAllAvailability"
              :disabled="isSaving"
              class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save class="w-4 h-4" />
              Save Availability
            </button>
          </div>
        </div>

        <!-- Quick Templates -->
        <div class="bg-gray-800 rounded-lg p-6 mt-6">
          <h3 class="text-lg font-bold text-white mb-4">Quick Templates</h3>
          <div class="grid grid-cols-3 gap-4">
            <button
              @click="applyWeekdaysOnly"
              class="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <div class="font-semibold">Weekdays Only</div>
              <div class="text-xs text-gray-400 mt-1">Mon-Fri, 9 AM - 5 PM</div>
            </button>
            <button
              @click="applyWeekendsOnly"
              class="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <div class="font-semibold">Weekends Only</div>
              <div class="text-xs text-gray-400 mt-1">Sat-Sun, All Day</div>
            </button>
            <button
              @click="applyFullTime"
              class="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <div class="font-semibold">Full Time</div>
              <div class="text-xs text-gray-400 mt-1">7 Days, 9 AM - 5 PM</div>
            </button>
          </div>
        </div>

        <!-- Current Availability Summary -->
        <div class="bg-gray-800 rounded-lg p-6 mt-6">
          <h3 class="text-lg font-bold text-white mb-4">Availability Summary</h3>
          <div class="grid grid-cols-7 gap-2">
            <div
              v-for="day in daysOfWeek"
              :key="day.value"
              class="text-center p-3 rounded-lg"
              :class="getAvailabilityForDay(day.value)?.isAvailable ?? true ? 'bg-green-900 border border-green-600' : 'bg-red-900 border border-red-600'"
            >
              <div class="text-xs font-semibold text-white mb-1">{{ day.short }}</div>
              <div v-if="getAvailabilityForDay(day.value)?.isAvailable ?? true" class="text-xs text-gray-300">
                {{ getAvailabilityForDay(day.value)?.startTime || 'All' }} -
                {{ getAvailabilityForDay(day.value)?.endTime || 'Day' }}
              </div>
              <div v-else class="text-xs text-red-400">Off</div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col items-center justify-center h-full">
        <UserCheck class="w-24 h-24 text-gray-600 mb-4" />
        <p class="text-xl text-gray-400">Select an employee to manage availability</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Calendar, Save, UserCheck } from 'lucide-vue-next'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

// State
const employees = ref<any[]>([])
const selectedEmployeeId = ref('')
const availability = ref<any[]>([])
const isSaving = ref(false)

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080'

const daysOfWeek = [
  { value: 'MONDAY', label: 'Monday', short: 'Mon' },
  { value: 'TUESDAY', label: 'Tuesday', short: 'Tue' },
  { value: 'WEDNESDAY', label: 'Wednesday', short: 'Wed' },
  { value: 'THURSDAY', label: 'Thursday', short: 'Thu' },
  { value: 'FRIDAY', label: 'Friday', short: 'Fri' },
  { value: 'SATURDAY', label: 'Saturday', short: 'Sat' },
  { value: 'SUNDAY', label: 'Sunday', short: 'Sun' }
]

// Computed
const selectedEmployee = computed(() => {
  return employees.value.find(e => e.id === Number(selectedEmployeeId.value))
})

// Methods
const loadEmployees = async () => {
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/employees?activeOnly=true`)
    employees.value = response.data
  } catch (error: any) {
    console.error('Failed to load employees:', error)
    toast.error('Failed to load employees')
  }
}

const loadEmployeeAvailability = async () => {
  if (!selectedEmployeeId.value) {
    availability.value = []
    return
  }

  try {
    const response = await axios.get(
      `${API_GATEWAY_URL}/api/employees/availability/employee/${selectedEmployeeId.value}`
    )
    availability.value = response.data
  } catch (error: any) {
    console.error('Failed to load availability:', error)
    availability.value = []
  }
}

const getAvailabilityForDay = (dayOfWeek: string) => {
  return availability.value.find(a => a.dayOfWeek === dayOfWeek)
}

const toggleAvailability = (dayOfWeek: string, isAvailable: boolean) => {
  const existing = getAvailabilityForDay(dayOfWeek)

  if (existing) {
    existing.isAvailable = isAvailable
  } else {
    availability.value.push({
      dayOfWeek,
      isAvailable,
      startTime: '09:00',
      endTime: '17:00'
    })
  }
}

const updateAvailabilityTime = (dayOfWeek: string, field: 'startTime' | 'endTime', value: string) => {
  const existing = getAvailabilityForDay(dayOfWeek)

  if (existing) {
    existing[field] = value
  } else {
    availability.value.push({
      dayOfWeek,
      isAvailable: true,
      startTime: field === 'startTime' ? value : '09:00',
      endTime: field === 'endTime' ? value : '17:00'
    })
  }
}

const setAllDayAvailability = (dayOfWeek: string) => {
  const existing = getAvailabilityForDay(dayOfWeek)

  if (existing) {
    existing.startTime = null
    existing.endTime = null
  } else {
    availability.value.push({
      dayOfWeek,
      isAvailable: true,
      startTime: null,
      endTime: null
    })
  }
}

const saveAllAvailability = async () => {
  if (!selectedEmployeeId.value) {
    toast.error('Please select an employee')
    return
  }

  isSaving.value = true
  try {
    // Save each day's availability
    for (const day of daysOfWeek) {
      const dayAvailability = getAvailabilityForDay(day.value)

      const payload = {
        employeeId: Number(selectedEmployeeId.value),
        dayOfWeek: day.value,
        isAvailable: dayAvailability?.isAvailable ?? true,
        startTime: dayAvailability?.startTime || null,
        endTime: dayAvailability?.endTime || null,
        notes: null
      }

      await axios.post(`${API_GATEWAY_URL}/api/employees/availability`, payload)
    }

    toast.success('Availability saved successfully!')
    loadEmployeeAvailability()
  } catch (error: any) {
    console.error('Failed to save availability:', error)
    toast.error(error.response?.data?.message || 'Failed to save availability')
  } finally {
    isSaving.value = false
  }
}

const clearAllAvailability = async () => {
  if (!selectedEmployeeId.value) return

  if (!confirm('Are you sure you want to clear all availability for this employee?')) {
    return
  }

  try {
    await axios.delete(
      `${API_GATEWAY_URL}/api/employees/availability/employee/${selectedEmployeeId.value}/clear`
    )
    toast.success('Availability cleared successfully!')
    availability.value = []
  } catch (error: any) {
    console.error('Failed to clear availability:', error)
    toast.error('Failed to clear availability')
  }
}

const applyWeekdaysOnly = () => {
  availability.value = []

  const weekdays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
  const weekend = ['SATURDAY', 'SUNDAY']

  weekdays.forEach(day => {
    availability.value.push({
      dayOfWeek: day,
      isAvailable: true,
      startTime: '09:00',
      endTime: '17:00'
    })
  })

  weekend.forEach(day => {
    availability.value.push({
      dayOfWeek: day,
      isAvailable: false,
      startTime: null,
      endTime: null
    })
  })

  toast.info('Applied weekdays template')
}

const applyWeekendsOnly = () => {
  availability.value = []

  const weekdays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
  const weekend = ['SATURDAY', 'SUNDAY']

  weekdays.forEach(day => {
    availability.value.push({
      dayOfWeek: day,
      isAvailable: false,
      startTime: null,
      endTime: null
    })
  })

  weekend.forEach(day => {
    availability.value.push({
      dayOfWeek: day,
      isAvailable: true,
      startTime: null,
      endTime: null
    })
  })

  toast.info('Applied weekends template')
}

const applyFullTime = () => {
  availability.value = []

  daysOfWeek.forEach(day => {
    availability.value.push({
      dayOfWeek: day.value,
      isAvailable: true,
      startTime: '09:00',
      endTime: '17:00'
    })
  })

  toast.info('Applied full-time template')
}

// Lifecycle
onMounted(() => {
  loadEmployees()
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
