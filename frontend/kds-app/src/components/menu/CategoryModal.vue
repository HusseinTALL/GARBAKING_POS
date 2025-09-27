<!--
  Category Modal - Create/Edit menu categories
  Form for managing menu categories with validation and image upload
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
          {{ isEditing ? 'Edit Category' : 'Create New Category' }}
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
          <!-- Category Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Category Name *
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="e.g., Appetizers, Main Courses"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :class="{ 'border-red-500': errors.name }"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-600">
              {{ errors.name }}
            </p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Brief description of this category"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              :class="{ 'border-red-500': errors.description }"
            ></textarea>
            <p v-if="errors.description" class="mt-1 text-sm text-red-600">
              {{ errors.description }}
            </p>
          </div>

          <!-- Image Upload -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Category Image
            </label>
            <div class="flex items-start space-x-4">
              <!-- Image Preview -->
              <div class="flex-shrink-0">
                <div class="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                  <img
                    v-if="imagePreview"
                    :src="imagePreview"
                    :alt="form.name"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <ImageIcon class="w-6 h-6 text-gray-400" />
                  </div>
                </div>
              </div>

              <!-- Upload Controls -->
              <div class="flex-1">
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
                <p class="text-xs text-gray-500 mt-1">
                  Recommended: 400x300px, max 2MB
                </p>
              </div>
            </div>
          </div>

          <!-- Display Order -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Display Order
            </label>
            <input
              v-model.number="form.displayOrder"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p class="text-xs text-gray-500 mt-1">
              Lower numbers appear first in the menu
            </p>
          </div>

          <!-- Active Status -->
          <div class="flex items-center">
            <input
              v-model="form.isActive"
              type="checkbox"
              id="isActive"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="isActive" class="ml-2 text-sm text-gray-700">
              Active (visible in customer menu)
            </label>
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
            {{ isEditing ? 'Update' : 'Create' }} Category
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

interface MenuCategory {
  id?: string
  name: string
  description: string
  imageUrl?: string
  displayOrder: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

interface Props {
  category?: MenuCategory | null
}

interface Emits {
  (e: 'close'): void
  (e: 'save', category: Omit<MenuCategory, 'id' | 'createdAt' | 'updatedAt'>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const loading = ref(false)
const imageFile = ref<File | null>(null)
const imagePreview = ref<string>('')

const form = reactive({
  name: '',
  description: '',
  imageUrl: '',
  displayOrder: 0,
  isActive: true
})

const errors = reactive({
  name: '',
  description: ''
})

// Computed
const isEditing = computed(() => !!props.category)

const isFormValid = computed(() => {
  return form.name.trim().length > 0 && !Object.values(errors).some(error => error)
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
    errors.name = 'Category name is required'
    isValid = false
  } else if (form.name.length > 50) {
    errors.name = 'Category name must be less than 50 characters'
    isValid = false
  }

  // Validate description
  if (form.description.length > 200) {
    errors.description = 'Description must be less than 200 characters'
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
    const response = await fetch('/api/upload/category-image', {
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

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    // Upload image if new one selected
    let imageUrl = form.imageUrl
    if (imageFile.value) {
      imageUrl = await uploadImage() || ''
    }

    // Prepare category data
    const categoryData = {
      name: form.name.trim(),
      description: form.description.trim(),
      imageUrl: imageUrl || '',
      displayOrder: form.displayOrder,
      isActive: form.isActive
    }

    emit('save', categoryData)
  } catch (error) {
    console.error('Error saving category:', error)
    alert('Failed to save category. Please try again.')
  } finally {
    loading.value = false
  }
}

// Initialize form with existing data
onMounted(() => {
  if (props.category) {
    form.name = props.category.name
    form.description = props.category.description || ''
    form.imageUrl = props.category.imageUrl || ''
    form.displayOrder = props.category.displayOrder || 0
    form.isActive = props.category.isActive

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