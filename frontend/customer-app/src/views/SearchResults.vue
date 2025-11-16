<script setup lang="ts">
/**
 * SearchResults - Search for menu items (Page 13 - UI/UX 4.4)
 *
 * Features:
 * - Search bar with clear button
 * - Category filter tabs
 * - Search results grid
 * - Empty state with illustration
 */

import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const searchQuery = ref('')
const selectedCategory = ref('All')

const categories = ref(['All', 'Burgers', 'Pizza', 'Salads', 'Drinks', 'Desserts'])

// Mock search results - replace with actual search results
const allResults = ref([
  {
    id: '1',
    name: 'Classic Burger',
    description: 'Beef patty, lettuce, tomato',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop',
    price: 12.00,
    rating: 4.8,
    category: 'Burgers',
    restaurant: 'Garbaking'
  },
  {
    id: '2',
    name: 'Margherita Pizza',
    description: 'Fresh mozzarella and basil',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=400&fit=crop',
    price: 14.00,
    rating: 4.7,
    category: 'Pizza',
    restaurant: 'Pizza Palace'
  },
  {
    id: '3',
    name: 'Caesar Salad',
    description: 'Romaine, parmesan, croutons',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=400&fit=crop',
    price: 9.00,
    rating: 4.5,
    category: 'Salads',
    restaurant: 'Fresh Bowl'
  },
  {
    id: '4',
    name: 'Cheeseburger',
    description: 'Double patty with cheese',
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&h=400&fit=crop',
    price: 15.00,
    rating: 4.9,
    category: 'Burgers',
    restaurant: 'Burger House'
  }
])

const filteredResults = computed(() => {
  let results = allResults.value

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    results = results.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.restaurant.toLowerCase().includes(query)
    )
  }

  // Filter by category
  if (selectedCategory.value !== 'All') {
    results = results.filter(item => item.category === selectedCategory.value)
  }

  return results
})

const hasResults = computed(() => filteredResults.value.length > 0)

onMounted(() => {
  // Get search query from route if provided
  if (route.query.q) {
    searchQuery.value = route.query.q as string
  }
})

function goBack() {
  router.back()
}

function clearSearch() {
  searchQuery.value = ''
}

function selectCategory(category: string) {
  selectedCategory.value = category
}

function viewItem(item: any) {
  router.push(`/product/${item.id}`)
}

function addToCart(item: any) {
  // TODO: Add to cart
  console.log('Add to cart:', item)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-warm pb-6">
    <!-- Header -->
    <div class="px-6 pt-8 pb-6 bg-white rounded-b-3xl shadow-sm">
      <div class="flex items-center gap-3 mb-4">
        <button
          @click="goBack"
          class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0"
        >
          <i class="fas fa-arrow-left text-black"></i>
        </button>

        <!-- Search Input -->
        <div class="flex-1 relative">
          <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-black opacity-40"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search for food..."
            class="w-full pl-12 pr-12 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:border-primary-500"
          />
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <i class="fas fa-times text-black opacity-40"></i>
          </button>
        </div>
      </div>

      <!-- Results Count -->
      <p v-if="searchQuery" class="text-black opacity-60 text-sm">
        {{ filteredResults.length }} results found
      </p>
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

    <!-- Search Results -->
    <div class="px-6">
      <div v-if="hasResults" class="grid grid-cols-2 gap-4">
        <div
          v-for="item in filteredResults"
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
            <p class="text-black opacity-60 text-xs mb-2 line-clamp-1">
              {{ item.restaurant }}
            </p>

            <!-- Rating and Price -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-1">
                <i class="fas fa-star text-primary-500 text-xs"></i>
                <span class="text-black text-xs font-semibold">{{ item.rating }}</span>
              </div>
              <span class="text-black font-bold">${{ item.price.toFixed(2) }}</span>
            </div>

            <!-- Add button -->
            <button
              @click="addToCart(item)"
              class="w-full bg-gradient-primary text-white font-semibold py-3 rounded-2xl"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-20 px-6">
        <div class="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <i class="fas fa-search text-gray-300 text-6xl"></i>
        </div>

        <h3 class="text-black font-bold text-xl mb-2 text-center">
          {{ searchQuery ? 'No Results Found' : 'Start Searching' }}
        </h3>
        <p class="text-black opacity-60 text-center max-w-xs">
          {{ searchQuery ? 'Try adjusting your search or filters' : 'Search for your favorite dishes' }}
        </p>
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

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
