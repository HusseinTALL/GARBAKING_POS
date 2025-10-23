<!--
  Home View - Menu Browsing
  Main menu interface with search, categories, and product grid
-->

<template>
  <div class="min-h-screen bg-white pb-20">
    <!-- Header -->
    <header class="sticky top-0 z-20 bg-white border-b border-gray-100">
      <div class="max-w-md mx-auto px-4 py-4">
        <div class="flex items-center justify-between mb-4">
          <!-- Greeting -->
          <div>
            <h1 class="text-2xl font-bold text-text-DEFAULT">Hello 👋</h1>
            <p class="text-sm text-text-secondary">What would you like to eat?</p>
          </div>

          <!-- Right icons -->
          <div class="flex items-center gap-3">
            <!-- Language switcher -->
            <button
              @click="toggleLanguage"
              class="w-10 h-10 rounded-full bg-background-gray flex items-center justify-center text-text-secondary hover:bg-gray-200 transition-colors"
            >
              <span class="text-lg">{{ currentLocale === 'en' ? '🇺🇸' : '🇫🇷' }}</span>
            </button>

            <!-- Notification bell -->
            <button class="w-10 h-10 rounded-full bg-background-gray flex items-center justify-center text-text-secondary hover:bg-gray-200 transition-colors relative">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span class="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
            </button>
          </div>
        </div>

        <!-- Search bar -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search for food..."
            @input="handleSearch"
            class="w-full pl-10 pr-4 py-3 bg-background-gray rounded-2xl text-sm text-text-DEFAULT placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <!-- Clear search button -->
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white hover:bg-gray-400 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-md mx-auto px-4 py-6">
      <!-- Category Icons -->
      <CategoryIcons
        :categories="categories"
        :selected-category="selectedCategory"
        @select="handleCategorySelect"
        class="mb-6"
      />

      <!-- Promo Banner -->
      <PromoBanner
        title="Get 25% Discount"
        description="On your first order"
        cta-text="Order Now"
        @click="handlePromoClick"
        class="mb-6"
      />

      <!-- Section heading -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-text-DEFAULT">
          {{ searchQuery ? 'Search Results' : 'Best Sellers' }}
        </h2>
        <button
          @click="handleSeeAll"
          class="text-sm text-primary-500 font-semibold hover:text-primary-600 transition-colors"
        >
          See All
        </button>
      </div>

      <!-- Loading skeleton -->
      <div v-if="isLoadingMenu" class="grid grid-cols-2 gap-4">
        <div v-for="i in 6" :key="i" class="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
          <div class="aspect-square bg-gray-200"></div>
          <div class="p-4 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-6 bg-gray-200 rounded w-1/2"></div>
            <div class="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>

      <!-- Menu items grid -->
      <div v-else-if="filteredMenuItems.length > 0" class="grid grid-cols-2 gap-4">
        <MenuItemCard
          v-for="item in filteredMenuItems"
          :key="item.sku"
          :item="item"
          @add-to-cart="addToCart"
          @view-detail="showProductDetail(item)"
          class="animate-fade-in"
        />
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-12">
        <div class="w-16 h-16 bg-background-gray rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <p class="text-text-secondary text-base font-medium">
          {{ searchQuery ? 'No items match your search' : 'No items found' }}
        </p>
        <p class="text-text-tertiary text-sm mt-2">
          {{ searchQuery ? 'Try a different search term' : 'Try selecting a different category' }}
        </p>
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="mt-4 px-4 py-2 bg-primary-500 text-white rounded-full text-sm font-semibold hover:bg-primary-600 transition-colors"
        >
          Clear Search
        </button>
      </div>
    </main>

    <!-- Product Detail Modal -->
    <ProductDetail
      v-if="selectedProduct"
      :is-visible="showProductDetailModal"
      :product="selectedProduct"
      @close="closeProductDetail"
      @add-to-cart="addToCartFromDetail"
    />

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { setLocale, getCurrentLocale } from '@/plugins/i18n'
import { mockApi, type MenuItem } from '@/services/mockApi'
import { useCartStore } from '@/stores/cart'
import { useMenuStore } from '@/stores/menu'
import MenuItemCard from '@/components/MenuItemCard.vue'
import CategoryIcons from '@/components/CategoryIcons.vue'
import PromoBanner from '@/components/PromoBanner.vue'
import ProductDetail from '@/components/ProductDetail.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'

const router = useRouter()
const { t: $t } = useI18n()
const cartStore = useCartStore()
const menuStore = useMenuStore()

// State
const selectedCategory = ref<string>('All')
const searchQuery = ref<string>('')
const selectedProduct = ref<MenuItem | null>(null)
const showProductDetailModal = ref(false)
const isLoadingMenu = ref(true)

// Helper function for category emojis
const getCategoryEmoji = (category: string): string => {
  const emojiMap: Record<string, string> = {
    'All': '🍽️',
    'Mains': '🍛',
    'Drinks': '🥤',
    'Desserts': '🍰',
    'Appetizers': '🥗'
  }
  return emojiMap[category] || '🍽️'
}

// Computed
const categories = computed(() => {
  if (!menuStore.menuItems || menuStore.menuItems.length === 0) {
    return [{ id: 'All', name: 'All', emoji: '🍽️' }]
  }

  const categorySet = new Set<string>(
    menuStore.menuItems.map((item) => item.category?.name || 'Other')
  )
  const categoryArray = Array.from(categorySet) as string[]
  const uniqueCategories: string[] = ['All', ...categoryArray]

  return uniqueCategories.map((cat: string) => ({
    id: cat,
    name: cat,
    emoji: getCategoryEmoji(cat)
  }))
})

const filteredMenuItems = computed(() => {
  if (!menuStore.menuItems) return []

  let items = menuStore.menuItems

  // Filter by category
  if (selectedCategory.value !== 'All') {
    items = items.filter((item) =>
      item.category?.name === selectedCategory.value || item.categoryId === selectedCategory.value
    )
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    items = items.filter((item) =>
      item.name.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.category?.name?.toLowerCase().includes(query)
    )
  }

  return items
})

const currentLocale = computed(() => getCurrentLocale())

// Methods
const loadMenu = async () => {
  isLoadingMenu.value = true
  try {
    await menuStore.fetchMenu()
  } catch (error) {
    console.error('Failed to load menu:', error)
  } finally {
    isLoadingMenu.value = false
  }
}

const addToCart = (item: MenuItem) => {
  cartStore.addItem({
    id: item.id,
    name: item.name,
    price: item.price,
    imageUrl: item.imageUrl || item.image,
    category: typeof item.category === 'string' ? item.category : item.category?.name
  })
}

const showProductDetail = (item: MenuItem) => {
  selectedProduct.value = item
  showProductDetailModal.value = true
}

const closeProductDetail = () => {
  showProductDetailModal.value = false
  selectedProduct.value = null
}

const addToCartFromDetail = (data: { item: MenuItem; quantity: number; size?: string; ingredients?: string[] }) => {
  const item = data.item
  cartStore.addItem({
    id: item.id,
    name: item.name,
    price: item.price,
    imageUrl: item.imageUrl || item.image,
    category: typeof item.category === 'string' ? item.category : item.category?.name
  }, data.quantity)
  closeProductDetail()
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    selectedCategory.value = 'All'
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  selectedCategory.value = 'All'
}

const handleSeeAll = () => {
  searchQuery.value = ''
  selectedCategory.value = 'All'
}

const handlePromoClick = () => {
  searchQuery.value = ''
  selectedCategory.value = 'All'
}

const handleCategorySelect = (categoryId: string) => {
  selectedCategory.value = categoryId
  searchQuery.value = ''
}

const toggleLanguage = () => {
  const newLocale = currentLocale.value === 'en' ? 'fr' : 'en'
  setLocale(newLocale)
}

// Initialize
onMounted(async () => {
  await loadMenu()

  // Set default category to first available
  if (categories.value.length > 1) {
    selectedCategory.value = categories.value[1].id
  }
})
</script>
