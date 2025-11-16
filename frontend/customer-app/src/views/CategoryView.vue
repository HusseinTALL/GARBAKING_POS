<script setup lang="ts">
/**
 * CategoryView - Browse items within a category (Page 3b)
 *
 * Features:
 * - Grid layout of menu items
 * - Filter tabs (All, Popular, New, Vegetarian)
 * - Add to cart functionality
 * - Favorite toggle
 */

import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
import { useCartStore } from '@/stores/cart'
import { useFavoritesStore } from '@/stores/favorites'

const router = useRouter()
const route = useRoute()
const menuStore = useMenuStore()
const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()

const categoryId = computed(() => route.params.id as string)
const categoryName = ref('Pizza') // TODO: Get from route or store

const activeFilter = ref('all')

const filters = ['All', 'Popular', 'New', 'Vegetarian']

// Mock items - replace with actual data from store
const items = ref([
  {
    id: '1',
    name: 'Margherita',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e',
    rating: 4.8,
    price: 12.00,
    isFavorite: false
  },
  {
    id: '2',
    name: 'Pepperoni',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e',
    rating: 4.9,
    price: 14.00,
    isFavorite: true
  },
  {
    id: '3',
    name: 'Veggie Supreme',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e',
    rating: 4.7,
    price: 13.00,
    isFavorite: false
  },
  {
    id: '4',
    name: 'BBQ Chicken',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e',
    rating: 4.8,
    price: 15.00,
    isFavorite: false
  }
])

function goBack() {
  router.back()
}

function toggleFavorite(itemId: string) {
  const item = items.value.find(i => i.id === itemId)
  if (item) {
    item.isFavorite = !item.isFavorite
  }
}

function addToCart(item: any) {
  // TODO: Implement cart functionality
  console.log('Add to cart:', item)
}

function selectFilter(filter: string) {
  activeFilter.value = filter.toLowerCase()
}

function viewItem(itemId: string) {
  router.push(`/product/${itemId}`)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-warm pb-24">
    <!-- Header -->
    <div class="px-6 pt-8 pb-6 bg-white rounded-b-3xl shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <button
          @click="goBack"
          class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"
        >
          <i class="fas fa-arrow-left text-black"></i>
        </button>
        <h2 class="text-black font-bold text-lg">{{ categoryName }}</h2>
        <button class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
          <i class="fas fa-heart text-black opacity-40"></i>
        </button>
      </div>

      <!-- Filter Tabs -->
      <div class="flex gap-3 overflow-x-auto pb-2">
        <button
          v-for="filter in filters"
          :key="filter"
          @click="selectFilter(filter)"
          :class="[
            'px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all',
            activeFilter === filter.toLowerCase()
              ? 'bg-gradient-primary text-white shadow-lg'
              : 'bg-white text-black border border-gray-200'
          ]"
        >
          {{ filter }}
        </button>
      </div>
    </div>

    <!-- Items Grid -->
    <div class="px-6 py-6">
      <p class="text-black text-sm opacity-60 mb-4">{{ items.length }} items available</p>

      <div class="grid grid-cols-2 gap-4">
        <div
          v-for="item in items"
          :key="item.id"
          class="bg-white rounded-3xl p-4 shadow-md hover:shadow-xl transition-shadow cursor-pointer"
          @click="viewItem(item.id)"
        >
          <div class="relative mb-3">
            <div class="w-full h-32 rounded-2xl overflow-hidden">
              <img
                :src="item.image"
                :alt="item.name"
                class="w-full h-full object-cover"
              />
            </div>
            <button
              @click.stop="toggleFavorite(item.id)"
              class="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center"
            >
              <i
                :class="[
                  'fas fa-heart',
                  item.isFavorite ? 'text-secondary-500' : 'text-black opacity-30'
                ]"
              ></i>
            </button>
          </div>
          <h4 class="text-black font-bold text-sm mb-1">{{ item.name }}</h4>
          <div class="flex items-center gap-1 mb-2">
            <i class="fas fa-star text-primary-500 text-xs"></i>
            <span class="text-black text-xs">{{ item.rating }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-black font-bold">${{ item.price.toFixed(2) }}</span>
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
</template>

<style scoped>
/* Hide scrollbar for filter tabs */
.overflow-x-auto::-webkit-scrollbar {
  display: none;
}
.overflow-x-auto {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
