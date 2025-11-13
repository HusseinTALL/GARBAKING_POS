<!--
  Product Detail Modal - Enhanced
  Full-screen product view with customization options
  Features: RatingStars, favorite toggle, size selection with chips, quantity controls
-->

<template>
  <div v-if="isVisible" class="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto">
    <!-- Header -->
    <div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10">
      <div class="flex items-center justify-between px-4 py-3">
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <svg class="w-6 h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <div class="flex items-center gap-2">
          <button
            @click="toggleFavorite"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <svg
              class="w-6 h-6"
              :class="isFavorite ? 'fill-error-500 text-error-500' : 'text-gray-400'"
              :fill="isFavorite ? 'currentColor' : 'none'"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>
          <button class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <svg class="w-6 h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Product Image -->
    <div class="relative bg-gray-50 p-8">
      <img
        :src="product.image"
        :alt="product.name"
        class="w-full max-w-sm mx-auto h-64 object-contain"
      />
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 dark:border-gray-800">
      <div class="flex">
        <button
          @click="activeTab = 'details'"
          class="flex-1 py-3 px-4 text-sm font-semibold border-b-2 transition-colors"
          :class="activeTab === 'details'
            ? 'text-primary-600 border-primary-600'
            : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'"
        >
          {{ t('reviews.product_details') }}
        </button>
        <button
          @click="activeTab = 'reviews'"
          class="flex-1 py-3 px-4 text-sm font-semibold border-b-2 transition-colors"
          :class="activeTab === 'reviews'
            ? 'text-primary-600 border-primary-600'
            : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'"
        >
          {{ t('reviews.reviews') }} ({{ reviewStats.totalReviews }})
        </button>
      </div>
    </div>

    <!-- Product Info -->
    <div v-show="activeTab === 'details'" class="p-4">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ product.name }}</h1>

      <div class="flex items-center gap-3 mb-3">
        <BaseChip
          :label="`🍕 ${product.category}`"
          variant="secondary"
          size="sm"
        />
        <BaseBadge
          v-if="product.discount"
          :label="`${product.discount}% OFF`"
          variant="error"
          size="sm"
        />
      </div>

      <!-- Rating Stars -->
      <div class="mb-4">
        <RatingStars
          :modelValue="reviewStats.averageRating || product.rating || 4.5"
          readonly
          showValue
          showReviewCount
          :reviewCount="reviewStats.totalReviews || product.reviewCount || 0"
          size="sm"
        />
      </div>

      <p class="text-gray-600 dark:text-gray-400 text-sm mb-6">{{ product.description }}</p>

      <!-- Size Selection with Chips -->
      <div class="mb-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Size</h3>
        <div class="flex flex-wrap gap-2">
          <BaseChip
            v-for="size in sizes"
            :key="size.id"
            :label="`${size.label} - ${formatPrice(size.price)}`"
            :selected="selectedSize === size.id"
            @click="selectedSize = size.id"
            variant="primary"
            size="md"
          />
        </div>
      </div>

      <!-- Add Ingredients -->
      <div class="mb-6">
        <h3 class="font-semibold text-text-DEFAULT mb-3">Add Ingredients</h3>
        <div class="space-y-3">
          <label
            v-for="ingredient in ingredients"
            :key="ingredient.id"
            class="flex items-center justify-between p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <img :src="ingredient.image" :alt="ingredient.name" class="w-10 h-10 rounded-lg object-cover" />
              <div>
                <div class="font-medium text-text-DEFAULT text-sm">{{ ingredient.name }}</div>
                <div class="text-xs text-text-secondary">{{ ingredient.quantity }} +{{ formatPrice(ingredient.price) }}</div>
              </div>
            </div>
            <input
              type="checkbox"
              :value="ingredient.id"
              v-model="selectedIngredients"
              class="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
          </label>
        </div>
      </div>

      <!-- Quantity Selector -->
      <div class="mb-6">
        <h3 class="font-semibold text-text-DEFAULT mb-3">Quantity</h3>
        <div class="flex items-center gap-4">
          <button
            @click="quantity = Math.max(1, quantity - 1)"
            class="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
            </svg>
          </button>
          <span class="text-xl font-semibold text-text-DEFAULT min-w-[40px] text-center">{{ quantity }}</span>
          <button
            @click="quantity++"
            class="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Reviews Tab -->
    <div v-show="activeTab === 'reviews'" class="p-4 pb-24">
      <!-- Write Review Button -->
      <div v-if="!hasUserReviewed && !showReviewForm" class="mb-6">
        <button
          @click="showReviewForm = true"
          class="w-full py-3 px-6 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
          <span>{{ t('reviews.write_review') }}</span>
        </button>
      </div>

      <!-- Review Form -->
      <div v-if="showReviewForm" class="mb-6">
        <ReviewForm
          :product-id="String(product.id || product.sku)"
          :product-name="product.name"
          show-cancel
          @submit="handleReviewSubmit"
          @cancel="showReviewForm = false"
        />
      </div>

      <!-- Review List -->
      <ReviewList :product-id="String(product.id || product.sku)" />
    </div>

    <!-- Bottom CTA -->
    <div class="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
      <BaseButton
        @click="addToCart"
        variant="primary"
        size="lg"
        class="w-full"
      >
        <span>Add to Cart</span>
        <span class="ml-2">{{ formatPrice(totalPrice) }}</span>
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { MenuItem } from '@/services/mockApi'
import { useFavoritesStore } from '@/stores/favorites'
import { useReviewsStore } from '@/stores/reviews'

// Advanced Components
import RatingStars from '@/components/advanced/RatingStars.vue'

// Base Components
import BaseChip from '@/components/base/BaseChip.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'

// Review Components
import ReviewForm from '@/components/ReviewForm.vue'
import ReviewList from '@/components/ReviewList.vue'

const { t } = useI18n()
const favoritesStore = useFavoritesStore()
const reviewsStore = useReviewsStore()

interface Props {
  isVisible: boolean
  product: MenuItem
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'close': []
  'add-to-cart': [item: MenuItem, quantity: number, customizations: any]
}>()

// State
const activeTab = ref<'details' | 'reviews'>('details')
const selectedSize = ref('medium')
const selectedIngredients = ref<string[]>([])
const quantity = ref(1)
const showReviewForm = ref(false)
const isFavorite = computed(() => favoritesStore.isFavorite(String(props.product.id || props.product.sku)))

// Review state
const reviewStats = computed(() => reviewsStore.reviewStats)
const hasUserReviewed = computed(() =>
  reviewsStore.hasUserReviewedProduct(String(props.product.id || props.product.sku))
)

// Watch for product changes to load reviews
watch(() => props.product.id, (newId) => {
  if (newId) {
    reviewsStore.fetchReviewsForProduct(String(newId))
  }
}, { immediate: true })

// Mock data - would come from product in real app
const sizes = ref([
  { id: 'small', label: '6" - Small', price: 8.99 },
  { id: 'medium', label: '8" - Medium', price: 10.99 },
  { id: 'large', label: '10" - Large', price: 12.99 },
])

const ingredients = ref([
  { id: '1', name: 'Chicken', quantity: '250 gm', price: 1.40, image: 'https://via.placeholder.com/40' },
  { id: '2', name: 'Mushroom', quantity: 'Free', price: 0.40, image: 'https://via.placeholder.com/40' },
])

// Computed
const totalPrice = computed(() => {
  const sizePrice = sizes.value.find(s => s.id === selectedSize.value)?.price || 0
  const ingredientsPrice = selectedIngredients.value.reduce((total, id) => {
    const ingredient = ingredients.value.find(i => i.id === id)
    return total + (ingredient?.price || 0)
  }, 0)
  return (sizePrice + ingredientsPrice) * quantity.value
})

// Methods
const formatPrice = (amount: number): string => {
  return `$${amount.toFixed(2)}`
}

const toggleFavorite = () => {
  favoritesStore.toggleFavorite(props.product)
}

const addToCart = () => {
  emit('add-to-cart', props.product, quantity.value, {
    size: selectedSize.value,
    ingredients: selectedIngredients.value
  })
  emit('close')
}

const handleReviewSubmit = (reviewId: string) => {
  showReviewForm.value = false
  // Optionally scroll to the new review or show a success message
}
</script>
