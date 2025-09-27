<!--
  Reservation Modal - Create and edit table reservations
  Handles reservation scheduling, party size, and special requests
-->

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div
      class="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-scale-in"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-xl font-semibold text-gray-900">
          {{ isEditing ? 'Edit Reservation' : 'New Reservation' }}
        </h3>
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X class="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto">
        <div class="px-6 py-4 space-y-6">
          <!-- Customer Information -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <input
                v-model="form.customerName"
                type="text"
                required
                placeholder="Enter customer name"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.customerName }"
              />
              <p v-if="errors.customerName" class="mt-1 text-sm text-red-600">
                {{ errors.customerName }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                v-model="form.customerPhone"
                type="tel"
                placeholder="Enter phone number"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Table Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Table *
            </label>
            <select
              v-model="form.tableId"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :class="{ 'border-red-500': errors.tableId }"
            >
              <option value="">Select a table</option>
              <option
                v-for="table in availableTables"
                :key="table.id"
                :value="table.id"
              >
                Table {{ table.number }} ({{ table.capacity }} people)
              </option>
            </select>
            <p v-if="errors.tableId" class="mt-1 text-sm text-red-600">
              {{ errors.tableId }}
            </p>
          </div>

          <!-- Party Size -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Party Size *
            </label>
            <input
              v-model.number="form.partySize"
              type="number"
              min="1"
              max="20"
              required
              placeholder="Number of guests"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :class="{ 'border-red-500': errors.partySize }"
            />
            <p v-if="errors.partySize" class="mt-1 text-sm text-red-600">
              {{ errors.partySize }}
            </p>
          </div>

          <!-- Date & Time -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                v-model="form.date"
                type="date"
                required
                :min="today"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.date }"
              />
              <p v-if="errors.date" class="mt-1 text-sm text-red-600">
                {{ errors.date }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Time *
              </label>
              <input
                v-model="form.time"
                type="time"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.time }"
              />
              <p v-if="errors.time" class="mt-1 text-sm text-red-600">
                {{ errors.time }}
              </p>
            </div>
          </div>

          <!-- Duration -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Duration (hours)
            </label>
            <select
              v-model.number="form.duration"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option :value="1">1 hour</option>
              <option :value="1.5">1.5 hours</option>
              <option :value="2">2 hours</option>
              <option :value="2.5">2.5 hours</option>
              <option :value="3">3 hours</option>
            </select>
          </div>

          <!-- Special Requests -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Special Requests
            </label>
            <div class="space-y-2">
              <label v-for="request in specialRequestOptions" :key="request" class="flex items-center">
                <input
                  v-model="form.specialRequests"
                  type="checkbox"
                  :value="request"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-700">{{ request }}</span>
              </label>
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              v-model="form.notes"
              rows="3"
              placeholder="Any additional notes..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            ></textarea>
          </div>
        </div>

        <!-- Actions -->
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            :disabled="loading"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2
              v-if="loading"
              class="animate-spin w-4 h-4 mr-2"
            />
            {{ isEditing ? 'Update' : 'Create' }} Reservation
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { X, Loader2 } from 'lucide-vue-next'

interface Table {
  id: string
  number: string
  capacity: number
  status: string
}

interface Props {
  table?: Table | null
  tables: Table[]
  reservation?: any
}

interface Emits {
  (e: 'close'): void
  (e: 'created', tableId: string, reservationData: any): void
}

const props = withDefaults(defineProps<Props>(), {
  table: null,
  reservation: null
})
const emit = defineEmits<Emits>()

// State
const loading = ref(false)
const today = new Date().toISOString().split('T')[0]

const form = reactive({
  customerName: '',
  customerPhone: '',
  tableId: '',
  partySize: 2,
  date: '',
  time: '',
  duration: 2,
  specialRequests: [] as string[],
  notes: ''
})

const errors = reactive({
  customerName: '',
  tableId: '',
  partySize: '',
  date: '',
  time: ''
})

const specialRequestOptions = [
  'High chair needed',
  'Wheelchair accessible',
  'Birthday celebration',
  'Anniversary celebration',
  'Quiet table preferred',
  'Window table preferred'
]

// Computed
const isEditing = computed(() => !!props.reservation)

const availableTables = computed(() => {
  return props.tables.filter(table =>
    table.status === 'AVAILABLE' ||
    (props.table && table.id === props.table.id)
  )
})

const isFormValid = computed(() => {
  return form.customerName.trim().length > 0 &&
         form.tableId &&
         form.partySize > 0 &&
         form.date &&
         form.time &&
         !Object.values(errors).some(error => error)
})

// Methods
const validateForm = () => {
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  let isValid = true

  // Validate customer name
  if (!form.customerName.trim()) {
    errors.customerName = 'Customer name is required'
    isValid = false
  }

  // Validate table selection
  if (!form.tableId) {
    errors.tableId = 'Please select a table'
    isValid = false
  }

  // Validate party size
  if (!form.partySize || form.partySize < 1) {
    errors.partySize = 'Party size must be at least 1'
    isValid = false
  }

  // Validate date
  if (!form.date) {
    errors.date = 'Date is required'
    isValid = false
  } else {
    const selectedDate = new Date(form.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      errors.date = 'Date cannot be in the past'
      isValid = false
    }
  }

  // Validate time
  if (!form.time) {
    errors.time = 'Time is required'
    isValid = false
  }

  // Check table capacity
  const selectedTable = props.tables.find(t => t.id === form.tableId)
  if (selectedTable && form.partySize > selectedTable.capacity) {
    errors.partySize = `Party size cannot exceed table capacity (${selectedTable.capacity})`
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    // Combine date and time
    const reservationDateTime = new Date(`${form.date}T${form.time}`).toISOString()

    const reservationData = {
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone?.trim() || undefined,
      partySize: form.partySize,
      reservationTime: reservationDateTime,
      duration: form.duration,
      specialRequests: form.specialRequests,
      notes: form.notes?.trim() || undefined
    }

    emit('created', form.tableId, reservationData)
  } catch (error) {
    console.error('Error creating reservation:', error)
    // Handle error (could show notification)
  } finally {
    loading.value = false
  }
}

// Initialize form with existing data
onMounted(() => {
  if (props.table) {
    form.tableId = props.table.id
  }

  if (props.reservation) {
    const reservationDate = new Date(props.reservation.reservationTime)
    form.customerName = props.reservation.customerName
    form.customerPhone = props.reservation.customerPhone || ''
    form.partySize = props.reservation.partySize
    form.date = reservationDate.toISOString().split('T')[0]
    form.time = reservationDate.toTimeString().substring(0, 5)
    form.duration = props.reservation.duration
    form.specialRequests = props.reservation.specialRequests || []
    form.notes = props.reservation.notes || ''
  } else {
    // Set default date to today
    form.date = today
    // Set default time to next hour
    const nextHour = new Date()
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0)
    form.time = nextHour.toTimeString().substring(0, 5)
  }
})
</script>

<style scoped>
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}
</style>