<!--
  Menu browsing page for customer app
  Beautiful category filtering, search, and menu item display with cart integration
-->

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="sticky top-0 bg-white shadow-sm z-40 safe-area-top">
      <div class="px-4 py-3">
        <!-- Top bar -->
        <div class="flex items-center justify-between mb-3">
          <button
            @click="$router.go(-1)"
            class="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FontAwesomeIcon :icon="['fas', 'arrow-left']" class="text-xl text-gray-600" />
          </button>

          <h1 class="text-xl font-bold text-gray-900">Menu</h1>

          <button
            @click="showSearch = !showSearch"
            class="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FontAwesomeIcon :icon="['fas', 'search']" class="text-xl text-gray-600" />
          </button>
        </div>

        <!-- Search bar -->
        <div v-if="showSearch" class="mb-3 animate-fade-in">
          <div class="relative">
            <FontAwesomeIcon :icon="['fas', 'search']" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un plat..."
              class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
            <button
              v-if="searchQuery"
              @click="clearSearch"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FontAwesomeIcon :icon="['fas', 'times']" />
            </button>
          </div>
        </div>

        <!-- Category filter -->
        <div class="overflow-x-auto">
          <div class="flex space-x-2 pb-2">
            <button
              @click="selectCategory(null)"
              :class="[
                'flex-shrink-0 px-4 py-2 rounded-full font-medium transition-all duration-200',
                !selectedCategoryId
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              Tous
            </button>
            <button
              v-for="category in availableCategories"
              :key="category.id"
              @click="selectCategory(category.id)"
              :class="[
                'flex-shrink-0 px-4 py-2 rounded-full font-medium transition-all duration-200 whitespace-nowrap',
                selectedCategoryId === category.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ category.name }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <FontAwesomeIcon :icon="['fas', 'spinner']" class="animate-spin text-3xl text-primary-600 mb-4" />
        <p class="text-gray-600">Chargement du menu...</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex items-center justify-center py-20">
      <div class="text-center px-6">
        <FontAwesomeIcon :icon="['fas', 'exclamation-triangle']" class="text-3xl text-red-500 mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button
          @click="refreshMenu"
          class="bg-primary-600 text-white px-6 py-2 rounded-xl hover:bg-primary-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>

    <!-- Menu items -->
    <div v-else class="px-4 pb-24">
      <!-- Results summary -->
      <div v-if="searchQuery || selectedCategoryId" class="py-3">
        <p class="text-sm text-gray-600">
          {{ filteredMenuItems.length }} résultat{{ filteredMenuItems.length !== 1 ? 's' : '' }}
          <span v-if="searchQuery"> pour "{{ searchQuery }}"</span>
          <span v-if="selectedCategoryId && getCategoryById(selectedCategoryId)">
            dans {{ getCategoryById(selectedCategoryId).name }}
          </span>
        </p>
      </div>

      <!-- No results -->
      <div v-if="filteredMenuItems.length === 0" class="text-center py-20">
        <FontAwesomeIcon :icon="['fas', 'search']" class="text-4xl text-gray-300 mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Aucun résultat</h3>
        <p class="text-gray-600 mb-4">
          Aucun plat ne correspond à votre recherche.
        </p>
        <button
          @click="clearFilters"
          class="text-primary-600 hover:text-primary-700 font-medium"
        >
          Voir tous les plats
        </button>
      </div>

      <!-- Menu items grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MenuItemCard
          v-for="item in filteredMenuItems"
          :key="item.id"
          :item="item"
          @add-to-cart="addToCart"
          @toggle-favorite="toggleFavorite"
        />
      </div>
    </div>

    <!-- Floating cart button -->
    <div
      v-if="cartItemsCount > 0"
      class="fixed bottom-6 right-6 z-50 animate-bounce-in"
    >
      <button
        @click="goToCart"
        class="bg-primary-600 text-white w-16 h-16 rounded-full shadow-floating hover:shadow-button hover:scale-105 transition-all duration-300 flex items-center justify-center relative"
      >
        <FontAwesomeIcon :icon="['fas', 'shopping-cart']" class="text-xl" />
        <div class="absolute -top-2 -right-2 bg-accent-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
          {{ cartItemsCount }}
        </div>
      </button>
    </div>

    <!-- Favorites FAB -->
    <div
      v-if="favoriteItems.length > 0 && cartItemsCount === 0"
      class="fixed bottom-6 right-6 z-50"
    >
      <button
        @click="showFavorites = !showFavorites"
        class="bg-red-500 text-white w-14 h-14 rounded-full shadow-floating hover:shadow-button hover:scale-105 transition-all duration-300 flex items-center justify-center"
      >
        <FontAwesomeIcon :icon="['fas', 'heart']" class="text-lg" />
      </button>
    </div>

    <!-- Favorites overlay -->
    <div
      v-if="showFavorites"
      class="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-end justify-center p-4"
      @click="showFavorites = false"
    >
      <div
        class="bg-white rounded-t-3xl p-6 max-w-md w-full max-h-96 overflow-y-auto animate-slide-up"
        @click.stop
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-gray-900">Mes Favoris</h3>
          <button
            @click="showFavorites = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <FontAwesomeIcon :icon="['fas', 'times']" />
          </button>
        </div>

        <div class="space-y-3">
          <div
            v-for="item in favoriteItems"
            :key="item.id"
            class="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl"
          >
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :alt="item.name"
              class="w-12 h-12 rounded-lg object-cover"
            />
            <div class="flex-1">
              <h4 class="font-medium text-gray-900">{{ item.name }}</h4>
              <p class="text-sm text-primary-600 font-semibold">{{ formatPrice(item.price) }}</p>
            </div>
            <button
              @click="quickAddToCart(item)"
              class="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <FontAwesomeIcon :icon="['fas', 'plus']" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useMenuStore } from '@/stores/menu'
import { useCartStore } from '@/stores/cart'
import { storeToRefs } from 'pinia'
import MenuItemCard from '@/components/MenuItemCard.vue'

const router = useRouter()
const toast = useToast()

// Stores
const menuStore = useMenuStore()
const cartStore = useCartStore()

// Destructure store state
const {
  availableCategories,
  filteredMenuItems,
  favoriteItems,
  isLoading,
  error,
  getCategoryById,
  isFavorite
} = storeToRefs(menuStore)

const { totalItems: cartItemsCount } = storeToRefs(cartStore)

// Local state
const showSearch = ref(false)
const showFavorites = ref(false)

// Computed properties for reactive search and filtering
const searchQuery = computed({
  get: () => menuStore.searchQuery,
  set: (value: string) => menuStore.searchMenu(value)
})

const selectedCategoryId = computed({
  get: () => menuStore.selectedCategoryId,
  set: (value: string | null) => menuStore.selectCategory(value)
})

// Methods
const selectCategory = (categoryId: string | null) => {
  menuStore.selectCategory(categoryId)
  showSearch.value = false
}

const clearSearch = () => {
  menuStore.searchMenu('')
}

const clearFilters = () => {
  menuStore.clearFilters()
  showSearch.value = false
}

const refreshMenu = async () => {
  await menuStore.refreshMenu()
}

const addToCart = (item: any) => {
  cartStore.addItem({
    id: item.id,
    name: item.name,
    price: item.price,
    imageUrl: item.imageUrl || item.image,
    category: typeof item.category === 'string' ? item.category : item.category?.name
  })

  toast.success(`${item.name} ajouté au panier`)
}

const quickAddToCart = (item: any) => {
  addToCart(item)
  showFavorites.value = false
}

const toggleFavorite = (itemId: string) => {
  menuStore.toggleFavorite(itemId)
}

const goToCart = () => {
  router.push('/cart')
}

const formatPrice = (amount: number): string => {
  return `${amount.toLocaleString()} FCFA`
}

// Auto-hide search when typing stops
watch(searchQuery, () => {
  if (searchQuery.value.trim() === '') {
    setTimeout(() => {
      if (searchQuery.value.trim() === '') {
        showSearch.value = false
      }
    }, 3000)
  }
})

// Lifecycle
onMounted(async () => {
  // Set page title
  document.title = 'Menu - Garbaking'

  // Load menu if not already loaded
  if (menuStore.categories.length === 0) {
    await menuStore.fetchMenu()
  }
})
</script>

<style scoped>
/* Component-specific animations */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

.animate-bounce-in {
  animation: bounce-in 0.6s ease-out;
}

/* Custom scrollbar for categories */
.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>