<!--
  Mobile Menu Toggle Component
  Hamburger menu button for mobile navigation
-->
<template>
  <button
    @click="$emit('toggle')"
    class="mobile-menu-toggle"
  >
    <Menu class="w-6 h-6" />
  </button>
</template>

<script setup lang="ts">
import { Menu } from 'lucide-vue-next'

defineEmits<{
  toggle: []
}>()
</script>

<style scoped>
.mobile-menu-toggle {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 44px;
  height: 44px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: flex;
  }
}
</style>