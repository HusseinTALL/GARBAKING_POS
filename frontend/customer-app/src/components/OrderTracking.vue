<!--
  OrderTracking.vue
  Visual timeline tracking for order status
  Features: status timeline, progress indicator, estimated times, status descriptions
-->

<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
    <h3 class="font-bold text-gray-900 dark:text-white mb-6">Order Status</h3>

    <!-- Progress Timeline -->
    <div class="space-y-6">
      <div
        v-for="(step, index) in orderSteps"
        :key="step.status"
        class="relative flex items-start gap-4"
      >
        <!-- Timeline Line -->
        <div
          v-if="index < orderSteps.length - 1"
          class="absolute left-5 top-12 w-0.5 h-full -ml-px transition-colors"
          :class="isStepCompleted(index + 1) ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'"
        ></div>

        <!-- Status Icon -->
        <div class="relative flex-shrink-0">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center transition-all"
            :class="getStepClass(step)"
          >
            <!-- Completed -->
            <svg
              v-if="isStepCompleted(index)"
              class="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>

            <!-- Current -->
            <div
              v-else-if="isStepCurrent(index)"
              class="w-3 h-3 bg-white rounded-full animate-pulse"
            ></div>

            <!-- Upcoming -->
            <div
              v-else
              class="w-2 h-2 bg-current rounded-full opacity-40"
            ></div>
          </div>

          <!-- Pulse animation for current step -->
          <div
            v-if="isStepCurrent(index)"
            class="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-75"
          ></div>
        </div>

        <!-- Status Content -->
        <div class="flex-1 pb-8">
          <div class="flex items-start justify-between">
            <div>
              <h4
                class="font-semibold text-sm transition-colors"
                :class="isStepCompleted(index) || isStepCurrent(index) ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-500'"
              >
                {{ step.label }}
              </h4>
              <p
                class="text-xs mt-1 transition-colors"
                :class="isStepCompleted(index) || isStepCurrent(index) ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600'"
              >
                {{ step.description }}
              </p>

              <!-- Timestamp for completed steps -->
              <p
                v-if="isStepCompleted(index) && step.timestamp"
                class="text-xs text-orange-600 dark:text-orange-400 mt-1 font-medium"
              >
                {{ formatTime(step.timestamp) }}
              </p>

              <!-- Estimated time for current step -->
              <p
                v-else-if="isStepCurrent(index) && step.estimatedTime"
                class="text-xs text-orange-600 dark:text-orange-400 mt-1 font-medium"
              >
                Est. {{ step.estimatedTime }}
              </p>
            </div>

            <!-- Status Badge -->
            <span
              v-if="isStepCurrent(index)"
              class="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
            >
              In Progress
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Additional Info -->
    <div v-if="order.status !== 'DELIVERED' && order.status !== 'CANCELLED'" class="mt-6 pt-6 border-t dark:border-gray-700">
      <div class="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="flex-1">
          <p class="text-sm font-medium text-blue-900 dark:text-blue-300">
            Need help with your order?
          </p>
          <p class="text-xs text-blue-700 dark:text-blue-400 mt-1">
            Contact support at <a href="tel:+2250123456789" class="underline">+225 01 23 45 67 89</a>
          </p>
        </div>
      </div>
    </div>

    <!-- Delivered Success Message -->
    <div v-if="order.status === 'DELIVERED'" class="mt-6 pt-6 border-t dark:border-gray-700">
      <div class="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <svg class="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="flex-1">
          <p class="text-sm font-medium text-green-900 dark:text-green-300">
            Order delivered successfully!
          </p>
          <p class="text-xs text-green-700 dark:text-green-400 mt-1">
            We hope you enjoyed your meal. Rate your experience?
          </p>
        </div>
      </div>
    </div>

    <!-- Cancelled Message -->
    <div v-if="order.status === 'CANCELLED'" class="mt-6 pt-6 border-t dark:border-gray-700">
      <div class="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <svg class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="flex-1">
          <p class="text-sm font-medium text-red-900 dark:text-red-300">
            Order was cancelled
          </p>
          <p class="text-xs text-red-700 dark:text-red-400 mt-1">
            If you have questions, please contact support.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { OrderStatus } from '@/stores/order'

// Props
interface Props {
  order: any
}

const props = defineProps<Props>()

// Order steps configuration
const orderSteps = computed(() => {
  const steps = [
    {
      status: OrderStatus.PENDING,
      label: 'Order Placed',
      description: 'Your order has been received',
      estimatedTime: 'Just now',
      timestamp: props.order.createdAt
    },
    {
      status: OrderStatus.CONFIRMED,
      label: 'Order Confirmed',
      description: 'Restaurant confirmed your order',
      estimatedTime: '1-2 minutes',
      timestamp: null
    },
    {
      status: OrderStatus.PREPARING,
      label: 'Preparing',
      description: 'Your food is being prepared',
      estimatedTime: '15-20 minutes',
      timestamp: null
    },
    {
      status: OrderStatus.READY,
      label: 'Ready',
      description: 'Your order is ready',
      estimatedTime: '5 minutes',
      timestamp: null
    }
  ]

  // Add delivery-specific steps
  if (props.order.deliveryAddress) {
    steps.push(
      {
        status: OrderStatus.OUT_FOR_DELIVERY,
        label: 'Out for Delivery',
        description: 'Driver is on the way',
        estimatedTime: '10-15 minutes',
        timestamp: null
      },
      {
        status: OrderStatus.DELIVERED,
        label: 'Delivered',
        description: 'Enjoy your meal!',
        estimatedTime: null,
        timestamp: null
      }
    )
  } else {
    steps.push({
      status: OrderStatus.DELIVERED,
      label: 'Ready for Pickup',
      description: 'Collect your order',
      estimatedTime: null,
      timestamp: null
    })
  }

  return steps
})

// Status order mapping
const statusOrder = {
  [OrderStatus.PENDING]: 0,
  [OrderStatus.CONFIRMED]: 1,
  [OrderStatus.PREPARING]: 2,
  [OrderStatus.READY]: 3,
  [OrderStatus.OUT_FOR_DELIVERY]: 4,
  [OrderStatus.DELIVERED]: 5,
  [OrderStatus.CANCELLED]: -1
}

const currentStatusIndex = computed(() => {
  return statusOrder[props.order.status as OrderStatus] ?? 0
})

// Methods
const isStepCompleted = (stepIndex: number): boolean => {
  if (props.order.status === OrderStatus.CANCELLED) return false
  return stepIndex < currentStatusIndex.value
}

const isStepCurrent = (stepIndex: number): boolean => {
  if (props.order.status === OrderStatus.CANCELLED) return false
  return stepIndex === currentStatusIndex.value
}

const getStepClass = (step: any): string => {
  const stepIndex = orderSteps.value.findIndex(s => s.status === step.status)

  if (props.order.status === OrderStatus.CANCELLED) {
    return 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-600'
  }

  if (isStepCompleted(stepIndex)) {
    return 'bg-orange-500 text-white'
  }

  if (isStepCurrent(stepIndex)) {
    return 'bg-orange-500 text-white'
  }

  return 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-600'
}

const formatTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })
}
</script>
