<!--
  RestaurantDetail.vue
  Restaurant detail page with hero, menu, reviews, and similar restaurants
-->

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Restaurant Header with Image Gallery -->
    <RestaurantHeader
      v-if="restaurant"
      :restaurant="restaurant"
      :is-favorite="restaurantStore.isFavorite(restaurant.id)"
      @toggle-favorite="handleToggleFavorite"
      @back="handleBack"
    />

    <!-- Loading State -->
    <div v-if="loading" class="px-4 py-6">
      <div class="animate-pulse space-y-4">
        <div class="h-8 bg-gray-200 rounded w-1/3"></div>
        <div class="h-48 bg-gray-200 rounded"></div>
        <div class="h-48 bg-gray-200 rounded"></div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="restaurant" class="pb-24">
      <!-- Restaurant Info Card -->
      <div class="bg-white px-4 py-6 shadow-sm">
        <div class="max-w-4xl mx-auto">
          <!-- Name and Rating -->
          <div class="mb-4">
            <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ restaurant.name }}</h1>
            <p class="text-gray-600 mb-3">{{ restaurant.description }}</p>

            <!-- Rating and Info -->
            <div class="flex items-center gap-4 text-sm">
              <div class="flex items-center gap-1">
                <svg class="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span class="font-bold text-gray-900">{{ restaurant.rating.toFixed(1) }}</span>
                <span class="text-gray-500">({{ restaurant.reviewCount }} reviews)</span>
              </div>

              <div class="flex items-center gap-1 text-gray-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ restaurant.deliveryTime }}</span>
              </div>

              <div v-if="restaurant.deliveryFee === 0" class="text-green-600 font-semibold">
                Free Delivery
              </div>
              <div v-else class="text-gray-600">
                ${{ restaurant.deliveryFee.toFixed(2) }} delivery
              </div>
            </div>
          </div>

          <!-- Cuisine Tags -->
          <div class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="cuisine in restaurant.cuisineTypes"
              :key="cuisine"
              class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
            >
              {{ cuisine }}
            </span>
          </div>

          <!-- Info Grid -->
          <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <div class="text-xs text-gray-500 mb-1">Minimum Order</div>
              <div class="font-semibold text-gray-900">${{ restaurant.minimumOrder || 0 }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 mb-1">Distance</div>
              <div class="font-semibold text-gray-900">{{ restaurant.distance || 'N/A' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Menu Categories Tabs -->
      <div class="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <MenuCategoryTabs
          :categories="menuCategories"
          :selected-category="selectedMenuCategory"
          @select="handleCategorySelect"
        />
      </div>

      <!-- Menu Items Grid -->
      <div class="px-4 py-6">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-xl font-bold text-gray-900 mb-4">
            {{ selectedMenuCategory === 'all' ? 'All Items' : selectedMenuCategory }}
          </h2>

          <div class="grid grid-cols-1 gap-4">
            <MenuItem
              v-for="item in filteredMenuItems"
              :key="item.id"
              :item="item"
              @click="handleMenuItemClick"
              @add-to-cart="handleQuickAdd"
            />
          </div>

          <!-- Empty State -->
          <div v-if="filteredMenuItems.length === 0" class="text-center py-12">
            <svg class="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-gray-500">No items in this category</p>
          </div>
        </div>
      </div>

      <!-- Reviews Section -->
      <div class="bg-white px-4 py-6 mt-4">
        <div class="max-w-4xl mx-auto">
          <ReviewsList
            :restaurant-id="restaurant.id"
            :overall-rating="restaurant.rating"
            :total-reviews="restaurant.reviewCount"
          />
        </div>
      </div>

      <!-- Similar Restaurants -->
      <div class="px-4 py-6">
        <div class="max-w-4xl mx-auto">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900">Similar Restaurants</h2>
            <button class="text-sm font-semibold text-orange-500 hover:text-orange-600">
              See All
            </button>
          </div>

          <div class="grid grid-cols-1 gap-4">
            <RestaurantCard
              v-for="similar in similarRestaurants.slice(0, 3)"
              :key="similar.id"
              :id="similar.id"
              :name="similar.name"
              :imageUrl="similar.image"
              :tags="similar.cuisineTypes.join(', ')"
              :tagsList="similar.tags"
              :rating="similar.rating"
              :reviewCount="similar.reviewCount"
              :deliveryTime="similar.deliveryTime"
              :deliveryFee="similar.deliveryFee"
              :distance="similar.distance"
              :isOpen="similar.isOpen"
              :isFavorite="restaurantStore.isFavorite(similar.id)"
              :priceRange="similar.priceRange"
              @click="handleSimilarRestaurantClick"
              @toggle-favorite="handleToggleFavorite"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <svg class="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Restaurant Not Found</h2>
        <p class="text-gray-500 mb-4">We couldn't find this restaurant</p>
        <button
          @click="handleBack"
          class="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>

    <!-- Add to Cart Modal -->
    <AddToCartModal
      v-if="selectedMenuItem"
      :is-open="showAddToCartModal"
      :item="selectedMenuItem"
      @close="closeAddToCartModal"
      @add-to-cart="handleAddToCart"
    />

    <!-- Floating Cart Button (if cart has items) -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-full opacity-0"
    >
      <div v-if="cartStore.itemCount > 0" class="fixed bottom-0 left-0 right-0 p-4 pb-safe z-40">
        <button
          @click="handleViewCart"
          class="w-full max-w-4xl mx-auto bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl shadow-2xl transition-all flex items-center justify-between px-6"
        >
          <div class="flex items-center gap-3">
            <div class="bg-white/20 rounded-full px-3 py-1">
              <span class="font-bold">{{ cartStore.itemCount }}</span>
            </div>
            <span class="font-semibold">View Cart</span>
          </div>
          <div class="font-bold text-lg">
            ${{ cartStore.total.toFixed(2) }}
          </div>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRestaurantStore } from '@/stores/restaurant'
import { useCartStore } from '@/stores/cart'

// Components
import RestaurantHeader from '@/components/RestaurantHeader.vue'
import MenuCategoryTabs from '@/components/MenuCategoryTabs.vue'
import MenuItem from '@/components/MenuItem.vue'
import ReviewsList from '@/components/ReviewsList.vue'
import RestaurantCard from '@/components/RestaurantCard.vue'
import AddToCartModal from '@/components/AddToCartModal.vue'

const router = useRouter()
const route = useRoute()
const restaurantStore = useRestaurantStore()
const cartStore = useCartStore()

// State
const loading = ref(true)
const selectedMenuCategory = ref('all')
const selectedMenuItem = ref<any>(null)
const showAddToCartModal = ref(false)

// Sample menu items (will be fetched from store)
const menuItems = ref([
  {
    id: 'item-1',
    name: 'Classic Burger',
    description: 'Beef patty, lettuce, tomato, cheese, special sauce',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    category: 'Burgers',
    customizable: true,
    options: [
      { id: 'size', name: 'Size', required: true, choices: ['Regular', 'Large'] },
      { id: 'extras', name: 'Extras', required: false, choices: ['Bacon', 'Extra Cheese', 'Avocado'] }
    ]
  },
  {
    id: 'item-2',
    name: 'Margherita Pizza',
    description: 'Fresh mozzarella, basil, tomato sauce',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    category: 'Pizza',
    customizable: true
  },
  {
    id: 'item-3',
    name: 'Caesar Salad',
    description: 'Romaine lettuce, parmesan, croutons, caesar dressing',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
    category: 'Salads',
    customizable: false
  },
  {
    id: 'item-4',
    name: 'Chicken Wings',
    description: '8 pieces with your choice of sauce',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400',
    category: 'Appetizers',
    customizable: true
  },
  {
    id: 'item-5',
    name: 'Coca Cola',
    description: 'Classic refreshing soda',
    price: 2.99,
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
    category: 'Drinks',
    customizable: false
  }
])

// Computed
const restaurant = computed(() => restaurantStore.selectedRestaurant)

const menuCategories = computed(() => {
  const categories = new Set(['all'])
  menuItems.value.forEach(item => categories.add(item.category))
  return Array.from(categories)
})

const filteredMenuItems = computed(() => {
  if (selectedMenuCategory.value === 'all') {
    return menuItems.value
  }
  return menuItems.value.filter(item => item.category === selectedMenuCategory.value)
})

const similarRestaurants = computed(() => {
  if (!restaurant.value) return []

  // Find restaurants with similar cuisine types
  return restaurantStore.restaurants.filter(r =>
    r.id !== restaurant.value!.id &&
    r.cuisineTypes.some(c => restaurant.value!.cuisineTypes.includes(c))
  )
})

// Methods
const loadRestaurant = async () => {
  loading.value = true
  const restaurantId = route.params.id as string

  try {
    await restaurantStore.fetchRestaurantById(restaurantId)
  } catch (error) {
    console.error('Failed to load restaurant:', error)
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  router.back()
}

const handleToggleFavorite = (id: string | number) => {
  restaurantStore.toggleFavorite(String(id))
}

const handleCategorySelect = (category: string) => {
  selectedMenuCategory.value = category
}

const handleMenuItemClick = (item: any) => {
  if (item.customizable) {
    selectedMenuItem.value = item
    showAddToCartModal.value = true
  } else {
    handleQuickAdd(item)
  }
}

const handleQuickAdd = (item: any) => {
  cartStore.addItem({
    id: item.id,
    name: item.name,
    price: item.price,
    imageUrl: item.image,
    category: item.category
  })
}

const closeAddToCartModal = () => {
  showAddToCartModal.value = false
  selectedMenuItem.value = null
}

const handleAddToCart = (data: { item: any; quantity: number; options?: any }) => {
  for (let i = 0; i < data.quantity; i++) {
    cartStore.addItem({
      id: data.item.id,
      name: data.item.name,
      price: data.item.price,
      imageUrl: data.item.image,
      category: data.item.category
    })
  }
  closeAddToCartModal()
}

const handleViewCart = () => {
  router.push('/cart')
}

const handleSimilarRestaurantClick = (id: string | number) => {
  router.push(`/restaurant/${id}`)
}

// Watch for route changes
watch(() => route.params.id, () => {
  if (route.params.id) {
    loadRestaurant()
    selectedMenuCategory.value = 'all'
    window.scrollTo(0, 0)
  }
})

// Initialize
onMounted(() => {
  loadRestaurant()
})
</script>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
