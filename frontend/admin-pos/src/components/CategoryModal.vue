<!--
  Category management modal for creating and editing menu categories
  Provides form validation, image upload, and comprehensive category management
-->

<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div class="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-700">
        <h2 class="text-2xl font-bold text-white">
          {{ isEditing ? 'Edit Category' : 'Add Category' }}
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
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <!-- Category Name -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Category Name *
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="input w-full"
              placeholder="e.g., Beverages, Main Dishes, Desserts"
              :class="{ 'border-red-500': errors.name }"
            />
            <p v-if="errors.name" class="text-red-400 text-sm mt-1">{{ errors.name }}</p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              class="input w-full resize-none"
              placeholder="Brief description of this category..."
              :class="{ 'border-red-500': errors.description }"
            ></textarea>
            <p v-if="errors.description" class="text-red-400 text-sm mt-1">{{ errors.description }}</p>
          </div>

          <!-- Sort Order -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Sort Order
            </label>
            <input
              v-model.number="form.sortOrder"
              type="number"
              min="0"
              class="input w-full"
              placeholder="0"
              :class="{ 'border-red-500': errors.sortOrder }"
            />
            <p class="text-gray-400 text-sm mt-1">Lower numbers appear first in the menu</p>
            <p v-if="errors.sortOrder" class="text-red-400 text-sm mt-1">{{ errors.sortOrder }}</p>
          </div>

          <!-- Category Image -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Category Image
            </label>
            <div class="space-y-3">
              <!-- Image Preview -->
              <div v-if="form.imageUrl || imagePreview" class="relative">
                <img
                  :src="imagePreview || form.imageUrl"
                  alt="Category preview"
                  class="w-32 h-32 object-cover rounded-lg border border-gray-600"
                />
                <button
                  type="button"
                  @click="clearImage"
                  class="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>

              <!-- File Upload -->
              <div>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleFileSelect"
                  class="hidden"
                />
                <button
                  type="button"
                  @click="$refs.fileInput.click()"
                  class="btn btn-secondary w-full"
                >
                  <Upload class="w-4 h-4 mr-2" />
                  {{ selectedFile ? selectedFile.name : 'Choose Image File' }}
                </button>
                <p class="text-gray-400 text-sm mt-1">JPG, PNG, or WebP (max 5MB)</p>
              </div>

              <div class="text-center text-gray-500 text-sm">OR</div>

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

          <!-- Error Message -->
          <div v-if="submitError" class="p-4 bg-red-900/50 border border-red-700 rounded-lg">
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
              {{ isEditing ? 'Update Category' : 'Create Category' }}
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { X, Upload } from 'lucide-vue-next'
import { useMenuStore, type MenuCategory, type CategoryForm } from '@/stores/menu'
import { uploadService } from '@/services/uploadService'
import { useToast } from 'vue-toastification'

interface Props {
  category?: MenuCategory | null
}

const props = withDefaults(defineProps<Props>(), {
  category: null
})

const emit = defineEmits<{
  close: []
  success: [category: MenuCategory]
}>()

const menuStore = useMenuStore()
const toast = useToast()

// Form state
const form = ref<CategoryForm>({
  name: '',
  description: '',
  sortOrder: 0,
  imageUrl: ''
})

const errors = ref<Record<string, string>>({})
const submitError = ref('')
const isSubmitting = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const imagePreview = ref<string>('')

// Computed
const isEditing = computed(() => !!props.category)
const isFormValid = computed(() => {
  return form.value.name.trim().length > 0 && Object.keys(errors.value).length === 0
})

// Form validation
const validateForm = () => {
  errors.value = {}

  if (!form.value.name.trim()) {
    errors.value.name = 'Category name is required'
  } else if (form.value.name.trim().length < 2) {
    errors.value.name = 'Category name must be at least 2 characters'
  }

  if (form.value.description && form.value.description.length > 500) {
    errors.value.description = 'Description must be less than 500 characters'
  }

  if (form.value.sortOrder < 0) {
    errors.value.sortOrder = 'Sort order must be 0 or greater'
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

// File handling
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    selectedFile.value = file

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const clearImage = () => {
  form.value.imageUrl = ''
  imagePreview.value = ''
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Initialize form
const initializeForm = () => {
  if (props.category) {
    form.value = {
      name: props.category.name,
      description: props.category.description,
      sortOrder: props.category.sortOrder,
      imageUrl: props.category.imageUrl || ''
    }
  } else {
    // Set default sort order to be last
    const maxSortOrder = Math.max(...menuStore.categories.map(cat => cat.sortOrder), -1)
    form.value = {
      name: '',
      description: '',
      sortOrder: maxSortOrder + 1,
      imageUrl: ''
    }
  }
  errors.value = {}
  submitError.value = ''
  imagePreview.value = ''
  selectedFile.value = null
}

// Handle form submission
const handleSubmit = async () => {
  validateForm()
  if (!isFormValid.value) return

  isSubmitting.value = true
  submitError.value = ''

  try {
    // Handle file upload if selectedFile exists
    let uploadedImageUrl = form.value.imageUrl
    if (selectedFile.value) {
      toast.info('Uploading image...')
      const uploadedImage = await uploadService.uploadImage(selectedFile.value, 'categories')

      uploadedImageUrl = uploadedImage.url
      const savedPercentage = typeof uploadedImage.savedPercentage === 'number'
        ? Math.round(uploadedImage.savedPercentage)
        : null

      if (savedPercentage !== null) {
        toast.success(`Image uploaded (saved ${savedPercentage}% space)`)
      } else {
        toast.success('Image uploaded successfully')
      }
    }

    let result: MenuCategory

    const categoryData = {
      ...form.value,
      imageUrl: uploadedImageUrl
    }

    if (isEditing.value && props.category) {
      result = await menuStore.updateCategory(props.category.id, categoryData)
    } else {
      result = await menuStore.createCategory(categoryData)
    }

    emit('success', result)
    emit('close')
  } catch (error: any) {
    submitError.value = error.message || 'An error occurred while saving the category'
    toast.error(submitError.value)
  } finally {
    isSubmitting.value = false
  }
}

// Initialize on mount
onMounted(() => {
  initializeForm()
})

// Re-initialize when category prop changes
watch(() => props.category, initializeForm, { immediate: true })
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