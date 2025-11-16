<script setup lang="ts">
/**
 * ReviewOrder - Rate and review completed order (Page 19)
 *
 * Features:
 * - Star ratings (food quality & delivery service)
 * - Review text input
 * - Quick feedback tags
 * - Submit review functionality
 */

import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const orderNumber = computed(() => route.params.orderNumber as string)

// Rating state
const foodRating = ref(0)
const deliveryRating = ref(0)
const reviewText = ref('')
const selectedTags = ref<string[]>([])

// Quick feedback tags
const feedbackTags = [
  'Delicious',
  'Fresh',
  'Hot & Ready',
  'Great Packaging',
  'Fast Delivery',
  'Friendly Driver',
  'Good Portion',
  'Value for Money'
]

// Mock order data
const order = ref({
  id: orderNumber.value || '#12345',
  items: [
    {
      id: '1',
      name: 'Margherita Pizza',
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e'
    }
  ],
  date: 'Today, 2:30 PM'
})

function goBack() {
  router.back()
}

function setFoodRating(rating: number) {
  foodRating.value = rating
}

function setDeliveryRating(rating: number) {
  deliveryRating.value = rating
}

function toggleTag(tag: string) {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

function isTagSelected(tag: string): boolean {
  return selectedTags.value.includes(tag)
}

async function submitReview() {
  if (foodRating.value === 0 && deliveryRating.value === 0) {
    alert('Please provide at least one rating')
    return
  }

  try {
    // TODO: Implement API call to submit review
    console.log('Submitting review:', {
      orderNumber: orderNumber.value,
      foodRating: foodRating.value,
      deliveryRating: deliveryRating.value,
      reviewText: reviewText.value,
      tags: selectedTags.value
    })

    // Show success and navigate back
    router.push('/orders')
  } catch (error) {
    console.error('Failed to submit review:', error)
  }
}

function skipReview() {
  router.push('/orders')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-warm pb-24">
    <!-- Header -->
    <div class="px-6 pt-8 pb-4 bg-white rounded-b-3xl shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <button
          @click="goBack"
          class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"
        >
          <i class="fas fa-arrow-left text-black"></i>
        </button>
        <h2 class="text-black font-bold text-lg">Rate Your Order</h2>
        <button
          @click="skipReview"
          class="text-black opacity-60 text-sm font-semibold"
        >
          Skip
        </button>
      </div>
    </div>

    <div class="px-6 py-6 space-y-4">
      <!-- Order Info -->
      <div class="bg-white rounded-3xl p-6 shadow-md">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-20 h-20 rounded-2xl overflow-hidden">
            <img
              :src="order.items[0].image"
              :alt="order.items[0].name"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="flex-1">
            <h3 class="text-black font-bold mb-1">{{ order.items[0].name }}</h3>
            <p class="text-black opacity-60 text-sm">Order {{ order.id }}</p>
            <p class="text-black opacity-60 text-xs">{{ order.date }}</p>
          </div>
        </div>
      </div>

      <!-- Food Quality Rating -->
      <div class="bg-white rounded-3xl p-6 shadow-md">
        <h3 class="text-black font-bold text-lg mb-1">How was the food?</h3>
        <p class="text-black opacity-60 text-sm mb-4">Rate the quality of your meal</p>

        <!-- Star Rating -->
        <div class="flex items-center justify-center gap-4 mb-2">
          <button
            v-for="star in 5"
            :key="`food-${star}`"
            @click="setFoodRating(star)"
            class="transition-transform active:scale-90"
          >
            <i
              :class="[
                'fas fa-star text-4xl',
                star <= foodRating ? 'text-primary-500' : 'text-gray-200'
              ]"
            ></i>
          </button>
        </div>

        <p v-if="foodRating > 0" class="text-center text-black opacity-60 text-sm">
          {{ foodRating }} {{ foodRating === 1 ? 'star' : 'stars' }}
        </p>
      </div>

      <!-- Delivery Service Rating -->
      <div class="bg-white rounded-3xl p-6 shadow-md">
        <h3 class="text-black font-bold text-lg mb-1">How was the delivery?</h3>
        <p class="text-black opacity-60 text-sm mb-4">Rate the delivery service</p>

        <!-- Star Rating -->
        <div class="flex items-center justify-center gap-4 mb-2">
          <button
            v-for="star in 5"
            :key="`delivery-${star}`"
            @click="setDeliveryRating(star)"
            class="transition-transform active:scale-90"
          >
            <i
              :class="[
                'fas fa-star text-4xl',
                star <= deliveryRating ? 'text-accent-blue-500' : 'text-gray-200'
              ]"
            ></i>
          </button>
        </div>

        <p v-if="deliveryRating > 0" class="text-center text-black opacity-60 text-sm">
          {{ deliveryRating }} {{ deliveryRating === 1 ? 'star' : 'stars' }}
        </p>
      </div>

      <!-- Quick Feedback Tags -->
      <div class="bg-white rounded-3xl p-6 shadow-md">
        <h3 class="text-black font-bold text-lg mb-4">Quick Feedback</h3>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tag in feedbackTags"
            :key="tag"
            @click="toggleTag(tag)"
            :class="[
              'px-4 py-2 rounded-full text-sm font-semibold transition-all',
              isTagSelected(tag)
                ? 'bg-gradient-primary text-white shadow-lg'
                : 'bg-gray-50 text-black border border-gray-200'
            ]"
          >
            {{ tag }}
          </button>
        </div>
      </div>

      <!-- Review Text -->
      <div class="bg-white rounded-3xl p-6 shadow-md">
        <h3 class="text-black font-bold text-lg mb-1">Write a Review (Optional)</h3>
        <p class="text-black opacity-60 text-sm mb-4">Share your experience with others</p>
        <textarea
          v-model="reviewText"
          rows="4"
          class="w-full px-4 py-3 bg-gray-50 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
          placeholder="Tell us what you liked or what could be improved..."
        ></textarea>
        <p class="text-black opacity-40 text-xs mt-2">
          {{ reviewText.length }}/500 characters
        </p>
      </div>

      <!-- Submit Button -->
      <button
        @click="submitReview"
        class="w-full bg-gradient-primary text-white font-semibold py-4 rounded-2xl shadow-lg"
      >
        Submit Review
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Add any component-specific styles */
</style>
