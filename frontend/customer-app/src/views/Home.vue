<!--
  Home View - Menu Browsing
  Enhanced menu browsing with advanced SearchBar, FilterPanel, ProductCard components
  Features: real-time search, filters, favorites, restaurant cards, error/empty states
-->

<template>
  <div class="min-h-screen bg-gradient-warm pb-24">
    <!-- Header -->
    <header class="sticky top-0 z-20 bg-white/95 backdrop-blur-lg border-b-2 border-primary-100 shadow-lg">
      <div class="max-w-md mx-auto px-5 py-5">
        <div class="flex items-center justify-between mb-5">
          <!-- Greeting -->
          <div>
            <h1 class="text-3xl font-black text-gray-900 tracking-tight bg-gradient-primary bg-clip-text text-transparent" style="background-image: linear-gradient(135deg, #ffbf00 0%, #ff6b6b 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
              {{ $t('home.greeting') }}
            </h1>
            <p class="text-sm text-gray-600 mt-1 font-semibold">{{ $t('home.subtitle') }}</p>
          </div>

          <!-- Right icons -->
          <div class="flex items-center gap-3">
            <!-- Language switcher -->
            <button
              @click="toggleLanguage"
              class="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-50 to-warning-50 flex items-center justify-center shadow-card hover:shadow-card-hover hover:scale-105 transition-all duration-300 border border-primary-200"
            >
              <span class="text-xl">{{ currentLocale === 'en' ? '🇺🇸' : '🇫🇷' }}</span>
            </button>

            <!-- Notification bell -->
            <button class="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary-50 to-secondary-100 flex items-center justify-center shadow-card hover:shadow-card-hover hover:scale-105 transition-all duration-300 relative border border-secondary-200">
              <svg class="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <BaseBadge
                v-if="notificationCount > 0"
                :label="notificationCount.toString()"
                variant="error"
                size="xs"
                rounded
                class="absolute -top-1 -right-1"
              />
            </button>
          </div>
        </div>

        <!-- Advanced Search Bar -->
        <SearchBar
          v-model="searchQuery"
          :suggestions="searchSuggestions"
          :isLoading="isSearching"
          :placeholder="$t('home.search_placeholder')"
          showFilterButton
          :filterCount="activeFilterCount"
          :debounceMs="300"
          @search="handleSearch"
          @select="handleSelectSuggestion"
          @filter="showFilters = true"
          @clear="clearSearch"
        />
      </div>
    </header>

    <!-- Filter Panel Modal -->
    <FilterPanel
      v-model="showFilters"
      :minPrice="0"
      :maxPrice="100"
      currencySymbol="$"
      @apply="handleApplyFilters"
      @clear="clearFilters"
    />

    <!-- Main content -->
    <main class="max-w-md mx-auto px-5 py-6">
      <!-- Category Chips -->
      <div class="flex items-center gap-3 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide mb-6">
        <BaseChip
          v-for="category in categories"
          :key="category.id"
          :label="`${category.emoji} ${category.name}`"
          :selected="selectedCategory === category.id"
          @click="handleCategorySelect(category.id)"
          size="md"
        />
      </div>

      <!-- Promo Banner -->
      <PromoBanner
        :title="$t('home.promo_title')"
        :description="$t('home.promo_subtitle')"
        :cta-text="$t('home.promo_button')"
        @click="handlePromoClick"
        class="mb-6"
      />

      <SmartSuggestCard class="mb-6" />

      <!-- Section heading -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-black text-gray-900">
          {{ searchQuery ? $t('home.search_results') : $t('home.best_sellers') }}
        </h2>
        <button
          @click="handleSeeAll"
          class="px-4 py-2 bg-gradient-primary text-gray-900 text-sm font-bold rounded-xl hover:shadow-button transition-all duration-300 hover:scale-105"
          style="background-image: linear-gradient(135deg, #ffbf00 0%, #ffd45c 100%);"
        >
          {{ $t('home.see_all') }}
        </button>
      </div>

      <!-- Error State -->
      <ErrorState
        v-if="loadError"
        type="server"
        variant="inline"
        :title="$t('home.error_title')"
        :description="$t('home.error_description')"
        showRetry
        @retry="handleRetry"
        class="mb-6"
      />

      <!-- Loading State -->
      <BaseLoader
        v-if="isLoadingMenu"
        variant="skeleton"
        size="lg"
        class="mb-6"
      />

      <!-- Menu items grid with ProductCard -->
      <div v-else-if="filteredMenuItems.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <ProductCard
          v-for="item in filteredMenuItems"
          :key="item.sku"
          :product="transformToProduct(item)"
          :quantity="getCartQuantity(item.id)"
          :isFavorite="isFavorite(item.id)"
          variant="grid"
          showQuickAdd
          @addToCart="addToCart(item)"
          @favoriteToggle="toggleFavorite(item.id)"
          @click="showProductDetail(item)"
          @quantityChange="handleQuantityChange(item, $event)"
          class="animate-fade-in"
        />
      </div>

      <!-- Empty state -->
      <EmptyState
        v-else-if="!isLoadingMenu && !loadError"
        :type="searchQuery ? 'search' : 'generic'"
        :title="searchQuery ? $t('home.no_results') : $t('home.no_items')"
        :description="searchQuery ? $t('home.try_different_search') : $t('home.try_different_category')"
        :actionText="searchQuery ? $t('home.clear_search') : undefined"
        @action="clearSearch"
        size="md"
      />
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
import { useFavoritesStore } from '@/stores/favorites'

// Advanced Components
import SearchBar from '@/components/advanced/SearchBar.vue'
import FilterPanel from '@/components/advanced/FilterPanel.vue'
import ProductCard from '@/components/advanced/ProductCard.vue'
import EmptyState from '@/components/advanced/EmptyState.vue'
import ErrorState from '@/components/advanced/ErrorState.vue'

// Base Components
import BaseChip from '@/components/base/BaseChip.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseLoader from '@/components/base/BaseLoader.vue'

// Existing Components
import PromoBanner from '@/components/PromoBanner.vue'
import SmartSuggestCard from '@/components/SmartSuggestCard.vue'
import ProductDetail from '@/components/ProductDetail.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'

const router = useRouter()
const { t: $t } = useI18n()
const cartStore = useCartStore()
const menuStore = useMenuStore()
const favoritesStore = useFavoritesStore()

// State
const selectedCategory = ref<string>('All')
const searchQuery = ref<string>('')
const selectedProduct = ref<MenuItem | null>(null)
const showProductDetailModal = ref(false)
const isLoadingMenu = ref(true)
const loadError = ref(false)
const showFilters = ref(false)
const isSearching = ref(false)
const searchSuggestions = ref<Array<{
  id: string | number
  title: string
  subtitle?: string
  icon?: string
  badge?: string
}>>([])
const notificationCount = ref(3)
const appliedFilters = ref<any>({
  cuisines: [],
  priceRange: [0, 100],
  ratings: [],
  distance: 10,
  dietary: [],
  delivery: [],
  sortBy: 'recommended'
})

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

  // Apply filters
  if (appliedFilters.value.priceRange) {
    const [min, max] = appliedFilters.value.priceRange
    items = items.filter(item => item.price >= min && item.price <= max)
  }

  if (appliedFilters.value.ratings && appliedFilters.value.ratings.length > 0) {
    items = items.filter(item => {
      const rating = item.rating || 0
      return appliedFilters.value.ratings.some((r: number) => rating >= r)
    })
  }

  return items
})

const currentLocale = computed(() => getCurrentLocale())

const activeFilterCount = computed(() => {
  let count = 0
  if (appliedFilters.value.cuisines?.length > 0) count++
  if (appliedFilters.value.ratings?.length > 0) count++
  if (appliedFilters.value.dietary?.length > 0) count++
  if (appliedFilters.value.delivery?.length > 0) count++
  if (appliedFilters.value.priceRange[0] !== 0 || appliedFilters.value.priceRange[1] !== 100) count++
  return count
})

// Methods
const loadMenu = async () => {
  isLoadingMenu.value = true
  loadError.value = false
  try {
    await menuStore.fetchMenu()
  } catch (error) {
    console.error('Failed to load menu:', error)
    loadError.value = true
  } finally {
    isLoadingMenu.value = false
  }
}

const handleRetry = () => {
  loadMenu()
}

const transformToProduct = (item: MenuItem) => {
  return {
    id: item.id,
    name: item.name,
    description: item.description || '',
    price: item.price,
    originalPrice: item.originalPrice,
    image: item.imageUrl || item.image || '',
    rating: item.rating || 4.5,
    reviewCount: item.reviewCount || Math.floor(Math.random() * 500) + 50,
    category: typeof item.category === 'string' ? item.category : item.category?.name || '',
    prepTime: item.prepTime || '15-20 min',
    discount: item.discount,
    isNew: item.isNew || false,
    inStock: item.available !== false,
    tags: item.tags || [],
    badge: item.badge
  }
}

const getCartQuantity = (itemId: string | number) => {
  const cartItem = cartStore.items.find(i => i.id === itemId)
  return cartItem?.quantity || 0
}

const isFavorite = (itemId: string | number) => {
  return favoritesStore.isFavorite(String(itemId))
}

const toggleFavorite = (itemId: string | number) => {
  const item = menuStore.menuItems.find(i => i.id === itemId)
  if (item) {
    favoritesStore.toggleFavorite(item)
  }
}

const addToCart = (item: MenuItem) => {
  cartStore.addItem({
    id: item.id,
    name: item.name,
    price: item.price,
    sku: item.sku,
    imageUrl: item.imageUrl || item.image,
    category: typeof item.category === 'string' ? item.category : item.category?.name
  })
}

const handleQuantityChange = (item: MenuItem, quantity: number) => {
  if (quantity === 0) {
    cartStore.removeItem(item.id)
  } else {
    const currentQty = getCartQuantity(item.id)
    const diff = quantity - currentQty
    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        addToCart(item)
      }
    } else {
      for (let i = 0; i < Math.abs(diff); i++) {
        cartStore.decrementItem(item.id)
      }
    }
  }
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
    sku: item.sku,
    imageUrl: item.imageUrl || item.image,
    category: typeof item.category === 'string' ? item.category : item.category?.name
  }, data.quantity)
  closeProductDetail()
}

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchSuggestions.value = []
    return
  }

  isSearching.value = true
  selectedCategory.value = 'All'

  // Simulate API call for suggestions
  setTimeout(() => {
    const query = searchQuery.value.toLowerCase()
    const matches = menuStore.menuItems.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    ).slice(0, 5)

    searchSuggestions.value = matches.map(item => ({
      id: item.id,
      title: item.name,
      subtitle: item.description || '',
      icon: '🍽️'
    }))

    isSearching.value = false
  }, 300)
}

const handleSelectSuggestion = (suggestion: any) => {
  const item = menuStore.menuItems.find(i => i.id === suggestion.id)
  if (item) {
    showProductDetail(item)
  }
  searchQuery.value = suggestion.title
  searchSuggestions.value = []
}

const clearSearch = () => {
  searchQuery.value = ''
  searchSuggestions.value = []
  selectedCategory.value = 'All'
}

const handleApplyFilters = (filters: any) => {
  appliedFilters.value = { ...filters }
  showFilters.value = false
}

const clearFilters = () => {
  appliedFilters.value = {
    cuisines: [],
    priceRange: [0, 100],
    ratings: [],
    distance: 10,
    dietary: [],
    delivery: [],
    sortBy: 'recommended'
  }
}

const handleSeeAll = () => {
  searchQuery.value = ''
  selectedCategory.value = 'All'
  clearFilters()
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
