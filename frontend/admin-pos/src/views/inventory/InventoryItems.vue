<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-900 text-gray-100">
    <!-- Header -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-white">Inventory Items</h1>
        <div class="flex items-center gap-3">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search items..."
            class="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="searchItems"
          />
          <button
            @click="loadItems"
            :disabled="isLoading"
            class="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <RotateCw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
          </button>
          <button
            @click="showAddModal = true"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus class="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>
    </div>

    <!-- Items List -->
    <div class="flex-1 overflow-y-auto p-6">
      <div v-if="items.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="item in items"
          :key="item.id"
          class="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors border"
          :class="item.isLowStock ? 'border-red-500' : 'border-gray-700'"
        >
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1">
              <h3 class="text-white font-medium">{{ item.name }}</h3>
              <p class="text-sm text-gray-400">SKU: {{ item.sku }}</p>
              <p class="text-sm text-gray-400">{{ item.categoryName }}</p>
            </div>
            <span v-if="item.isLowStock" class="bg-red-900 text-red-400 text-xs px-2 py-1 rounded-full">
              Low Stock
            </span>
          </div>

          <div class="mt-3 space-y-1">
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">On Hand:</span>
              <span class="text-white font-medium">{{ item.totalStockOnHand || 0 }} {{ item.unitDisplay }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">Available:</span>
              <span class="text-white font-medium">{{ item.totalStockAvailable || 0 }} {{ item.unitDisplay }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">Cost/Unit:</span>
              <span class="text-white font-medium">${{ item.costPerUnit }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">Reorder Point:</span>
              <span class="text-white font-medium">{{ item.reorderPoint }}</span>
            </div>
          </div>

          <div class="mt-3 flex gap-2">
            <button
              @click="editItem(item)"
              class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
            >
              Edit
            </button>
            <button
              @click="deleteItem(item.id)"
              class="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="!isLoading" class="text-center py-12">
        <Package class="w-16 h-16 mx-auto text-gray-600 mb-4" />
        <p class="text-gray-400">No inventory items found</p>
        <button
          @click="showAddModal = true"
          class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Add Your First Item
        </button>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-white">{{ editingItem ? 'Edit Item' : 'Add New Item' }}</h2>
            <button @click="closeModal" class="text-gray-400 hover:text-white">
              <X class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="saveItem" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">SKU *</label>
                <input
                  v-model="formData.sku"
                  type="text"
                  required
                  class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                <input
                  v-model="formData.name"
                  type="text"
                  required
                  class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                v-model="formData.description"
                rows="2"
                class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                <select
                  v-model.number="formData.categoryId"
                  required
                  class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Unit *</label>
                <select
                  v-model="formData.unit"
                  required
                  class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="KILOGRAM">Kilogram (kg)</option>
                  <option value="GRAM">Gram (g)</option>
                  <option value="LITER">Liter (L)</option>
                  <option value="PIECE">Piece</option>
                  <option value="BOX">Box</option>
                  <option value="BAG">Bag</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Cost/Unit *</label>
                <input
                  v-model.number="formData.costPerUnit"
                  type="number"
                  step="0.01"
                  required
                  class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Reorder Point *</label>
                <input
                  v-model.number="formData.reorderPoint"
                  type="number"
                  step="0.01"
                  required
                  class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Reorder Qty *</label>
                <input
                  v-model.number="formData.reorderQuantity"
                  type="number"
                  step="0.01"
                  required
                  class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSaving"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {{ isSaving ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RotateCw, Plus, Package, X } from 'lucide-vue-next'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080'

// State
const items = ref<any[]>([])
const categories = ref<any[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const searchQuery = ref('')
const showAddModal = ref(false)
const editingItem = ref<any>(null)

const formData = ref({
  sku: '',
  name: '',
  description: '',
  categoryId: null,
  unit: 'PIECE',
  costPerUnit: 0,
  reorderPoint: 0,
  reorderQuantity: 0,
  supplierId: null
})

// Methods
const loadItems = async () => {
  isLoading.value = true
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/inventory/items?activeOnly=true`)
    items.value = response.data
  } catch (error) {
    console.error('Failed to load items:', error)
    toast.error('Failed to load inventory items')
  } finally {
    isLoading.value = false
  }
}

const loadCategories = async () => {
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/inventory/items`)  // Placeholder - need category endpoint
    // For now, mock categories
    categories.value = [
      { id: 1, name: 'Produce' },
      { id: 2, name: 'Dairy' },
      { id: 3, name: 'Meat & Seafood' },
      { id: 4, name: 'Baking Supplies' },
      { id: 5, name: 'Beverages' }
    ]
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

const searchItems = async () => {
  if (searchQuery.value.length > 2) {
    try {
      const response = await axios.get(`${API_GATEWAY_URL}/api/inventory/items/search?q=${searchQuery.value}`)
      items.value = response.data
    } catch (error) {
      console.error('Search failed:', error)
    }
  } else if (searchQuery.value.length === 0) {
    loadItems()
  }
}

const editItem = (item: any) => {
  editingItem.value = item
  formData.value = {
    sku: item.sku,
    name: item.name,
    description: item.description || '',
    categoryId: item.categoryId,
    unit: item.unit,
    costPerUnit: item.costPerUnit,
    reorderPoint: item.reorderPoint,
    reorderQuantity: item.reorderQuantity,
    supplierId: item.supplierId
  }
  showAddModal.value = true
}

const saveItem = async () => {
  isSaving.value = true
  try {
    if (editingItem.value) {
      await axios.put(`${API_GATEWAY_URL}/api/inventory/items/${editingItem.value.id}`, formData.value)
      toast.success('Item updated successfully')
    } else {
      await axios.post(`${API_GATEWAY_URL}/api/inventory/items`, formData.value)
      toast.success('Item created successfully')
    }
    closeModal()
    loadItems()
  } catch (error: any) {
    console.error('Failed to save item:', error)
    toast.error(error.response?.data?.message || 'Failed to save item')
  } finally {
    isSaving.value = false
  }
}

const deleteItem = async (id: number) => {
  if (confirm('Are you sure you want to delete this item?')) {
    try {
      await axios.delete(`${API_GATEWAY_URL}/api/inventory/items/${id}`)
      toast.success('Item deleted successfully')
      loadItems()
    } catch (error) {
      console.error('Failed to delete item:', error)
      toast.error('Failed to delete item')
    }
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingItem.value = null
  formData.value = {
    sku: '',
    name: '',
    description: '',
    categoryId: null,
    unit: 'PIECE',
    costPerUnit: 0,
    reorderPoint: 0,
    reorderQuantity: 0,
    supplierId: null
  }
}

// Lifecycle
onMounted(() => {
  loadItems()
  loadCategories()
})
</script>
