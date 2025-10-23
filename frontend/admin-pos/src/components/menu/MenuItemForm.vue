<!--
  MenuItemForm.vue
  Form component for creating and editing menu items with image upload,
  category selection, pricing, and availability controls.
-->
<template>
  <div class="menu-item-form">
    <h2 class="form-title">{{ isEdit ? 'Edit Menu Item' : 'New Menu Item' }}</h2>

    <form @submit.prevent="handleSubmit" class="form-content">
      <!-- Image Upload -->
      <div class="form-section">
        <label class="form-label">Item Image</label>
        <div class="image-upload-area">
          <div v-if="imagePreview" class="image-preview">
            <img :src="imagePreview" alt="Preview" />
            <button type="button" @click="removeImage" class="remove-image-btn">
              <X class="w-4 h-4" />
            </button>
          </div>
          <div v-else class="upload-placeholder" @click="triggerFileInput">
            <Upload class="w-8 h-8" />
            <p>Click to upload image</p>
            <span class="upload-hint">PNG, JPG up to 5MB</span>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleImageUpload"
            class="hidden"
          />
        </div>
      </div>

      <!-- Basic Information -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label required">Item Name</label>
          <input
            v-model="formData.name"
            type="text"
            placeholder="e.g., Grilled Chicken"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label required">Category</label>
          <div class="category-select-wrapper">
            <select v-model="formData.categoryId" class="form-select" required>
              <option value="">Select Category</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
            <button
              type="button"
              @click="openCategoryModal"
              class="btn-icon"
              title="Manage Categories"
            >
              <Plus class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea
          v-model="formData.description"
          placeholder="Brief description of the dish..."
          rows="3"
          class="form-textarea"
        ></textarea>
      </div>

      <!-- Pricing & Stock -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label required">Price (XOF)</label>
          <input
            v-model.number="formData.price"
            type="number"
            min="0"
            step="100"
            placeholder="0"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Stock / Available</label>
          <input
            v-model.number="formData.stock"
            type="number"
            min="0"
            placeholder="0"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Preparation Time (min)</label>
          <input
            v-model.number="formData.prepTime"
            type="number"
            min="0"
            placeholder="15"
            class="form-input"
          />
        </div>
      </div>

      <!-- Toggles -->
      <div class="form-toggles">
        <label class="toggle-item">
          <input v-model="formData.isAvailable" type="checkbox" class="toggle-checkbox" />
          <span class="toggle-label">Available for Order</span>
        </label>

        <label class="toggle-item">
          <input v-model="formData.isFeatured" type="checkbox" class="toggle-checkbox" />
          <span class="toggle-label">Featured Item</span>
        </label>

        <label class="toggle-item">
          <input v-model="formData.isSpicy" type="checkbox" class="toggle-checkbox" />
          <span class="toggle-label">Spicy</span>
        </label>

        <label class="toggle-item">
          <input v-model="formData.isVegetarian" type="checkbox" class="toggle-checkbox" />
          <span class="toggle-label">Vegetarian</span>
        </label>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" class="btn-secondary">
          Cancel
        </button>
        <button type="submit" class="btn-primary" :disabled="isSubmitting">
          <Loader v-if="isSubmitting" class="w-4 h-4 animate-spin" />
          <span v-else>{{ isEdit ? 'Update Item' : 'Create Item' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Upload, X, Plus, Loader } from 'lucide-vue-next'
import { useMenuStore } from '@/stores/menu'
import { useToast } from 'vue-toastification'

interface MenuItem {
  id?: number
  name: string
  description: string
  price: number
  categoryId: number | string
  imageUrl?: string
  stock?: number
  prepTime?: number
  isAvailable: boolean
  isFeatured: boolean
  isSpicy: boolean
  isVegetarian: boolean
}

interface Props {
  item?: MenuItem
  isEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false
})

const emit = defineEmits(['submit', 'cancel', 'open-category-modal'])

const menuStore = useMenuStore()
const toast = useToast()

const fileInput = ref<HTMLInputElement | null>(null)
const imagePreview = ref<string>('')
const imageFile = ref<File | null>(null)
const isSubmitting = ref(false)

const formData = ref<MenuItem>({
  name: '',
  description: '',
  price: 0,
  categoryId: '',
  stock: 0,
  prepTime: 15,
  isAvailable: true,
  isFeatured: false,
  isSpicy: false,
  isVegetarian: false
})

const categories = computed(() => menuStore.categories || [])

// Initialize form with existing item data if editing
watch(() => props.item, (newItem) => {
  if (newItem && props.isEdit) {
    formData.value = {
      ...newItem,
      categoryId: newItem.categoryId || ''
    }
    imagePreview.value = newItem.imageUrl || ''
  }
}, { immediate: true })

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    imageFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const removeImage = () => {
  imagePreview.value = ''
  imageFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const openCategoryModal = () => {
  emit('open-category-modal')
}

const handleSubmit = async () => {
  if (!formData.value.name || !formData.value.categoryId || !formData.value.price) {
    toast.error('Please fill in all required fields')
    return
  }

  isSubmitting.value = true

  try {
    const submitData = {
      ...formData.value,
      imageFile: imageFile.value
    }

    emit('submit', submitData)
  } catch (error) {
    console.error('Form submission error:', error)
    toast.error('Failed to submit form')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  // Fetch categories if not already loaded
  if (!menuStore.categories || menuStore.categories.length === 0) {
    await menuStore.fetchCategories()
  }
})
</script>

<style scoped>
.menu-item-form {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.form-label.required::after {
  content: ' *';
  color: var(--accent-red);
}

.image-upload-area {
  width: 100%;
  height: 200px;
  border: 2px dashed var(--border);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.image-preview {
  width: 100%;
  height: 100%;
  position: relative;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.remove-image-btn:hover {
  background: rgba(0, 0, 0, 0.9);
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

.upload-placeholder:hover {
  background: var(--bg-tertiary);
}

.upload-placeholder .w-8 {
  color: var(--text-tertiary);
}

.upload-placeholder p {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.upload-hint {
  color: var(--text-tertiary);
  font-size: 0.75rem;
}

.hidden {
  display: none;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-select-wrapper {
  display: flex;
  gap: 0.5rem;
}

.form-select {
  flex: 1;
}

.btn-icon {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 6px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-primary);
}

.btn-icon:hover {
  background: var(--accent-orange);
  border-color: var(--accent-orange);
}

.form-input,
.form-select,
.form-textarea {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.625rem 0.875rem;
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent-orange);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.form-toggles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: 8px;
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.toggle-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--accent-orange);
}

.toggle-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  user-select: none;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.btn-secondary {
  padding: 0.625rem 1.5rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: var(--bg-primary);
}

.btn-primary {
  padding: 0.625rem 1.5rem;
  background: var(--accent-orange);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  background: #ff8555;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .menu-item-form {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-toggles {
    grid-template-columns: 1fr;
  }
}
</style>
