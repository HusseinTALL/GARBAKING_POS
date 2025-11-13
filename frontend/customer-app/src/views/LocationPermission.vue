<!--
  LocationPermission.vue
  Location access permission request screen with privacy information
-->
<template>
  <div class="min-h-screen bg-white flex flex-col">
    <!-- Content -->
    <div class="flex-1 flex flex-col justify-center items-center px-6 py-12">
      <!-- Illustration -->
      <div class="mb-12 relative">
        <!-- Circular background -->
        <div class="w-64 h-64 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center relative">
          <!-- Map pin icon with animation -->
          <div class="relative animate-bounce-slow">
            <svg class="w-32 h-32 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C7.802 0 4.403 3.403 4.403 7.602c0 1.7.6 3.3 1.6 4.6L12 24l5.998-11.798c1-1.3 1.6-2.9 1.6-4.6C19.598 3.403 16.199 0 12 0zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"/>
            </svg>
            <!-- Pulsing circles -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-40 h-40 border-4 border-orange-300 rounded-full animate-ping-slow opacity-20"></div>
            </div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-48 h-48 border-4 border-orange-200 rounded-full animate-ping-slower opacity-10"></div>
            </div>
          </div>
        </div>

        <!-- Decorative elements -->
        <div class="absolute -top-4 -right-4 w-8 h-8 bg-orange-400 rounded-full opacity-60"></div>
        <div class="absolute -bottom-2 -left-2 w-6 h-6 bg-orange-300 rounded-full opacity-40"></div>
      </div>

      <!-- Title and Description -->
      <div class="text-center max-w-md mb-12">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          Enable Location Access
        </h1>
        <p class="text-gray-600 text-lg leading-relaxed">
          We'll use your location to show you nearby restaurants and provide accurate delivery estimates.
        </p>
      </div>

      <!-- Privacy Info -->
      <div class="bg-orange-50 border border-orange-200 rounded-xl p-4 max-w-md mb-8">
        <div class="flex items-start">
          <svg class="w-5 h-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <p class="text-sm text-gray-700 font-medium mb-1">Your privacy matters</p>
            <p class="text-xs text-gray-600">
              DFOOD will access your location only while using the app. We never share your location with third parties.
            </p>
          </div>
        </div>
      </div>

      <!-- Features List -->
      <div class="space-y-4 max-w-md mb-12">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="text-gray-700">Find restaurants near you</p>
        </div>

        <div class="flex items-center">
          <div class="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="text-gray-700">Get accurate delivery times</p>
        </div>

        <div class="flex items-center">
          <div class="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="text-gray-700">Track your order in real-time</p>
        </div>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="px-6 pb-8 space-y-4">
      <!-- Access Location Button -->
      <button
        @click="requestLocationPermission"
        :disabled="requesting"
        class="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <span v-if="!requesting" class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          ACCESS LOCATION
        </span>
        <span v-else class="flex items-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Requesting...
        </span>
      </button>

      <!-- Skip Button -->
      <button
        @click="skip"
        class="w-full py-4 text-gray-500 hover:text-gray-700 font-medium transition-colors"
      >
        Skip for now
      </button>

      <!-- Error Message -->
      <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-600 text-center">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const requesting = ref(false)
const error = ref('')

const requestLocationPermission = async () => {
  if (!navigator.geolocation) {
    error.value = 'Geolocation is not supported by your browser'
    return
  }

  requesting.value = true
  error.value = ''

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      })
    })

    // Store location permission granted
    localStorage.setItem('location_permission', 'granted')
    localStorage.setItem('user_location', JSON.stringify({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: Date.now()
    }))

    // Navigate to home
    router.push('/home')
  } catch (err: any) {
    requesting.value = false

    if (err.code === err.PERMISSION_DENIED) {
      error.value = 'Location access denied. You can enable it later in settings.'
    } else if (err.code === err.POSITION_UNAVAILABLE) {
      error.value = 'Location information is unavailable.'
    } else if (err.code === err.TIMEOUT) {
      error.value = 'Location request timed out. Please try again.'
    } else {
      error.value = 'An error occurred while requesting location.'
    }

    console.error('Location error:', err)
  }
}

const skip = () => {
  // Store that user skipped location
  localStorage.setItem('location_permission', 'skipped')

  // Navigate to home
  router.push('/home')
}
</script>

<style scoped>
@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes ping-slow {
  0% {
    transform: scale(1);
    opacity: 0.2;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes ping-slower {
  0% {
    transform: scale(1);
    opacity: 0.1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}

.animate-ping-slow {
  animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.animate-ping-slower {
  animation: ping-slower 3s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>
