<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-900 text-gray-100">
    <!-- Header -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4 shadow-lg">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Schedule Calendar
        </h1>
        <button
          @click="showCreateShiftModal = true"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus class="w-4 h-4" />
          Create Shift
        </button>
      </div>
    </div>

    <!-- Date Navigation & Filters -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-4">
          <button
            @click="previousWeek"
            class="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <ChevronLeft class="w-5 h-5" />
          </button>
          <button
            @click="goToToday"
            class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            @click="nextWeek"
            class="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <ChevronRight class="w-5 h-5" />
          </button>
          <span class="text-lg font-semibold text-white">
            {{ formatWeekRange(currentStartDate) }}
          </span>
        </div>

        <div class="flex items-center gap-2">
          <select
            v-model="viewMode"
            class="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Week View</option>
            <option value="day">Day View</option>
          </select>
        </div>
      </div>

      <!-- Summary Stats -->
      <div v-if="schedule" class="grid grid-cols-4 gap-4">
        <div class="bg-gray-700 rounded-lg p-3">
          <p class="text-sm text-gray-400">Total Shifts</p>
          <p class="text-2xl font-bold text-white">{{ schedule.totalShifts }}</p>
        </div>
        <div class="bg-gray-700 rounded-lg p-3">
          <p class="text-sm text-gray-400">Total Employees</p>
          <p class="text-2xl font-bold text-white">{{ schedule.totalEmployees }}</p>
        </div>
        <div class="bg-gray-700 rounded-lg p-3">
          <p class="text-sm text-gray-400">Scheduled Hours</p>
          <p class="text-2xl font-bold text-white">{{ schedule.totalScheduledHours?.toFixed(1) || 0 }}</p>
        </div>
        <div class="bg-gray-700 rounded-lg p-3">
          <p class="text-sm text-gray-400">Unassigned Shifts</p>
          <p class="text-2xl font-bold text-yellow-400">{{ schedule.unassignedShifts?.length || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="flex-1 overflow-auto p-6">
      <div v-if="viewMode === 'week'" class="min-w-max">
        <!-- Week Headers -->
        <div class="grid grid-cols-8 gap-2 mb-2">
          <div class="text-center font-semibold text-gray-400 text-sm">Time</div>
          <div
            v-for="date in weekDates"
            :key="date.toString()"
            class="text-center p-3 bg-gray-800 rounded-lg"
            :class="{ 'bg-blue-900': isToday(date) }"
          >
            <div class="font-semibold text-white">{{ formatDayName(date) }}</div>
            <div class="text-sm text-gray-400">{{ formatDate(date) }}</div>
            <div v-if="schedule?.staffingByDate" class="text-xs text-green-400 mt-1">
              {{ schedule.staffingByDate[formatDateKey(date)] || 0 }} staff
            </div>
          </div>
        </div>

        <!-- Shifts by Day -->
        <div class="grid grid-cols-8 gap-2">
          <div class="flex flex-col gap-1">
            <div
              v-for="hour in displayHours"
              :key="hour"
              class="h-16 text-xs text-gray-500 text-right pr-2 pt-1"
            >
              {{ formatHour(hour) }}
            </div>
          </div>
          <div
            v-for="date in weekDates"
            :key="date.toString()"
            class="relative"
          >
            <div class="absolute inset-0 flex flex-col">
              <!-- Time Grid Lines -->
              <div
                v-for="hour in displayHours"
                :key="hour"
                class="h-16 border-t border-gray-700"
              ></div>

              <!-- Shifts for this day -->
              <div
                v-for="shift in getShiftsForDate(date)"
                :key="shift.id"
                class="absolute left-0 right-0 mx-1 cursor-pointer hover:opacity-80 transition-opacity"
                :style="getShiftStyle(shift)"
                @click="viewShiftDetails(shift)"
              >
                <div
                  class="h-full rounded p-2 text-xs overflow-hidden"
                  :class="getShiftColorClass(shift)"
                >
                  <div class="font-semibold truncate">{{ shift.employeeName || 'Unassigned' }}</div>
                  <div class="text-xs opacity-90">{{ shift.positionTitle }}</div>
                  <div class="text-xs">
                    {{ formatTime(shift.startTime) }} - {{ formatTime(shift.endTime) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Day View -->
      <div v-else-if="viewMode === 'day'" class="max-w-4xl mx-auto">
        <div class="space-y-2">
          <div
            v-for="shift in getTodayShifts()"
            :key="shift.id"
            class="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 cursor-pointer transition-colors"
            @click="viewShiftDetails(shift)"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3">
                  <Clock class="w-5 h-5 text-blue-400" />
                  <div>
                    <p class="font-semibold text-white">
                      {{ shift.employeeName || 'Unassigned' }}
                    </p>
                    <p class="text-sm text-gray-400">{{ shift.positionTitle }}</p>
                  </div>
                </div>
              </div>
              <div class="text-right">
                <p class="text-white font-semibold">
                  {{ formatTime(shift.startTime) }} - {{ formatTime(shift.endTime) }}
                </p>
                <p class="text-sm text-gray-400">{{ shift.shiftHours?.toFixed(1) }} hours</p>
                <span
                  class="inline-block px-2 py-1 rounded text-xs font-semibold mt-1"
                  :class="getStatusClass(shift.status)"
                >
                  {{ shift.status }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="getTodayShifts().length === 0" class="text-center py-12">
            <Calendar class="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p class="text-gray-400">No shifts scheduled for this day</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Shift Modal -->
    <div
      v-if="showCreateShiftModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showCreateShiftModal = false"
    >
      <div class="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-white">Create Shift</h2>
          <button
            @click="showCreateShiftModal = false"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="createShift" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Employee</label>
              <select
                v-model="shiftForm.employeeId"
                required
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Employee</option>
                <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                  {{ emp.fullName }} ({{ emp.employeeNumber }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Position</label>
              <select
                v-model="shiftForm.positionId"
                required
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Position</option>
                <option v-for="pos in positions" :key="pos.id" :value="pos.id">
                  {{ pos.title }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Shift Date</label>
              <input
                v-model="shiftForm.shiftDate"
                type="date"
                required
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Location</label>
              <input
                v-model="shiftForm.location"
                type="text"
                placeholder="e.g., Main Store"
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
              <input
                v-model="shiftForm.startTime"
                type="time"
                required
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">End Time</label>
              <input
                v-model="shiftForm.endTime"
                type="time"
                required
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Break Minutes</label>
              <input
                v-model.number="shiftForm.breakMinutes"
                type="number"
                min="0"
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Notes</label>
            <textarea
              v-model="shiftForm.notes"
              rows="2"
              class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              @click="showCreateShiftModal = false"
              class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Create Shift
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Shift Details Modal -->
    <div
      v-if="selectedShift"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="selectedShift = null"
    >
      <div class="bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-white">Shift Details</h2>
          <button
            @click="selectedShift = null"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-400">Employee</p>
              <p class="text-white font-semibold">{{ selectedShift.employeeName || 'Unassigned' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-400">Position</p>
              <p class="text-white font-semibold">{{ selectedShift.positionTitle }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-400">Date</p>
              <p class="text-white font-semibold">{{ formatFullDate(selectedShift.shiftDate) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-400">Time</p>
              <p class="text-white font-semibold">
                {{ formatTime(selectedShift.startTime) }} - {{ formatTime(selectedShift.endTime) }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-400">Hours</p>
              <p class="text-white font-semibold">{{ selectedShift.shiftHours?.toFixed(2) }} hours</p>
            </div>
            <div>
              <p class="text-sm text-gray-400">Break Minutes</p>
              <p class="text-white font-semibold">{{ selectedShift.breakMinutes }} minutes</p>
            </div>
            <div>
              <p class="text-sm text-gray-400">Status</p>
              <span
                class="inline-block px-3 py-1 rounded text-sm font-semibold"
                :class="getStatusClass(selectedShift.status)"
              >
                {{ selectedShift.status }}
              </span>
            </div>
            <div v-if="selectedShift.location">
              <p class="text-sm text-gray-400">Location</p>
              <p class="text-white font-semibold">{{ selectedShift.location }}</p>
            </div>
          </div>

          <div v-if="selectedShift.notes">
            <p class="text-sm text-gray-400">Notes</p>
            <p class="text-white">{{ selectedShift.notes }}</p>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              v-if="selectedShift.status === 'SCHEDULED'"
              @click="cancelShift(selectedShift.id)"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Cancel Shift
            </button>
            <button
              @click="selectedShift = null"
              class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors ml-auto"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, ChevronLeft, ChevronRight, Clock, Calendar, X } from 'lucide-vue-next'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

// State
const schedule = ref<any>(null)
const employees = ref<any[]>([])
const positions = ref<any[]>([])
const currentStartDate = ref(getStartOfWeek(new Date()))
const viewMode = ref<'week' | 'day'>('week')
const showCreateShiftModal = ref(false)
const selectedShift = ref<any>(null)
const isSubmitting = ref(false)

const shiftForm = ref({
  employeeId: '',
  positionId: '',
  shiftDate: '',
  startTime: '09:00',
  endTime: '17:00',
  breakMinutes: 30,
  location: '',
  notes: ''
})

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080'

const displayHours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]

// Computed
const weekDates = computed(() => {
  const dates = []
  const start = new Date(currentStartDate.value)
  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    dates.push(date)
  }
  return dates
})

// Methods
function getStartOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.setDate(diff))
}

function previousWeek() {
  const newDate = new Date(currentStartDate.value)
  newDate.setDate(newDate.getDate() - 7)
  currentStartDate.value = newDate
  loadSchedule()
}

function nextWeek() {
  const newDate = new Date(currentStartDate.value)
  newDate.setDate(newDate.getDate() + 7)
  currentStartDate.value = newDate
  loadSchedule()
}

function goToToday() {
  currentStartDate.value = getStartOfWeek(new Date())
  loadSchedule()
}

function formatWeekRange(startDate: Date): string {
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)

  const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return `${startStr} - ${endStr}`
}

function formatDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
}

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatTime(time: string): string {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

function formatHour(hour: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour} ${ampm}`
}

function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

function getShiftsForDate(date: Date): any[] {
  if (!schedule.value?.shiftsByDate) return []
  const dateKey = formatDateKey(date)
  return schedule.value.shiftsByDate[dateKey] || []
}

function getTodayShifts(): any[] {
  return getShiftsForDate(currentStartDate.value)
}

function getShiftStyle(shift: any): any {
  if (!shift.startTime || !shift.endTime) return {}

  const [startHour, startMin] = shift.startTime.split(':').map(Number)
  const [endHour, endMin] = shift.endTime.split(':').map(Number)

  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  const duration = endMinutes - startMinutes

  // Calculate position relative to 6 AM (6 * 60 = 360 minutes)
  const displayStart = 6 * 60
  const top = ((startMinutes - displayStart) / 60) * 64 // 64px per hour
  const height = (duration / 60) * 64

  return {
    top: `${Math.max(0, top)}px`,
    height: `${height}px`,
    zIndex: 10
  }
}

function getShiftColorClass(shift: any): string {
  if (!shift.employeeId) {
    return 'bg-yellow-600 text-white border-l-4 border-yellow-400'
  }

  switch (shift.status) {
    case 'SCHEDULED':
      return 'bg-blue-600 text-white border-l-4 border-blue-400'
    case 'IN_PROGRESS':
      return 'bg-green-600 text-white border-l-4 border-green-400'
    case 'COMPLETED':
      return 'bg-gray-600 text-white border-l-4 border-gray-400'
    case 'CANCELLED':
      return 'bg-red-600 text-white border-l-4 border-red-400'
    case 'NO_SHOW':
      return 'bg-red-700 text-white border-l-4 border-red-500'
    default:
      return 'bg-blue-600 text-white border-l-4 border-blue-400'
  }
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'SCHEDULED':
      return 'bg-blue-600 text-blue-200'
    case 'IN_PROGRESS':
      return 'bg-green-600 text-green-200'
    case 'COMPLETED':
      return 'bg-gray-600 text-gray-200'
    case 'CANCELLED':
      return 'bg-red-600 text-red-200'
    case 'NO_SHOW':
      return 'bg-red-700 text-red-200'
    default:
      return 'bg-gray-600 text-gray-200'
  }
}

function viewShiftDetails(shift: any) {
  selectedShift.value = shift
}

async function loadSchedule() {
  try {
    const endDate = new Date(currentStartDate.value)
    endDate.setDate(endDate.getDate() + 6)

    const response = await axios.get(`${API_GATEWAY_URL}/api/employees/shifts/schedule`, {
      params: {
        startDate: formatDateKey(currentStartDate.value),
        endDate: formatDateKey(endDate)
      }
    })

    schedule.value = response.data
  } catch (error: any) {
    console.error('Failed to load schedule:', error)
    toast.error('Failed to load schedule')
  }
}

async function loadEmployees() {
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/employees?activeOnly=true`)
    employees.value = response.data
  } catch (error: any) {
    console.error('Failed to load employees:', error)
  }
}

async function loadPositions() {
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/employees/positions`)
    positions.value = response.data
  } catch (error: any) {
    console.error('Failed to load positions:', error)
  }
}

async function createShift() {
  isSubmitting.value = true
  try {
    await axios.post(`${API_GATEWAY_URL}/api/employees/shifts`, {
      employeeId: Number(shiftForm.value.employeeId),
      positionId: Number(shiftForm.value.positionId),
      shiftDate: shiftForm.value.shiftDate,
      startTime: shiftForm.value.startTime,
      endTime: shiftForm.value.endTime,
      breakMinutes: shiftForm.value.breakMinutes,
      location: shiftForm.value.location || null,
      notes: shiftForm.value.notes || null
    })

    toast.success('Shift created successfully!')
    showCreateShiftModal.value = false

    // Reset form
    shiftForm.value = {
      employeeId: '',
      positionId: '',
      shiftDate: '',
      startTime: '09:00',
      endTime: '17:00',
      breakMinutes: 30,
      location: '',
      notes: ''
    }

    loadSchedule()
  } catch (error: any) {
    console.error('Failed to create shift:', error)
    toast.error(error.response?.data?.message || 'Failed to create shift')
  } finally {
    isSubmitting.value = false
  }
}

async function cancelShift(shiftId: number) {
  if (!confirm('Are you sure you want to cancel this shift?')) return

  try {
    await axios.post(`${API_GATEWAY_URL}/api/employees/shifts/${shiftId}/cancel`)
    toast.success('Shift cancelled successfully!')
    selectedShift.value = null
    loadSchedule()
  } catch (error: any) {
    console.error('Failed to cancel shift:', error)
    toast.error(error.response?.data?.message || 'Failed to cancel shift')
  }
}

// Lifecycle
onMounted(() => {
  loadSchedule()
  loadEmployees()
  loadPositions()
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
