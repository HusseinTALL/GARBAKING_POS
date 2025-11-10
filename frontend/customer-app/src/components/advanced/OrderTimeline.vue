<!--
  OrderTimeline Component
  Visual order progress tracker with status updates
  Displays: Order placed → Confirmed → Preparing → Out for delivery → Delivered
  Features: timestamps, animated progress, estimated time, step details
-->

<template>
  <div class="order-timeline">
    <!-- Timeline Steps -->
    <div class="relative">
      <!-- Progress Bar Background -->
      <div class="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200 dark:bg-gray-700" />

      <!-- Active Progress Bar -->
      <div
        class="absolute left-6 top-8 w-0.5 bg-primary-500 dark:bg-primary-400 transition-all duration-1000 ease-out"
        :style="{ height: progressHeight }"
      />

      <!-- Steps -->
      <div class="relative space-y-8">
        <div
          v-for="(step, index) in steps"
          :key="step.id"
          class="relative flex items-start gap-4"
        >
          <!-- Step Icon/Number -->
          <div
            :class="[
              'relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 transition-all duration-500',
              getStepClasses(step.status)
            ]"
          >
            <!-- Completed -->
            <svg
              v-if="step.status === 'completed'"
              class="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>

            <!-- In Progress -->
            <div
              v-else-if="step.status === 'in-progress'"
              class="w-3 h-3 bg-white rounded-full animate-pulse"
            />

            <!-- Pending -->
            <span
              v-else
              class="text-sm font-semibold text-gray-400 dark:text-gray-500"
            >
              {{ index + 1 }}
            </span>

            <!-- Pulse Animation (in-progress only) -->
            <div
              v-if="step.status === 'in-progress'"
              class="absolute inset-0 rounded-full bg-primary-500 animate-ping opacity-75"
            />
          </div>

          <!-- Step Content -->
          <div class="flex-1 pb-8">
            <!-- Step Title & Time -->
            <div class="flex items-start justify-between mb-2">
              <div>
                <h3
                  :class="[
                    'text-base font-bold',
                    step.status === 'completed' || step.status === 'in-progress'
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-400 dark:text-gray-500'
                  ]"
                >
                  {{ step.title }}
                </h3>
                <p
                  v-if="step.description"
                  :class="[
                    'text-sm mt-1',
                    step.status === 'completed' || step.status === 'in-progress'
                      ? 'text-gray-600 dark:text-gray-400'
                      : 'text-gray-400 dark:text-gray-500'
                  ]"
                >
                  {{ step.description }}
                </p>
              </div>

              <!-- Timestamp -->
              <div
                v-if="step.timestamp"
                class="text-right flex-shrink-0 ml-4"
              >
                <div class="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {{ formatTime(step.timestamp) }}
                </div>
                <div class="text-xs text-gray-400 dark:text-gray-500">
                  {{ formatDate(step.timestamp) }}
                </div>
              </div>
            </div>

            <!-- Estimated Time (in-progress only) -->
            <div
              v-if="step.status === 'in-progress' && step.estimatedTime"
              class="flex items-center gap-2 mt-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl"
            >
              <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="text-sm font-semibold text-primary-700 dark:text-primary-300">
                Est. {{ step.estimatedTime }}
              </span>
            </div>

            <!-- Step Details -->
            <div
              v-if="step.details && (step.status === 'completed' || step.status === 'in-progress')"
              class="mt-3 space-y-2"
            >
              <div
                v-for="(detail, idx) in step.details"
                :key="idx"
                class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
              >
                <svg class="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span>{{ detail }}</span>
              </div>
            </div>

            <!-- Custom Slot for Additional Content -->
            <slot :name="`step-${step.id}`" :step="step" />
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Card (Optional) -->
    <div
      v-if="showSummary && currentStep"
      class="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl"
    >
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Current Status
        </h4>
        <BaseBadge
          :label="currentStep.title"
          :variant="getStatusVariant(currentStep.status)"
          size="sm"
        />
      </div>

      <div class="flex items-center gap-3">
        <div class="flex-1">
          <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full bg-primary-500 dark:bg-primary-400 rounded-full transition-all duration-1000"
              :style="{ width: `${progressPercentage}%` }"
            />
          </div>
        </div>
        <span class="text-sm font-bold text-primary-500">
          {{ progressPercentage }}%
        </span>
      </div>

      <p v-if="currentStep.estimatedTime" class="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Estimated completion: {{ currentStep.estimatedTime }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseBadge from '@/components/base/BaseBadge.vue'

export interface TimelineStep {
  id: string
  title: string
  description?: string
  status: 'completed' | 'in-progress' | 'pending' | 'failed'
  timestamp?: Date | string
  estimatedTime?: string
  details?: string[]
  icon?: any
}

export interface OrderTimelineProps {
  steps: TimelineStep[]
  showSummary?: boolean
}

const props = withDefaults(defineProps<OrderTimelineProps>(), {
  showSummary: true
})

// Computed
const currentStepIndex = computed(() => {
  return props.steps.findIndex(step =>
    step.status === 'in-progress' || step.status === 'failed'
  )
})

const currentStep = computed(() => {
  return currentStepIndex.value >= 0
    ? props.steps[currentStepIndex.value]
    : props.steps[props.steps.length - 1]
})

const completedSteps = computed(() => {
  return props.steps.filter(step => step.status === 'completed').length
})

const progressPercentage = computed(() => {
  const total = props.steps.length
  const completed = completedSteps.value
  const inProgress = currentStepIndex.value >= 0 ? 0.5 : 0

  return Math.round(((completed + inProgress) / total) * 100)
})

const progressHeight = computed(() => {
  const stepHeight = 8 * 16 // 8rem in pixels (Tailwind space-y-8)
  const baseOffset = 2 * 16 // 2rem

  if (currentStepIndex.value < 0) {
    // All completed or all pending
    const completed = completedSteps.value
    return `${(completed - 1) * stepHeight + baseOffset}px`
  }

  // Progress to current step
  const height = currentStepIndex.value * stepHeight + baseOffset
  return `${height}px`
})

// Methods
const getStepClasses = (status: TimelineStep['status']) => {
  const classes = {
    completed: 'bg-success-500 border-success-500',
    'in-progress': 'bg-primary-500 border-primary-500',
    pending: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    failed: 'bg-error-500 border-error-500'
  }

  return classes[status]
}

const getStatusVariant = (status: TimelineStep['status']) => {
  const variants = {
    completed: 'success' as const,
    'in-progress': 'primary' as const,
    pending: 'default' as const,
    failed: 'error' as const
  }

  return variants[status]
}

const formatTime = (timestamp: Date | string) => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

const formatDate = (timestamp: Date | string) => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }
}
</script>

<style scoped>
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>
