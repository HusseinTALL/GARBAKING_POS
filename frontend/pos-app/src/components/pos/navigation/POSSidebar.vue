<!--
  POS Sidebar Navigation Component
  Fixed sidebar with brand, navigation items, and settings
-->
<template>
  <aside class="sidebar">
    <!-- Brand -->
    <div class="sidebar-brand">
      <div class="brand-icon">
        <Utensils class="w-6 h-6" />
      </div>
      <span class="brand-text">Admin POS</span>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <div
        v-for="item in navigationItems"
        :key="item.id"
        class="nav-item"
        :class="{ active: activeTab === item.id }"
        @click="$emit('tabChange', item.id)"
      >
        <component :is="item.icon" class="nav-icon" />
        <span class="nav-text">{{ item.label }}</span>
        <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
      </div>
    </nav>

    <!-- Bottom Navigation -->
    <div class="sidebar-bottom">
      <div class="nav-item" @click="$emit('showSettings')">
        <Settings class="nav-icon" />
        <span class="nav-text">Settings</span>
      </div>

      <div class="nav-item logout" @click="$emit('logout')">
        <LogOut class="nav-icon" />
        <span class="nav-text">Logout</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import {
  Utensils,
  ShoppingCart,
  FileText,
  Package,
  BarChart3,
  Users,
  Settings,
  LogOut
} from 'lucide-vue-next'

interface NavigationItem {
  id: string
  label: string
  icon: any
  badge?: string | number
}

interface Props {
  activeTab: string
}

defineProps<Props>()

defineEmits<{
  tabChange: [tab: string]
  showSettings: []
  logout: []
}>()

// Navigation items configuration
const navigationItems: NavigationItem[] = [
  { id: 'sales', label: 'Sales Analytic', icon: ShoppingCart, badge: '5' },
  { id: 'orders', label: 'Orders', icon: FileText },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'customers', label: 'Customers', icon: Users }
]
</script>

<style scoped>
/* Sidebar */
.sidebar {
  width: 240px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  transition: transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform;
}

.sidebar-brand {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.brand-icon {
  width: 40px;
  height: 40px;
  background: #5b63d3;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.brand-text {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94), color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: background-color;
  margin-bottom: 4px;
  position: relative;
}

.nav-item:hover {
  background: #f3f4f6;
}

.nav-item.active {
  background: #eef2ff;
  color: #5b63d3;
}

.nav-icon {
  width: 20px;
  height: 20px;
  color: #6b7280;
}

.nav-item.active .nav-icon {
  color: #5b63d3;
}

.nav-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
}

.nav-item.active .nav-text {
  color: #5b63d3;
}

.nav-badge {
  background: #5b63d3;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
}

.sidebar-bottom {
  padding: 12px;
  border-top: 1px solid #e5e7eb;
}

.nav-item.logout {
  color: #ef4444;
}

.nav-item.logout:hover {
  background: #fee2e2;
}
</style>