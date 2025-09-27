<!--
  Welcome page for customer app
  Beautiful landing page with restaurant branding and call-to-action
-->

<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 relative overflow-hidden">
    <!-- Background decoration -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-white bg-opacity-10 rounded-full"></div>
      <div class="absolute -bottom-32 -left-32 w-64 h-64 bg-white bg-opacity-10 rounded-full"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white bg-opacity-5 rounded-full"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 flex flex-col min-h-screen safe-area-top safe-area-bottom">
      <!-- Header -->
      <div class="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <!-- Logo -->
        <div class="mb-8 animate-bounce-in">
          <div class="w-24 h-24 bg-white bg-opacity-20 rounded-3xl flex items-center justify-center mb-4 mx-auto backdrop-blur-sm">
            <FontAwesomeIcon :icon="['fas', 'utensils']" class="text-4xl text-white" />
          </div>
          <h1 class="text-4xl font-bold text-white mb-2">{{ restaurantName }}</h1>
          <p class="text-xl text-white text-opacity-90">Restaurant Burkinabe Authentique</p>
        </div>

        <!-- Welcome message -->
        <div class="mb-12 animate-fade-in">
          <h2 class="text-2xl font-semibold text-white mb-4">
            Bienvenue !
          </h2>
          <p class="text-lg text-white text-opacity-90 leading-relaxed max-w-md">
            Découvrez nos délicieux plats traditionnels ivoiriens.
            Commandez directement depuis votre table pour une expérience unique.
          </p>
        </div>

        <!-- Features -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 max-w-lg animate-slide-up">
          <div class="text-center">
            <div class="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
              <FontAwesomeIcon :icon="['fas', 'utensils']" class="text-2xl text-white" />
            </div>
            <p class="text-white text-opacity-90 text-sm font-medium">Plats Authentiques</p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
              <FontAwesomeIcon :icon="['fas', 'clock']" class="text-2xl text-white" />
            </div>
            <p class="text-white text-opacity-90 text-sm font-medium">Service Rapide</p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
              <FontAwesomeIcon :icon="['fas', 'wifi']" class="text-2xl text-white" />
            </div>
            <p class="text-white text-opacity-90 text-sm font-medium">Commande Digitale</p>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="px-6 pb-8">
        <div class="space-y-4">
          <!-- Main CTA -->
          <button
            @click="goToMenu"
            :disabled="isLoading"
            class="w-full bg-white text-primary-600 font-bold py-4 px-6 rounded-2xl shadow-floating hover:shadow-button transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
          >
            <FontAwesomeIcon
              v-if="isLoading"
              :icon="['fas', 'spinner']"
              class="animate-spin mr-3"
            />
            <span v-else>
              <FontAwesomeIcon :icon="['fas', 'utensils']" class="mr-3" />
            </span>
            {{ isLoading ? 'Chargement du menu...' : 'Découvrir le Menu' }}
          </button>

          <!-- Secondary actions -->
          <div class="grid grid-cols-2 gap-3">
            <button
              @click="goToOrderStatus"
              class="bg-white bg-opacity-20 text-white font-medium py-3 px-4 rounded-xl backdrop-blur-sm hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center"
            >
              <FontAwesomeIcon :icon="['fas', 'search']" class="mr-2" />
              <span class="text-sm">Suivre ma commande</span>
            </button>

            <button
              @click="showAbout = true"
              class="bg-white bg-opacity-20 text-white font-medium py-3 px-4 rounded-xl backdrop-blur-sm hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center"
            >
              <FontAwesomeIcon :icon="['fas', 'info-circle']" class="mr-2" />
              <span class="text-sm">À propos</span>
            </button>
          </div>
        </div>

        <!-- Connection status -->
        <div class="mt-6 text-center">
          <div class="inline-flex items-center space-x-2 text-white text-opacity-75 text-sm">
            <FontAwesomeIcon
              :icon="['fas', isOnline ? 'wifi' : 'wifi-slash']"
              :class="isOnline ? 'text-green-300' : 'text-yellow-300'"
            />
            <span>{{ connectionText }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- About Modal -->
    <div
      v-if="showAbout"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click="showAbout = false"
    >
      <div
        class="bg-white rounded-2xl p-6 max-w-sm w-full animate-scale-in"
        @click.stop
      >
        <div class="text-center mb-4">
          <div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FontAwesomeIcon :icon="['fas', 'utensils']" class="text-2xl text-primary-600" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">{{ restaurantName }}</h3>
          <p class="text-gray-600">Restaurant Ivoirien Authentique</p>
        </div>

        <div class="space-y-3 text-sm text-gray-600 mb-6">
          <div class="flex items-center">
            <FontAwesomeIcon :icon="['fas', 'map-marker-alt']" class="mr-3 text-primary-600" />
            <span>Abidjan, Côte d'Ivoire</span>
          </div>
          <div class="flex items-center">
            <FontAwesomeIcon :icon="['fas', 'phone']" class="mr-3 text-primary-600" />
            <span>{{ supportPhone }}</span>
          </div>
          <div class="flex items-center">
            <FontAwesomeIcon :icon="['fas', 'clock']" class="mr-3 text-primary-600" />
            <span>Ouvert 7j/7 · 10h - 22h</span>
          </div>
        </div>

        <button
          @click="showAbout = false"
          class="w-full bg-primary-600 text-white font-medium py-3 rounded-xl hover:bg-primary-700 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>

    <!-- Order Status Modal -->
    <div
      v-if="showOrderTracker"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click="showOrderTracker = false"
    >
      <div
        class="bg-white rounded-2xl p-6 max-w-sm w-full animate-scale-in"
        @click.stop
      >
        <h3 class="text-xl font-bold text-gray-900 mb-4 text-center">Suivre ma commande</h3>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Numéro de commande
          </label>
          <input
            v-model="orderNumberInput"
            type="text"
            placeholder="Ex: 001"
            class="input-field"
          />
        </div>

        <div class="flex space-x-3">
          <button
            @click="showOrderTracker = false"
            class="flex-1 bg-gray-200 text-gray-800 font-medium py-3 rounded-xl hover:bg-gray-300 transition-colors"
          >
            Annuler
          </button>
          <button
            @click="trackOrder"
            :disabled="!orderNumberInput.trim()"
            class="flex-1 bg-primary-600 text-white font-medium py-3 rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Suivre
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useMenuStore } from '@/stores/menu'
import { useNetworkStore } from '@/stores/network'
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'

const router = useRouter()
const toast = useToast()

// Stores
const menuStore = useMenuStore()
const networkStore = useNetworkStore()
const appStore = useAppStore()
const { isOnline } = storeToRefs(networkStore)
const { appConfig } = storeToRefs(appStore)

// Local state
const isLoading = ref(false)
const showAbout = ref(false)
const showOrderTracker = ref(false)
const orderNumberInput = ref('')

// Computed
const restaurantName = computed(() => appConfig.value.restaurantName)
const supportPhone = computed(() => appConfig.value.supportPhone)

const connectionText = computed(() => {
  if (isOnline.value) {
    return 'Connecté au restaurant'
  } else {
    return 'Mode hors ligne'
  }
})

// Methods
const goToMenu = async () => {
  isLoading.value = true

  try {
    // Pre-load menu data
    await menuStore.fetchMenu()

    // Navigate to menu with a slight delay for UX
    setTimeout(() => {
      router.push('/menu')
    }, 500)
  } catch (error) {
    toast.error('Erreur lors du chargement du menu')
    console.error('Error loading menu:', error)
  } finally {
    setTimeout(() => {
      isLoading.value = false
    }, 500)
  }
}

const goToOrderStatus = () => {
  showOrderTracker.value = true
}

const trackOrder = () => {
  const orderNumber = orderNumberInput.value.trim()
  if (orderNumber) {
    showOrderTracker.value = false
    router.push(`/order-status/${orderNumber}`)
  }
}

// Lifecycle
onMounted(() => {
  // Check connectivity
  networkStore.checkConnectivity()

  // Set page title
  document.title = `Bienvenue - ${restaurantName.value}`
})
</script>

<style scoped>
/* Component-specific animations */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.6);
  }
}

.animate-glow {
  animation: pulse-glow 2s infinite;
}
</style>