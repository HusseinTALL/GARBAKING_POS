<!--
  Menu item management modal for creating and editing menu items
  Provides comprehensive form validation, category selection, and pricing management
-->

<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div class="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-hidden">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-700">
        <h2 class="text-2xl font-bold text-white">
          {{ isEditing ? 'Edit Menu Item' : 'Add Menu Item' }}
        </h2>
        <button
          @click="$emit('close')"
          class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- Modal Content -->
      <form @submit.prevent="handleSubmit" class="flex flex-col max-h-[calc(90vh-80px)]">
        <div class="flex-1 overflow-y-auto p-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Left Column -->
            <div class="space-y-6">
              <!-- Item Name -->
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">
                  Item Name *
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="input w-full"
                  placeholder="e.g., Classic Burger, Cappuccino"
                  :class="{ 'border-red-500': errors.name }"
                />
                <p v-if="errors.name" class="text-red-400 text-sm mt-1">{{ errors.name }}</p>
              </div>

              <!-- SKU -->
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">
                  SKU *
                </label>
                <input
                  v-model="form.sku"
                  type="text"
                  required
                  class="input w-full"
                  placeholder="e.g., BRG001, COF002"
                  :class="{ 'border-red-500': errors.sku }"
                />
                <p class="text-gray-400 text-sm mt-1">Unique product identifier</p>
                <p v-if="errors.sku" class="text-red-400 text-sm mt-1">{{ errors.sku }}</p>
              </div>

              <!-- Category -->
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  v-model="form.categoryId"
                  required
                  class="input w-full"
                  :class="{ 'border-red-500': errors.categoryId }"
                >
                  <option value="">Select a category</option>
                  <option
                    v-for="category in menuStore.categoriesForSelect"
                    :key="category.value"
                    :value="category.value"
                  >
                    {{ category.label }}
                  </option>
                </select>
                <p v-if="errors.categoryId" class="text-red-400 text-sm mt-1">{{ errors.categoryId }}</p>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  v-model="form.description"
                  rows="4"
                  class="input w-full resize-none"
                  placeholder="Describe the item, ingredients, preparation method..."
                  :class="{ 'border-red-500': errors.description }"
                ></textarea>
                <p v-if="errors.description" class="text-red-400 text-sm mt-1">{{ errors.description }}</p>
              </div>

              <!-- Availability -->
              <div>
                <label class="flex items-center gap-3">
                  <input
                    v-model="form.isAvailable"
                    type="checkbox"
                    class="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span class="text-sm font-medium text-gray-300">
                    Available for ordering
                  </span>
                </label>
                <p class="text-gray-400 text-sm mt-1">Uncheck to temporarily disable this item</p>
              </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-6">
              <!-- Pricing -->
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-white">Pricing</h3>

                <!-- Sale Price -->
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">
                    Sale Price *
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                    <input
                      v-model.number="form.price"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      class="input w-full pl-8"
                      placeholder="0.00"
                      :class="{ 'border-red-500': errors.price }"
                    />
                  </div>
                  <p v-if="errors.price" class="text-red-400 text-sm mt-1">{{ errors.price }}</p>
                </div>

                <!-- Cost Price -->
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">
                    Cost Price (Optional)
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                    <input
                      v-model.number="form.cost"
                      type="number"
                      step="0.01"
                      min="0"
                      class="input w-full pl-8"
                      placeholder="0.00"
                      :class="{ 'border-red-500': errors.cost }"
                    />
                  </div>
                  <p class="text-gray-400 text-sm mt-1">For profit margin calculations</p>
                  <p v-if="errors.cost" class="text-red-400 text-sm mt-1">{{ errors.cost }}</p>
                </div>

                <!-- Profit Margin Display -->
                <div v-if="form.price && form.cost" class="p-3 bg-gray-700 rounded-lg">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-300">Profit Margin:</span>
                    <span :class="profitMarginColor">{{ profitMarginText }}</span>
                  </div>
                </div>
              </div>

              <!-- Item Image -->
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">
                  Item Image
                </label>
                <div class="space-y-3">
                  <!-- Image Preview -->
                  <div v-if="form.imageUrl" class="relative">
                    <img
                      :src="form.imageUrl"
                      alt="Item preview"
                      class="w-full h-48 object-cover rounded-lg border border-gray-600"
                    />
                    <button
                      type="button"
                      @click="form.imageUrl = ''"
                      class="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <X class="w-4 h-4" />
                    </button>
                  </div>

                  <!-- Image URL Input -->
                  <input
                    v-model="form.imageUrl"
                    type="url"
                    class="input w-full"
                    placeholder="https://example.com/image.jpg"
                    :class="{ 'border-red-500': errors.imageUrl }"
                  />
                  <p v-if="errors.imageUrl" class="text-red-400 text-sm mt-1">{{ errors.imageUrl }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="submitError" class="mt-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <p class="text-red-300 text-sm">{{ submitError }}</p>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-700 bg-gray-800/50">
          <button
            type="button"
            @click="$emit('close')"
            class="btn btn-secondary"
            :disabled="isSubmitting"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isSubmitting || !isFormValid"
          >
            <span v-if="isSubmitting" class="flex items-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {{ isEditing ? 'Updating...' : 'Creating...' }}
            </span>
            <span v-else>
              {{ isEditing ? 'Update Item' : 'Create Item' }}
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { X } from 'lucide-vue-next'
import { useMenuStore, type MenuItem, type MenuItemForm } from '@/stores/menu'

interface Props {
  item?: MenuItem | null
}

const props = withDefaults(defineProps<Props>(), {
  item: null
})

const emit = defineEmits<{
  close: []
  success: [item: MenuItem]
}>()

const menuStore = useMenuStore()

// Form state
const form = ref<MenuItemForm>({
  name: '',
  sku: '',
  description: '',
  price: 0,
  cost: 0,
  categoryId: '',
  imageUrl: '',
  isAvailable: true
})

const errors = ref<Record<string, string>>({})
const submitError = ref('')
const isSubmitting = ref(false)

// Computed
const isEditing = computed(() => !!props.item)

const isFormValid = computed(() => {
  return (
    form.value.name.trim().length > 0 &&
    form.value.sku.trim().length > 0 &&
    form.value.categoryId.length > 0 &&
    form.value.price > 0 &&
    Object.keys(errors.value).length === 0
  )
})

const profitMarginText = computed(() => {
  if (!form.value.price || !form.value.cost) return ''
  const margin = ((form.value.price - form.value.cost) / form.value.price) * 100
  return `${margin.toFixed(1)}% ($${(form.value.price - form.value.cost).toFixed(2)})`
})

const profitMarginColor = computed(() => {
  if (!form.value.price || !form.value.cost) return 'text-gray-300'
  const margin = ((form.value.price - form.value.cost) / form.value.price) * 100
  if (margin >= 30) return 'text-green-400'
  if (margin >= 15) return 'text-yellow-400'
  return 'text-red-400'
})

// Form validation
const validateForm = () => {
  errors.value = {}

  if (!form.value.name.trim()) {
    errors.value.name = 'Item name is required'
  } else if (form.value.name.trim().length < 2) {
    errors.value.name = 'Item name must be at least 2 characters'
  }

  if (!form.value.sku.trim()) {
    errors.value.sku = 'SKU is required'
  } else if (form.value.sku.trim().length < 2) {
    errors.value.sku = 'SKU must be at least 2 characters'
  }

  if (!form.value.categoryId) {
    errors.value.categoryId = 'Category selection is required'
  }

  if (form.value.price <= 0) {
    errors.value.price = 'Price must be greater than 0'
  }

  if (form.value.cost && form.value.cost < 0) {
    errors.value.cost = 'Cost cannot be negative'
  }

  if (form.value.cost && form.value.price && form.value.cost >= form.value.price) {
    errors.value.cost = 'Cost should be less than the sale price'
  }

  if (form.value.description && form.value.description.length > 1000) {
    errors.value.description = 'Description must be less than 1000 characters'
  }

  if (form.value.imageUrl && !isValidUrl(form.value.imageUrl)) {
    errors.value.imageUrl = 'Please enter a valid URL'
  }
}

const isValidUrl = (string: string) => {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

// Watch for form changes to validate
watch(form, validateForm, { deep: true })

// Initialize form
const initializeForm = () => {
  if (props.item) {
    form.value = {
      name: props.item.name,
      sku: props.item.sku,
      description: props.item.description,
      price: props.item.price,
      cost: props.item.cost || 0,
      categoryId: props.item.categoryId,
      imageUrl: props.item.imageUrl || '',
      isAvailable: props.item.isAvailable
    }
  } else {
    form.value = {
      name: '',
      sku: '',
      description: '',
      price: 0,
      cost: 0,
      categoryId: '',
      imageUrl: '',
      isAvailable: true
    }
  }
  errors.value = {}
  submitError.value = ''
}

// Handle form submission
const handleSubmit = async () => {
  validateForm()
  if (!isFormValid.value) return

  isSubmitting.value = true
  submitError.value = ''

  try {
    let result: MenuItem

    if (isEditing.value && props.item) {
      result = await menuStore.updateMenuItem(props.item.id, form.value)
    } else {
      result = await menuStore.createMenuItem(form.value)
    }

    emit('success', result)
    emit('close')
  } catch (error: any) {
    submitError.value = error.message || 'An error occurred while saving the menu item'
  } finally {
    isSubmitting.value = false
  }
}

// Initialize on mount
onMounted(() => {
  initializeForm()
})

// Re-initialize when item prop changes
watch(() => props.item, initializeForm, { immediate: true })
</script>

<style scoped>
.btn {
  @apply inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed;
}

.input {
  @apply block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}
</style>