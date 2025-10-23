<!--
  Menu management view for adding, editing, and organizing menu items and categories
  Provides comprehensive CRUD operations with real-time updates -->

<template>
  <div class="h-full flex flex-col bg-gray-900 text-gray-100">
    <!-- Header -->
    <div class="flex-shrink-0 p-6 border-b border-gray-700 bg-gray-800 shadow">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Menu Management</h1>
          <p class="text-sm text-gray-400 mt-1">
            Manage your restaurant's menu categories and items
          </p>
        </div>
        <div class="flex gap-3">
          <!-- Import/Export Dropdown -->
          <div class="relative" ref="importExportDropdown">
            <button
              @click="showImportExportMenu = !showImportExportMenu"
              class="btn btn-secondary"
            >
              <FileDown class="w-4 h-4 mr-2" />
              Import/Export
            </button>
            <!-- Dropdown Menu -->
            <div
              v-if="showImportExportMenu"
              class="absolute right-0 mt-2 w-56 rounded-lg bg-gray-800 border border-gray-700 shadow-lg z-10"
            >
              <div class="p-2">
                <button
                  @click="exportToCSV"
                  class="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded flex items-center gap-2"
                >
                  <Download class="w-4 h-4" />
                  Export to CSV
                </button>
                <button
                  @click="downloadTemplate"
                  class="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded flex items-center gap-2"
                >
                  <FileText class="w-4 h-4" />
                  Download Template
                </button>
                <button
                  @click="triggerImport"
                  class="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded flex items-center gap-2"
                >
                  <Upload class="w-4 h-4" />
                  Import from CSV
                </button>
              </div>
            </div>
          </div>
          <button @click="showCategoryModal = true" class="btn btn-secondary">
            <Plus class="w-4 h-4 mr-2" />
            Add Category
          </button>
          <button @click="showItemModal = true" class="btn btn-primary">
            <Plus class="w-4 h-4 mr-2" />
            Add Item
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1 flex overflow-hidden">
      <!-- Categories Sidebar -->
      <div class="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div class="p-4 border-b border-gray-700">
          <h2 class="font-semibold text-white">Categories</h2>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-2">
          <!-- All Items -->
          <button
            @click="menuStore.setSelectedCategory(null)"
            :class="[
              'w-full text-left p-3 rounded-lg transition-colors border',
              !menuStore.selectedCategory
                ? 'bg-blue-900 text-blue-400 border-blue-600'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600'
            ]"
          >
            <div class="flex items-center justify-between">
              <span class="font-medium">All Items</span>
              <span class="text-sm text-gray-400">{{ menuStore.menuItems.length }}</span>
            </div>
          </button>

          <!-- Category List -->
          <div
            v-for="category in menuStore.categoriesWithCounts"
            :key="category.id"
            class="group"
          >
            <button
              @click="menuStore.setSelectedCategory(category.id)"
              :class="[
                'w-full text-left p-3 rounded-lg border performance-optimized',
                menuStore.selectedCategory === category.id
                  ? 'bg-blue-900 text-blue-400 border-blue-600'
                  : 'bg-gray-700 text-gray-300 border-gray-600'
              ]"
              style="transition: background-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94); transform: translate3d(0, 0, 0); will-change: transform, background-color;"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                  <h3 class="font-medium truncate">{{ category.name }}</h3>
                  <p class="text-sm text-gray-500 truncate">{{ category.description }}</p>
                </div>
                <div class="flex items-center gap-2 ml-2">
                  <span class="text-sm text-gray-400">{{ category.itemCount }}</span>
                  <div class="opacity-0 group-hover:opacity-100 performance-optimized"
                       style="transition: opacity 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change: opacity;">
                    <button
                      @click.stop="editCategory(category)"
                      class="p-1 rounded interactive-fast"
                    >
                      <Edit class="w-3 h-3 text-gray-300" />
                    </button>
                  </div>
                </div>
              </div>
            </button>
          </div>

          <!-- Loading state -->
          <div v-if="menuStore.loading" class="text-center py-4">
            <div
              class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"
            ></div>
          </div>
        </div>
      </div>

      <!-- Menu Items Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Filters and Search -->
        <div class="p-4 border-b border-gray-700 bg-gray-800">
          <div class="flex flex-col gap-4">
            <!-- Top row: Search and filters -->
            <div class="flex items-center gap-4">
              <div class="flex-1 relative">
                <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search menu items..."
                  class="input w-full pl-10"
                />
              </div>
              <select v-model="availabilityFilter" class="input">
                <option value="all">All Items</option>
                <option value="available">Available Only</option>
                <option value="unavailable">Unavailable Only</option>
              </select>
              <select v-model="sortBy" class="input">
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="category">Sort by Category</option>
                <option value="created">Sort by Created Date</option>
              </select>
              <button
                @click="refreshMenu"
                class="btn btn-secondary"
                :disabled="menuStore.loading"
              >
                <RotateCcw class="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>

            <!-- Bottom row: Bulk actions (shown when items selected) -->
            <div v-if="selectedItems.length > 0" class="flex items-center justify-between bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
              <div class="flex items-center gap-3">
                <span class="text-blue-400 text-sm font-medium">
                  {{ selectedItems.length }} item{{ selectedItems.length === 1 ? '' : 's' }} selected
                </span>
                <button
                  @click="selectAll"
                  class="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Select All ({{ filteredAndSortedItems.length }})
                </button>
                <button
                  @click="clearSelection"
                  class="text-gray-400 hover:text-gray-300 text-sm"
                >
                  Clear Selection
                </button>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="bulkToggleAvailability(true)"
                  class="btn btn-sm bg-green-600 hover:bg-green-500 text-white"
                >
                  <Check class="w-3 h-3 mr-1" />
                  Enable Selected
                </button>
                <button
                  @click="bulkToggleAvailability(false)"
                  class="btn btn-sm bg-yellow-600 hover:bg-yellow-500 text-white"
                >
                  <X class="w-3 h-3 mr-1" />
                  Disable Selected
                </button>
                <button
                  @click="confirmBulkDelete"
                  class="btn btn-sm bg-red-600 hover:bg-red-500 text-white"
                >
                  <Trash2 class="w-3 h-3 mr-1" />
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Menu Items Grid -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Auth Error Banner -->
          <div v-if="menuStore.error && (menuStore.error.includes('Session expired') || menuStore.error.includes('Admin or Manager role'))"
               class="mb-6 p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg">
            <div class="flex items-center gap-3">
              <AlertTriangle class="w-5 h-5 text-yellow-400" />
              <div>
                <h3 class="font-medium text-yellow-200">Authentication Required</h3>
                <p class="text-sm text-yellow-300 mt-1">{{ menuStore.error }}</p>
                <div class="mt-3 flex gap-2">
                  <button @click="goToLogin" class="text-sm bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded">
                    Go to Login
                  </button>
                  <button @click="menuStore.clearError()" class="text-sm bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div
            v-if="filteredAndSortedItems.length === 0"
            class="text-center py-12"
          >
            <Utensils class="w-20 h-20 text-gray-600 mb-4" />
            <h3 class="text-lg font-medium text-gray-200 mb-2">
              No menu items found
            </h3>
            <p class="text-gray-400 mb-4">
              {{
                searchQuery
                  ? "Try adjusting your search criteria"
                  : "Start by adding your first menu item"
              }}
            </p>
            <button
              v-if="!searchQuery"
              @click="showItemModal = true"
              class="btn btn-primary"
            >
              <Plus class="w-4 h-4 mr-2" />
              Add First Item
            </button>
          </div>

          <!-- Items -->
          <div
            v-else
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <div
              v-for="item in filteredAndSortedItems"
              :key="item.id"
              :class="[
                'bg-gray-800 rounded-xl border border-gray-700 shadow card-hover performance-optimized relative transition-all duration-200',
                selectedItems.includes(item.id) ? 'ring-2 ring-blue-500 border-blue-500' : ''
              ]"
            >
              <!-- Selection Checkbox -->
              <div class="absolute top-3 left-3 z-10">
                <input
                  type="checkbox"
                  :checked="selectedItems.includes(item.id)"
                  @change="toggleItemSelection(item.id)"
                  class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
              </div>

              <!-- Item Image -->
              <div class="aspect-video bg-gray-700 rounded-t-xl overflow-hidden relative">
                <img
                  v-if="item.imageUrl"
                  :src="item.imageUrl"
                  :alt="item.name"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center"
                >
                  <Utensils class="w-12 h-12 text-gray-500" />
                </div>

                <!-- Availability Badge -->
                <div class="absolute top-3 right-3">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded-full',
                      item.isAvailable
                        ? 'bg-green-500/90 text-white'
                        : 'bg-red-500/90 text-white'
                    ]"
                  >
                    {{ item.isAvailable ? 'Available' : 'Unavailable' }}
                  </span>
                </div>
              </div>

              <!-- Item Details -->
              <div class="p-4">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-white truncate">
                      {{ item.name }}
                    </h3>
                    <p class="text-xs text-gray-500 mt-1">SKU: {{ item.sku }}</p>
                  </div>
                  <div class="flex items-center gap-1 ml-2">
                    <!-- Quick Availability Toggle -->
                    <button
                      @click="toggleAvailability(item)"
                      :class="[
                        'w-6 h-6 rounded-full border-2 interactive-fast flex items-center justify-center',
                        item.isAvailable
                          ? 'bg-green-500 border-green-500 hover:bg-green-600'
                          : 'bg-gray-600 border-gray-600 hover:bg-gray-500'
                      ]"
                      :title="item.isAvailable ? 'Click to disable' : 'Click to enable'"
                    >
                      <Check
                        v-if="item.isAvailable"
                        class="w-3 h-3 text-white"
                      />
                      <X
                        v-else
                        class="w-3 h-3 text-white"
                      />
                    </button>
                  </div>
                </div>

                <p class="text-sm text-gray-400 mb-3 line-clamp-2" :title="item.description">
                  {{ item.description }}
                </p>

                <!-- Price and Category -->
                <div class="flex items-center justify-between mb-3">
                  <div class="text-lg font-bold text-green-400">
                    {{ formatCurrency(item.price) }}
                  </div>
                  <span class="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                    {{ getCategoryName(item.categoryId) }}
                  </span>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar class="w-3 h-3" />
                    <span>{{ formatDate(item.createdAt) }}</span>
                  </div>
                  <div class="flex gap-1">
                    <button
                      @click="editItem(item)"
                      class="p-2 text-gray-400 hover:text-blue-400 interactive-fast rounded"
                      title="Edit item"
                    >
                      <Edit class="w-4 h-4" />
                    </button>
                    <button
                      @click="duplicateItem(item)"
                      class="p-2 text-gray-400 hover:text-yellow-400 interactive-fast rounded"
                      title="Duplicate item"
                    >
                      <Copy class="w-4 h-4" />
                    </button>
                    <button
                      @click="confirmDeleteItem(item)"
                      class="p-2 text-gray-400 hover:text-red-400 interactive-fast rounded"
                      title="Delete item"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Modal -->
    <CategoryModal
      v-if="showCategoryModal"
      :category="editingCategory"
      @close="closeCategoryModal"
      @success="handleCategorySuccess"
    />

    <!-- Menu Item Modal -->
    <MenuItemModal
      v-if="showItemModal"
      :item="editingItem"
      @close="closeItemModal"
      @success="handleItemSuccess"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      v-if="showDeleteConfirm"
      :title="deleteConfirmTitle"
      :message="deleteConfirmMessage"
      :is-destructive="true"
      :is-loading="isDeleting || isBulkDeleting"
      :icon="Trash2"
      :confirm-text="deletingItem?.id === 'bulk-delete' ? 'Delete Selected Items' : 'Delete Item'"
      :loading-text="deletingItem?.id === 'bulk-delete' ? 'Deleting Items...' : 'Deleting...'"
      @confirm="handleDeleteConfirm"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from 'vue-router';
import {
  Plus, RotateCcw, Utensils, Check, Edit, Trash2, Search, X, Copy, Calendar,
  AlertTriangle, FileDown, Download, Upload, FileText
} from "lucide-vue-next";
import { useMenuStore, type MenuCategory, type MenuItem } from '@/stores/menu'
import CategoryModal from '@/components/CategoryModal.vue'
import MenuItemModal from '@/components/MenuItemModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { useToast } from 'vue-toastification'
import {
  exportMenuItemsToCSV,
  parseCSVToMenuItems,
  downloadCSV,
  generateCSVTemplate
} from '@/utils/menuCsvUtils'

// Stores and composables
const menuStore = useMenuStore()
const toast = useToast()
const router = useRouter()

// State
const showCategoryModal = ref(false)
const showItemModal = ref(false)
const showDeleteConfirm = ref(false)
const showImportExportMenu = ref(false)

const editingCategory = ref<MenuCategory | null>(null)
const editingItem = ref<MenuItem | null>(null)
const deletingItem = ref<MenuItem | null>(null)
const isDeleting = ref(false)

const searchQuery = ref('')
const sortBy = ref('name')
const availabilityFilter = ref('all')
const selectedItems = ref<string[]>([])
const isBulkDeleting = ref(false)
const importExportDropdown = ref<HTMLElement | null>(null)
const csvFileInput = ref<HTMLInputElement | null>(null)

// Filtering + Sorting
const filteredAndSortedItems = computed(() => {
  let items = menuStore.selectedCategory
    ? menuStore.filteredMenuItems
    : menuStore.menuItems

  // Apply search filter
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    items = items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q) ||
        i.sku?.toLowerCase().includes(q)
    )
  }

  // Apply availability filter
  if (availabilityFilter.value !== 'all') {
    items = items.filter(i =>
      availabilityFilter.value === 'available' ? i.isAvailable : !i.isAvailable
    )
  }

  // Sort items
  return [...items].sort((a, b) => {
    switch (sortBy.value) {
      case 'price':
        return a.price - b.price
      case 'category':
        return a.categoryId.localeCompare(b.categoryId)
      case 'created':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      default:
        return a.name.localeCompare(b.name)
    }
  })
})

// Methods
const refreshMenu = async () => {
  try {
    await menuStore.refreshMenu()
    toast.success('Menu refreshed successfully')
  } catch (error) {
    toast.error('Failed to refresh menu')
  }
}

const toggleAvailability = async (item: MenuItem) => {
  try {
    await menuStore.toggleItemAvailability(item.id, !item.isAvailable)
    toast.success(`${item.name} ${item.isAvailable ? 'enabled' : 'disabled'}`)
  } catch (error) {
    toast.error('Failed to update item availability')
  }
}

const editCategory = (category: MenuCategory) => {
  editingCategory.value = category
  showCategoryModal.value = true
}

const editItem = (item: MenuItem) => {
  editingItem.value = item
  showItemModal.value = true
}

const confirmDeleteItem = (item: MenuItem) => {
  deletingItem.value = item
  showDeleteConfirm.value = true
}

const handleDeleteConfirm = async () => {
  if (!deletingItem.value) return

  // Handle bulk delete
  if (deletingItem.value.id === 'bulk-delete') {
    await handleBulkDelete()
    return
  }

  // Handle single item delete
  isDeleting.value = true
  try {
    await menuStore.deleteMenuItem(deletingItem.value.id)
    toast.success('Menu item deleted successfully')
    cancelDelete()
  } catch (error) {
    toast.error('Failed to delete menu item')
    isDeleting.value = false
  }
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  deletingItem.value = null
  isDeleting.value = false
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const getCategoryName = (categoryId: string) => {
  const category = menuStore.categories.find((c) => c.id === categoryId)
  return category ? category.name : 'Uncategorized'
}

// Modal handlers
const closeCategoryModal = () => {
  showCategoryModal.value = false
  editingCategory.value = null
}

const closeItemModal = () => {
  showItemModal.value = false
  editingItem.value = null
}

const handleCategorySuccess = (category: MenuCategory) => {
  const action = editingCategory.value ? 'updated' : 'created'
  toast.success(`Category ${category.name} ${action} successfully`)
}

const handleItemSuccess = (item: MenuItem) => {
  const action = editingItem.value ? 'updated' : 'created'
  toast.success(`Menu item ${item.name} ${action} successfully`)
}

// Selection Methods
const toggleItemSelection = (itemId: string) => {
  const index = selectedItems.value.indexOf(itemId)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(itemId)
  }
}

const selectAll = () => {
  selectedItems.value = filteredAndSortedItems.value.map(item => item.id)
}

const clearSelection = () => {
  selectedItems.value = []
}

// Bulk Operations
const bulkToggleAvailability = async (isAvailable: boolean) => {
  if (selectedItems.value.length === 0) return

  try {
    const promises = selectedItems.value.map(itemId =>
      menuStore.toggleItemAvailability(itemId, isAvailable)
    )
    await Promise.all(promises)

    const action = isAvailable ? 'enabled' : 'disabled'
    toast.success(`${selectedItems.value.length} items ${action} successfully`)
    clearSelection()
  } catch (error) {
    toast.error('Failed to update item availability')
  }
}

const confirmBulkDelete = () => {
  if (selectedItems.value.length === 0) return

  deletingItem.value = { id: 'bulk-delete' } as MenuItem
  showDeleteConfirm.value = true
}

const handleBulkDelete = async () => {
  if (selectedItems.value.length === 0) return

  isBulkDeleting.value = true
  try {
    const promises = selectedItems.value.map(itemId =>
      menuStore.deleteMenuItem(itemId)
    )
    await Promise.all(promises)

    toast.success(`${selectedItems.value.length} items deleted successfully`)
    clearSelection()
    cancelDelete()
  } catch (error) {
    toast.error('Failed to delete selected items')
  } finally {
    isBulkDeleting.value = false
  }
}

// Additional Features
const duplicateItem = async (item: MenuItem) => {
  try {
    const duplicatedItem = {
      name: `${item.name} (Copy)`,
      sku: `${item.sku}_COPY_${Date.now()}`,
      description: item.description,
      price: item.price,
      cost: item.cost || 0,
      categoryId: item.categoryId,
      imageUrl: item.imageUrl || '',
      isAvailable: false // Start as unavailable for review
    }

    const result = await menuStore.createMenuItem(duplicatedItem)
    toast.success(`Menu item duplicated: ${result.name}`)
  } catch (error) {
    toast.error('Failed to duplicate menu item')
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const goToLogin = () => {
  router.push('/login')
}

const deleteConfirmTitle = computed(() => {
  if (!deletingItem.value) return 'Delete Item'
  if (deletingItem.value.id === 'bulk-delete') {
    return `Delete ${selectedItems.value.length} Items`
  }
  return `Delete "${deletingItem.value.name}"`
})

const deleteConfirmMessage = computed(() => {
  if (!deletingItem.value) return 'Are you sure you want to delete this menu item?'
  if (deletingItem.value.id === 'bulk-delete') {
    return `Are you sure you want to delete ${selectedItems.value.length} selected items? This will remove them from all future orders and cannot be undone.`
  }
  return `Are you sure you want to delete "${deletingItem.value.name}"? This will remove it from all future orders and cannot be undone.`
})

// Import/Export Functions
const exportToCSV = () => {
  try {
    const itemsToExport = selectedItems.value.length > 0
      ? menuStore.menuItems.filter(item => selectedItems.value.includes(item.id))
      : filteredAndSortedItems.value

    if (itemsToExport.length === 0) {
      toast.warning('No items to export')
      return
    }

    const csvContent = exportMenuItemsToCSV(itemsToExport, menuStore.categories)
    const filename = `menu-items-${new Date().toISOString().split('T')[0]}.csv`
    downloadCSV(csvContent, filename)

    toast.success(`Exported ${itemsToExport.length} items to CSV`)
    showImportExportMenu.value = false
  } catch (error: any) {
    console.error('Export error:', error)
    toast.error('Failed to export menu items')
  }
}

const downloadTemplate = () => {
  try {
    const csvContent = generateCSVTemplate(menuStore.categories)
    downloadCSV(csvContent, 'menu-items-template.csv')
    toast.success('Downloaded CSV template')
    showImportExportMenu.value = false
  } catch (error: any) {
    console.error('Template download error:', error)
    toast.error('Failed to download template')
  }
}

const triggerImport = () => {
  // Create hidden file input if it doesn't exist
  if (!csvFileInput.value) {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv'
    input.style.display = 'none'
    input.addEventListener('change', handleCSVImport)
    document.body.appendChild(input)
    csvFileInput.value = input
  }

  csvFileInput.value.click()
  showImportExportMenu.value = false
}

const handleCSVImport = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  try {
    const fileContent = await file.text()
    const { items, errors } = parseCSVToMenuItems(fileContent, menuStore.categories)

    if (errors.length > 0) {
      console.warn('CSV parsing errors:', errors)
      toast.warning(`Import completed with ${errors.length} warnings. Check console for details.`)
    }

    if (items.length === 0) {
      toast.error('No valid items found in CSV file')
      return
    }

    // Import items
    let successCount = 0
    let errorCount = 0

    for (const item of items) {
      try {
        await menuStore.createMenuItem(item as any)
        successCount++
      } catch (error: any) {
        console.error(`Failed to import item ${item.name}:`, error)
        errorCount++
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully imported ${successCount} menu items`)
      await refreshMenu()
    }

    if (errorCount > 0) {
      toast.error(`Failed to import ${errorCount} items`)
    }
  } catch (error: any) {
    console.error('Import error:', error)
    toast.error('Failed to read CSV file')
  } finally {
    // Reset file input
    target.value = ''
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (importExportDropdown.value && !importExportDropdown.value.contains(event.target as Node)) {
    showImportExportMenu.value = false
  }
}

// Initialize data on mount
onMounted(async () => {
  await refreshMenu()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  // Clean up file input if it exists
  if (csvFileInput.value && csvFileInput.value.parentNode) {
    csvFileInput.value.parentNode.removeChild(csvFileInput.value)
  }
})
</script>

<style scoped>
.btn {
  @apply inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2;
}
.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-500;
}
.btn-secondary {
  @apply bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-gray-500;
}
.input {
  @apply block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.btn-sm {
  @apply px-3 py-1.5 text-sm;
}

.card-hover {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.3);
}

.performance-optimized {
  transform: translate3d(0, 0, 0);
  will-change: transform;
}

.interactive-fast {
  transition: all 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: color, background-color, transform;
}

.interactive-fast:hover {
  transform: scale(1.05);
}
</style>
