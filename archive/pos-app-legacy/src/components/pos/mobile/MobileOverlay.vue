<!--
  Mobile Overlay Component
  Mobile menu overlay for touch interactions
-->
<template>
  <div
    v-if="isOpen"
    @click="$emit('close')"
    class="mobile-overlay"
  ></div>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
}

defineProps<Props>()

defineEmits<{
  close: []
}>()
</script>

<style scoped>
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 998;
  display: none;
}

@media (max-width: 768px) {
  .mobile-overlay {
    display: block;
  }
}
</style>