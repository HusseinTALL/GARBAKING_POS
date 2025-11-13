<!--
  ReviewCard.vue
  Individual review card with rating, comment, and user info
-->

<template>
  <div class="bg-white p-4 rounded-xl border border-gray-200">
    <!-- User Info and Rating -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-3">
        <!-- User Avatar -->
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {{ review.userName.charAt(0).toUpperCase() }}
        </div>

        <!-- User Name and Date -->
        <div>
          <div class="font-semibold text-gray-900">{{ review.userName }}</div>
          <div class="text-xs text-gray-500">{{ formatDate(review.date) }}</div>
        </div>
      </div>

      <!-- Rating Stars -->
      <div class="flex items-center gap-1">
        <svg
          v-for="n in 5"
          :key="n"
          class="w-4 h-4"
          :class="n <= review.rating ? 'text-orange-500' : 'text-gray-300'"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </div>
    </div>

    <!-- Review Comment -->
    <p class="text-gray-700 text-sm leading-relaxed mb-3">
      {{ review.comment }}
    </p>

    <!-- Review Images (if any) -->
    <div v-if="review.images && review.images.length > 0" class="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
      <img
        v-for="(image, index) in review.images"
        :key="index"
        :src="image"
        :alt="`Review image ${index + 1}`"
        class="w-20 h-20 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
        @click="handleImageClick(image)"
      />
    </div>

    <!-- Helpful Button -->
    <div class="flex items-center gap-4 text-sm">
      <button
        @click="handleHelpful"
        class="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        <span>Helpful {{ review.helpfulCount ? `(${review.helpfulCount})` : '' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Props
interface Props {
  review: {
    id: string
    userName: string
    userAvatar?: string
    rating: number
    comment: string
    date: Date | string
    images?: string[]
    helpfulCount?: number
  }
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  (e: 'helpful', reviewId: string): void
  (e: 'image-click', image: string): void
}>()

// Methods
const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - d.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

const handleHelpful = () => {
  emit('helpful', props.review.id)
}

const handleImageClick = (image: string) => {
  emit('image-click', image)
}
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
