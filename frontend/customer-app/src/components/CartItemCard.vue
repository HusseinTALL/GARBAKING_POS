<!--
  Cart item card component for displaying items in the shopping cart
  Features quantity controls, notes, and remove functionality
-->

<template>
  <div class="bg-white rounded-2xl p-4 shadow-sm">
    <div class="flex space-x-4">
      <!-- Item image -->
      <div class="flex-shrink-0">
        <img
          v-if="item.imageUrl"
          :src="item.imageUrl"
          :alt="item.name"
          class="w-16 h-16 rounded-xl object-cover"
          @error="onImageError"
        />
        <div
          v-else
          class="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center"
        >
          <FontAwesomeIcon :icon="['fas', 'utensils']" class="text-2xl text-primary-400" />
        </div>
      </div>

      <!-- Item details -->
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-start mb-2">
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900 truncate">{{ item.name }}</h3>
            <p v-if="item.category" class="text-sm text-gray-500">{{ item.category }}</p>
          </div>
          <button
            @click="$emit('remove-item', item.id)"
            class="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <FontAwesomeIcon :icon="['fas', 'times']" class="text-sm" />
          </button>
        </div>

        <!-- Price and quantity controls -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <!-- Quantity controls -->
            <div class="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                @click="decreaseQuantity"
                class="w-8 h-8 rounded-md bg-white shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <FontAwesomeIcon :icon="['fas', 'minus']" class="text-sm text-gray-600" />
              </button>

              <span class="w-8 text-center font-semibold text-gray-900">{{ item.quantity }}</span>

              <button
                @click="increaseQuantity"
                class="w-8 h-8 rounded-md bg-white shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <FontAwesomeIcon :icon="['fas', 'plus']" class="text-sm text-gray-600" />
              </button>
            </div>

            <!-- Notes button -->
            <button
              @click="showNotesModal = true"
              :class="[
                'p-2 rounded-lg transition-colors',
                item.notes
                  ? 'text-primary-600 bg-primary-50 hover:bg-primary-100'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              ]"
            >
              <FontAwesomeIcon :icon="['fas', 'edit']" class="text-sm" />
            </button>
          </div>

          <!-- Item total price -->
          <div class="text-right">
            <p class="font-bold text-lg text-primary-600">{{ formatPrice(itemTotal) }}</p>
            <p v-if="item.quantity > 1" class="text-sm text-gray-500">
              {{ formatPrice(item.price) }} × {{ item.quantity }}
            </p>
          </div>
        </div>

        <!-- Notes display -->
        <div v-if="item.notes" class="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
          <div class="flex items-start space-x-2">
            <FontAwesomeIcon :icon="['fas', 'sticky-note']" class="text-amber-600 text-sm mt-0.5" />
            <p class="text-sm text-amber-800">{{ item.notes }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Notes modal -->
    <div
      v-if="showNotesModal"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click="showNotesModal = false"
    >
      <div
        class="bg-white rounded-2xl p-6 max-w-sm w-full animate-scale-in"
        @click.stop
      >
        <div class="mb-4">
          <h3 class="text-lg font-bold text-gray-900 mb-2">Notes spéciales</h3>
          <p class="text-sm text-gray-600">{{ item.name }}</p>
        </div>

        <div class="mb-6">
          <textarea
            v-model="notesInput"
            placeholder="Ajoutez des instructions spéciales, allergies, etc."
            rows="4"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
          ></textarea>
        </div>

        <div class="flex space-x-3">
          <button
            @click="cancelNotes"
            class="flex-1 bg-gray-200 text-gray-800 font-medium py-3 rounded-xl hover:bg-gray-300 transition-colors"
          >
            Annuler
          </button>
          <button
            @click="saveNotes"
            class="flex-1 bg-primary-600 text-white font-medium py-3 rounded-xl hover:bg-primary-700 transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useToast } from 'vue-toastification'

// Props
interface Props {
  item: {
    id: string
    name: string
    price: number
    quantity: number
    notes?: string
    imageUrl?: string
    category?: string
  }
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update-quantity': [itemId: string, quantity: number]
  'remove-item': [itemId: string]
  'add-notes': [itemId: string, notes: string]
}>()

const toast = useToast()

// Local state
const showNotesModal = ref(false)
const notesInput = ref('')

// Computed
const itemTotal = computed(() => props.item.price * props.item.quantity)

// Methods
const formatPrice = (amount: number): string => {
  return `${amount.toLocaleString()} FCFA`
}

const increaseQuantity = () => {
  emit('update-quantity', props.item.id, props.item.quantity + 1)
}

const decreaseQuantity = () => {
  if (props.item.quantity > 1) {
    emit('update-quantity', props.item.id, props.item.quantity - 1)
  } else {
    // Show confirmation for removing item
    emit('remove-item', props.item.id)
  }
}

const saveNotes = () => {
  emit('add-notes', props.item.id, notesInput.value.trim())
  showNotesModal.value = false

  if (notesInput.value.trim()) {
    toast.success('Notes ajoutées')
  } else {
    toast.info('Notes supprimées')
  }
}

const cancelNotes = () => {
  notesInput.value = props.item.notes || ''
  showNotesModal.value = false
}

const onImageError = () => {
  // Handle image loading error gracefully
  console.log('Image failed to load for item:', props.item.name)
}

// Watch for modal opening to initialize notes input
watch(showNotesModal, (isOpen) => {
  if (isOpen) {
    notesInput.value = props.item.notes || ''
  }
})
</script>

<style scoped>
/* Scale animation for modal */
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}

/* Hover effects for touch devices */
@media (hover: none) and (pointer: coarse) {
  .hover\:bg-gray-50:hover,
  .hover\:bg-gray-300:hover,
  .hover\:bg-primary-100:hover,
  .hover\:bg-primary-700:hover,
  .hover\:text-gray-600:hover,
  .hover\:text-red-500:hover {
    /* Disable hover effects on touch devices */
  }
}
</style>