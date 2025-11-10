<!--
  WelcomeScreen: Immersive, appetite-inducing restaurant kiosk intro
  - Fullscreen food slideshow with slow fade transitions
  - Subtle motion (steam, lighting, zoom)
  - Interactive “Tap to Start” glow CTA
  - Maintains brand consistency and legibility
-->

<template>
  <div
    class="welcome-screen relative h-screen w-screen flex flex-col items-center justify-center text-white overflow-hidden cursor-pointer"
    @click="startOrder"
    @touchstart="startOrder"
  >
    <!-- Food Slideshow Background -->
    <div class="absolute inset-0">
      <transition-group name="fade" tag="div">
        <div
          v-for="(image, index) in images"
          :key="image"
          v-show="currentImageIndex === index"
          class="absolute inset-0 bg-cover bg-center animate-slow-zoom"
          :style="{ backgroundImage: `url(${image})` }"
        ></div>
      </transition-group>
    </div>

    <!-- Warm Overlay Gradient -->
    <div class="absolute inset-0 bg-gradient-to-br from-black/70 via-brand-700/60 to-brand-500/50"></div>

    <!-- Ambient Motion (Steam/Light Flare) -->
    <div class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
      <div class="absolute top-10 left-20 w-40 h-40 bg-white/20 rounded-full blur-3xl animate-steam-slow"></div>
      <div class="absolute bottom-20 right-16 w-56 h-56 bg-amber-300/20 rounded-full blur-3xl animate-light-flow delay-1000"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 text-center px-8">
      <!-- Branding -->
      <div class="mb-12">
        <h1 class="text-6xl font-brand font-extrabold tracking-tight drop-shadow-lg">
          {{ t('welcome.title') }}
        </h1>
        <p class="mt-4 text-xl opacity-90 font-light">Fresh. Fast. Delicious.</p>
        <div class="w-24 h-1 bg-gradient-to-r from-amber-400 to-red-500 mx-auto mt-4 rounded-full"></div>
      </div>

      <!-- Glowing Tap Button -->
      <div class="mb-8 animate-bounce-gentle">
        <div
          class="relative w-48 h-48 mx-auto flex items-center justify-center rounded-full bg-white/10 border-4 border-white/50 backdrop-blur-md shadow-[0_0_40px_rgba(255,150,0,0.4)] hover:shadow-[0_0_70px_rgba(255,200,50,0.7)] transition-all duration-500"
        >
          <svg
            class="w-16 h-16 text-amber-300 drop-shadow-[0_0_15px_rgba(255,200,50,0.8)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span class="absolute bottom-[-2.5rem] text-2xl font-semibold text-amber-200 animate-pulse">
            {{ t('welcome.touchToStart') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="absolute bottom-8 text-center z-10">
      <p class="text-sm opacity-80">Open 24/7 • Quick Service • Always Fresh</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n({
  inheritLocale: true,
  useScope: 'global'
})

const images = [
  '/images/food-burger.jpg',
  '/images/food-grill.jpg',
  '/images/food-smoothie.jpg',
  '/images/food-fries.jpg',
  '/images/food-salad.jpg'
]

const currentImageIndex = ref(0)

onMounted(() => {
  setInterval(() => {
    currentImageIndex.value = (currentImageIndex.value + 1) % images.length
  }, 6000) // change every 6 seconds
})

const startOrder = () => {
  router.push('/language')
}
</script>

<style scoped>
/* Smooth fade transition for slideshow */
.fade-enter-active, .fade-leave-active {
  transition: opacity 2s ease-in-out;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@keyframes steam-slow {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
  50% { transform: translateY(-20px) scale(1.1); opacity: 0.7; }
}

@keyframes light-flow {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

@keyframes slow-zoom {
  0% { transform: scale(1); }
  100% { transform: scale(1.05); }
}

.animate-steam-slow {
  animation: steam-slow 6s ease-in-out infinite;
}

.animate-light-flow {
  animation: light-flow 8s ease-in-out infinite;
}

.animate-slow-zoom {
  animation: slow-zoom 20s ease-in-out infinite alternate;
}

.animate-bounce-gentle {
  animation: bounce 3s ease-in-out infinite;
}
</style>
