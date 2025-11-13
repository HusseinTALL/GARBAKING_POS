<!--
  ReviewForm - Form for submitting product reviews
  Features: star rating, title, comment, image upload, validation
-->

<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
      {{ t('reviews.write_review') }}
    </h3>

    <form @submit.prevent="handleSubmit" class="space-y-5">
      <!-- Rating -->
      <div>
        <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          {{ t('reviews.your_rating') }}
          <span class="text-red-500">*</span>
        </label>
        <div class="flex items-center gap-2">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            @click="rating = star"
            @mouseenter="hoverRating = star"
            @mouseleave="hoverRating = 0"
            class="transition-transform hover:scale-110 active:scale-95"
            :aria-label="`Rate ${star} stars`"
          >
            <svg
              class="w-10 h-10 transition-colors"
              :class="star <= (hoverRating || rating)
                ? 'text-warning-500 fill-current'
                : 'text-gray-300 dark:text-gray-600'"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </button>
          <span v-if="rating" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('reviews.rating_description.' + rating) }}
          </span>
        </div>
        <p v-if="errors.rating" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ errors.rating }}
        </p>
      </div>

      <!-- Title -->
      <div>
        <label for="review-title" class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          {{ t('reviews.review_title') }}
          <span class="text-red-500">*</span>
        </label>
        <input
          id="review-title"
          v-model="title"
          type="text"
          :placeholder="t('reviews.title_placeholder')"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          :class="{ 'border-red-500': errors.title }"
          maxlength="100"
        />
        <div class="flex justify-between mt-1">
          <p v-if="errors.title" class="text-sm text-red-600 dark:text-red-400">
            {{ errors.title }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 ml-auto">
            {{ title.length }}/100
          </p>
        </div>
      </div>

      <!-- Comment -->
      <div>
        <label for="review-comment" class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          {{ t('reviews.your_review') }}
          <span class="text-red-500">*</span>
        </label>
        <textarea
          id="review-comment"
          v-model="comment"
          rows="5"
          :placeholder="t('reviews.comment_placeholder')"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
          :class="{ 'border-red-500': errors.comment }"
          maxlength="500"
        ></textarea>
        <div class="flex justify-between mt-1">
          <p v-if="errors.comment" class="text-sm text-red-600 dark:text-red-400">
            {{ errors.comment }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 ml-auto">
            {{ comment.length }}/500
          </p>
        </div>
      </div>

      <!-- Image upload -->
      <div>
        <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          {{ t('reviews.add_photos') }}
          <span class="text-xs text-gray-500 dark:text-gray-400 font-normal ml-1">
            ({{ t('reviews.optional') }})
          </span>
        </label>

        <!-- Upload button -->
        <div class="flex flex-wrap gap-3">
          <!-- Preview images -->
          <div
            v-for="(image, index) in previewImages"
            :key="index"
            class="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 group"
          >
            <img
              :src="image"
              alt="Review image preview"
              class="w-full h-full object-cover"
            />
            <button
              type="button"
              @click="removeImage(index)"
              class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              :aria-label="t('reviews.remove_photo')"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Upload button -->
          <label
            v-if="previewImages.length < maxImages"
            class="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
          >
            <svg class="w-6 h-6 text-gray-400 dark:text-gray-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span class="text-xs text-gray-500 dark:text-gray-400">{{ t('reviews.add_photo') }}</span>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              multiple
              @change="handleFileSelect"
              class="hidden"
            />
          </label>
        </div>

        <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {{ t('reviews.photo_limit', { max: maxImages }) }}
        </p>
        <p v-if="errors.images" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ errors.images }}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 pt-4">
        <button
          v-if="showCancel"
          type="button"
          @click="$emit('cancel')"
          class="flex-1 py-3 px-6 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          {{ t('reviews.cancel') }}
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="flex-1 py-3 px-6 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg
            v-if="isSubmitting"
            class="animate-spin h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isSubmitting ? t('reviews.submitting') : t('reviews.submit_review') }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useReviewsStore } from '@/stores/reviews'
import { useProfileStore } from '@/stores/profile'

interface Props {
  productId: string
  productName: string
  showCancel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showCancel: false
})

const emit = defineEmits<{
  'submit': [reviewId: string]
  'cancel': []
}>()

const { t } = useI18n()
const reviewsStore = useReviewsStore()
const profileStore = useProfileStore()

// State
const rating = ref(0)
const hoverRating = ref(0)
const title = ref('')
const comment = ref('')
const previewImages = ref<string[]>([])
const imageFiles = ref<File[]>([])
const isSubmitting = ref(false)
const errors = ref<Record<string, string>>({})
const maxImages = 5
const fileInput = ref<HTMLInputElement | null>(null)

// Methods
function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (!files) return

  // Check total images
  if (previewImages.value.length + files.length > maxImages) {
    errors.value.images = t('reviews.too_many_photos', { max: maxImages })
    return
  }

  // Process each file
  Array.from(files).forEach(file => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      errors.value.images = t('reviews.invalid_file_type')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      errors.value.images = t('reviews.file_too_large')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        previewImages.value.push(e.target.result as string)
        imageFiles.value.push(file)
      }
    }
    reader.readAsDataURL(file)
  })

  // Clear input
  if (target) {
    target.value = ''
  }
  errors.value.images = ''
}

function removeImage(index: number) {
  previewImages.value.splice(index, 1)
  imageFiles.value.splice(index, 1)
}

function validateForm(): boolean {
  errors.value = {}

  if (rating.value === 0) {
    errors.value.rating = t('reviews.rating_required')
  }

  if (!title.value.trim()) {
    errors.value.title = t('reviews.title_required')
  } else if (title.value.length < 5) {
    errors.value.title = t('reviews.title_too_short')
  }

  if (!comment.value.trim()) {
    errors.value.comment = t('reviews.comment_required')
  } else if (comment.value.length < 20) {
    errors.value.comment = t('reviews.comment_too_short')
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    // In a real app, you would upload images first and get URLs
    // For now, we'll use the preview images as URLs
    const reviewData = {
      userId: profileStore.profile.id || 'guest',
      userName: profileStore.profile.name || t('profile.guest_user'),
      userAvatar: profileStore.profile.avatar,
      productId: props.productId,
      productName: props.productName,
      rating: rating.value,
      title: title.value.trim(),
      comment: comment.value.trim(),
      images: previewImages.value.length > 0 ? previewImages.value : undefined,
      verified: true // In real app, this would be determined by purchase history
    }

    const review = await reviewsStore.submitReview(reviewData)

    // Reset form
    rating.value = 0
    title.value = ''
    comment.value = ''
    previewImages.value = []
    imageFiles.value = []
    errors.value = {}

    emit('submit', review.id)
  } catch (error: any) {
    errors.value.submit = error.message || t('reviews.submit_failed')
  } finally {
    isSubmitting.value = false
  }
}
</script>
