<!--
  Order Header Component
  Header section with customer info and order details
-->
<template>
  <div class="order-header">
    <div class="order-title-section">
      <h2 class="order-title">Order Summary</h2>
      <button class="order-menu-btn" @click="$emit('showMenu')">
        <MoreVertical class="w-5 h-5" />
      </button>
    </div>

    <div class="customer-section">
      <div class="customer-avatar">
        <User class="w-5 h-5" />
      </div>
      <div class="customer-info">
        <div class="customer-name">{{ customerName }}</div>
        <div class="customer-details">{{ customerType }} • Table {{ tableNumber }}</div>
      </div>
      <div class="order-status" :class="statusClass">
        <div class="status-dot"></div>
        <span>{{ orderStatus }}</span>
      </div>
    </div>

    <div class="order-meta">
      <div class="order-number">
        <span class="meta-label">Order #</span>
        <span class="meta-value">{{ orderNumber }}</span>
      </div>
      <div class="order-time">
        <Clock class="w-4 h-4" />
        <span class="time-value">{{ formatTime(orderTime) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MoreVertical, User, Clock } from 'lucide-vue-next'

interface Props {
  customerName?: string
  customerType?: string
  tableNumber?: number
  orderNumber: string
  orderStatus?: 'pending' | 'preparing' | 'ready' | 'completed'
  orderTime?: Date
}

const props = withDefaults(defineProps<Props>(), {
  customerName: 'Walk-in Customer',
  customerType: 'Dine In',
  tableNumber: 12,
  orderStatus: 'pending',
  orderTime: () => new Date()
})

const emit = defineEmits<{
  showMenu: []
}>()

const statusClass = computed(() => {
  const classes = {
    pending: 'status-pending',
    preparing: 'status-preparing',
    ready: 'status-ready',
    completed: 'status-completed'
  }
  return classes[props.orderStatus]
})

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}
</script>

<style scoped>
.order-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.order-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grid)" /></svg>');
  pointer-events: none;
}

.order-title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.order-title {
  font-size: 22px;
  font-weight: 700;
  color: white;
  margin: 0;
}

.order-menu-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  backdrop-filter: blur(10px);
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: background-color, transform;
  transform: translate3d(0, 0, 0);
}

.order-menu-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translate3d(0, -1px, 0);
}

.customer-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

.customer-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  backdrop-filter: blur(10px);
}

.customer-info {
  flex: 1;
}

.customer-name {
  font-size: 16px;
  font-weight: 600;
  color: white;
  line-height: 1.2;
}

.customer-details {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 2px;
}

.order-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-pending {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.status-pending .status-dot {
  background: #fbbf24;
}

.status-preparing {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.status-preparing .status-dot {
  background: #3b82f6;
}

.status-ready {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-ready .status-dot {
  background: #22c55e;
}

.status-completed {
  background: rgba(156, 163, 175, 0.2);
  color: #9ca3af;
  border: 1px solid rgba(156, 163, 175, 0.3);
}

.status-completed .status-dot {
  background: #9ca3af;
}

.order-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.order-number {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-value {
  font-size: 16px;
  font-weight: 700;
  color: white;
}

.order-time {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  font-weight: 500;
}

.time-value {
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .order-header {
    padding: 20px;
  }

  .order-title {
    font-size: 20px;
  }

  .customer-section {
    margin-bottom: 14px;
  }
}
</style>