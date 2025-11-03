<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden" @click.stop>
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-xl font-semibold text-gray-900">
          Nouvelle réservation
        </h3>
        <button @click="$emit('close')" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <X class="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto">
        <div class="px-6 py-4 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nom du client *
              </label>
              <input
                v-model="form.customerName"
                type="text"
                required
                placeholder="Nom complet"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Contact *
              </label>
              <input
                v-model="form.contact"
                type="tel"
                required
                placeholder="Téléphone ou email"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Table *
            </label>
            <select
              v-model.number="form.tableId"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="" disabled>Sélectionner une table</option>
              <option v-for="table in tables" :key="table.id" :value="table.id">
                Table {{ table.label }} · {{ table.capacity }} pers. · {{ getStatusLabel(table.status) }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nombre de personnes *
            </label>
            <input
              v-model.number="form.partySize"
              type="number"
              min="1"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                v-model="form.date"
                type="date"
                :min="today"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Heure *
              </label>
              <input
                v-model="form.time"
                type="time"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Durée (heures)
            </label>
            <select
              v-model.number="form.duration"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option :value="1">1 h</option>
              <option :value="1.5">1 h 30</option>
              <option :value="2">2 h</option>
              <option :value="2.5">2 h 30</option>
              <option :value="3">3 h</option>
            </select>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            :disabled="loading"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="loading" class="animate-spin w-4 h-4 mr-2" />
            Confirmer
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { X, Loader2 } from 'lucide-vue-next'
import { TableStatus, type Table, type CreateReservationPayload } from '@/stores/tables'

interface Props {
  tables: Table[]
  selectedTableId: number | null
}

interface Emits {
  (e: 'close'): void
  (e: 'submit', payload: CreateReservationPayload): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const today = new Date().toISOString().split('T')[0]

const form = reactive({
  customerName: '',
  contact: '',
  tableId: null as number | null,
  partySize: 2,
  date: today,
  time: new Date(new Date().setMinutes(0, 0, 0)).toTimeString().substring(0, 5),
  duration: 2
})

watch(
  () => props.selectedTableId,
  value => {
    form.tableId = value ?? null
  },
  { immediate: true }
)

const isFormValid = computed(() => {
  return (
    form.customerName.trim().length > 0 &&
    form.contact.trim().length > 0 &&
    form.tableId !== null &&
    form.partySize > 0 &&
    form.date !== '' &&
    form.time !== ''
  )
})

const getStatusLabel = (status: TableStatus): string => {
  const labels: Record<TableStatus, string> = {
    [TableStatus.AVAILABLE]: 'Disponible',
    [TableStatus.OCCUPIED]: 'Occupée',
    [TableStatus.RESERVED]: 'Réservée',
    [TableStatus.DIRTY]: 'À nettoyer'
  }
  return labels[status] || status
}

const handleSubmit = async () => {
  if (!isFormValid.value || form.tableId === null) return

  loading.value = true
  try {
    const start = new Date(`${form.date}T${form.time}:00`)
    const end = new Date(start.getTime() + form.duration * 60 * 60 * 1000)

    const payload: CreateReservationPayload = {
      tableId: form.tableId,
      customerName: form.customerName.trim(),
      contact: form.contact.trim(),
      partySize: form.partySize,
      startTime: start.toISOString(),
      endTime: end.toISOString()
    }

    emit('submit', payload)
  } finally {
    loading.value = false
  }
}
</script>
