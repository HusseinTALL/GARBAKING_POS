<script setup lang="ts">
/**
 * Home - Menu Browsing (UI/UX 4.4 Redesign)
 *
 * Features:
 * - Order type switcher (Delivery/Takeaway/Dine-in)
 * - Location selector
 * - Search with filter
 * - Category pills
 * - Featured banner
 * - Popular dishes list
 * - Bottom navigation
 */

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
import { useCartStore } from '@/stores/cart'
import { useFavoritesStore } from '@/stores/favorites'
import { useOrderModeStore } from '@/stores/orderMode'
import type { MenuItem } from '@/services/mockApi'
import BottomNavigation from '@/components/BottomNavigation.vue'

const router = useRouter()
const menuStore = useMenuStore()
const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()
const orderModeStore = useOrderModeStore()

// State
const searchQuery = ref('')
const selectedCategory = ref('pizza')
const isLoadingMenu = ref(true)

// Mock data - replace with actual menu store data
const categories = [
  { id: 'pizza', name: 'Pizza', icon: 'fa-pizza-slice' },
  { id: 'burger', name: 'Burger', icon: 'fa-burger' },
  { id: 'noodles', name: 'Noodles', icon: 'fa-bowl-food' },
  { id: 'dessert', name: 'Dessert', icon: 'fa-ice-cream' }
]

const popularDishes = ref([
  {
    id: '1',
    name: 'Margherita Pizza',
    rating: 4.8,
    prepTime: '20 min',
    price: 12.00,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=400&fit=crop'
  },
  {
    id: '2',
    name: 'Classic Burger',
    rating: 4.9,
    prepTime: '15 min',
    price: 10.00,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop'
  },
  {
    id: '3',
    name: 'Spicy Ramen',
    rating: 4.7,
    prepTime: '25 min',
    price: 14.00,
    image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&h=400&fit=crop'
  }
])

// Computed
const currentLocation = computed(() => 'Times Square, NY')

// Methods
function selectOrderType(type: 'delivery' | 'takeaway' | 'dine-in') {
  orderModeStore.setMode(type)
}

function changeLocation() {
  // TODO: Navigate to location selection
  router.push('/address/add')
}

function openNotifications() {
  router.push('/notifications')
}

function openSearch() {
  router.push('/search')
}

function openFilters() {
  // TODO: Open filter modal
  console.log('Open filters')
}

function selectCategory(categoryId: string) {
  selectedCategory.value = categoryId
}

function viewAll() {
  router.push(`/category/${selectedCategory.value}`)
}

function addToCart(item: any) {
  // TODO: Add to cart with proper CartItem interface
  console.log('Add to cart:', item)
}

function viewItem(item: any) {
  // TODO: Navigate to product details
  router.push(`/product/${item.id}`)
}

// Initialize
onMounted(async () => {
  isLoadingMenu.value = true
  try {
    await menuStore.fetchMenu()
  } catch (error) {
    console.error('Failed to load menu:', error)
  } finally {
    isLoadingMenu.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-warm">
    <!-- Header -->
    <div class="px-6 pt-8 pb-4 bg-white rounded-b-3xl shadow-sm">
      <!-- Order Type Switcher -->
      <div class="flex items-center gap-2 mb-4 bg-gray-50 rounded-2xl p-2">
        <button
          @click="selectOrderType('delivery')"
          :class="[
            'flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all',
            orderModeStore.isDelivery
              ? 'bg-gradient-primary text-white shadow-lg'
              : 'bg-transparent text-black'
          ]"
        >
          <i class="fas fa-motorcycle text-sm"></i>
          <span>Delivery</span>
        </button>
        <button
          @click="selectOrderType('takeaway')"
          :class="[
            'flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all',
            orderModeStore.isTakeaway
              ? 'bg-gradient-green text-white shadow-lg'
              : 'bg-transparent text-black'
          ]"
        >
          <i class="fas fa-shopping-bag text-sm"></i>
          <span>Takeaway</span>
        </button>
        <button
          @click="selectOrderType('dine-in')"
          :class="[
            'flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all',
            orderModeStore.isDineIn
              ? 'bg-gradient-purple text-white shadow-lg'
              : 'bg-transparent text-black'
          ]"
        >
          <i class="fas fa-utensils text-sm"></i>
          <span>Dine-in</span>
        </button>
      </div>

      <!-- Location & Notification -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <p class="text-black text-sm opacity-60">Deliver to</p>
          <button @click="changeLocation" class="flex items-center gap-2 mt-1">
            <i class="fas fa-location-dot text-primary-500"></i>
            <h2 class="text-black font-bold">{{ currentLocation }}</h2>
            <i class="fas fa-chevron-down text-black text-xs"></i>
          </button>
        </div>
        <button
          @click="openNotifications"
          class="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center relative"
        >
          <i class="fas fa-bell text-white text-xl"></i>
          <!-- Badge for unread count -->
          <span class="absolute -top-1 -right-1 w-5 h-5 bg-secondary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </button>
      </div>

      <!-- Search Bar -->
      <div class="relative">
        <i class="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-black opacity-40"></i>
        <input
          v-model="searchQuery"
          type="text"
          @focus="openSearch"
          placeholder="Search for dishes..."
          class="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
          readonly
        />
        <button
          @click="openFilters"
          class="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center"
        >
          <i class="fas fa-sliders text-white"></i>
        </button>
      </div>
    </div>

    <!-- Categories -->
    <div class="px-6 py-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-black font-bold text-lg">Explore Categories</h3>
        <button class="text-primary-500 text-sm font-semibold">See All</button>
      </div>

      <div class="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        <div
          v-for="(category, index) in categories"
          :key="category.id"
          @click="selectCategory(category.id)"
          class="flex-shrink-0 cursor-pointer"
        >
          <div
            :class="[
              'w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg mb-2 transition-all',
              selectedCategory === category.id && index === 0
                ? 'bg-gradient-primary'
                : 'bg-white border border-gray-100'
            ]"
          >
            <i
              :class="[
                `fas ${category.icon} text-3xl`,
                selectedCategory === category.id && index === 0 ? 'text-white' : 'text-gray-400'
              ]"
            ></i>
          </div>
          <p :class="[
            'text-xs text-center font-medium',
            selectedCategory === category.id && index === 0 ? 'text-black' : 'text-black opacity-60'
          ]">
            {{ category.name }}
          </p>
        </div>
      </div>
    </div>

    <!-- Featured Banner -->
    <div class="px-6 mb-6">
      <div class="bg-gradient-to-r from-primary-600 to-primary-500 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div class="absolute right-0 top-0 w-32 h-32 opacity-20">
          <i class="fas fa-utensils text-9xl text-white transform rotate-12"></i>
        </div>
        <div class="relative z-10">
          <h3 class="text-white font-bold text-xl mb-1">Get 30% Off</h3>
          <p class="text-white text-sm mb-4 opacity-90">On your first order</p>
          <button class="bg-white text-black font-semibold px-6 py-2 rounded-xl text-sm">
            Order Now
          </button>
        </div>
      </div>
    </div>

    <!-- Popular Dishes -->
    <div class="px-6 pb-24">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-black font-bold text-lg">Popular Dishes</h3>
        <button @click="viewAll" class="text-primary-500 text-sm font-semibold">View All</button>
      </div>

      <div class="space-y-4">
        <div
          v-for="item in popularDishes"
          :key="item.id"
          @click="viewItem(item)"
          class="bg-white rounded-3xl p-4 shadow-md flex items-center gap-4 cursor-pointer hover:shadow-xl transition-shadow"
        >
          <div class="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
            <img :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1">
            <h4 class="text-black font-bold mb-1">{{ item.name }}</h4>
            <div class="flex items-center gap-2 mb-2">
              <i class="fas fa-star text-primary-500 text-xs"></i>
              <span class="text-black text-xs">{{ item.rating }}</span>
              <span class="text-black text-xs opacity-40">•</span>
              <i class="fas fa-clock text-black opacity-40 text-xs"></i>
              <span class="text-black text-xs opacity-60">{{ item.prepTime }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-black font-bold text-lg">${{ item.price.toFixed(2) }}</span>
              <button
                @click.stop="addToCart(item)"
                class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center"
              >
                <i class="fas fa-plus text-white text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<style scoped>
/* Hide scrollbar */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
