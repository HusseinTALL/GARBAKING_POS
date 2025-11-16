<script setup lang="ts">
/**
 * RestaurantDetail - Restaurant details and menu (Page 12 - UI/UX 4.4)
 *
 * Features:
 * - Hero image with back and favorite buttons
 * - Restaurant info with rating and delivery time
 * - Category filter tabs
 * - Menu items grid
 * - Add to cart functionality
 */

import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()

const restaurantId = computed(() => route.params.id as string)

// Mock restaurant data - replace with actual restaurant store
const restaurant = ref({
  id: '1',
  name: 'Garbaking Restaurant',
  image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop',
  rating: 4.8,
  reviewCount: 245,
  deliveryTime: '25-35 min',
  deliveryFee: 0,
  description: 'Fresh ingredients, authentic flavors',
  isFavorite: false
})

const categories = ref(['All', 'Burgers', 'Pizza', 'Salads', 'Drinks'])
const selectedCategory = ref('All')

// Mock menu items
const menuItems = ref([
  {
    id: '1',
    name: 'Classic Burger',
    description: 'Beef patty, lettuce, tomato, cheese',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop',
    price: 12.00,
    category: 'Burgers'
  },
  {
    id: '2',
    name: 'Margherita Pizza',
    description: 'Fresh mozzarella, basil, tomato',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=400&fit=crop',
    price: 14.00,
    category: 'Pizza'
  },
  {
    id: '3',
    name: 'Caesar Salad',
    description: 'Romaine, parmesan, croutons',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=400&fit=crop',
    price: 9.00,
    category: 'Salads'
  },
  {
    id: '4',
    name: 'Coca Cola',
    description: 'Classic refreshing soda',
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=400&fit=crop',
    price: 2.50,
    category: 'Drinks'
  },
  {
    id: '5',
    name: 'Cheeseburger',
    description: 'Double patty with extra cheese',
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&h=400&fit=crop',
    price: 15.00,
    category: 'Burgers'
  },
  {
    id: '6',
    name: 'Pepperoni Pizza',
    description: 'Classic pepperoni and cheese',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=400&fit=crop',
    price: 16.00,
    category: 'Pizza'
  }
])

const filteredMenuItems = computed(() => {
  if (selectedCategory.value === 'All') {
    return menuItems.value
  }
  return menuItems.value.filter(item => item.category === selectedCategory.value)
})

function goBack() {
  router.back()
}

function toggleFavorite() {
  restaurant.value.isFavorite = !restaurant.value.isFavorite
  // TODO: Update favorite in store
}

function selectCategory(category: string) {
  selectedCategory.value = category
}

function addToCart(item: any) {
  // TODO: Add to cart with proper CartItem interface
  console.log('Add to cart:', item)
  // cartStore.addItem(item)
}

function viewItem(item: any) {
  router.push(`/product/${item.id}`)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-warm pb-6">
    <!-- Hero Image -->
    <div class="relative h-64">
      <img
        :src="restaurant.image"
        :alt="restaurant.name"
        class="w-full h-full object-cover"
      />

      <!-- Overlay buttons -->
      <div class="absolute top-0 left-0 right-0 px-6 pt-8 flex items-center justify-between">
        <button
          @click="goBack"
          class="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg"
        >
          <i class="fas fa-arrow-left text-black"></i>
        </button>

        <button
          @click="toggleFavorite"
          class="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg"
        >
          <i :class="['fas fa-heart text-lg', restaurant.isFavorite ? 'text-red-500' : 'text-gray-400']"></i>
        </button>
      </div>
    </div>

    <!-- Restaurant Info -->
    <div class="px-6 -mt-6">
      <div class="bg-white rounded-3xl p-6 shadow-xl">
        <h1 class="text-black font-bold text-2xl mb-2">{{ restaurant.name }}</h1>
        <p class="text-black opacity-60 text-sm mb-4">{{ restaurant.description }}</p>

        <!-- Stats -->
        <div class="flex items-center gap-4 mb-4">
          <div class="flex items-center gap-1">
            <i class="fas fa-star text-primary-500"></i>
            <span class="text-black font-semibold">{{ restaurant.rating }}</span>
            <span class="text-black opacity-40 text-sm">({{ restaurant.reviewCount }})</span>
          </div>

          <span class="text-black opacity-40">•</span>

          <div class="flex items-center gap-1">
            <i class="fas fa-clock text-black opacity-40"></i>
            <span class="text-black opacity-60 text-sm">{{ restaurant.deliveryTime }}</span>
          </div>

          <span class="text-black opacity-40">•</span>

          <div class="flex items-center gap-1">
            <i class="fas fa-motorcycle text-black opacity-40"></i>
            <span class="text-green-500 font-semibold text-sm">
              {{ restaurant.deliveryFee === 0 ? 'Free' : `$${restaurant.deliveryFee}` }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Categories -->
    <div class="px-6 py-6">
      <div class="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
        <button
          v-for="category in categories"
          :key="category"
          @click="selectCategory(category)"
          :class="[
            'flex-shrink-0 px-6 py-3 rounded-2xl font-semibold text-sm transition-all',
            selectedCategory === category
              ? 'bg-gradient-primary text-white shadow-lg'
              : 'bg-white text-black border-2 border-gray-200'
          ]"
        >
          {{ category }}
        </button>
      </div>
    </div>

    <!-- Menu Items Grid -->
    <div class="px-6">
      <h2 class="text-black font-bold text-xl mb-4">Menu Items</h2>

      <div class="grid grid-cols-2 gap-4">
        <div
          v-for="item in filteredMenuItems"
          :key="item.id"
          class="bg-white rounded-3xl shadow-md overflow-hidden"
        >
          <!-- Image -->
          <div class="relative" @click="viewItem(item)">
            <img
              :src="item.image"
              :alt="item.name"
              class="w-full h-40 object-cover cursor-pointer"
            />
          </div>

          <!-- Item Details -->
          <div class="p-4">
            <h3
              class="text-black font-bold mb-1 line-clamp-1 cursor-pointer"
              @click="viewItem(item)"
            >
              {{ item.name }}
            </h3>
            <p class="text-black opacity-60 text-xs mb-3 line-clamp-2">
              {{ item.description }}
            </p>

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
      <div v-if="filteredMenuItems.length === 0" class="flex flex-col items-center justify-center py-20">
        <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <i class="fas fa-utensils text-gray-300 text-4xl"></i>
        </div>
        <p class="text-black opacity-60 text-center">No items in this category</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
