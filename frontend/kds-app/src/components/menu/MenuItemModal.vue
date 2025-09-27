<!--
  Menu Item Modal - Create/Edit menu items
  Comprehensive form for managing menu items with categories, pricing, and options
-->

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div
      class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-in"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-xl font-semibold text-gray-900">
          {{ isEditing ? 'Edit Menu Item' : 'Create New Menu Item' }}
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
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Left Column -->
            <div class="space-y-6">
              <!-- Item Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Item Name *
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="e.g., Grilled Chicken Sandwich"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  :class="{ 'border-red-500': errors.name }"
                />
                <p v-if="errors.name" class="mt-1 text-sm text-red-600">
                  {{ errors.name }}
                </p>
              </div>

              <!-- Category -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  v-model="form.categoryId"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  :class="{ 'border-red-500': errors.categoryId }"
                >
                  <option value="">Select a category</option>
                  <option
                    v-for="category in categories"
                    :key="category.id"
                    :value="category.id"
                  >
                    {{ category.name }}
                  </option>
                </select>
                <p v-if="errors.categoryId" class="mt-1 text-sm text-red-600">
                  {{ errors.categoryId }}
                </p>
              </div>

              <!-- Price -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Price (XOF) *
                </label>
                <div class="relative">
                  <input
                    v-model.number="form.price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    class="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :class="{ 'border-red-500': errors.price }"
                  />
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span class="text-gray-500 text-sm">XOF</span>
                  </div>
                </div>
                <p v-if="errors.price" class="mt-1 text-sm text-red-600">
                  {{ errors.price }}
                </p>
              </div>

              <!-- SKU -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  SKU
                </label>
                <input
                  v-model="form.sku"
                  type="text"
                  placeholder="e.g., MENU-001"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p class="text-xs text-gray-500 mt-1">
                  Leave empty to auto-generate
                </p>
              </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-6">
              <!-- Image Upload -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Item Image
                </label>
                <div class="flex flex-col items-center space-y-4">
                  <!-- Image Preview -->
                  <div class="w-40 h-40 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                    <img
                      v-if="imagePreview"
                      :src="imagePreview"
                      :alt="form.name"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex flex-col items-center justify-center">
                      <ImageIcon class="w-8 h-8 text-gray-400 mb-2" />
                      <span class="text-xs text-gray-500 text-center">No image</span>
                    </div>
                  </div>

                  <!-- Upload Controls -->
                  <div class="flex space-x-2">
                    <label class="cursor-pointer inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                      <Upload class="w-4 h-4 mr-2" />
                      Choose Image
                      <input
                        type="file"
                        class="hidden"
                        accept="image/*"
                        @change="handleImageUpload"
                      />
                    </label>
                    <button
                      v-if="imagePreview"
                      type="button"
                      @click="removeImage"
                      class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <p class="text-xs text-gray-500 text-center">
                    Recommended: 400x400px, max 2MB
                  </p>
                </div>
              </div>

              <!-- Availability & Options -->
              <div class="space-y-4">
                <div class="flex items-center">
                  <input
                    v-model="form.isAvailable"
                    type="checkbox"
                    id="isAvailable"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label for="isAvailable" class="ml-2 text-sm text-gray-700">
                    Available for ordering
                  </label>
                </div>

                <div class="flex items-center">
                  <input
                    v-model="form.isFeatured"
                    type="checkbox"
                    id="isFeatured"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label for="isFeatured" class="ml-2 text-sm text-gray-700">
                    Featured item
                  </label>
                </div>

                <div class="flex items-center">
                  <input
                    v-model="form.isVegetarian"
                    type="checkbox"
                    id="isVegetarian"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label for="isVegetarian" class="ml-2 text-sm text-gray-700">
                    Vegetarian
                  </label>
                </div>

                <div class="flex items-center">
                  <input
                    v-model="form.isSpicy"
                    type="checkbox"
                    id="isSpicy"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label for="isSpicy" class="ml-2 text-sm text-gray-700">
                    Spicy
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Detailed description of the menu item"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              :class="{ 'border-red-500': errors.description }"
            ></textarea>
            <p v-if="errors.description" class="mt-1 text-sm text-red-600">
              {{ errors.description }}
            </p>
          </div>

          <!-- Allergens -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Allergens
            </label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
              <label
                v-for="allergen in availableAllergens"
                :key="allergen"
                class="flex items-center"
              >
                <input
                  v-model="form.allergens"
                  :value="allergen"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-700">{{ allergen }}</span>
              </label>
            </div>
          </div>

          <!-- Preparation Time -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Preparation Time (minutes)
            </label>
            <input
              v-model.number="form.prepTime"
              type="number"
              min="1"
              step="1"
              placeholder="15"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
            {{ isEditing ? 'Update' : 'Create' }} Item
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  X,
  Upload,
  ImageIcon,
  Loader2
} from 'lucide-vue-next'

interface MenuItem {
  id?: string
  name: string
  description: string
  price: number
  categoryId: string
  sku: string
  imageUrl?: string
  isAvailable: boolean
  isFeatured: boolean
  isVegetarian: boolean
  isSpicy: boolean
  allergens: string[]
  prepTime?: number
  createdAt?: string
  updatedAt?: string
}

interface MenuCategory {
  id: string
  name: string
}

interface Props {
  item?: MenuItem | null
  categories: MenuCategory[]
}

interface Emits {
  (e: 'close'): void
  (e: 'save', item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Available allergens list
const availableAllergens = [
  'Gluten', 'Dairy', 'Eggs', 'Nuts', 'Peanuts',
  'Shellfish', 'Fish', 'Soy', 'Sesame'
]

// State
const loading = ref(false)
const imageFile = ref<File | null>(null)
const imagePreview = ref<string>('')

const form = reactive({
  name: '',
  description: '',
  price: 0,
  categoryId: '',
  sku: '',
  imageUrl: '',
  isAvailable: true,
  isFeatured: false,
  isVegetarian: false,
  isSpicy: false,
  allergens: [] as string[],
  prepTime: 15
})

const errors = reactive({
  name: '',
  description: '',
  price: '',
  categoryId: ''
})

// Computed
const isEditing = computed(() => !!props.item)

const isFormValid = computed(() => {
  return form.name.trim().length > 0 &&
         form.categoryId.length > 0 &&
         form.price > 0 &&
         !Object.values(errors).some(error => error)
})

// Methods
const validateForm = () => {
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  let isValid = true

  // Validate name
  if (!form.name.trim()) {
    errors.name = 'Item name is required'
    isValid = false
  } else if (form.name.length > 100) {
    errors.name = 'Item name must be less than 100 characters'
    isValid = false
  }

  // Validate category
  if (!form.categoryId) {
    errors.categoryId = 'Please select a category'
    isValid = false
  }

  // Validate price
  if (form.price <= 0) {
    errors.price = 'Price must be greater than 0'
    isValid = false
  } else if (form.price > 1000000) {
    errors.price = 'Price seems too high'
    isValid = false
  }

  // Validate description
  if (form.description.length > 500) {
    errors.description = 'Description must be less than 500 characters'
    isValid = false
  }

  return isValid
}

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file')
    return
  }

  // Validate file size (2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert('Image size must be less than 2MB')
    return
  }

  imageFile.value = file

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  imageFile.value = null
  imagePreview.value = ''
  form.imageUrl = ''
}

const uploadImage = async (): Promise<string | null> => {
  if (!imageFile.value) return form.imageUrl || null

  const formData = new FormData()
  formData.append('image', imageFile.value)

  try {
    const response = await fetch('/api/upload/menu-item-image', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) throw new Error('Failed to upload image')

    const data = await response.json()
    return data.url
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

const generateSKU = () => {
  if (!form.sku) {
    const prefix = 'MENU'
    const timestamp = Date.now().toString().slice(-6)
    return `${prefix}-${timestamp}`
  }
  return form.sku
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    // Upload image if new one selected
    let imageUrl = form.imageUrl
    if (imageFile.value) {
      imageUrl = await uploadImage() || ''
    }

    // Prepare item data
    const itemData = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: form.price,
      categoryId: form.categoryId,
      sku: generateSKU(),
      imageUrl: imageUrl || '',
      isAvailable: form.isAvailable,
      isFeatured: form.isFeatured,
      isVegetarian: form.isVegetarian,
      isSpicy: form.isSpicy,
      allergens: form.allergens,
      prepTime: form.prepTime || 15
    }

    emit('save', itemData)
  } catch (error) {
    console.error('Error saving menu item:', error)
    alert('Failed to save menu item. Please try again.')
  } finally {
    loading.value = false
  }
}

// Initialize form with existing data
onMounted(() => {
  if (props.item) {
    form.name = props.item.name
    form.description = props.item.description || ''
    form.price = props.item.price
    form.categoryId = props.item.categoryId
    form.sku = props.item.sku
    form.imageUrl = props.item.imageUrl || ''
    form.isAvailable = props.item.isAvailable
    form.isFeatured = props.item.isFeatured || false
    form.isVegetarian = props.item.isVegetarian || false
    form.isSpicy = props.item.isSpicy || false
    form.allergens = props.item.allergens || []
    form.prepTime = props.item.prepTime || 15

    if (form.imageUrl) {
      imagePreview.value = form.imageUrl
    }
  }
})

// Close modal on Escape key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emit('close')
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown)
}

import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown)
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