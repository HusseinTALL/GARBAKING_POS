<!--
  Modern MainLayout with Vertical Sidebar
  Jaegar Resto style dark theme layout
-->
<template>
  <div class="main-layout">
    <!-- Vertical Sidebar -->
    <Sidebar />

    <!-- Main Content Area -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/layout/Sidebar.vue'
</script>

<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
}

.main-content {
  flex: 1;
  margin-left: var(--sidebar-width);
  min-width: 0; /* Prevents flex overflow issues */
  overflow-x: hidden;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    margin-left: 60px;
  }
}

@media (max-width: 640px) {
  .main-content {
    margin-left: 0;
  }
}
</style>
