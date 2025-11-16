<script setup lang="ts">
/**
 * ProductDetails - Product detail screen (Page 4 - UI/UX 4.4)
 *
 * Features:
 * - Full-height hero image
 * - Product info (name, rating, description)
 * - Size selection
 * - Add-ons with checkboxes
 * - Quantity selector
 * - Add to cart button
 */

import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useFavoritesStore } from '@/stores/favorites'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()

const productId = computed(() => route.params.id as string)

// Mock product data - replace with actual data from store
const product = ref({
  id: '1',
  name: 'Pepperoni Pizza',
  description: 'Classic pepperoni pizza with mozzarella cheese, tangy tomato sauce, and premium pepperoni slices. Baked to perfection with a crispy crust and topped with Italian herbs.',
  price: 14.00,
  image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=800&fit=crop',
  rating: 4.9,
  reviewCount: 245,
  calories: 150
})

// State
const selectedSize = ref('medium')
const quantity = ref(1)
const selectedAddons = ref<string[]>([])
const isFavorite = ref(false)

const sizes = [
  { id: 'small', label: 'Small', priceModifier: -2 },
  { id: 'medium', label: 'Medium', priceModifier: 0 },
  { id: 'large', label: 'Large', priceModifier: 3 }
]

const addons = [
  {
    id: 'extra-cheese',
    name: 'Extra Cheese',
    price: 2.00,
    icon: 'fa-cheese'
  },
  {
    id: 'jalapenos',
    name: 'Jalapeños',
    price: 1.50,
    icon: 'fa-pepper-hot'
  }
]

// Computed
const currentPrice = computed(() => {
  let price = product.value.price

  // Add size modifier
  const size = sizes.find(s => s.id === selectedSize.value)
  if (size) {
    price += size.priceModifier
  }

  // Add add-ons
  selectedAddons.value.forEach(addonId => {
    const addon = addons.find(a => a.id === addonId)
    if (addon) {
      price += addon.price
    }
  })

  return price
})

const totalPrice = computed(() => currentPrice.value * quantity.value)

// Methods
function goBack() {
  router.back()
}

function toggleFavorite() {
  isFavorite.value = !isFavorite.value
  // TODO: Update favorites store
}

function selectSize(sizeId: string) {
  selectedSize.value = sizeId
}

function toggleAddon(addonId: string) {
  const index = selectedAddons.value.indexOf(addonId)
  if (index > -1) {
    selectedAddons.value.splice(index, 1)
  } else {
    selectedAddons.value.push(addonId)
  }
}

function decrementQuantity() {
  if (quantity.value > 1) {
    quantity.value--
  }
}

function incrementQuantity() {
  quantity.value++
}

function addToCart() {
  // TODO: Add to cart with selected options
  console.log('Adding to cart:', {
    product: product.value,
    size: selectedSize.value,
    addons: selectedAddons.value,
    quantity: quantity.value,
    totalPrice: totalPrice.value
  })
  router.back()
}
</script>

<template>
  <div class="h-screen flex flex-col bg-gradient-warm">
    <!-- Hero Image -->
    <div class="relative h-96 bg-white rounded-b-3xl overflow-hidden">
      <img
        :src="product.image"
        :alt="product.name"
        class="w-full h-full object-cover"
      />
      <div class="absolute top-8 left-6 right-6 flex items-center justify-between">
        <button
          @click="goBack"
          class="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center"
        >
          <i class="fas fa-arrow-left text-black"></i>
        </button>
        <button
          @click="toggleFavorite"
          class="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center"
        >
          <i :class="['fas fa-heart', isFavorite ? 'text-primary-500' : 'text-black opacity-30']"></i>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 px-6 py-6 overflow-y-auto">
      <!-- Title & Rating -->
      <div class="mb-4">
        <h2 class="text-black font-bold text-2xl mb-2">{{ product.name }}</h2>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1">
            <i class="fas fa-star text-primary-500"></i>
            <span class="text-black font-bold">{{ product.rating }}</span>
            <span class="text-black opacity-40 text-sm">({{ product.reviewCount }} reviews)</span>
          </div>
          <span class="text-black opacity-40">•</span>
          <div class="flex items-center gap-1">
            <i class="fas fa-fire text-orange-500"></i>
            <span class="text-black text-sm font-semibold">{{ product.calories }} Kcal</span>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="mb-6">
        <h3 class="text-black font-bold mb-2">Description</h3>
        <p class="text-black opacity-70 text-sm leading-relaxed">
          {{ product.description }}
        </p>
      </div>

      <!-- Size Selection -->
      <div class="mb-6">
        <h3 class="text-black font-bold mb-3">Size</h3>
        <div class="flex gap-3">
          <button
            v-for="size in sizes"
            :key="size.id"
            @click="selectSize(size.id)"
            :class="[
              'flex-1 py-3 rounded-2xl font-semibold transition-all',
              selectedSize === size.id
                ? 'bg-gradient-primary text-white shadow-lg'
                : 'bg-white border-2 border-gray-200 text-black'
            ]"
          >
            {{ size.label }}
          </button>
        </div>
      </div>

      <!-- Add-ons -->
      <div class="mb-6">
        <h3 class="text-black font-bold mb-3">Add-ons</h3>
        <div class="space-y-3">
          <div
            v-for="addon in addons"
            :key="addon.id"
            class="flex items-center justify-between p-3 bg-white rounded-2xl cursor-pointer"
            @click="toggleAddon(addon.id)"
          >
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <i :class="`fas ${addon.icon} text-primary-500 text-xl`"></i>
              </div>
              <div>
                <p class="text-black font-semibold text-sm">{{ addon.name }}</p>
                <p class="text-black opacity-60 text-xs">+${{ addon.price.toFixed(2) }}</p>
              </div>
            </div>
            <input
              type="checkbox"
              :checked="selectedAddons.includes(addon.id)"
              class="w-6 h-6 accent-primary-500 rounded"
              @click.stop="toggleAddon(addon.id)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Action -->
    <div class="px-6 py-4 bg-white border-t border-gray-100">
      <div class="flex items-center justify-between gap-4">
        <!-- Quantity Selector -->
        <div class="flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3">
          <button
            @click="decrementQuantity"
            class="w-8 h-8 bg-white rounded-lg flex items-center justify-center"
          >
            <i class="fas fa-minus text-black"></i>
          </button>
          <span class="text-black font-bold">{{ quantity }}</span>
          <button
            @click="incrementQuantity"
            class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center"
          >
            <i class="fas fa-plus text-white"></i>
          </button>
        </div>

        <!-- Add to Cart Button -->
        <button
          @click="addToCart"
          class="flex-1 bg-gradient-primary text-white font-bold py-4 rounded-2xl shadow-lg"
        >
          Add to Cart - ${{ totalPrice.toFixed(2) }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any component-specific styles */
</style>
