<!--
  Home View - Enhanced Home Screen (Phase 2)
  Features: HeaderBar with location, SearchBar with debouncing, Category pills/cards,
  PromoBannerModal, RestaurantCard with favorites, BottomNavigation
-->

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Bar with Menu, Location, Cart -->
    <HeaderBar
      :cart-item-count="cartStore.itemCount"
      @toggle-menu="showMenu = !showMenu"
    />

    <!-- Main Content -->
    <div class="pb-20">
      <!-- Search Bar -->
      <div class="bg-white px-4 py-4 shadow-sm">
        <SearchBar />
      </div>

      <!-- Category Pills (Horizontal Scroll) -->
      <div class="bg-white px-4 py-4 border-b border-gray-100">
        <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <CategoryPillButton
            v-for="category in categoryStore.categories"
            :key="category.id"
            :category="category"
            :is-active="categoryStore.selectedCategory?.id === category.id"
            :show-count="true"
            @click="handleCategoryClick"
          />
        </div>
      </div>

      <!-- Promotional Banner Modal -->
      <PromoBannerModal
        v-if="currentPromo"
        :promo="currentPromo"
        :auto-show="true"
        :show-once="true"
        @close="handlePromoClose"
        @copy-code="handlePromoCopy"
      />

      <!-- Main Content Sections -->
      <div class="px-4 py-6 space-y-8">
        <!-- Featured Restaurants Section -->
        <section v-if="restaurantStore.featuredRestaurants.length > 0">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900">Featured Restaurants</h2>
            <button
              @click="handleSeeAllFeatured"
              class="text-sm font-semibold text-orange-500 hover:text-orange-600"
            >
              See All
            </button>
          </div>

          <!-- Featured Restaurant Cards (Horizontal Scroll) -->
          <div class="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div
              v-for="restaurant in restaurantStore.featuredRestaurants"
              :key="restaurant.id"
              class="flex-shrink-0 w-72"
            >
              <RestaurantCard
                :id="restaurant.id"
                :name="restaurant.name"
                :imageUrl="restaurant.image"
                :tags="restaurant.cuisineTypes.join(', ')"
                :tagsList="restaurant.tags"
                :rating="restaurant.rating"
                :reviewCount="restaurant.reviewCount"
                :deliveryTime="restaurant.deliveryTime"
                :deliveryFee="restaurant.deliveryFee"
                :distance="restaurant.distance"
                :badge="restaurant.isFeatured ? 'Featured' : undefined"
                :isOpen="restaurant.isOpen"
                :isFavorite="restaurantStore.isFavorite(restaurant.id)"
                :priceRange="restaurant.priceRange"
                @click="handleRestaurantClick"
                @toggle-favorite="handleToggleFavorite"
              />
            </div>
          </div>
        </section>

        <!-- Browse by Category Section -->
        <section>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900">Browse by Category</h2>
          </div>

          <!-- Category Cards Grid -->
          <div class="grid grid-cols-2 gap-4">
            <CategoryCard
              v-for="category in categoryStore.categories.slice(1, 7)"
              :key="category.id"
              :category="category"
              @click="handleCategoryCardClick"
            />
          </div>
        </section>

        <!-- All Restaurants Section -->
        <section>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900">
              {{ categoryStore.selectedCategory?.name === 'All' ? 'All Restaurants' : categoryStore.selectedCategory?.name }}
            </h2>
            <div class="flex items-center gap-2">
              <!-- Sort Dropdown -->
              <button
                @click="showSortMenu = !showSortMenu"
                class="relative px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                Sort
              </button>

              <!-- Filter Button -->
              <button
                @click="showFilters = !showFilters"
                class="relative px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </button>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="restaurantStore.loading" class="grid grid-cols-1 gap-4">
            <div v-for="n in 3" :key="n" class="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
              <div class="h-40 bg-gray-200"></div>
              <div class="p-4 space-y-3">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                <div class="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>

          <!-- Restaurant Cards Grid -->
          <div v-else-if="restaurantStore.filteredRestaurants.length > 0" class="grid grid-cols-1 gap-4">
            <RestaurantCard
              v-for="restaurant in restaurantStore.filteredRestaurants"
              :key="restaurant.id"
              :id="restaurant.id"
              :name="restaurant.name"
              :imageUrl="restaurant.image"
              :tags="restaurant.cuisineTypes.join(', ')"
              :tagsList="restaurant.tags"
              :rating="restaurant.rating"
              :reviewCount="restaurant.reviewCount"
              :deliveryTime="restaurant.deliveryTime"
              :deliveryFee="restaurant.deliveryFee"
              :distance="restaurant.distance"
              :badge="restaurant.tags?.[0]"
              :isOpen="restaurant.isOpen"
              :isFavorite="restaurantStore.isFavorite(restaurant.id)"
              :priceRange="restaurant.priceRange"
              @click="handleRestaurantClick"
              @toggle-favorite="handleToggleFavorite"
            />
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <svg class="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">No restaurants found</h3>
            <p class="text-gray-500 mb-4">Try adjusting your filters or search criteria</p>
            <button
              @click="handleClearFilters"
              class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </section>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />

    <!-- Side Menu (Drawer) -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showMenu"
        @click="showMenu = false"
        class="fixed inset-0 bg-black/50 z-40"
      >
        <Transition
          enter-active-class="transition ease-out duration-300"
          enter-from-class="-translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transition ease-in duration-200"
          leave-from-class="translate-x-0"
          leave-to-class="-translate-x-full"
        >
          <div
            v-if="showMenu"
            @click.stop
            class="absolute top-0 left-0 bottom-0 w-80 bg-white shadow-xl"
          >
            <!-- Menu Content -->
            <div class="p-6">
              <div class="flex items-center justify-between mb-8">
                <h2 class="text-2xl font-bold text-gray-900">Menu</h2>
                <button
                  @click="showMenu = false"
                  class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Menu Items -->
              <nav class="space-y-2">
                <router-link
                  v-for="item in menuItems"
                  :key="item.path"
                  :to="item.path"
                  @click="showMenu = false"
                  class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <component :is="item.icon" class="w-6 h-6 text-gray-600" />
                  <span class="font-medium text-gray-900">{{ item.label }}</span>
                </router-link>
              </nav>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useRestaurantStore } from '@/stores/restaurant'
import { useCategoryStore } from '@/stores/category'
import { useSearchStore } from '@/stores/search'
import type { Category } from '@/stores/category'
import type { Restaurant } from '@/stores/restaurant'

// Components
import HeaderBar from '@/components/HeaderBar.vue'
import SearchBar from '@/components/SearchBar.vue'
import CategoryPillButton from '@/components/CategoryPillButton.vue'
import CategoryCard from '@/components/CategoryCard.vue'
import PromoBannerModal from '@/components/PromoBannerModal.vue'
import RestaurantCard from '@/components/RestaurantCard.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'

const router = useRouter()
const cartStore = useCartStore()
const restaurantStore = useRestaurantStore()
const categoryStore = useCategoryStore()
const searchStore = useSearchStore()

// State
const showMenu = ref(false)
const showSortMenu = ref(false)
const showFilters = ref(false)

// Promo data
const currentPromo = ref({
  title: 'Welcome Offer!',
  description: 'Get 20% off on your first order',
  code: 'WELCOME20',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  terms: 'Valid on orders above $15. New users only.'
})

// Menu items for drawer
const menuItems = [
  { path: '/home', label: 'Home', icon: 'svg' },
  { path: '/favorites', label: 'Favorites', icon: 'svg' },
  { path: '/vouchers', label: 'Vouchers', icon: 'svg' },
  { path: '/profile', label: 'Profile', icon: 'svg' },
  { path: '/about', label: 'About', icon: 'svg' }
]

// Handlers
const handleCategoryClick = (category: Category) => {
  categoryStore.selectCategory(category)

  // Filter restaurants by category
  if (category.id === 'all') {
    restaurantStore.setCategory(null)
  } else {
    restaurantStore.setCategory(category.name)
  }
}

const handleCategoryCardClick = (category: Category) => {
  categoryStore.selectCategory(category)
  restaurantStore.setCategory(category.name)

  // Scroll to all restaurants section
  window.scrollTo({ top: 600, behavior: 'smooth' })
}

const handleRestaurantClick = (id: string | number) => {
  router.push(`/restaurant/${id}`)
}

const handleToggleFavorite = (id: string | number) => {
  restaurantStore.toggleFavorite(String(id))
}

const handleSeeAllFeatured = () => {
  categoryStore.selectCategory(categoryStore.categories[0]) // All
  restaurantStore.setCategory(null)
  window.scrollTo({ top: 600, behavior: 'smooth' })
}

const handleClearFilters = () => {
  restaurantStore.clearFilters()
  categoryStore.selectCategory(categoryStore.categories[0]) // All
}

const handlePromoClose = () => {
  console.log('Promo modal closed')
}

const handlePromoCopy = (code: string) => {
  console.log('Promo code copied:', code)
}

// Initialize
onMounted(() => {
  // Fetch restaurants (will use sample data as fallback)
  restaurantStore.fetchRestaurants()

  // Select "All" category by default
  categoryStore.selectCategory(categoryStore.categories[0])
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
