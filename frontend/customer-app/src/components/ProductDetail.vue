<!--
  Product detail modal/page component
  Full-screen product view with customization options
-->

<template>
  <div v-if="isVisible" class="fixed inset-0 bg-white z-50 overflow-y-auto">
    <!-- Header -->
    <div class="sticky top-0 bg-white border-b border-gray-200 z-10">
      <div class="flex items-center justify-between px-4 py-3">
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <div class="flex items-center gap-2">
          <button class="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>
          <button class="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

    <!-- Product Info -->
    <div class="p-4">
      <h1 class="text-2xl font-bold text-text-DEFAULT mb-2">{{ product.name }}</h1>

      <div class="flex items-center gap-2 mb-4">
        <span class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg text-xs text-text-secondary">
          🍕 {{ product.category }}
        </span>
        <span class="inline-flex items-center gap-1 text-sm text-text-DEFAULT">
          <svg class="w-4 h-4 text-warning-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          {{ product.rating || '4.8' }}
          <span class="text-text-secondary">({{ product.reviewCount || '2.2k' }})</span>
        </span>
      </div>

      <p class="text-text-secondary text-sm mb-6">{{ product.description }}</p>

      <!-- Size Selection -->
      <div class="mb-6">
        <h3 class="font-semibold text-text-DEFAULT mb-3">Size</h3>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="size in sizes"
            :key="size.id"
            @click="selectedSize = size.id"
            :class="[
              'py-3 px-4 rounded-xl border-2 transition-all text-center',
              selectedSize === size.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white'
            ]"
          >
            <div class="text-xs text-text-secondary mb-1">{{ size.label }}</div>
            <div class="font-semibold text-text-DEFAULT">{{ formatPrice(size.price) }}</div>
          </button>
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

    <!-- Bottom CTA -->
    <div class="sticky bottom-0 bg-white border-t border-gray-200 p-4">
      <button
        @click="addToCart"
        class="w-full bg-primary-500 text-white py-4 rounded-full font-semibold text-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
      >
        <span>Add to Cart</span>
        <span>{{ formatPrice(totalPrice) }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MenuItem } from '@/services/mockApi'

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
const selectedSize = ref('medium')
const selectedIngredients = ref<string[]>([])
const quantity = ref(1)

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

const addToCart = () => {
  emit('add-to-cart', props.product, quantity.value, {
    size: selectedSize.value,
    ingredients: selectedIngredients.value
  })
  emit('close')
}
</script>
