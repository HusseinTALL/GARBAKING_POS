<!--
  WelcomeScreen: Bold Food Poster Design
  - Large, dynamic food imagery as hero element
  - Bold typography with vibrant color palette
  - Energetic animations and floating elements
  - Promotional badges and offers
  - Pattern backgrounds for visual interest
  - Optimized for 1080x1920 vertical kiosk displays
-->

<template>
  <div
    class="welcome-poster relative h-screen w-screen flex flex-col overflow-hidden bg-gradient-to-br from-red-700 via-red-600 to-orange-500"
    role="main"
    aria-label="Welcome screen"
  >
    
    <!-- Animated Pattern Background -->
    <div class="absolute inset-0 z-0 opacity-20">
      <div class="pattern-bg absolute inset-0 animate-pattern-scroll">
        <div class="text-pattern text-red-900/40 font-black text-9xl tracking-wider transform -rotate-12">
          BURGER BURGER BURGER BURGER BURGER BURGER BURGER BURGER BURGER BURGER BURGER BURGER
        </div>
      </div>
    </div>

    <!-- Decorative Shapes -->
    <div class="absolute inset-0 z-5 pointer-events-none overflow-hidden">
      <!-- Yellow accent wave -->
      <div class="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-amber-400 via-yellow-400 to-transparent opacity-90 transform skew-y-3"></div>
      <!-- Floating circles -->
      <div class="absolute top-20 right-20 w-64 h-64 bg-yellow-300/30 rounded-full blur-3xl animate-float"></div>
      <div class="absolute bottom-40 left-10 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl animate-float-delayed"></div>
    </div>

    <!-- Content Container -->
    <div class="relative z-10 flex flex-col h-full w-full px-12 py-12">

      <!-- Top Bar: Logo & Social -->
      <div class="flex justify-between items-start">
        <!-- Logo -->
        <div class="logo-badge bg-white rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-3 animate-slide-in-left">
          <div class="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
            <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            </svg>
          </div>
          <div>
            <div class="text-2xl font-black text-neutral-900 leading-none">GARBAKING</div>
            <div class="text-xs font-bold text-orange-600 uppercase tracking-widest">Restaurant</div>
          </div>
        </div>

        <!-- Social Media -->
        <div class="flex items-center gap-4 animate-slide-in-right">
          <span class="text-white font-bold text-lg uppercase tracking-wider">Follow Us Now</span>
          <div class="flex gap-2">
            <div class="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
              <svg class="w-6 h-6 text-red-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <div class="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
              <svg class="w-6 h-6 text-red-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </div>
            <div class="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
              <svg class="w-6 h-6 text-red-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Hero Section -->
      <div class="flex-1 flex flex-col items-center justify-center relative mt-8 mb-8">

        <!-- Main Headline -->
        <div class="text-center mb-8 space-y-4 animate-fade-in-up" style="animation-delay: 0.2s">
          <!-- Script Font -->
          <div class="text-white text-7xl font-script italic tracking-wide drop-shadow-2xl" style="font-family: 'Brush Script MT', cursive; filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.8))">
            Premium
          </div>
          
          <!-- Bold Main Title -->
          <div class="space-y-2">
            <h1 class="text-yellow-300 text-[12rem] font-black leading-none tracking-tight drop-shadow-2xl"
                style="text-shadow: 4px 4px 0 #dc2626, 8px 8px 0 rgba(0,0,0,0.3); -webkit-text-stroke: 3px #b91c1c;">
              CHEESE
            </h1>
            <h1 class="text-yellow-300 text-[12rem] font-black leading-none tracking-tight drop-shadow-2xl -mt-8"
                style="text-shadow: 4px 4px 0 #dc2626, 8px 8px 0 rgba(0,0,0,0.3); -webkit-text-stroke: 3px #b91c1c;">
              BURGERS
            </h1>
          </div>

          <!-- Limited Time Script -->
          <div class="text-white text-5xl font-script italic tracking-widest drop-shadow-xl" 
               style="font-family: 'Brush Script MT', cursive; filter: drop-shadow(0 4px 15px rgba(0, 0, 0, 0.8))">
            Limited Time Offer
          </div>
        </div>

        <!-- Promotional Badge -->
        <div class="absolute top-20 right-32 animate-bounce-rotate">
          <div class="relative">
            <!-- Badge Shadow -->
            <div class="absolute inset-0 bg-red-900 rounded-3xl blur-xl opacity-60 scale-110"></div>
            <!-- Badge Content -->
            <div class="relative bg-white rounded-3xl px-12 py-8 transform rotate-12 shadow-2xl border-4 border-red-600">
              <div class="text-center">
                <div class="text-red-700 text-3xl font-bold uppercase tracking-wider">Save</div>
                <div class="text-red-700 text-8xl font-black leading-none">50<span class="text-6xl">%</span></div>
                <div class="text-red-700 text-3xl font-bold uppercase tracking-wider">Off</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Hero Burger Images -->
        <div class="relative w-full h-[600px] animate-fade-in-up" style="animation-delay: 0.4s">
          <!-- Main Large Burger (Right) -->
          <div class="absolute right-20 top-0 animate-float-burger">
            <div class="relative">
              <!-- Burger shadow -->
              <div class="absolute inset-0 bg-black/40 blur-3xl transform translate-y-8 scale-90"></div>
              <!-- Burger placeholder (replace with actual images) -->
              <div class="relative w-[500px] h-[500px] transform hover:scale-105 transition-transform duration-500">
                <img 
                  src="/images/food-grill.jpg" 
                  alt="Delicious cheeseburger"
                  class="w-full h-full object-contain drop-shadow-2xl"
                  onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
                />
                <!-- Fallback burger illustration if image not available -->
                <div class="hidden w-full h-full items-center justify-center bg-gradient-to-br from-amber-600 via-yellow-500 to-orange-600 rounded-full p-12" style="display: none;">
                  <svg class="w-full h-full text-white" viewBox="0 0 200 200" fill="currentColor">
                    <!-- Top bun -->
                    <ellipse cx="100" cy="60" rx="90" ry="30" fill="#f59e0b" />
                    <ellipse cx="100" cy="55" rx="85" ry="28" fill="#fbbf24" />
                    <!-- Sesame seeds -->
                    <circle cx="70" cy="50" r="3" fill="#fff" />
                    <circle cx="90" cy="48" r="3" fill="#fff" />
                    <circle cx="110" cy="52" r="3" fill="#fff" />
                    <circle cx="130" cy="49" r="3" fill="#fff" />
                    <!-- Cheese -->
                    <path d="M 15 85 L 185 85 L 180 105 L 20 105 Z" fill="#fde047" />
                    <!-- Patty -->
                    <ellipse cx="100" cy="115" rx="95" ry="20" fill="#78350f" />
                    <!-- Lettuce -->
                    <path d="M 10 125 Q 100 120 190 125" fill="#22c55e" stroke="#16a34a" stroke-width="2" />
                    <!-- Tomato -->
                    <ellipse cx="100" cy="140" rx="90" ry="12" fill="#ef4444" />
                    <!-- Bottom bun -->
                    <ellipse cx="100" cy="165" rx="95" ry="25" fill="#f59e0b" />
                    <ellipse cx="100" cy="160" rx="90" ry="23" fill="#fbbf24" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Secondary Smaller Burger (Left) -->
          <div class="absolute left-32 top-32 animate-float-burger-delayed">
            <div class="relative">
              <!-- Burger shadow -->
              <div class="absolute inset-0 bg-black/40 blur-2xl transform translate-y-6 scale-90"></div>
              <!-- Burger placeholder -->
              <div class="relative w-[350px] h-[350px] transform hover:scale-105 transition-transform duration-500">
                <img 
                  src="/images/food-smoothie.jpg" 
                  alt="Classic burger"
                  class="w-full h-full rounded-xl object-contain drop-shadow-2xl"
                  onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
                />
                <!-- Fallback burger illustration -->
                <div class="hidden w-full h-full items-center justify-center bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 rounded-full p-8" style="display: none;">
                  <svg class="w-full h-full text-white" viewBox="0 0 200 200" fill="currentColor">
                    <ellipse cx="100" cy="60" rx="85" ry="28" fill="#f59e0b" />
                    <ellipse cx="100" cy="55" rx="80" ry="26" fill="#fbbf24" />
                    <circle cx="75" cy="50" r="2.5" fill="#fff" />
                    <circle cx="95" cy="48" r="2.5" fill="#fff" />
                    <circle cx="115" cy="52" r="2.5" fill="#fff" />
                    <circle cx="130" cy="49" r="2.5" fill="#fff" />
                    <path d="M 20 85 L 180 85 L 175 103 L 25 103 Z" fill="#fde047" />
                    <ellipse cx="100" cy="115" rx="90" ry="18" fill="#78350f" />
                    <path d="M 15 128 Q 100 123 185 128" fill="#22c55e" stroke="#16a34a" stroke-width="2" />
                    <ellipse cx="100" cy="142" rx="85" ry="10" fill="#ef4444" />
                    <ellipse cx="100" cy="165" rx="90" ry="23" fill="#f59e0b" />
                    <ellipse cx="100" cy="160" rx="85" ry="21" fill="#fbbf24" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Free Home Delivery Badge -->
          <div class="absolute left-20 bottom-0 animate-slide-in-left" style="animation-delay: 0.6s">
            <div class="bg-white rounded-full px-8 py-6 shadow-2xl border-4 border-yellow-400 transform -rotate-12">
              <div class="text-center">
                <div class="text-red-700 text-2xl font-script italic" style="font-family: 'Brush Script MT', cursive">Free Home</div>
                <div class="text-red-700 text-3xl font-black -mt-1">Delivery</div>
              </div>
              <div class="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <svg class="w-16 h-16 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 7L11 7 11 11 7 11 7 13 11 13 11 17 13 17 13 13 17 13 17 11 13 11z"/>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Bottom CTA Section -->
      <div class="flex flex-col items-center space-y-6 pb-8 animate-fade-in-up" style="animation-delay: 0.8s">
        
        <!-- Main CTA Button -->
        <button
          @click="startOrder"
          @touchstart="handleTouch"
          class="cta-button group relative overflow-hidden"
          aria-label="Order now"
        >
          <!-- Button Background -->
          <div class="absolute inset-0 bg-gradient-to-r from-red-700 via-red-600 to-red-700 rounded-full"></div>
          
          <!-- Shine Effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          <!-- Button Content -->
          <span class="relative z-10 flex items-center gap-3 px-20 py-7 text-5xl font-black text-white uppercase tracking-wider">
            Order Now
          </span>

          <!-- Pulse Ring -->
          <div class="absolute inset-0 rounded-full border-4 border-white/50 animate-ping-slow"></div>
        </button>

        <!-- Contact Info -->
        <div class="flex flex-col items-center space-y-3">
          <div class="text-6xl font-black text-yellow-300 tracking-wider drop-shadow-lg"
               style="text-shadow: 2px 2px 0 #dc2626, 4px 4px 10px rgba(0,0,0,0.5)">
            917-953-4456
          </div>
          <div class="text-3xl font-bold text-white uppercase tracking-widest drop-shadow-lg">
            www.garbaking.com
          </div>
        </div>

        <!-- Touch Prompt -->
        <div class="flex items-center gap-3 text-yellow-300 text-2xl font-bold uppercase tracking-wider animate-pulse">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/>
          </svg>
          <span>Touch Anywhere to Start</span>
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/>
          </svg>
        </div>

      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n({
  inheritLocale: true,
  useScope: 'global'
})

const startOrder = () => {
  router.push('/language')
}

const handleTouch = (event: TouchEvent) => {
  startOrder()
}
</script>

<style scoped>
/* ============================================
   WELCOME POSTER STYLES
   Bold food advertising aesthetic
   Fully responsive for all screen sizes
   ============================================ */

.welcome-poster {
  min-height: 100vh;
  min-height: 100dvh;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  
  /* Base font size scales with viewport */
  font-size: clamp(12px, 1.5vw, 18px);
}

/* ============================================
   PATTERN BACKGROUND
   ============================================ */

.pattern-bg {
  white-space: nowrap;
  animation: pattern-scroll 40s linear infinite;
}

.text-pattern {
  display: inline-block;
  line-height: 1.2;
  white-space: nowrap;
}

@keyframes pattern-scroll {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}

/* ============================================
   FLOATING ANIMATIONS
   ============================================ */

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-30px) scale(1.05);
  }
}

@keyframes float-delayed {
  0%, 100% {
    transform: translateY(0) scale(1) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) scale(1.03) rotate(5deg);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 8s ease-in-out infinite;
  animation-delay: 1s;
}

/* Burger floating animations */
@keyframes float-burger {
  0%, 100% {
    transform: translateY(0) rotate(-2deg);
  }
  50% {
    transform: translateY(-25px) rotate(2deg);
  }
}

@keyframes float-burger-delayed {
  0%, 100% {
    transform: translateY(0) rotate(5deg);
  }
  50% {
    transform: translateY(-20px) rotate(-3deg);
  }
}

.animate-float-burger {
  animation: float-burger 5s ease-in-out infinite;
}

.animate-float-burger-delayed {
  animation: float-burger-delayed 6s ease-in-out infinite;
  animation-delay: 0.5s;
}

/* ============================================
   SLIDE IN ANIMATIONS
   ============================================ */

@keyframes slide-in-left {
  0% {
    opacity: 0;
    transform: translateX(-100px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-in-right {
  0% {
    opacity: 0;
    transform: translateX(100px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in-left {
  animation: slide-in-left 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.animate-slide-in-right {
  animation: slide-in-right 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* ============================================
   FADE IN ANIMATIONS
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
   PROMOTIONAL BADGE
   ============================================ */

@keyframes bounce-rotate {
  0%, 100% {
    transform: translateY(0) rotate(12deg) scale(1);
  }
  50% {
    transform: translateY(-15px) rotate(15deg) scale(1.05);
  }
}

.animate-bounce-rotate {
  animation: bounce-rotate 3s ease-in-out infinite;
}

/* ============================================
   CTA BUTTON
   ============================================ */

.cta-button {
  position: relative;
  min-width: 480px;
  min-height: 100px;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.5),
    0 0 0 4px rgba(255, 255, 255, 0.3),
    inset 0 2px 0 rgba(255, 255, 255, 0.3);

  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.6),
      0 0 0 6px rgba(255, 255, 255, 0.4),
      0 0 60px rgba(239, 68, 68, 0.8),
      inset 0 2px 0 rgba(255, 255, 255, 0.4);
  }

  &:active {
    transform: translateY(-2px) scale(0.98);
  }

  &:focus-visible {
    outline: 6px solid rgba(251, 191, 36, 0.6);
    outline-offset: 6px;
  }
}

@keyframes ping-slow {
  75%, 100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

.animate-ping-slow {
  animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* ============================================
   LOGO BADGE
   ============================================ */

.logo-badge {
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);

  &:hover {
    transform: scale(1.05) translateY(-2px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  }
}

/* ============================================
   RESPONSIVE ADJUSTMENTS
   Mobile-first approach with breakpoints
   ============================================ */

/* ===== SMALL MOBILE (320px - 480px) ===== */
@media (max-width: 480px) {
  .welcome-poster {
    font-size: clamp(10px, 2vw, 14px);
  }

  /* Adjust padding */
  .welcome-poster > div {
    padding: 0.75rem !important;
  }

  /* Logo sizing */
  .logo-badge {
    padding: 0.5rem 0.75rem !important;
  }

  .logo-badge svg {
    width: 2rem !important;
    height: 2rem !important;
  }

  .logo-badge > div > div:first-child {
    font-size: 1rem !important;
  }

  .logo-badge > div > div:last-child {
    font-size: 0.5rem !important;
  }

  /* Hide social media on very small screens */
  .animate-slide-in-right {
    display: none;
  }

  /* Main headline */
  .text-\[12rem\] {
    font-size: 3rem !important;
    -webkit-text-stroke: 1px #b91c1c !important;
  }

  .text-7xl {
    font-size: 1.5rem !important;
  }

  .text-5xl {
    font-size: 1.25rem !important;
  }

  /* Promotional badge */
  .animate-bounce-rotate {
    top: 10px !important;
    right: 10px !important;
  }

  .animate-bounce-rotate .relative {
    padding: 0.5rem 1rem !important;
  }

  .animate-bounce-rotate .text-8xl {
    font-size: 2rem !important;
  }

  .animate-bounce-rotate .text-3xl {
    font-size: 0.875rem !important;
  }

  /* Burger images */
  .animate-float-burger > div > div {
    width: 200px !important;
    height: 200px !important;
  }

  .animate-float-burger-delayed > div > div {
    width: 150px !important;
    height: 150px !important;
  }

  .animate-float-burger {
    right: 0 !important;
    top: 50px !important;
  }

  .animate-float-burger-delayed {
    left: 0 !important;
    top: 150px !important;
  }

  /* Free delivery badge */
  .animate-slide-in-left:has(.text-2xl) {
    left: 5px !important;
    bottom: 20px !important;
  }

  .animate-slide-in-left .text-3xl {
    font-size: 1rem !important;
  }

  .animate-slide-in-left .text-2xl {
    font-size: 0.875rem !important;
  }

  /* CTA Button */
  .cta-button {
    min-width: 280px !important;
    min-height: 60px !important;
  }

  .cta-button span {
    padding: 0.75rem 2rem !important;
    font-size: 1.5rem !important;
  }

  /* Contact info */
  .text-6xl {
    font-size: 1.75rem !important;
  }

  .text-3xl {
    font-size: 1rem !important;
  }

  .text-2xl {
    font-size: 0.875rem !important;
  }
}

/* ===== MOBILE (481px - 767px) ===== */
@media (min-width: 481px) and (max-width: 767px) {
  .welcome-poster {
    font-size: clamp(12px, 1.8vw, 16px);
  }

  .welcome-poster > div {
    padding: 1rem 1.5rem !important;
  }

  /* Main headline */
  .text-\[12rem\] {
    font-size: 4.5rem !important;
    -webkit-text-stroke: 2px #b91c1c !important;
  }

  .text-7xl {
    font-size: 2rem !important;
  }

  .text-5xl {
    font-size: 1.75rem !important;
  }

  /* Promotional badge */
  .animate-bounce-rotate {
    top: 20px !important;
    right: 20px !important;
  }

  .animate-bounce-rotate .text-8xl {
    font-size: 3rem !important;
  }

  /* Burger images */
  .animate-float-burger > div > div {
    width: 280px !important;
    height: 280px !important;
  }

  .animate-float-burger-delayed > div > div {
    width: 200px !important;
    height: 200px !important;
  }

  /* CTA Button */
  .cta-button {
    min-width: 340px !important;
    min-height: 70px !important;
  }

  .cta-button span {
    padding: 1rem 3rem !important;
    font-size: 2rem !important;
  }
}

/* ===== TABLET PORTRAIT (768px - 1024px) ===== */
@media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
  .text-\[12rem\] {
    font-size: 6rem !important;
    -webkit-text-stroke: 2px #b91c1c !important;
  }

  .text-7xl {
    font-size: 3rem !important;
  }

  .text-8xl {
    font-size: 4rem !important;
  }

  /* Burger images */
  .animate-float-burger > div > div {
    width: 350px !important;
    height: 350px !important;
  }

  .animate-float-burger-delayed > div > div {
    width: 250px !important;
    height: 250px !important;
  }

  /* CTA Button */
  .cta-button {
    min-width: 400px !important;
    min-height: 80px !important;
  }

  .cta-button span {
    font-size: 2.5rem !important;
  }
}

/* ===== TABLET LANDSCAPE (768px - 1024px) ===== */
@media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
  .welcome-poster > div {
    padding: 1rem 2rem !important;
  }

  .text-\[12rem\] {
    font-size: 5rem !important;
    -webkit-text-stroke: 2px #b91c1c !important;
  }

  .text-7xl {
    font-size: 2.5rem !important;
  }

  .text-8xl {
    font-size: 3.5rem !important;
  }

  /* Adjust burger positioning for landscape */
  .animate-float-burger {
    right: 10px !important;
    top: 20px !important;
  }

  .animate-float-burger > div > div {
    width: 320px !important;
    height: 320px !important;
  }

  .animate-float-burger-delayed {
    left: 20px !important;
    top: 80px !important;
  }

  .animate-float-burger-delayed > div > div {
    width: 220px !important;
    height: 220px !important;
  }

  /* Reduce spacing */
  .space-y-12 {
    gap: 2rem !important;
  }

  .space-y-6 {
    gap: 1.5rem !important;
  }

  /* CTA Button */
  .cta-button {
    min-width: 360px !important;
    min-height: 70px !important;
  }

  .cta-button span {
    font-size: 2.25rem !important;
  }
}

/* ===== SMALL DESKTOP / LARGE TABLET (1025px - 1366px) ===== */
@media (min-width: 1025px) and (max-width: 1366px) {
  .text-\[12rem\] {
    font-size: 8rem !important;
  }

  .text-7xl {
    font-size: 3.5rem !important;
  }

  .text-8xl {
    font-size: 4.5rem !important;
  }

  /* Burger images */
  .animate-float-burger > div > div {
    width: 400px !important;
    height: 400px !important;
  }

  .animate-float-burger-delayed > div > div {
    width: 280px !important;
    height: 280px !important;
  }

  .cta-button {
    min-width: 440px !important;
    min-height: 90px !important;
  }

  .cta-button span {
    font-size: 3rem !important;
  }
}

/* ===== MEDIUM DESKTOP (1367px - 1600px) ===== */
@media (min-width: 1367px) and (max-width: 1600px) {
  .text-\[12rem\] {
    font-size: 9rem !important;
  }

  .text-7xl {
    font-size: 4rem !important;
  }

  .text-8xl {
    font-size: 5rem !important;
  }

  .animate-float-burger > div > div {
    width: 450px !important;
    height: 450px !important;
  }

  .animate-float-burger-delayed > div > div {
    width: 320px !important;
    height: 320px !important;
  }
}

/* ===== LARGE DESKTOP (1601px - 1920px) ===== */
@media (min-width: 1601px) and (max-width: 1920px) {
  .text-\[12rem\] {
    font-size: 10rem !important;
  }

  .text-7xl {
    font-size: 4.5rem !important;
  }

  .text-8xl {
    font-size: 5.5rem !important;
  }
}

/* ===== KIOSK VERTICAL (1080px wide x 1920px tall) ===== */
@media (min-width: 1080px) and (min-height: 1920px) and (orientation: portrait) {
  .welcome-poster {
    font-size: 1.1vw;
  }

  .text-\[12rem\] {
    font-size: 11rem !important;
  }

  .text-7xl {
    font-size: 5rem !important;
  }

  .text-8xl {
    font-size: 6rem !important;
  }

  .animate-float-burger > div > div {
    width: 500px !important;
    height: 500px !important;
  }

  .animate-float-burger-delayed > div > div {
    width: 350px !important;
    height: 350px !important;
  }

  .cta-button {
    min-width: 480px !important;
    min-height: 100px !important;
  }

  .cta-button span {
    font-size: 4xl !important;
  }
}

/* ===== EXTRA LARGE / 4K (2560px+) ===== */
@media (min-width: 2560px) {
  .welcome-poster {
    font-size: 1.2vw;
  }

  .text-\[12rem\] {
    font-size: 14rem !important;
  }

  .text-7xl {
    font-size: 6rem !important;
  }

  .text-8xl {
    font-size: 7rem !important;
  }

  .animate-float-burger > div > div {
    width: 600px !important;
    height: 600px !important;
  }

  .animate-float-burger-delayed > div > div {
    width: 420px !important;
    height: 420px !important;
  }
}

/* ===== HEIGHT-BASED ADJUSTMENTS ===== */
@media (max-height: 600px) {
  /* Very short screens (landscape phones) */
  .welcome-poster > div {
    padding: 0.5rem 1rem !important;
  }

  .text-\[12rem\] {
    font-size: 3rem !important;
    -webkit-text-stroke: 1px #b91c1c !important;
  }

  .text-7xl {
    font-size: 1.5rem !important;
  }

  .space-y-12 {
    gap: 1rem !important;
  }

  .space-y-8 {
    gap: 0.75rem !important;
  }

  .space-y-6 {
    gap: 0.5rem !important;
  }

  .animate-bounce-rotate {
    display: none !important;
  }

  .animate-float-burger > div > div {
    width: 200px !important;
    height: 200px !important;
  }

  .animate-float-burger-delayed {
    display: none !important;
  }

  .cta-button {
    min-width: 280px !important;
    min-height: 50px !important;
  }

  .cta-button span {
    padding: 0.5rem 1.5rem !important;
    font-size: 1.25rem !important;
  }
}

/* ===== LANDSCAPE ORIENTATION ADJUSTMENTS ===== */
@media (orientation: landscape) and (max-height: 900px) {
  .welcome-poster > div {
    padding: 1rem 2rem !important;
  }

  /* Reduce vertical spacing */
  .space-y-12 {
    gap: 1.5rem !important;
  }

  .space-y-8 {
    gap: 1rem !important;
  }

  .mb-8 {
    margin-bottom: 1rem !important;
  }

  .mt-8 {
    margin-top: 1rem !important;
  }

  /* Adjust hero section height */
  .relative.w-full.h-\[600px\] {
    height: 400px !important;
  }
}

/* ============================================
   ACCESSIBILITY - REDUCED MOTION
   ============================================ */

@media (prefers-reduced-motion: reduce) {
  .animate-float,
  .animate-float-delayed,
  .animate-float-burger,
  .animate-float-burger-delayed,
  .animate-bounce-rotate,
  .animate-ping-slow,
  .pattern-bg {
    animation: none;
  }

  .animate-slide-in-left,
  .animate-slide-in-right,
  .animate-fade-in-up {
    animation-duration: 0.3s;
  }
}

/* ============================================
   RESPONSIVE UTILITY CLASSES
   ============================================ */

/* Responsive text sizing */
.text-responsive-xs {
  font-size: clamp(0.75rem, 2vw, 1rem);
}

.text-responsive-sm {
  font-size: clamp(0.875rem, 2.5vw, 1.125rem);
}

.text-responsive-base {
  font-size: clamp(1rem, 3vw, 1.25rem);
}

.text-responsive-lg {
  font-size: clamp(1.125rem, 3.5vw, 1.5rem);
}

.text-responsive-xl {
  font-size: clamp(1.25rem, 4vw, 1.875rem);
}

.text-responsive-2xl {
  font-size: clamp(1.5rem, 4.5vw, 2.25rem);
}

.text-responsive-3xl {
  font-size: clamp(1.875rem, 5vw, 3rem);
}

.text-responsive-4xl {
  font-size: clamp(2.25rem, 6vw, 3.75rem);
}

.text-responsive-5xl {
  font-size: clamp(3rem, 8vw, 5rem);
}

/* Responsive spacing */
.space-responsive-y {
  gap: clamp(1rem, 3vw, 3rem);
}

.space-responsive-x {
  gap: clamp(0.5rem, 2vw, 2rem);
}

/* Responsive padding */
.padding-responsive {
  padding: clamp(0.5rem, 2vw, 3rem);
}

/* Responsive button */
.button-responsive {
  min-width: clamp(200px, 40vw, 480px);
  min-height: clamp(50px, 8vh, 100px);
  padding: clamp(0.75rem, 2vw, 2rem) clamp(2rem, 4vw, 4rem);
  font-size: clamp(1.25rem, 3vw, 3rem);
}

/* Responsive image container */
.image-responsive-lg {
  width: clamp(250px, 40vw, 500px);
  height: clamp(250px, 40vw, 500px);
}

.image-responsive-md {
  width: clamp(180px, 30vw, 350px);
  height: clamp(180px, 30vw, 350px);
}

/* ============================================
   CONTAINER QUERIES SUPPORT (Future-proof)
   ============================================ */

@container (max-width: 600px) {
  .container-text-sm {
    font-size: 0.875rem;
  }
}

/* ============================================
   PRINT STYLES
   ============================================ */

@media print {
  .welcome-poster {
    background: white !important;
    color: black !important;
  }

  .animate-float,
  .animate-float-delayed,
  .animate-float-burger,
  .animate-float-burger-delayed,
  .animate-bounce-rotate {
    animation: none !important;
  }
}
</style>