<!--
  Favorites View - Displays user's favorite menu items
  Features: grid/list view toggle, remove favorites, add to cart
-->

<template>
  <div class="min-h-screen bg-white pb-20">
    <!-- Header -->
    <header class="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
      <div class="max-w-md mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 tracking-tight">
              {{ t('favorites.title') }}
            </h1>
            <p v-if="hasFavorites" class="text-sm text-gray-600 mt-0.5">
              {{ t('favorites.items_saved', favoritesCount) }}
            </p>
          </div>

          <!-- Actions -->
          <div v-if="hasFavorites" class="flex items-center gap-2">
            <!-- View toggle -->
            <button
              @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'"
              class="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
              :aria-label="t('favorites.switch_view', { view: viewMode === 'grid' ? 'list' : 'grid' })"
            >
              <svg
                v-if="viewMode === 'grid'"
                class="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
              <svg
                v-else
                class="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
              </svg>
            </button>

            <!-- Clear all button -->
            <button
              @click="showClearConfirmation = true"
              class="p-2 rounded-xl bg-red-50 hover:bg-red-100 transition-colors"
              :aria-label="t('favorites.clear_all_label')"
            >
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-md mx-auto px-4 py-6">
      <!-- Favorites grid -->
      <div v-if="hasFavorites && viewMode === 'grid'" class="grid grid-cols-2 gap-4">
        <MenuItemCard
          v-for="item in favoriteItems"
          :key="item.id || item.sku"
          :item="item"
          @add-to-cart="addToCart"
          @view-detail="viewDetail"
          class="animate-fade-in"
        />
      </div>

      <!-- Favorites list -->
      <div v-else-if="hasFavorites && viewMode === 'list'" class="space-y-3">
        <div
          v-for="item in favoriteItems"
          :key="item.id || item.sku"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 flex gap-3 hover:shadow-md transition-shadow animate-fade-in"
        >
          <!-- Image -->
          <div
            @click="viewDetail(item)"
            class="w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex-shrink-0 cursor-pointer"
          >
            <img
              v-if="item.image || item.imageUrl"
              :src="item.image || item.imageUrl"
              :alt="item.name"
              class="w-full h-full object-cover hover:scale-110 transition-transform"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
              <svg class="w-10 h-10 text-primary-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
              </svg>
            </div>
          </div>

          <!-- Details -->
          <div class="flex-1 min-w-0" @click="viewDetail(item)">
            <h3 class="font-bold text-gray-900 text-sm mb-1 line-clamp-2 cursor-pointer">
              {{ item.name }}
            </h3>
            <p v-if="item.description" class="text-xs text-gray-500 mb-2 line-clamp-1">
              {{ item.description }}
            </p>
            <div class="flex items-center justify-between">
              <span class="text-lg font-bold text-primary-600">
                {{ formatPrice(item.price) }}
              </span>
              <div class="flex gap-1">
                <button
                  @click.stop="addToCart(item)"
                  class="p-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 active:scale-95 transition-all"
                  :aria-label="t('favorites.add_to_cart_label')"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
                  </svg>
                </button>
                <button
                  @click.stop="removeFavorite(item)"
                  class="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 active:scale-95 transition-all"
                  :aria-label="t('favorites.remove_label')"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-20">
        <div class="w-24 h-24 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-500/30">
          <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t('favorites.empty_title') }}</h3>
        <p class="text-gray-600 mb-6 max-w-xs mx-auto px-4">
          {{ t('favorites.empty_description') }}
        </p>
        <button
          @click="goToHome"
          class="px-6 py-3 bg-primary-500 text-white rounded-2xl text-sm font-semibold hover:bg-primary-600 active:scale-95 transition-all shadow-lg shadow-primary-500/30"
        >
          {{ t('favorites.browse_menu') }}
        </button>
      </div>
    </main>

    <!-- Clear confirmation modal -->
    <div
      v-if="showClearConfirmation"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      @click="showClearConfirmation = false"
    >
      <div
        @click.stop
        class="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scale-in"
      >
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 text-center mb-2">{{ t('favorites.confirm_clear_title') }}</h3>
        <p class="text-gray-600 text-center mb-6">
          {{ t('favorites.confirm_clear_message', { count: favoritesCount }) }}
        </p>
        <div class="flex gap-3">
          <button
            @click="showClearConfirmation = false"
            class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
          >
            {{ t('favorites.cancel') }}
          </button>
          <button
            @click="confirmClearAll"
            class="flex-1 py-3 bg-red-500 text-white rounded-2xl font-semibold hover:bg-red-600 transition-colors"
          >
            {{ t('favorites.clear_all') }}
          </button>
        </div>
      </div>
    </div>

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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useFavoritesStore } from '@/stores/favorites'
import { useCartStore } from '@/stores/cart'
import type { MenuItem } from '@/services/mockApi'
import { formatCurrency } from '@/utils/currency'
import MenuItemCard from '@/components/MenuItemCard.vue'
import ProductDetail from '@/components/ProductDetail.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'

const { t } = useI18n()

const router = useRouter()
const favoritesStore = useFavoritesStore()
const cartStore = useCartStore()

// State
const viewMode = ref<'grid' | 'list'>('grid')
const showClearConfirmation = ref(false)
const selectedProduct = ref<MenuItem | null>(null)
const showProductDetailModal = ref(false)

// Computed
const favoriteItems = computed(() => favoritesStore.getFavorites())
const hasFavorites = computed(() => favoritesStore.hasFavorites)
const favoritesCount = computed(() => favoritesStore.favoritesCount)

// Methods
const formatPrice = (amount: number): string => formatCurrency(amount)

const goToHome = () => {
  router.push('/home')
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

const removeFavorite = (item: MenuItem) => {
  favoritesStore.removeFavorite(item.id || item.sku)
}

const confirmClearAll = () => {
  favoritesStore.clearFavorites()
  showClearConfirmation.value = false
}

const viewDetail = (item: MenuItem) => {
  selectedProduct.value = item
  showProductDetailModal.value = true
}

const closeProductDetail = () => {
  showProductDetailModal.value = false
  selectedProduct.value = null
}

const addToCartFromDetail = (data: { item: MenuItem; quantity: number }) => {
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
</script>

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

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}
</style>
