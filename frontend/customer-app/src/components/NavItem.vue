<!-- NavItem.vue -->
<template>
  <button
    class="relative flex flex-col items-center gap-1.5 px-4 py-2 min-w-[72px] transition-all duration-300 group active:scale-95"
    :class="[active ? 'scale-100' : 'scale-95 hover:scale-100']"
  >
    <!-- Icon Container -->
    <div 
      class="relative flex items-center justify-center w-10 h-10 transition-all duration-300"
      :class="[active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600']"
    >
      <i 
        :class="['fas', icon, 'text-[22px] transition-all duration-300']"
        :style="{ transform: active ? 'scale(1.1)' : 'scale(1)' }"
      />
      
      <!-- Active Pulse Indicator -->
      <Transition name="pulse">
        <div 
          v-if="active"
          class="absolute -top-1 -right-1 w-2 h-2 bg-primary-500 rounded-full animate-pulse"
        />
      </Transition>
    </div>
    
    <!-- Label -->
    <span 
      class="text-[11px] font-semibold tracking-wide transition-all duration-300 whitespace-nowrap"
      :class="[
        active 
          ? 'text-primary-600 opacity-100' 
          : 'text-gray-500 opacity-70 group-hover:opacity-100'
      ]"
    >
      {{ label }}
    </span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  label: string
  active: boolean
}

defineProps<Props>()
</script>

<script lang="ts">
export default {
  name: 'NavItem'
}
</script>

<style scoped>
.pulse-enter-active,
.pulse-leave-active {
  transition: all 0.3s ease;
}

.pulse-enter-from,
.pulse-leave-to {
  opacity: 0;
  transform: scale(0);
}
</style>