<!--
  POS Header Component
  Top header bar with page title, order tabs, action buttons, and user profile
-->
<template>
  <header class="header-bar">
    <div class="header-left">
      <h1 class="page-title">{{ pageTitle }}</h1>

      <!-- Tab Navigation -->
      <div class="tab-nav">
        <button
          v-for="tab in orderTabs"
          :key="tab.id"
          @click="$emit('orderTabChange', tab.id)"
          :class="['tab-btn', { active: activeOrderTab === tab.id }]"
        >
          <component :is="tab.icon" class="tab-icon" />
          <span>{{ tab.label }}</span>
        </button>
      </div>
    </div>

    <div class="header-right">
      <!-- Action Buttons -->
      <button class="action-btn secondary">Take Away</button>
      <button class="action-btn primary">
        Dine In
        <ChevronDown class="w-4 h-4 ml-1" />
      </button>
      <button class="action-btn ghost">Deliver</button>
      <button class="action-btn ghost">Cancel</button>

      <!-- User Profile -->
      <div class="user-profile">
        <img
          :src="`https://ui-avatars.com/api/?name=${cashierName}&background=5B63D3&color=fff`"
          :alt="cashierName"
          class="user-avatar"
        />
        <div class="user-info">
          <div class="user-name">{{ cashierName }}</div>
          <div class="user-role">Cashier 01</div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ChevronDown, FileText } from 'lucide-vue-next'

interface OrderTab {
  id: string
  label: string
  icon: any
}

interface Props {
  pageTitle: string
  activeOrderTab: string
  cashierName: string
}

defineProps<Props>()

defineEmits<{
  orderTabChange: [tabId: string]
}>()

// Order tabs data
const orderTabs: OrderTab[] = [
  { id: 'order1', label: '#219022', icon: FileText },
  { id: 'order2', label: '#219021', icon: FileText },
  { id: 'order3', label: '#219020', icon: FileText }
]
</script>

<style scoped>
/* Header Bar */
.header-bar {
  background: white;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.tab-nav {
  display: flex;
  gap: 8px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  transition: background-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: background-color, border-color;
  transform: translate3d(0, 0, 0);
}

.tab-btn:hover {
  background: #f9fafb;
}

.tab-btn.active {
  background: #eef2ff;
  border-color: #5b63d3;
  color: #5b63d3;
}

.tab-icon {
  width: 16px;
  height: 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.08s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: background-color, transform;
  transform: translate3d(0, 0, 0);
}

.action-btn.primary {
  background: #5b63d3;
  color: white;
}

.action-btn.primary:hover {
  background: #4c51bf;
}

.action-btn.secondary {
  background: white;
  color: #5b63d3;
  border: 2px solid #5b63d3;
}

.action-btn.secondary:hover {
  background: #eef2ff;
}

.action-btn.ghost {
  background: transparent;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.action-btn.ghost:hover {
  background: #f9fafb;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 12px;
  border-left: 1px solid #e5e7eb;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.user-role {
  font-size: 12px;
  color: #6b7280;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .action-btn.ghost {
    display: none;
  }
}

@media (max-width: 768px) {
  .header-bar {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  .header-left {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .user-profile {
    display: none;
  }
}

@media (max-width: 480px) {
  .action-btn {
    padding: 8px 12px;
    font-size: 13px;
  }

  .action-btn.secondary {
    border-width: 1px;
  }

  .tab-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>