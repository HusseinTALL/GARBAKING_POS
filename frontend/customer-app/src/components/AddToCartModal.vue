<!--
  AddToCartModal.vue
  Modal for customizing menu item before adding to cart
-->

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        @click="handleBackdropClick"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      >
        <!-- Modal Container -->
        <Transition
          enter-active-class="transition ease-out duration-300"
          enter-from-class="transform translate-y-full sm:scale-95 opacity-0"
          enter-to-class="transform translate-y-0 sm:scale-100 opacity-100"
          leave-active-class="transition ease-in duration-200"
          leave-from-class="transform translate-y-0 sm:scale-100 opacity-100"
          leave-to-class="transform translate-y-full sm:scale-95 opacity-0"
        >
          <div
            v-if="isOpen"
            @click.stop
            class="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <!-- Item Image Header -->
            <div class="relative h-48 bg-gray-200">
              <img
                v-if="item.image"
                :src="item.image"
                :alt="item.name"
                class="w-full h-full object-cover"
              />

              <!-- Close Button -->
              <button
                @click="handleClose"
                class="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
              >
                <svg class="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Scrollable Content -->
            <div class="flex-1 overflow-y-auto p-6">
              <!-- Item Name and Price -->
              <div class="mb-6">
                <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ item.name }}</h2>
                <p class="text-gray-600 text-sm mb-3">{{ item.description }}</p>
                <div class="text-2xl font-bold text-orange-500">
                  ${{ item.price.toFixed(2) }}
                </div>
              </div>

              <!-- Customization Options (if available) -->
              <div v-if="item.options && item.options.length > 0" class="space-y-6">
                <div
                  v-for="option in item.options"
                  :key="option.id"
                  class="border-b border-gray-200 pb-6 last:border-0 last:pb-0"
                >
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="font-semibold text-gray-900">{{ option.name }}</h3>
                    <span v-if="option.required" class="text-xs font-semibold text-orange-500 uppercase">
                      Required
                    </span>
                  </div>

                  <!-- Radio Buttons for Single Selection -->
                  <div v-if="option.required" class="space-y-2">
                    <label
                      v-for="choice in option.choices"
                      :key="choice"
                      class="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all"
                      :class="[
                        selectedOptions[option.id] === choice
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      ]"
                    >
                      <input
                        type="radio"
                        :name="option.id"
                        :value="choice"
                        v-model="selectedOptions[option.id]"
                        class="w-5 h-5 text-orange-500 focus:ring-orange-500"
                      />
                      <span class="flex-1 font-medium text-gray-900">{{ choice }}</span>
                    </label>
                  </div>

                  <!-- Checkboxes for Multiple Selection -->
                  <div v-else class="space-y-2">
                    <label
                      v-for="choice in option.choices"
                      :key="choice"
                      class="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all"
                      :class="[
                        selectedOptions[option.id]?.includes(choice)
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      ]"
                    >
                      <input
                        type="checkbox"
                        :value="choice"
                        v-model="selectedOptions[option.id]"
                        class="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                      />
                      <span class="flex-1 font-medium text-gray-900">{{ choice }}</span>
                      <span class="text-sm text-gray-500">+$1.00</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Special Instructions -->
              <div class="mt-6">
                <label class="block text-sm font-semibold text-gray-900 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  v-model="specialInstructions"
                  rows="3"
                  placeholder="E.g., No onions, extra sauce..."
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
                ></textarea>
              </div>
            </div>

            <!-- Footer with Quantity and Add Button -->
            <div class="border-t border-gray-200 p-4 bg-gray-50">
              <div class="flex items-center justify-between gap-4">
                <!-- Quantity Selector -->
                <div class="flex items-center gap-3 bg-white rounded-lg border-2 border-gray-200 p-1">
                  <button
                    @click="decrementQuantity"
                    :disabled="quantity <= 1"
                    class="p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg class="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                    </svg>
                  </button>

                  <span class="font-bold text-gray-900 w-8 text-center">{{ quantity }}</span>

                  <button
                    @click="incrementQuantity"
                    class="p-2 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <svg class="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>

                <!-- Add to Cart Button -->
                <button
                  @click="handleAddToCart"
                  :disabled="!isValid"
                  class="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Cart - ${{ totalPrice.toFixed(2) }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// Props
interface Props {
  isOpen: boolean
  item: {
    id: string
    name: string
    description: string
    price: number
    image?: string
    options?: Array<{
      id: string
      name: string
      required: boolean
      choices: string[]
    }>
  }
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'add-to-cart', data: { item: any; quantity: number; options: any; instructions?: string }): void
}>()

// State
const quantity = ref(1)
const selectedOptions = ref<Record<string, any>>({})
const specialInstructions = ref('')

// Computed
const isValid = computed(() => {
  if (!props.item.options) return true

  // Check if all required options are selected
  return props.item.options
    .filter(opt => opt.required)
    .every(opt => selectedOptions.value[opt.id])
})

const totalPrice = computed(() => {
  let total = props.item.price * quantity.value

  // Add extra charges for selected options (checkboxes)
  Object.values(selectedOptions.value).forEach(value => {
    if (Array.isArray(value)) {
      total += value.length * 1.00 * quantity.value // $1 per extra
    }
  })

  return total
})

// Methods
const incrementQuantity = () => {
  quantity.value++
}

const decrementQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const handleClose = () => {
  emit('close')
}

const handleBackdropClick = () => {
  handleClose()
}

const handleAddToCart = () => {
  if (!isValid.value) return

  emit('add-to-cart', {
    item: props.item,
    quantity: quantity.value,
    options: selectedOptions.value,
    instructions: specialInstructions.value || undefined
  })

  // Reset
  quantity.value = 1
  selectedOptions.value = {}
  specialInstructions.value = ''
}

// Watch for item changes to initialize options
watch(() => props.item, (newItem) => {
  if (newItem.options) {
    selectedOptions.value = {}
    newItem.options.forEach(option => {
      if (option.required) {
        // Initialize with first choice for required options
        selectedOptions.value[option.id] = option.choices[0]
      } else {
        // Initialize as empty array for optional checkboxes
        selectedOptions.value[option.id] = []
      }
    })
  }
}, { immediate: true })
</script>
