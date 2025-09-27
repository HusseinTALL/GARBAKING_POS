<!--
  Order Progress Component
  Visual progress tracker for order stages
-->
<template>
  <div class="order-progress">
    <h4 class="progress-title">Order Progress</h4>

    <div class="progress-timeline">
      <div
        v-for="(stage, index) in orderStages"
        :key="stage.id"
        class="progress-stage"
        :class="{
          active: index <= currentStageIndex,
          current: index === currentStageIndex,
          completed: index < currentStageIndex
        }"
      >
        <div class="stage-indicator">
          <div class="stage-dot">
            <Check class="w-3 h-3" v-if="index < currentStageIndex" />
            <component :is="stage.icon" class="w-3 h-3" v-else />
          </div>
          <div class="stage-line" v-if="index < orderStages.length - 1"></div>
        </div>

        <div class="stage-content">
          <div class="stage-title">{{ stage.title }}</div>
          <div class="stage-time" v-if="stage.time">
            <Clock class="w-3 h-3" />
            <span>{{ formatTime(stage.time) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="progress-summary" v-if="currentStage">
      <div class="current-status">
        <div class="status-indicator" :class="currentStage.statusClass">
          <component :is="currentStage.icon" class="w-4 h-4" />
        </div>
        <div class="status-text">
          <div class="status-title">{{ currentStage.title }}</div>
          <div class="status-description">{{ currentStage.description }}</div>
        </div>
      </div>

      <div class="estimated-time" v-if="estimatedCompletionTime">
        <span class="time-label">Est. completion:</span>
        <span class="time-value">{{ formatTime(estimatedCompletionTime) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Clock,
  Check,
  ShoppingCart,
  ChefHat,
  Truck,
  CheckCircle,
  AlertCircle,
  PlayCircle
} from 'lucide-vue-next'

interface OrderStage {
  id: string
  title: string
  description: string
  icon: any
  statusClass: string
  time?: Date
}

interface Props {
  orderStatus: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'completed'
  orderTime?: Date
  estimatedDuration?: number // in minutes
}

const props = withDefaults(defineProps<Props>(), {
  orderStatus: 'pending',
  orderTime: () => new Date(),
  estimatedDuration: 20
})

const orderStages: OrderStage[] = [
  {
    id: 'pending',
    title: 'Order Placed',
    description: 'Your order has been received',
    icon: ShoppingCart,
    statusClass: 'status-pending',
    time: props.orderTime
  },
  {
    id: 'confirmed',
    title: 'Order Confirmed',
    description: 'Order confirmed and sent to kitchen',
    icon: CheckCircle,
    statusClass: 'status-confirmed'
  },
  {
    id: 'preparing',
    title: 'Preparing',
    description: 'Kitchen is preparing your order',
    icon: ChefHat,
    statusClass: 'status-preparing'
  },
  {
    id: 'ready',
    title: 'Ready',
    description: 'Your order is ready for pickup/delivery',
    icon: AlertCircle,
    statusClass: 'status-ready'
  },
  {
    id: 'completed',
    title: 'Completed',
    description: 'Order has been delivered/picked up',
    icon: CheckCircle,
    statusClass: 'status-completed'
  }
]

const currentStageIndex = computed(() => {
  return orderStages.findIndex(stage => stage.id === props.orderStatus)
})

const currentStage = computed(() => {
  return orderStages[currentStageIndex.value]
})

const estimatedCompletionTime = computed(() => {
  if (!props.orderTime || !props.estimatedDuration) return null

  const completion = new Date(props.orderTime.getTime() + props.estimatedDuration * 60000)
  return completion
})

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

// Set completion times for completed stages
const setStageCompletionTimes = () => {
  const now = new Date()
  const stageDuration = props.estimatedDuration / orderStages.length

  orderStages.forEach((stage, index) => {
    if (index <= currentStageIndex.value && index > 0) {
      stage.time = new Date(props.orderTime.getTime() + index * stageDuration * 60000)
    }
  })
}

setStageCompletionTimes()
</script>

<style scoped>
.order-progress {
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  margin-bottom: 16px;
}

.progress-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-title::before {
  content: '📊';
  font-size: 16px;
}

.progress-timeline {
  position: relative;
}

.progress-stage {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  position: relative;
}

.progress-stage:last-child {
  margin-bottom: 0;
}

.stage-indicator {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stage-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #9ca3af;
  border: 2px solid #e5e7eb;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  z-index: 1;
}

.stage-line {
  width: 2px;
  height: 24px;
  background: #e5e7eb;
  margin-top: 8px;
  transition: background-color 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.progress-stage.active .stage-dot {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #3b82f6;
}

.progress-stage.current .stage-dot {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}

.progress-stage.completed .stage-dot {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

.progress-stage.active .stage-line,
.progress-stage.completed .stage-line {
  background: #3b82f6;
}

.stage-content {
  flex: 1;
  padding-top: 4px;
}

.stage-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.progress-stage.active .stage-title,
.progress-stage.current .stage-title {
  color: #1f2937;
}

.stage-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
}

.progress-stage.current .stage-time {
  color: #3b82f6;
  font-weight: 500;
}

.progress-summary {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.current-status {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.status-indicator {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-pending {
  background: #fef3c7;
  color: #d97706;
}

.status-confirmed {
  background: #dbeafe;
  color: #2563eb;
}

.status-preparing {
  background: #fde2e7;
  color: #dc2626;
}

.status-ready {
  background: #d1fae5;
  color: #059669;
}

.status-completed {
  background: #f3f4f6;
  color: #6b7280;
}

.status-text {
  flex: 1;
}

.status-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
}

.status-description {
  font-size: 13px;
  color: #6b7280;
}

.estimated-time {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.time-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.time-value {
  font-size: 14px;
  color: #1e293b;
  font-weight: 600;
}
</style>