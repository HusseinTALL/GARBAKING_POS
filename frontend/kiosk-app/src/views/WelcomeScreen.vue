<!--
  WelcomeScreen: High-End Restaurant Poster Design
  - Full-bleed, high-resolution food imagery with professional styling
  - Bold typography with warm, appetizing color palette
  - Prominent CTA button with sophisticated animations
  - WCAG 2.1 AA compliant (4.5:1 contrast ratio minimum)
  - Optimized for 1080x1920 vertical kiosk displays
  - Brand elements: logo, tagline, and visual identity
-->

<template>
  <div
    class="welcome-screen relative h-screen w-screen flex flex-col items-center justify-center text-white overflow-hidden"
    role="main"
    aria-label="Welcome screen"
  >
    <!-- Full-Bleed Food Background Slideshow -->
    <div class="absolute inset-0 z-0">
      <transition-group name="fade-slide" tag="div">
        <div
          v-for="(image, index) in images"
          :key="image"
          v-show="currentImageIndex === index"
          class="absolute inset-0 bg-cover bg-center will-change-transform"
          :style="{ backgroundImage: `url(${image})` }"
          :aria-hidden="currentImageIndex !== index"
        >
          <!-- Ken Burns Effect -->
          <div class="absolute inset-0 animate-ken-burns"></div>
        </div>
      </transition-group>
    </div>

    <!-- Rich Gradient Overlay - Dark with warm accents for readability -->
    <div class="absolute inset-0 z-10 bg-gradient-overlay"></div>

    <!-- Ambient Lighting Effects -->
    <div class="absolute inset-0 z-20 pointer-events-none overflow-hidden">
      <!-- Warm glow top-left -->
      <div class="absolute -top-20 -left-20 w-96 h-96 bg-gradient-radial from-amber-500/30 via-orange-600/20 to-transparent rounded-full blur-3xl animate-glow-pulse"></div>
      <!-- Accent glow bottom-right -->
      <div class="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-radial from-red-500/25 via-rose-600/15 to-transparent rounded-full blur-3xl animate-glow-pulse-delayed"></div>
      <!-- Center spotlight -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-white/5 to-transparent rounded-full blur-3xl"></div>
    </div>

    <!-- Content Container -->
    <div class="relative z-30 flex flex-col items-center justify-between h-full w-full px-12 py-16">

      <!-- Top Section: Logo & Brand Identity -->
      <div class="flex justify-between items-start w-full">
        <!-- Logo -->
        <div
          class="logo-container bg-white/95 backdrop-blur-md rounded-2xl px-8 py-6 shadow-2xl border-2 border-white/20"
          role="img"
          aria-label="Garbaking Restaurant Logo"
        >
          <div class="flex items-center gap-4">
            <!-- Logo Icon (placeholder - replace with actual logo) -->
            <svg class="w-16 h-16 text-brand-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
            <!-- Brand Name -->
            <div class="flex flex-col">
              <span class="text-3xl font-extrabold text-neutral-900 tracking-tight leading-none">Garbaking</span>
              <span class="text-sm font-medium text-brand-600 uppercase tracking-widest">Restaurant</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Center Section: Hero Content -->
      <div class="flex flex-col items-center text-center max-w-4xl mx-auto space-y-12">

        <!-- Tagline - Elegant Script -->
        <div class="tagline-wrapper animate-fade-in-up" style="animation-delay: 0.2s">
          <p
            class="tagline-text text-6xl font-light text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 drop-shadow-2xl leading-tight tracking-wide"
            style="font-family: 'Dancing Script', 'Brush Script MT', cursive; text-shadow: 0 2px 20px rgba(251, 191, 36, 0.5)"
          >
            {{ t('welcome.tagline') }}
          </p>
        </div>

        <!-- Main Headline - Bold & Modern -->
        <div class="space-y-6 animate-fade-in-up" style="animation-delay: 0.4s">
          <h1
            class="text-8xl font-extrabold text-white drop-shadow-2xl leading-none tracking-tight"
            style="text-shadow: 0 4px 30px rgba(0, 0, 0, 0.9), 0 2px 10px rgba(0, 0, 0, 0.8)"
          >
            {{ t('welcome.title') }}
          </h1>

          <!-- Decorative Accent Line -->
          <div class="flex items-center justify-center gap-4">
            <div class="h-1 w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full"></div>
            <div class="w-3 h-3 bg-amber-400 rounded-full shadow-lg shadow-amber-500/50"></div>
            <div class="h-1 w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full"></div>
          </div>

          <!-- Subheadline -->
          <p
            class="text-3xl font-medium text-amber-100/95 drop-shadow-lg leading-relaxed"
            style="text-shadow: 0 2px 15px rgba(0, 0, 0, 0.7)"
          >
            Gourmet Delights • Artisan Quality • Unforgettable Taste
          </p>
        </div>

        <!-- Call-to-Action Button - Prominent & Animated -->
        <div class="animate-fade-in-up" style="animation-delay: 0.6s">
          <button
            @click="startOrder"
            @touchstart="handleTouch"
            class="cta-button group relative overflow-hidden"
            aria-label="Start ordering now"
          >
            <!-- Button Background with Gradient -->
            <div class="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 transition-all duration-500 group-hover:scale-105 group-active:scale-95"></div>

            <!-- Shimmer Effect Overlay -->
            <div class="absolute inset-0 shimmer-overlay"></div>

            <!-- Glow Effect -->
            <div class="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-400 to-red-500 blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow"></div>

            <!-- Button Content -->
            <span class="relative z-10 flex items-center gap-4 px-16 py-8 text-4xl font-bold text-white drop-shadow-lg tracking-wide">
              <svg class="w-10 h-10 transition-transform duration-500 group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span>{{ t('welcome.startOrdering') }}</span>
            </span>

            <!-- Ripple Effect on Touch -->
            <div class="ripple"></div>
          </button>

          <!-- Touch Hint -->
          <p
            class="mt-8 text-2xl text-amber-200/80 font-light animate-bounce-subtle tracking-wide"
            style="text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7)"
          >
            Touch to Begin Your Culinary Journey
          </p>
        </div>

      </div>

      <!-- Bottom Section: Footer Info -->
      <div class="flex flex-col items-center space-y-4 animate-fade-in-up" style="animation-delay: 0.8s">
        <!-- Service Highlights -->
        <div class="flex items-center gap-8 text-amber-100/90 text-xl font-medium">
          <div class="flex items-center gap-2">
            <svg class="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>Fresh Daily</span>
          </div>
          <div class="text-amber-400">•</div>
          <div class="flex items-center gap-2">
            <svg class="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>Fast Service</span>
          </div>
          <div class="text-amber-400">•</div>
          <div class="flex items-center gap-2">
            <svg class="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>Premium Quality</span>
          </div>
        </div>

        <!-- Divider -->
        <div class="h-px w-96 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>

        <!-- Hours & Availability -->
        <p
          class="text-lg text-amber-100/70 font-light tracking-wider"
          style="text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7)"
        >
          Open 24/7 • Self-Service Kiosk Available Anytime
        </p>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n({
  inheritLocale: true,
  useScope: 'global'
})

// Food imagery - professional, high-resolution shots
const images = [
  '/images/food-burger.jpg',
  '/images/food-grill.jpg',
  '/images/food-smoothie.jpg',
  '/images/food-fries.jpg',
  '/images/food-salad.jpg'
]

const currentImageIndex = ref(0)
let slideInterval: number | null = null

onMounted(() => {
  // Automatic slideshow - change image every 7 seconds
  slideInterval = window.setInterval(() => {
    currentImageIndex.value = (currentImageIndex.value + 1) % images.length
  }, 7000)
})

onUnmounted(() => {
  if (slideInterval !== null) {
    clearInterval(slideInterval)
  }
})

const startOrder = () => {
  router.push('/language')
}

const handleTouch = (event: TouchEvent) => {
  // Add ripple effect on touch
  const button = event.currentTarget as HTMLElement
  const ripple = button.querySelector('.ripple') as HTMLElement
  if (ripple) {
    ripple.style.animation = 'none'
    setTimeout(() => {
      ripple.style.animation = 'ripple-effect 0.6s ease-out'
    }, 10)
  }
  startOrder()
}
</script>

<style scoped>
/* ============================================
   WELCOME SCREEN STYLES
   High-end restaurant poster aesthetics
   ============================================ */

.welcome-screen {
  /* Ensure full viewport coverage */
  min-height: 100vh;
  min-height: 100dvh;

  /* Prevent text selection for kiosk */
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;

  /* Optimize for kiosk display (1080x1920) */
  @media (min-width: 1080px) and (min-height: 1920px) {
    font-size: 1.1vw;
  }
}

/* ============================================
   BACKGROUND IMAGE TRANSITIONS
   ============================================ */

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 2.5s cubic-bezier(0.4, 0, 0.2, 1),
              transform 2.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: scale(1.1);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Ken Burns slow zoom effect */
@keyframes ken-burns {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.08);
  }
}

.animate-ken-burns {
  animation: ken-burns 20s ease-in-out infinite alternate;
}

/* ============================================
   GRADIENT OVERLAY
   Dark overlay with warm accents
   WCAG AA compliant (4.5:1 contrast minimum)
   ============================================ */

.bg-gradient-overlay {
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.85) 0%,
    rgba(20, 10, 0, 0.75) 25%,
    rgba(40, 20, 10, 0.7) 50%,
    rgba(60, 30, 15, 0.75) 75%,
    rgba(0, 0, 0, 0.85) 100%
  );
}

/* ============================================
   AMBIENT LIGHTING EFFECTS
   ============================================ */

.bg-gradient-radial {
  background: radial-gradient(circle, var(--tw-gradient-stops));
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

@keyframes glow-pulse-delayed {
  0%, 100% {
    opacity: 0.25;
    transform: scale(1) rotate(0deg);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.15) rotate(10deg);
  }
}

.animate-glow-pulse {
  animation: glow-pulse 8s ease-in-out infinite;
}

.animate-glow-pulse-delayed {
  animation: glow-pulse-delayed 10s ease-in-out infinite;
  animation-delay: 2s;
}

/* ============================================
   CONTENT ANIMATIONS
   Fade in from bottom with staggered delays
   ============================================ */

@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  opacity: 0;
}

/* ============================================
   CALL-TO-ACTION BUTTON
   Premium styling with multiple effects
   ============================================ */

.cta-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 480px;
  min-height: 96px;
  border-radius: 1.5rem;
  border: 3px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.5),
    0 4px 12px rgba(249, 115, 22, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  /* Accessibility - focus state */
  &:focus-visible {
    outline: 4px solid rgba(251, 191, 36, 0.6);
    outline-offset: 4px;
  }

  /* Hover effects */
  &:hover {
    transform: translateY(-4px);
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.6),
      0 8px 20px rgba(249, 115, 22, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }

  /* Active/pressed state */
  &:active {
    transform: translateY(0);
  }
}

/* Shimmer effect for premium feel */
.shimmer-overlay {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.15) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 3s infinite linear;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Pulse glow animation for button */
@keyframes pulse-glow {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Ripple effect on touch */
.ripple {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, transparent 70%);
  opacity: 0;
  pointer-events: none;
}

@keyframes ripple-effect {
  0% {
    opacity: 1;
    transform: scale(0);
  }
  100% {
    opacity: 0;
    transform: scale(2.5);
  }
}

/* ============================================
   SUBTLE BOUNCE ANIMATION
   ============================================ */

@keyframes bounce-subtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.animate-bounce-subtle {
  animation: bounce-subtle 3s ease-in-out infinite;
}

/* ============================================
   LOGO CONTAINER
   ============================================ */

.logo-container {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
}

/* ============================================
   TYPOGRAPHY ENHANCEMENTS
   ============================================ */

.tagline-text {
  filter: drop-shadow(0 2px 20px rgba(251, 191, 36, 0.5));
  animation: subtle-glow 4s ease-in-out infinite;
}

@keyframes subtle-glow {
  0%, 100% {
    filter: drop-shadow(0 2px 20px rgba(251, 191, 36, 0.5));
  }
  50% {
    filter: drop-shadow(0 4px 30px rgba(251, 191, 36, 0.8));
  }
}

/* ============================================
   ACCESSIBILITY ENHANCEMENTS
   ============================================ */

/* High contrast mode support */
@media (prefers-contrast: high) {
  .bg-gradient-overlay {
    background: rgba(0, 0, 0, 0.9);
  }

  .cta-button {
    border-width: 4px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-ken-burns,
  .animate-glow-pulse,
  .animate-glow-pulse-delayed,
  .animate-fade-in-up,
  .shimmer-overlay,
  .animate-pulse-glow,
  .animate-bounce-subtle,
  .tagline-text {
    animation: none;
  }

  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition-duration: 0.5s;
  }
}

/* ============================================
   RESPONSIVE ADJUSTMENTS
   For different kiosk sizes
   ============================================ */

@media (max-height: 1800px) {
  .text-8xl {
    font-size: 5rem;
  }

  .text-6xl {
    font-size: 3.5rem;
  }

  .text-4xl {
    font-size: 2.5rem;
  }
}

@media (max-height: 1600px) {
  .text-8xl {
    font-size: 4rem;
  }

  .text-6xl {
    font-size: 3rem;
  }

  .text-4xl {
    font-size: 2rem;
  }

  .cta-button {
    min-width: 400px;
    min-height: 80px;
  }
}
</style>
