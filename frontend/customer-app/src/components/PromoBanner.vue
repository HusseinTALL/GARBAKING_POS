<!--
  Premium promotional banner with animations
  Features: animated gradients, floating elements, parallax effect
-->

<template>
  <div 
    class="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-3xl p-6 shadow-2xl overflow-hidden cursor-pointer group hover:shadow-3xl transition-all duration-500"
    @click="$emit('click')"
  >
    <!-- Animated Background Pattern -->
    <div class="absolute inset-0 opacity-20">
      <!-- Large circles -->
      <div class="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl -mr-20 -mt-20 animate-float"></div>
      <div class="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl -ml-16 -mb-16 animate-float-delayed"></div>
      
      <!-- Small floating circles -->
      <div class="absolute top-1/2 right-1/4 w-16 h-16 bg-white/40 rounded-full blur-xl animate-pulse-slow"></div>
      <div class="absolute bottom-1/3 left-1/3 w-12 h-12 bg-white/30 rounded-full blur-lg animate-pulse-slower"></div>
    </div>

    <!-- Shimmer overlay on hover -->
    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>

    <!-- Content -->
    <div class="relative z-10 flex items-center justify-between gap-4">
      <div class="flex-1">
        <!-- Badge -->
        <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full mb-3 border border-white/30">
          <span class="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></span>
          <span class="text-xs font-semibold text-white uppercase tracking-wider">Limited Offer</span>
        </div>

        <!-- Title -->
        <h3 class="text-white font-bold text-2xl mb-1.5 drop-shadow-lg">
          {{ title }}
        </h3>
        
        <!-- Description -->
        <p class="text-white/95 text-sm mb-4 font-medium">
          {{ description }}
        </p>
        
        <!-- CTA Button -->
        <button
          @click.stop="$emit('click')"
          class="group/btn inline-flex items-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-emerald-50 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <span>{{ ctaText }}</span>
          <svg 
            class="w-4 h-4 transition-transform group-hover/btn:translate-x-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </button>
      </div>

      <!-- Image/Illustration -->
      <div v-if="image" class="relative ml-4 flex-shrink-0">
        <div class="relative w-28 h-28 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
          <!-- Glow effect behind image -->
          <div class="absolute inset-0 bg-white/30 rounded-full blur-2xl scale-75"></div>
          
          <img 
            :src="image" 
            :alt="title" 
            class="relative z-10 w-full h-full object-contain drop-shadow-2xl"
          />
        </div>
      </div>
      
      <!-- Default icon if no image -->
      <div v-else class="relative ml-4 flex-shrink-0">
        <div class="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-white/30">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Bottom decorative line -->
    <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description: string
  ctaText: string
  image?: string
}

defineProps<Props>()

defineEmits<{
  'click': []
}>()
</script>

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  50% {
    transform: translateY(-20px) translateX(10px);
  }
}

@keyframes float-delayed {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  50% {
    transform: translateY(20px) translateX(-10px);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 8s ease-in-out infinite;
}

.animate-pulse-slow {
  animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-pulse-slower {
  animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.shadow-3xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
</style>