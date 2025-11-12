<!--
  Onboarding.vue
  Three-screen onboarding flow with illustrations showing app features
  Includes skip button and automatic navigation on final screen
-->
<template>
  <div class="min-h-screen bg-white flex flex-col">
    <!-- Skip button -->
    <div class="absolute top-6 right-6 z-10" v-if="currentSlide < 2">
      <button
        @click="skip"
        class="text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors"
      >
        Skip
      </button>
    </div>

    <!-- Slides container -->
    <div class="flex-1 flex items-center justify-center px-6 py-12">
      <!-- Slide 1: All your favorites -->
      <transition name="fade" mode="out-in">
        <div v-if="currentSlide === 0" key="slide1" class="text-center max-w-md">
          <!-- Illustration -->
          <div class="mb-12 relative h-80 flex items-center justify-center">
            <div class="relative w-64 h-64">
              <!-- Person with phone illustration -->
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-48 h-48 rounded-full bg-orange-50"></div>
              </div>
              <div class="absolute inset-0 flex items-center justify-center">
                <svg class="w-40 h-40 text-orange-500" fill="none" viewBox="0 0 200 200">
                  <!-- Person -->
                  <ellipse cx="100" cy="160" rx="50" ry="25" fill="#FFA500" opacity="0.2"/>
                  <rect x="70" y="110" width="60" height="80" rx="30" fill="#FFB84D"/>
                  <circle cx="100" cy="70" r="30" fill="#FFD699"/>
                  <!-- Food icons floating around -->
                  <circle cx="40" cy="40" r="15" fill="#FF6B6B"/>
                  <circle cx="160" cy="60" r="12" fill="#4ECDC4"/>
                  <rect x="30" y="140" width="20" height="25" rx="4" fill="#FFE66D"/>
                  <path d="M 150 120 L 170 130 L 150 140 Z" fill="#FF6B6B"/>
                  <circle cx="140" cy="40" r="10" fill="#95E1D3"/>
                </svg>
              </div>
            </div>
          </div>

          <h1 class="text-3xl font-bold text-gray-900 mb-4">
            All your favorites
          </h1>
          <p class="text-gray-500 text-base leading-relaxed">
            Get all of your loved foods in one place, you just place the order we do the rest
          </p>
        </div>

        <!-- Slide 2: Order from chosen chef -->
        <div v-else-if="currentSlide === 1" key="slide2" class="text-center max-w-md">
          <!-- Illustration -->
          <div class="mb-12 relative h-80 flex items-center justify-center">
            <div class="relative w-64 h-64">
              <!-- Chef illustration -->
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-48 h-48 rounded-full bg-orange-50"></div>
              </div>
              <div class="absolute inset-0 flex items-center justify-center">
                <svg class="w-40 h-40 text-orange-500" fill="none" viewBox="0 0 200 200">
                  <!-- Chef -->
                  <ellipse cx="100" cy="160" rx="50" ry="25" fill="#FFA500" opacity="0.2"/>
                  <!-- Apron -->
                  <path d="M 70 100 L 70 160 L 130 160 L 130 100" fill="#FF6B6B"/>
                  <!-- Body -->
                  <rect x="75" y="90" width="50" height="70" rx="25" fill="#FFB84D"/>
                  <!-- Head -->
                  <circle cx="100" cy="60" r="25" fill="#FFD699"/>
                  <!-- Chef hat -->
                  <ellipse cx="100" cy="40" rx="30" ry="15" fill="#FF6B6B"/>
                  <rect x="75" y="30" width="50" height="20" fill="#FF6B6B"/>
                  <!-- Cooking pot -->
                  <rect x="120" y="110" width="40" height="30" rx="5" fill="#4A5568"/>
                  <ellipse cx="140" cy="110" rx="20" ry="8" fill="#718096"/>
                  <!-- Steam -->
                  <path d="M 135 100 Q 133 95 135 90" stroke="#95E1D3" stroke-width="2" fill="none"/>
                  <path d="M 145 105 Q 143 100 145 95" stroke="#95E1D3" stroke-width="2" fill="none"/>
                </svg>
              </div>
            </div>
          </div>

          <h1 class="text-3xl font-bold text-gray-900 mb-4">
            Order from chosen chef
          </h1>
          <p class="text-gray-500 text-base leading-relaxed">
            Get all of your loved foods in one place, you just place the order we do the rest
          </p>
        </div>

        <!-- Slide 3: Free delivery offers -->
        <div v-else-if="currentSlide === 2" key="slide3" class="text-center max-w-md">
          <!-- Illustration -->
          <div class="mb-12 relative h-80 flex items-center justify-center">
            <div class="relative w-64 h-64">
              <!-- Delivery illustration -->
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-48 h-48 rounded-full bg-orange-50"></div>
              </div>
              <div class="absolute inset-0 flex items-center justify-center">
                <svg class="w-40 h-40 text-orange-500" fill="none" viewBox="0 0 200 200">
                  <!-- Delivery person -->
                  <ellipse cx="80" cy="160" rx="40" ry="20" fill="#FFA500" opacity="0.2"/>
                  <!-- Body -->
                  <rect x="60" y="110" width="40" height="60" rx="20" fill="#FFB84D"/>
                  <!-- Head -->
                  <circle cx="80" cy="85" r="20" fill="#FFD699"/>
                  <!-- Arms -->
                  <rect x="95" y="115" width="8" height="30" rx="4" fill="#FFB84D" transform="rotate(30 99 115)"/>
                  <!-- Legs -->
                  <rect x="65" y="165" width="12" height="25" rx="6" fill="#FF6B6B"/>
                  <rect x="83" y="165" width="12" height="25" rx="6" fill="#FF6B6B"/>

                  <!-- Delivery scooter -->
                  <ellipse cx="140" cy="150" rx="30" ry="15" fill="#FFA500"/>
                  <rect x="110" y="120" width="60" height="30" rx="8" fill="#FFA500"/>
                  <circle cx="125" cy="155" r="12" fill="#2D3748"/>
                  <circle cx="155" cy="155" r="12" fill="#2D3748"/>

                  <!-- Package -->
                  <rect x="115" y="100" width="25" height="25" rx="3" fill="#FFD699" stroke="#FFA500" stroke-width="2"/>

                  <!-- Coins/savings indicators -->
                  <circle cx="40" cy="60" r="8" fill="#FFE66D" opacity="0.8"/>
                  <circle cx="160" cy="70" r="6" fill="#FFE66D" opacity="0.8"/>
                  <circle cx="50" cy="100" r="5" fill="#FFE66D" opacity="0.8"/>
                </svg>
              </div>
            </div>
          </div>

          <h1 class="text-3xl font-bold text-gray-900 mb-4">
            Free delivery offers
          </h1>
          <p class="text-gray-500 text-base leading-relaxed">
            Get all of your loved foods in one place, you just place the order we do the rest
          </p>
        </div>
      </transition>
    </div>

    <!-- Bottom section -->
    <div class="px-6 pb-8">
      <!-- Progress dots -->
      <div class="flex justify-center gap-2 mb-8">
        <button
          v-for="i in 3"
          :key="i"
          @click="goToSlide(i - 1)"
          class="transition-all duration-300"
          :class="currentSlide === i - 1
            ? 'w-8 h-2 bg-orange-500 rounded-full'
            : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400'"
        ></button>
      </div>

      <!-- Action button -->
      <button
        v-if="currentSlide < 2"
        @click="nextSlide"
        class="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-xl transition-colors shadow-lg shadow-orange-200"
      >
        NEXT
      </button>
      <button
        v-else
        @click="getStarted"
        class="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-xl transition-colors shadow-lg shadow-orange-200"
      >
        GET STARTED
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentSlide = ref(0)

const nextSlide = () => {
  if (currentSlide.value < 2) {
    currentSlide.value++
  }
}

const goToSlide = (index: number) => {
  currentSlide.value = index
}

const skip = () => {
  router.push('/home')
}

const getStarted = () => {
  // Mark onboarding as completed in localStorage
  localStorage.setItem('onboarding_completed', 'true')
  router.push('/home')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
