<!--
  Clock In/Out Panel Component - Time tracking for staff
  Allows users to clock in/out and track breaks
-->

<template>
  <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-3">
        <Clock class="w-6 h-6 text-blue-600" />
        <div>
          <h2 class="text-lg font-semibold text-slate-900">Time Tracking</h2>
          <p class="text-sm text-slate-600">{{ formattedDate }}</p>
        </div>
      </div>

      <div class="text-right">
        <div class="text-3xl font-bold text-slate-900 font-mono">{{ currentTime }}</div>
        <div class="text-sm text-slate-600">{{ timeZone }}</div>
      </div>
    </div>

    <!-- Current Status -->
    <div v-if="currentEntry" class="mb-6 p-4 rounded-lg" :class="statusCardClass">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full animate-pulse" :class="statusDotClass"></div>
          <span class="font-medium text-slate-900">{{ statusText }}</span>
        </div>
        <span class="text-sm text-slate-600">
          Since {{ formatTime(clockInTime) }}
        </span>
      </div>

      <div class="grid grid-cols-3 gap-4 mb-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-slate-900">{{ hoursWorked }}</div>
          <div class="text-xs text-slate-600">Hours Worked</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-slate-900">{{ breakTime }}</div>
          <div class="text-xs text-slate-600">Break Time</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-slate-900">{{ netHours }}</div>
          <div class="text-xs text-slate-600">Net Hours</div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center space-x-3">
        <button
          v-if="currentEntry.status === 'CLOCKED_IN'"
          @click="handleBreakStart"
          class="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <Pause class="w-4 h-4" />
          <span>Start Break</span>
        </button>

        <button
          v-if="currentEntry.status === 'ON_BREAK'"
          @click="handleBreakEnd"
          class="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <Play class="w-4 h-4" />
          <span>End Break</span>
        </button>

        <button
          @click="handleClockOut"
          class="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <LogOut class="w-4 h-4" />
          <span>Clock Out</span>
        </button>
      </div>
    </div>

    <!-- Clock In Form -->
    <div v-else class="mb-6">
      <div class="text-center py-8 mb-4">
        <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogIn class="w-10 h-10 text-blue-600" />
        </div>
        <h3 class="text-lg font-medium text-slate-900 mb-2">Ready to start your shift?</h3>
        <p class="text-sm text-slate-600">Click below to clock in</p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Location (Optional)</label>
          <select
            v-model="clockInLocation"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select location</option>
            <option value="Main Counter">Main Counter</option>
            <option value="Drive-Thru">Drive-Thru</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Back Office">Back Office</option>
          </select>
        </div>

        <button
          @click="handleClockIn"
          :disabled="isProcessing"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogIn class="w-5 h-5" />
          <span>{{ isProcessing ? 'Clocking In...' : 'Clock In' }}</span>
        </button>
      </div>
    </div>

    <!-- Recent Entries -->
    <div v-if="recentEntries.length > 0">
      <h3 class="text-sm font-medium text-slate-900 mb-3">Recent Clock Entries</h3>
      <div class="space-y-2">
        <div
          v-for="entry in recentEntries"
          :key="entry.id"
          class="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <div>
            <div class="text-sm font-medium text-slate-900">
              {{ formatDate(entry.shiftDate) }}
            </div>
            <div class="text-xs text-slate-600">
              {{ formatTime(entry.clockInTime) }} - {{ entry.clockOutTime ? formatTime(entry.clockOutTime) : 'In Progress' }}
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm font-medium text-slate-900">
              {{ entry.totalHours ? `${entry.totalHours.toFixed(2)}h` : '--' }}
            </div>
            <div v-if="entry.overtimeHours && entry.overtimeHours > 0" class="text-xs text-amber-600">
              +{{ entry.overtimeHours.toFixed(2)}h OT
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Clock Out Modal -->
    <div v-if="showClockOutModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="showClockOutModal = false">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4" @click.stop>
        <div class="p-6">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Clock Out</h3>

          <div class="mb-4">
            <div class="bg-blue-50 rounded-lg p-4 mb-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-slate-700">Total Hours</span>
                <span class="text-lg font-bold text-blue-600">{{ hoursWorked }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-700">Break Time</span>
                <span class="text-sm font-medium text-slate-600">{{ breakTime }}</span>
              </div>
            </div>

            <label class="block text-sm font-medium text-slate-700 mb-2">Notes (Optional)</label>
            <textarea
              v-model="clockOutNotes"
              rows="3"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any notes about your shift?"
            ></textarea>
          </div>

          <div class="flex items-center space-x-3">
            <button
              @click="showClockOutModal = false"
              class="flex-1 px-4 py-2 text-slate-600 hover:text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="confirmClockOut"
              :disabled="isProcessing"
              class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {{ isProcessing ? 'Clocking Out...' : 'Clock Out' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import { Clock, LogIn, LogOut, Pause, Play } from 'lucide-vue-next'

const usersStore = useUsersStore()
const authStore = useAuthStore()

// State
const currentTime = ref('')
const currentDate = ref(new Date())
const clockInLocation = ref('')
const clockOutNotes = ref('')
const showClockOutModal = ref(false)
const isProcessing = ref(false)
let timeInterval: any = null

// Computed
const currentEntry = computed(() => {
  return usersStore.getCurrentClockEntry(authStore.currentUser?.id || '')
})

const clockInTime = computed(() => {
  return currentEntry.value?.clockInTime || ''
})

const hoursWorked = computed(() => {
  if (!currentEntry.value) return '0.00'

  const start = new Date(currentEntry.value.clockInTime)
  const now = new Date()
  const diff = now.getTime() - start.getTime()
  const hours = diff / (1000 * 60 * 60)

  return hours.toFixed(2)
})

const breakTime = computed(() => {
  if (!currentEntry.value?.breakDuration) return '0m'

  const minutes = currentEntry.value.breakDuration
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return `${minutes}m`
})

const netHours = computed(() => {
  const worked = parseFloat(hoursWorked.value)
  const breakHours = (currentEntry.value?.breakDuration || 0) / 60
  return (worked - breakHours).toFixed(2)
})

const statusText = computed(() => {
  if (!currentEntry.value) return ''
  return currentEntry.value.status === 'CLOCKED_IN' ? 'Clocked In' : 'On Break'
})

const statusCardClass = computed(() => {
  if (!currentEntry.value) return ''
  return currentEntry.value.status === 'CLOCKED_IN'
    ? 'bg-green-50 border border-green-200'
    : 'bg-yellow-50 border border-yellow-200'
})

const statusDotClass = computed(() => {
  if (!currentEntry.value) return ''
  return currentEntry.value.status === 'CLOCKED_IN'
    ? 'bg-green-500'
    : 'bg-yellow-500'
})

const formattedDate = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const timeZone = computed(() => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
})

const recentEntries = computed(() => {
  const userId = authStore.currentUser?.id
  if (!userId) return []

  return usersStore.clockEntries
    .filter(entry => entry.userId === userId && entry.status === 'CLOCKED_OUT')
    .slice(0, 5)
})

// Methods
const updateTime = () => {
  const now = new Date()
  currentDate.value = now
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const handleClockIn = async () => {
  const userId = authStore.currentUser?.id
  if (!userId) return

  isProcessing.value = true

  try {
    await usersStore.clockIn(userId, clockInLocation.value || undefined)
    clockInLocation.value = ''
  } catch (err) {
    console.error('Failed to clock in:', err)
    alert('Failed to clock in. Please try again.')
  } finally {
    isProcessing.value = false
  }
}

const handleClockOut = () => {
  showClockOutModal.value = true
}

const confirmClockOut = async () => {
  if (!currentEntry.value) return

  isProcessing.value = true

  try {
    await usersStore.clockOut(currentEntry.value.id, clockOutNotes.value || undefined)
    showClockOutModal.value = false
    clockOutNotes.value = ''
  } catch (err) {
    console.error('Failed to clock out:', err)
    alert('Failed to clock out. Please try again.')
  } finally {
    isProcessing.value = false
  }
}

const handleBreakStart = async () => {
  if (!currentEntry.value) return

  try {
    await usersStore.startBreak(currentEntry.value.id)
  } catch (err) {
    console.error('Failed to start break:', err)
    alert('Failed to start break. Please try again.')
  }
}

const handleBreakEnd = async () => {
  if (!currentEntry.value) return

  try {
    await usersStore.endBreak(currentEntry.value.id)
  } catch (err) {
    console.error('Failed to end break:', err)
    alert('Failed to end break. Please try again.')
  }
}

const formatTime = (isoString: string): string => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(async () => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)

  // Fetch clock entries for current user
  const userId = authStore.currentUser?.id
  if (userId) {
    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    await usersStore.fetchClockEntries(userId, weekAgo, today)
  }
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>
