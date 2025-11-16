<script setup lang="ts">
/**
 * Favorites - User's favorite menu items (Page 9 - UI/UX 4.4)
 *
 * Features:
 * - Grid layout of favorite items
 * - Heart icon to remove from favorites
 * - Add to cart functionality
 * - Empty state with illustration
 * - Bottom navigation
 */

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoritesStore } from '@/stores/favorites'
import { useCartStore } from '@/stores/cart'
import BottomNavigation from '@/components/BottomNavigation.vue'

const router = useRouter()
const favoritesStore = useFavoritesStore()
const cartStore = useCartStore()

// Mock favorite items - replace with actual favorites store
const favoriteItems = ref([
  {
    id: '1',
    name: 'Margherita Pizza',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=400&fit=crop',
    rating: 4.8,
    prepTime: '20 min',
    price: 12.00
  },
  {
    id: '2',
    name: 'Classic Burger',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop',
    rating: 4.9,
    prepTime: '15 min',
    price: 10.00
  },
  {
    id: '3',
    name: 'Spicy Ramen',
    image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&h=400&fit=crop',
    rating: 4.7,
    prepTime: '25 min',
    price: 14.00
  },
  {
    id: '4',
    name: 'Caesar Salad',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=400&fit=crop',
    rating: 4.6,
    prepTime: '10 min',
    price: 8.00
  }
])

const hasFavorites = computed(() => favoriteItems.value.length > 0)

function goBack() {
  router.back()
}

function removeFavorite(itemId: string) {
  const index = favoriteItems.value.findIndex(item => item.id === itemId)
  if (index > -1) {
    favoriteItems.value.splice(index, 1)
  }
  // Also remove from favorites store
  // favoritesStore.removeFavorite(itemId)
}

function addToCart(item: any) {
  // TODO: Add to cart with proper CartItem interface
  console.log('Add to cart:', item)
  // cartStore.addItem(item)
}

function viewItem(item: any) {
  router.push(`/product/${item.id}`)
}

function browseMenu() {
  router.push('/home')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-warm pb-24">
    <!-- Header -->
    <div class="px-6 pt-8 pb-6 bg-white rounded-b-3xl shadow-sm">
      <div class="flex items-center justify-between">
        <button
          @click="goBack"
          class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"
        >
          <i class="fas fa-arrow-left text-black"></i>
        </button>
        <h2 class="text-black font-bold text-lg">My Favorites</h2>
        <div class="w-10"></div>
      </div>
    </div>

    <!-- Content -->
    <div class="px-6 py-6">
      <!-- Favorites Grid -->
      <div v-if="hasFavorites" class="grid grid-cols-2 gap-4">
        <div
          v-for="item in favoriteItems"
          :key="item.id"
          class="bg-white rounded-3xl shadow-md overflow-hidden"
        >
          <!-- Image with heart button -->
          <div class="relative">
            <img
              :src="item.image"
              :alt="item.name"
              class="w-full h-40 object-cover cursor-pointer"
              @click="viewItem(item)"
            />
            <!-- Heart button -->
            <button
              @click="removeFavorite(item.id)"
              class="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <i class="fas fa-heart text-red-500 text-lg"></i>
            </button>
          </div>

          <!-- Item Details -->
          <div class="p-4">
            <h3
              class="text-black font-bold mb-2 line-clamp-2 cursor-pointer"
              @click="viewItem(item)"
            >
              {{ item.name }}
            </h3>

            <!-- Rating and Time -->
            <div class="flex items-center gap-3 mb-3">
              <div class="flex items-center gap-1">
                <i class="fas fa-star text-primary-500 text-xs"></i>
                <span class="text-black text-xs font-semibold">{{ item.rating }}</span>
              </div>
              <span class="text-black opacity-40 text-xs">•</span>
              <div class="flex items-center gap-1">
                <i class="fas fa-clock text-black opacity-40 text-xs"></i>
                <span class="text-black opacity-60 text-xs">{{ item.prepTime }}</span>
              </div>
            </div>

            <!-- Price and Add button -->
            <div class="flex items-center justify-between">
              <span class="text-black font-bold text-lg">${{ item.price.toFixed(2) }}</span>
              <button
                @click="addToCart(item)"
                class="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg"
              >
                <i class="fas fa-plus text-white text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-20 px-6">
        <div class="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <i class="fas fa-heart text-gray-300 text-6xl"></i>
        </div>

        <h3 class="text-black font-bold text-xl mb-2 text-center">
          No Favorites Yet
        </h3>
        <p class="text-black opacity-60 text-center mb-8 max-w-xs">
          Start adding your favorite dishes to save them for later
        </p>

        <button
          @click="browseMenu"
          class="bg-gradient-primary text-white font-semibold px-8 py-4 rounded-2xl shadow-lg"
        >
          <i class="fas fa-utensils mr-2"></i>
          Browse Menu
        </button>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
