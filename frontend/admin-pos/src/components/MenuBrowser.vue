<!--
  Menu Browser Component for POS Order Creation
  Displays menu items by category with search and filtering capabilities
-->

<template>
  <div class="h-full flex flex-col bg-background min-h-0">
    <!-- Header -->
    <div class="flex-none p-4 bg-background-card border-b border-gray-200 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-xl font-bold text-text">Menu</h2>
          <p class="text-xs text-text-light mt-1">Use arrow keys to navigate, Enter to select, Space to add to cart, / to search</p>
        </div>
        <div class="flex items-center space-x-2">
          <div :class="[
            'w-3 h-3 rounded-full',
            menuStore.isLoading ? 'bg-secondary-500 animate-pulse' : 'bg-success-500'
          ]"></div>
          <span class="text-sm text-text-light">
            {{ menuStore.isLoading ? 'Loading...' : `${availableItems.length} items` }}
          </span>
        </div>
      </div>

      <!-- Search -->
      <div class="relative mb-4">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-lighter" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search menu items..."
          class="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-text placeholder-text-lighter focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
        />
      </div>

      <!-- Category Filter -->
      <div class="flex overflow-x-auto space-x-2 pb-2">
        <button
          @click="selectedCategory = null"
          :class="[
            'flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm',
            selectedCategory === null
              ? 'bg-primary-500 text-white shadow-button'
              : 'bg-white text-text border border-gray-300 hover:bg-gray-50 hover:border-primary-300'
          ]"
        >
          All Items
        </button>
        <button
          v-for="category in menuStore.categories"
          :key="category.id"
          @click="selectedCategory = category.id"
          :class="[
            'flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm',
            selectedCategory === category.id
              ? 'bg-primary-500 text-white shadow-button'
              : 'bg-white text-text border border-gray-300 hover:bg-gray-50 hover:border-primary-300'
          ]"
        >
          {{ category.name }}
        </button>
      </div>
    </div>

    <!-- Menu Items Grid -->
    <div class="flex-1 min-h-0 overflow-y-auto p-4">
      <!-- Loading -->
      <div v-if="menuStore.isLoading" class="flex items-center justify-center h-64">
        <div class="text-center">
          <Loader2 class="animate-spin w-8 h-8 text-primary-500 mb-4" />
          <p class="text-text-light">Loading menu items...</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredItems.length === 0" class="flex items-center justify-center h-64">
        <div class="text-center">
          <UtensilsCrossed class="w-16 h-16 text-text-lighter mb-4 mx-auto" />
          <h3 class="text-lg font-semibold text-text mb-2">No Items Found</h3>
          <p class="text-text-light">
            {{ searchQuery ? 'Try adjusting your search terms' : 'No items available in this category' }}
          </p>
        </div>
      </div>

      <!-- Items Grid -->
      <div v-else class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
        <div
          v-for="(item, index) in filteredItems"
          :key="item.id"
          :data-item-index="index"
          @click="handleItemClick(item)"
          @mouseenter="isKeyboardNavActive = false"
          :class="[
            'bg-background-card rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 group shadow-card hover:shadow-floating',
            isKeyboardNavActive && selectedIndex === index
              ? 'border-primary-400 shadow-lg ring-2 ring-primary-400/30'
              : 'border-gray-200 hover:border-primary-300'
          ]"
        >
          <!-- Item Image -->
          <div class="aspect-square bg-gray-100 relative overflow-hidden">
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :alt="item.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
              <UtensilsCrossed class="w-8 h-8 text-text-lighter" />
            </div>

            <!-- Availability overlay -->
            <div v-if="!item.isAvailable" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span class="text-white font-medium text-sm">Out of Stock</span>
            </div>

            <!-- Price badge -->
            <div class="absolute top-2 right-2 bg-secondary-500 text-white px-2 py-1 rounded-lg text-sm font-medium shadow-sm">
              ${item.price}
            </div>
          </div>

          <!-- Item Details -->
          <div class="p-3">
            <h3 class="font-semibold text-text text-sm mb-1 line-clamp-1">{{ item.name }}</h3>
            <p class="text-text-light text-xs line-clamp-2 mb-2">{{ item.description }}</p>

            <!-- Add to Cart Button -->
            <button
              @click.stop="addToCart(item)"
              :disabled="!item.isAvailable"
              class="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-button"
            >
              <Plus class="w-4 h-4 mr-1" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Item Details Modal -->
    <div v-if="selectedItem" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" @click="selectedItem = null">
      <div class="bg-background-card rounded-2xl max-w-md w-full shadow-floating" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-text">{{ selectedItem.name }}</h3>
            <button @click="selectedItem = null" class="text-text-light hover:text-text-lighter transition-colors">
              <X class="w-6 h-6" />
            </button>
          </div>

          <div v-if="selectedItem.imageUrl" class="mb-4">
            <img :src="selectedItem.imageUrl" :alt="selectedItem.name" class="w-full h-48 object-cover rounded-xl" />
          </div>

          <p class="text-text-light mb-4">{{ selectedItem.description }}</p>
          <p class="text-2xl font-bold text-secondary-500 mb-4">${{ selectedItem.price.toFixed(2) }}</p>

          <!-- Quantity Selection -->
          <div class="flex items-center space-x-4 mb-4">
            <span class="text-text">Quantity:</span>
            <div class="flex items-center space-x-2">
              <button
                @click="modalQuantity = Math.max(1, modalQuantity - 1)"
                class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors border border-gray-300"
              >
                <Minus class="w-4 h-4 text-text" />
              </button>
              <span class="text-text font-medium w-8 text-center">{{ modalQuantity }}</span>
              <button
                @click="modalQuantity += 1"
                class="w-8 h-8 rounded-full bg-primary-500 hover:bg-primary-600 flex items-center justify-center transition-colors shadow-sm"
              >
                <Plus class="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <!-- Special Instructions -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-text mb-2">Special Instructions</label>
            <textarea
              v-model="specialInstructions"
              placeholder="Any special requests or modifications..."
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-text placeholder-text-lighter focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none shadow-sm"
              rows="3"
            ></textarea>
          </div>

          <!-- Action Buttons -->
          <div class="flex space-x-3">
            <button
              @click="selectedItem = null"
              class="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-text rounded-lg font-medium transition-colors border border-gray-300"
            >
              Cancel
            </button>
            <button
              @click="addToCartFromModal"
              :disabled="!selectedItem.isAvailable"
              class="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500 text-white rounded-lg font-medium transition-colors shadow-sm hover:shadow-button"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useMenuStore } from '@/stores/menu'
import { useCartStore } from '@/stores/cart'
import { useNotificationStore } from '@/stores/notification'
import {
  Search,
  Plus,
  Minus,
  X,
  UtensilsCrossed,
  Loader2
} from 'lucide-vue-next'
import type { MenuItem } from '@/stores/menu'

// Stores
const menuStore = useMenuStore()
const cartStore = useCartStore()
const notification = useNotificationStore()

// Reactive data
const searchQuery = ref('')
const selectedCategory = ref<string | null>(null)
const selectedItem = ref<MenuItem | null>(null)
const modalQuantity = ref(1)
const specialInstructions = ref('')

// Keyboard navigation state
const selectedIndex = ref(0)
const isKeyboardNavActive = ref(false)

// Computed properties
const availableItems = computed(() =>
  menuStore.menuItems.filter(item => item.isActive)
)

const filteredItems = computed(() => {
  let items = availableItems.value

  // Filter by category
  if (selectedCategory.value) {
    items = items.filter(item => item.categoryId === selectedCategory.value)
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    )
  }

  return items
})

// Methods
const handleItemClick = (item: MenuItem) => {
  selectedItem.value = item
  modalQuantity.value = 1
  specialInstructions.value = ''
}

const addToCart = (item: MenuItem) => {
  if (!item.isAvailable) return

  cartStore.addItem(item, 1)
  notification.success('Added to Cart', `${item.name} has been added to your order`)
}

const addToCartFromModal = () => {
  if (!selectedItem.value || !selectedItem.value.isAvailable) return

  cartStore.addItem(
    selectedItem.value,
    modalQuantity.value,
    specialInstructions.value.trim() || undefined
  )

  notification.success(
    'Added to Cart',
    `${modalQuantity.value}x ${selectedItem.value.name} added to your order`
  )

  selectedItem.value = null
}

// Keyboard navigation methods
const handleKeyDown = (event: KeyboardEvent) => {
  if (selectedItem.value) return // Don't handle keyboard nav when modal is open

  const items = filteredItems.value
  if (items.length === 0) return

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault()
      isKeyboardNavActive.value = true
      selectedIndex.value = Math.min(selectedIndex.value + 1, items.length - 1)
      scrollToSelectedItem()
      break

    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault()
      isKeyboardNavActive.value = true
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
      scrollToSelectedItem()
      break

    case 'Enter':
    case ' ':
      event.preventDefault()
      if (isKeyboardNavActive.value && items[selectedIndex.value]) {
        const item = items[selectedIndex.value]
        if (event.key === 'Enter') {
          handleItemClick(item)
        } else if (event.key === ' ') {
          addToCart(item)
        }
      }
      break

    case 'Escape':
      event.preventDefault()
      isKeyboardNavActive.value = false
      selectedIndex.value = 0
      break

    case '/': {
      event.preventDefault()
      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
      }
      break
    }
  }
}

const scrollToSelectedItem = async () => {
  await nextTick()
  const selectedElement = document.querySelector(`[data-item-index="${selectedIndex.value}"]`)
  if (selectedElement) {
    selectedElement.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    })
  }
}

// Watch for changes in filtered items to reset selection
watch([searchQuery, selectedCategory], () => {
  selectedIndex.value = 0
  if (filteredItems.value.length === 0) {
    isKeyboardNavActive.value = false
  }
})

// Lifecycle
onMounted(async () => {
  await menuStore.fetchMenuItems()
  await menuStore.fetchCategories()

  // Add keyboard event listener
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  // Remove keyboard event listener
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Custom scrollbar for menu items */
.overflow-y-auto {
  scroll-behavior: smooth;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #374151;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #6B7280;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}
</style>
