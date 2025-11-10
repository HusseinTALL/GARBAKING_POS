<!--
  RatingStars Component
  Interactive star rating (input + display modes)
  Features: half-star support, hover preview, labels, readonly mode, custom colors
-->

<template>
  <div class="rating-stars">
    <!-- Stars Container -->
    <div
      :class="[
        'inline-flex items-center gap-1',
        size === 'sm' && 'gap-0.5',
        size === 'lg' && 'gap-1.5',
        size === 'xl' && 'gap-2'
      ]"
      @mouseleave="handleMouseLeave"
    >
      <button
        v-for="star in maxStars"
        :key="star"
        type="button"
        :disabled="readonly || disabled"
        @click="handleStarClick(star)"
        @mouseenter="handleMouseEnter(star)"
        :class="[
          'relative transition-all duration-200',
          !readonly && !disabled && 'cursor-pointer hover:scale-110',
          readonly && 'cursor-default',
          disabled && 'opacity-50 cursor-not-allowed'
        ]"
        :aria-label="`Rate ${star} out of ${maxStars} stars`"
      >
        <!-- Background Star (empty) -->
        <svg
          :class="[
            starSizeClasses,
            'text-gray-300 dark:text-gray-600'
          ]"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>

        <!-- Filled Star (colored) -->
        <div
          class="absolute inset-0 overflow-hidden transition-all duration-200"
          :style="{ width: getStarFillWidth(star) }"
        >
          <svg
            :class="[
              starSizeClasses,
              colorClasses
            ]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        </div>
      </button>
    </div>

    <!-- Label / Value Display -->
    <div
      v-if="showLabel || showValue"
      class="inline-flex items-center gap-2 ml-2"
    >
      <!-- Numeric Value -->
      <span
        v-if="showValue"
        :class="[
          'font-bold',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-lg',
          size === 'xl' && 'text-xl',
          valueColorClasses
        ]"
      >
        {{ displayValue.toFixed(precision) }}
      </span>

      <!-- Label Text -->
      <span
        v-if="showLabel && label"
        :class="[
          'text-gray-600 dark:text-gray-400',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base',
          size === 'xl' && 'text-lg'
        ]"
      >
        {{ label }}
      </span>

      <!-- Review Count -->
      <span
        v-if="showReviewCount && reviewCount !== undefined"
        :class="[
          'text-gray-500 dark:text-gray-400',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base'
        ]"
      >
        ({{ formatReviewCount(reviewCount) }})
      </span>
    </div>

    <!-- Rating Text (optional) -->
    <p
      v-if="showRatingText"
      :class="[
        'mt-1 text-sm text-gray-600 dark:text-gray-400',
        size === 'sm' && 'text-xs'
      ]"
    >
      {{ getRatingText(displayValue) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

export interface RatingStarsProps {
  modelValue?: number
  maxStars?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  precision?: number
  allowHalf?: boolean
  readonly?: boolean
  disabled?: boolean
  color?: 'warning' | 'primary' | 'success' | 'error'
  showValue?: boolean
  showLabel?: boolean
  showReviewCount?: boolean
  showRatingText?: boolean
  label?: string
  reviewCount?: number
  ratingTexts?: string[]
}

const props = withDefaults(defineProps<RatingStarsProps>(), {
  modelValue: 0,
  maxStars: 5,
  size: 'md',
  precision: 1,
  allowHalf: true,
  readonly: false,
  disabled: false,
  color: 'warning',
  showValue: false,
  showLabel: false,
  showReviewCount: false,
  showRatingText: false,
  label: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  change: [value: number]
  hover: [value: number]
}>()

// Refs
const hoverValue = ref<number | null>(null)

// Computed
const displayValue = computed(() => {
  return hoverValue.value !== null ? hoverValue.value : props.modelValue
})

const starSizeClasses = computed(() => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }
  return sizes[props.size]
})

const colorClasses = computed(() => {
  const colors = {
    warning: 'text-warning-500',
    primary: 'text-primary-500',
    success: 'text-success-500',
    error: 'text-error-500'
  }
  return colors[props.color]
})

const valueColorClasses = computed(() => {
  const colors = {
    warning: 'text-warning-600 dark:text-warning-400',
    primary: 'text-primary-600 dark:text-primary-400',
    success: 'text-success-600 dark:text-success-400',
    error: 'text-error-600 dark:text-error-400'
  }
  return colors[props.color]
})

// Methods
const getStarFillWidth = (star: number) => {
  const value = displayValue.value
  const diff = value - (star - 1)

  if (diff >= 1) {
    return '100%'
  } else if (diff > 0 && props.allowHalf) {
    return `${diff * 100}%`
  } else {
    return '0%'
  }
}

const handleStarClick = (star: number) => {
  if (props.readonly || props.disabled) return

  let newValue = star

  // Allow half stars on click if enabled
  if (props.allowHalf) {
    // If clicking the same star, toggle between full and half
    if (star === Math.ceil(props.modelValue)) {
      const isFullStar = props.modelValue === star
      newValue = isFullStar ? star - 0.5 : star
    }
  }

  // Round to precision
  newValue = Math.round(newValue / (1 / Math.pow(10, props.precision))) / Math.pow(10, props.precision)

  emit('update:modelValue', newValue)
  emit('change', newValue)
}

const handleMouseEnter = (star: number) => {
  if (props.readonly || props.disabled) return

  hoverValue.value = star
  emit('hover', star)
}

const handleMouseLeave = () => {
  if (props.readonly || props.disabled) return

  hoverValue.value = null
}

const formatReviewCount = (count: number) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

const getRatingText = (rating: number) => {
  if (props.ratingTexts && props.ratingTexts.length === props.maxStars) {
    const index = Math.ceil(rating) - 1
    return props.ratingTexts[index] || ''
  }

  // Default rating texts
  const texts = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
  const index = Math.ceil(rating) - 1
  return texts[index] || ''
}
</script>

<style scoped>
.rating-stars button {
  -webkit-tap-highlight-color: transparent;
}
</style>
