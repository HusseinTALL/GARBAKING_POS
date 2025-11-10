<!--
  ProductCard Component
  Menu item display card with image, rating, price, and add-to-cart
  Supports variants: grid (default), list, compact
  Features: favorite toggle, badges, quick add, image gallery
-->

<template>
  <div
    :class="[
      'product-card group relative overflow-hidden transition-all duration-300',
      variantClasses,
      clickable && 'cursor-pointer',
      disabled && 'opacity-50 pointer-events-none'
    ]"
    @click="handleCardClick"
  >
    <!-- Image Section -->
    <div class="relative overflow-hidden" :class="imageContainerClasses">
      <!-- Product Image -->
      <img
        :src="product.image || placeholderImage"
        :alt="product.name"
        :class="imageClasses"
        @error="handleImageError"
      />

      <!-- Image Overlay Gradient -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <!-- Badges -->
      <div class="absolute top-3 left-3 flex flex-col gap-2">
        <BaseBadge
          v-if="product.isNew"
          label="New"
          variant="primary"
          size="sm"
          rounded
        />
        <BaseBadge
          v-if="product.discount"
          :label="`-${product.discount}%`"
          variant="error"
          size="sm"
          rounded
        />
        <BaseBadge
          v-if="product.badge"
          :label="product.badge"
          variant="success"
          size="sm"
          rounded
        />
      </div>

      <!-- Favorite Button -->
      <button
        v-if="showFavorite"
        @click.stop="handleFavoriteToggle"
        :class="[
          'absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200',
          isFavorite
            ? 'bg-error-500 text-white scale-110'
            : 'bg-white/90 dark:bg-gray-800/90 text-gray-400 hover:text-error-500 hover:scale-110'
        ]"
        :aria-label="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
      >
        <svg
          class="w-5 h-5"
          :fill="isFavorite ? 'currentColor' : 'none'"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
      </button>

      <!-- Quick Add Button (Grid only) -->
      <button
        v-if="variant === 'grid' && showQuickAdd"
        @click.stop="handleQuickAdd"
        class="absolute bottom-3 right-3 w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110"
        aria-label="Quick add to cart"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
      </button>

      <!-- Out of Stock Overlay -->
      <div
        v-if="!product.available"
        class="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
      >
        <span class="text-white font-bold text-lg">Out of Stock</span>
      </div>
    </div>

    <!-- Content Section -->
    <div :class="contentClasses">
      <!-- Category -->
      <div v-if="product.category" class="flex items-center gap-2 mb-1">
        <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {{ product.category }}
        </span>
        <span v-if="product.prepTime" class="text-xs text-gray-400 dark:text-gray-500">
          • {{ product.prepTime }} min
        </span>
      </div>

      <!-- Name -->
      <h3 :class="titleClasses" class="line-clamp-2">
        {{ product.name }}
      </h3>

      <!-- Description (Grid & List only) -->
      <p
        v-if="variant !== 'compact' && product.description"
        class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3"
      >
        {{ product.description }}
      </p>

      <!-- Rating & Reviews -->
      <div v-if="showRating && product.rating" class="flex items-center gap-2 mb-3">
        <div class="flex items-center">
          <svg
            v-for="i in 5"
            :key="i"
            :class="[
              'w-4 h-4',
              i <= Math.floor(product.rating)
                ? 'text-warning-500'
                : 'text-gray-300 dark:text-gray-600'
            ]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        </div>
        <span class="text-sm font-semibold text-gray-900 dark:text-white">
          {{ product.rating }}
        </span>
        <span v-if="product.reviews" class="text-sm text-gray-500 dark:text-gray-400">
          ({{ product.reviews }})
        </span>
      </div>

      <!-- Tags/Attributes -->
      <div v-if="product.tags && product.tags.length > 0" class="flex flex-wrap gap-1.5 mb-3">
        <BaseChip
          v-for="tag in product.tags.slice(0, 3)"
          :key="tag"
          :label="tag"
          size="sm"
          variant="outline"
        />
      </div>

      <!-- Footer: Price & Action -->
      <div class="flex items-center justify-between mt-auto">
        <!-- Price -->
        <div class="flex items-baseline gap-2">
          <span class="text-xl font-bold text-gray-900 dark:text-white">
            {{ formatPrice(product.price) }}
          </span>
          <span
            v-if="product.originalPrice && product.originalPrice > product.price"
            class="text-sm text-gray-500 dark:text-gray-400 line-through"
          >
            {{ formatPrice(product.originalPrice) }}
          </span>
        </div>

        <!-- Add to Cart Button -->
        <BaseButton
          v-if="showAddButton"
          @click.stop="handleAddToCart"
          :size="variant === 'compact' ? 'sm' : 'md'"
          :variant="product.available ? 'primary' : 'secondary'"
          :disabled="!product.available"
          :class="variant === 'list' && 'px-6'"
        >
          <template v-if="variant !== 'compact'">
            {{ addButtonText }}
          </template>
          <template v-else>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
          </template>
        </BaseButton>

        <!-- Quantity Controls (if in cart) -->
        <div
          v-else-if="quantity > 0"
          @click.stop
          class="flex items-center gap-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl px-3 py-2"
        >
          <button
            @click="handleDecrement"
            class="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Decrease quantity"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
            </svg>
          </button>
          <span class="text-base font-bold text-primary-600 dark:text-primary-400 min-w-[2ch] text-center">
            {{ quantity }}
          </span>
          <button
            @click="handleIncrement"
            class="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Increase quantity"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseChip from '@/components/base/BaseChip.vue'

export interface Product {
  id: string | number
  name: string
  description?: string
  category?: string
  image?: string
  price: number
  originalPrice?: number
  discount?: number
  rating?: number
  reviews?: number
  available?: boolean
  isNew?: boolean
  badge?: string
  prepTime?: number
  tags?: string[]
  [key: string]: any
}

export interface ProductCardProps {
  product: Product
  variant?: 'grid' | 'list' | 'compact'
  quantity?: number
  isFavorite?: boolean
  showFavorite?: boolean
  showRating?: boolean
  showQuickAdd?: boolean
  showAddButton?: boolean
  clickable?: boolean
  disabled?: boolean
  currencySymbol?: string
  addButtonText?: string
}

const props = withDefaults(defineProps<ProductCardProps>(), {
  variant: 'grid',
  quantity: 0,
  isFavorite: false,
  showFavorite: true,
  showRating: true,
  showQuickAdd: true,
  showAddButton: true,
  clickable: true,
  disabled: false,
  currencySymbol: '$',
  addButtonText: 'Add'
})

const emit = defineEmits<{
  click: [product: Product]
  addToCart: [product: Product]
  quickAdd: [product: Product]
  favoriteToggle: [product: Product, isFavorite: boolean]
  increment: [product: Product]
  decrement: [product: Product]
}>()

// Refs
const imageError = ref(false)
const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E'

// Computed classes
const variantClasses = computed(() => {
  const base = 'bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700'

  const variants = {
    grid: `${base} flex flex-col hover:shadow-xl hover:-translate-y-1`,
    list: `${base} flex flex-row gap-4 hover:shadow-lg`,
    compact: `${base} flex flex-row gap-3 hover:shadow-md`
  }

  return variants[props.variant]
})

const imageContainerClasses = computed(() => {
  return {
    grid: 'aspect-square',
    list: 'w-32 h-32 flex-shrink-0',
    compact: 'w-20 h-20 flex-shrink-0'
  }[props.variant]
})

const imageClasses = computed(() => {
  return 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
})

const contentClasses = computed(() => {
  const base = 'flex flex-col'

  return {
    grid: `${base} p-4`,
    list: `${base} flex-1 py-4 pr-4`,
    compact: `${base} flex-1 py-2 pr-3`
  }[props.variant]
})

const titleClasses = computed(() => {
  return {
    grid: 'text-base font-bold text-gray-900 dark:text-white mb-2',
    list: 'text-lg font-bold text-gray-900 dark:text-white mb-2',
    compact: 'text-sm font-semibold text-gray-900 dark:text-white mb-1'
  }[props.variant]
})

// Methods
const formatPrice = (price: number) => {
  return `${props.currencySymbol}${price.toFixed(2)}`
}

const handleImageError = () => {
  imageError.value = true
}

const handleCardClick = () => {
  if (props.clickable && !props.disabled) {
    emit('click', props.product)
  }
}

const handleAddToCart = () => {
  emit('addToCart', props.product)
}

const handleQuickAdd = () => {
  emit('quickAdd', props.product)
}

const handleFavoriteToggle = () => {
  emit('favoriteToggle', props.product, !props.isFavorite)
}

const handleIncrement = () => {
  emit('increment', props.product)
}

const handleDecrement = () => {
  emit('decrement', props.product)
}
</script>

<style scoped>
.product-card {
  -webkit-tap-highlight-color: transparent;
}
</style>
