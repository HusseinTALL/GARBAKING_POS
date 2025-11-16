<!--
  ReviewCard - Display individual review with rating, comment, images, and voting
  Features: star rating, verified badge, helpful/unhelpful voting, images, response
-->

<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
    <!-- Header -->
    <div class="flex items-start gap-3 mb-3">
      <!-- Avatar -->
      <div class="flex-shrink-0">
        <div
          v-if="review.userAvatar"
          class="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 overflow-hidden"
        >
          <img
            :src="review.userAvatar"
            :alt="review.userName"
            class="w-full h-full object-cover"
          />
        </div>
        <div
          v-else
          class="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg"
        >
          {{ getUserInitials(review.userName) }}
        </div>
      </div>

      <!-- User info and rating -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <h4 class="font-semibold text-gray-900 dark:text-white text-sm">
            {{ review.userName }}
          </h4>
          <span
            v-if="review.verified"
            class="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium"
            :title="t('reviews.verified_purchase')"
          >
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span v-if="!compact">{{ t('reviews.verified') }}</span>
          </span>
        </div>

        <!-- Star rating -->
        <div class="flex items-center gap-1 mb-1">
          <div class="flex">
            <svg
              v-for="star in 5"
              :key="star"
              class="w-4 h-4"
              :class="star <= review.rating ? 'text-warning-500 fill-current' : 'text-gray-300 dark:text-gray-600'"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </div>
          <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">
            {{ formatDate(review.createdAt) }}
          </span>
        </div>
      </div>

      <!-- Actions menu (for user's own reviews) -->
      <button
        v-if="isOwnReview"
        @click="$emit('edit', review)"
        class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        :aria-label="t('reviews.edit_review')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
        </svg>
      </button>
    </div>

    <!-- Review title -->
    <h5
      v-if="review.title"
      class="font-semibold text-gray-900 dark:text-white mb-2 text-sm"
    >
      {{ review.title }}
    </h5>

    <!-- Review comment -->
    <p class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">
      {{ review.comment }}
    </p>

    <!-- Review images -->
    <div
      v-if="review.images && review.images.length > 0"
      class="flex gap-2 mb-3 overflow-x-auto pb-2"
    >
      <div
        v-for="(image, index) in review.images"
        :key="index"
        @click="$emit('view-image', { images: review.images, index })"
        class="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
      >
        <img
          :src="image"
          :alt="`Review image ${index + 1}`"
          class="w-full h-full object-cover"
        />
      </div>
    </div>

    <!-- Store response -->
    <div
      v-if="review.response"
      class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 mb-3"
    >
      <div class="flex items-start gap-2 mb-2">
        <svg class="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
        </svg>
        <div class="flex-1">
          <p class="font-semibold text-gray-900 dark:text-white text-xs mb-1">
            {{ t('reviews.response_from', { name: review.response.respondedBy }) }}
          </p>
          <p class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            {{ review.response.text }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{ formatDate(review.response.respondedAt) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Helpful voting -->
    <div class="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
      <span class="text-xs text-gray-500 dark:text-gray-400">
        {{ t('reviews.was_helpful') }}
      </span>

      <div class="flex items-center gap-2">
        <!-- Helpful button -->
        <button
          @click="handleVoteHelpful"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          :class="userVote === 'helpful'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'"
          :aria-label="t('reviews.mark_helpful')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
          </svg>
          <span>{{ review.helpful }}</span>
        </button>

        <!-- Unhelpful button -->
        <button
          @click="handleVoteUnhelpful"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          :class="userVote === 'unhelpful'
            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'"
          :aria-label="t('reviews.mark_unhelpful')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"/>
          </svg>
          <span>{{ review.unhelpful }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useReviewsStore } from '@/stores/reviews'
import type { Review } from '@/stores/reviews'

interface Props {
  review: Review
  isOwnReview?: boolean
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isOwnReview: false,
  compact: false
})

const emit = defineEmits<{
  'edit': [review: Review]
  'view-image': [data: { images: string[], index: number }]
}>()

const { t } = useI18n()
const reviewsStore = useReviewsStore()

// Computed
const userVote = computed(() => reviewsStore.getUserVote(props.review.id))

// Methods
function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) {
    return t('time.just_now')
  } else if (diffInDays === 1) {
    return t('time.yesterday')
  } else if (diffInDays < 7) {
    return t('time.days_ago', diffInDays)
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return t('time.weeks_ago', weeks)
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30)
    return t('time.months_ago', months)
  } else {
    return date.toLocaleDateString()
  }
}

function handleVoteHelpful() {
  reviewsStore.voteHelpful(props.review.id)
}

function handleVoteUnhelpful() {
  reviewsStore.voteUnhelpful(props.review.id)
}
</script>
