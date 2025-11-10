<!--
  Modern MainLayout with Enhanced Responsive Sidebar
  Features collapsible sidebar, mobile drawer, and smooth transitions
-->
<template>
  <div class="main-layout">
    <!-- Enhanced Responsive Sidebar -->
    <ResponsiveSidebar />

    <!-- Main Content Area -->
    <main :class="['main-content', { 'main-content-collapsed': isSidebarCollapsed }]">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import ResponsiveSidebar from '@/components/layout/ResponsiveSidebar.vue'

const isSidebarCollapsed = ref(false)
const isMobile = ref(false)

// Check if sidebar is collapsed from localStorage
const checkSidebarState = () => {
  const saved = localStorage.getItem('sidebar-collapsed')
  isSidebarCollapsed.value = saved === 'true'
}

// Check mobile breakpoint
const checkMobile = () => {
  const wasMobile = isMobile.value
  isMobile.value = window.innerWidth < 1024

  // If we're on mobile, don't apply collapsed class
  if (isMobile.value && !wasMobile) {
    checkSidebarState()
  }
}

// Listen for sidebar state changes
const handleStorageChange = (e: StorageEvent) => {
  if (e.key === 'sidebar-collapsed' || e.key === null) {
    checkSidebarState()
  }
}

// Polling interval for state checks (fallback)
let stateCheckInterval: number | null = null

onMounted(() => {
  checkSidebarState()
  checkMobile()

  window.addEventListener('storage', handleStorageChange)
  window.addEventListener('resize', checkMobile)

  // Poll for state changes every 100ms as a fallback
  stateCheckInterval = window.setInterval(checkSidebarState, 100)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('resize', checkMobile)

  if (stateCheckInterval !== null) {
    clearInterval(stateCheckInterval)
  }
})
</script>

<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
}

.main-content {
  flex: 1;
  margin-left: 350px; /* var(--sidebar-width-expanded) */
  min-width: 0; /* Prevents flex overflow issues */
  overflow-x: hidden;
  transition: margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-content-collapsed {
  margin-left: 140px; /* var(--sidebar-width-collapsed) */
}

/* Responsive */
@media (max-width: 1024px) {
  .main-content,
  .main-content-collapsed {
    margin-left: 0;
  }
}
</style>
