<!--
  DeliveryOptions.vue
  Delivery time and date selection component
-->

<template>
  <div class="bg-white rounded-2xl p-4 shadow-sm">
    <div class="flex items-center gap-2 mb-4">
      <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="font-semibold text-gray-900">Delivery Time</h3>
    </div>

    <!-- Delivery Type Selection -->
    <div class="space-y-3 mb-4">
      <!-- ASAP Option -->
      <label
        class="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all"
        :class="[
          selectedOption === 'asap'
            ? 'border-orange-500 bg-orange-50'
            : 'border-gray-200 hover:border-gray-300'
        ]"
      >
        <input
          type="radio"
          name="deliveryTime"
          value="asap"
          v-model="selectedOption"
          class="w-5 h-5 text-orange-500 focus:ring-orange-500"
        />
        <div class="flex-1">
          <div class="font-semibold text-gray-900">As soon as possible</div>
          <div class="text-sm text-gray-600">{{ estimatedTime }}</div>
        </div>
        <div v-if="selectedOption === 'asap'" class="flex-shrink-0">
          <svg class="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
      </label>

      <!-- Schedule for Later Option -->
      <label
        class="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all"
        :class="[
          selectedOption === 'scheduled'
            ? 'border-orange-500 bg-orange-50'
            : 'border-gray-200 hover:border-gray-300'
        ]"
      >
        <input
          type="radio"
          name="deliveryTime"
          value="scheduled"
          v-model="selectedOption"
          class="w-5 h-5 text-orange-500 focus:ring-orange-500"
        />
        <div class="flex-1">
          <div class="font-semibold text-gray-900">Schedule for later</div>
          <div class="text-sm text-gray-600">Choose date and time</div>
        </div>
        <div v-if="selectedOption === 'scheduled'" class="flex-shrink-0">
          <svg class="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
      </label>
    </div>

    <!-- Scheduled Time Selection -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="selectedOption === 'scheduled'" class="space-y-3 pt-2 border-t border-gray-200">
        <!-- Date Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <select
            v-model="selectedDate"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Select date</option>
            <option v-for="date in availableDates" :key="date.value" :value="date.value">
              {{ date.label }}
            </option>
          </select>
        </div>

        <!-- Time Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Time</label>
          <select
            v-model="selectedTime"
            :disabled="!selectedDate"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select time</option>
            <option v-for="time in availableTimes" :key="time" :value="time">
              {{ time }}
            </option>
          </select>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// Props
interface Props {
  estimatedDeliveryMinutes?: number
}

const props = withDefaults(defineProps<Props>(), {
  estimatedDeliveryMinutes: 30
})

// Emits
const emit = defineEmits<{
  (e: 'update', option: { type: 'asap' | 'scheduled'; date?: string; time?: string }): void
}>()

// State
const selectedOption = ref<'asap' | 'scheduled'>('asap')
const selectedDate = ref('')
const selectedTime = ref('')

// Computed
const estimatedTime = computed(() => {
  const min = props.estimatedDeliveryMinutes
  const max = min + 10
  return `${min}-${max} minutes`
})

const availableDates = computed(() => {
  const dates = []
  const today = new Date()

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)

    const label = i === 0
      ? 'Today'
      : i === 1
      ? 'Tomorrow'
      : date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })

    dates.push({
      value: date.toISOString().split('T')[0],
      label
    })
  }

  return dates
})

const availableTimes = computed(() => {
  const times = []
  const now = new Date()
  const isToday = selectedDate.value === now.toISOString().split('T')[0]

  // Generate time slots from 10 AM to 10 PM
  for (let hour = 10; hour <= 22; hour++) {
    for (let minute of [0, 30]) {
      const time = new Date()
      time.setHours(hour, minute, 0, 0)

      // Skip past times for today
      if (isToday && time <= now) continue

      const timeStr = time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })

      times.push(timeStr)
    }
  }

  return times
})

// Watch for changes and emit
watch([selectedOption, selectedDate, selectedTime], () => {
  if (selectedOption.value === 'asap') {
    emit('update', { type: 'asap' })
  } else if (selectedDate.value && selectedTime.value) {
    emit('update', {
      type: 'scheduled',
      date: selectedDate.value,
      time: selectedTime.value
    })
  }
})

// Initialize with ASAP
emit('update', { type: 'asap' })
</script>
