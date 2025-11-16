<script setup lang="ts">
/**
 * QRScanner - Camera-based QR code scanner
 *
 * Features:
 * - Camera access with permission handling
 * - Real-time QR code detection
 * - Torch/flashlight toggle
 * - Success animation and haptic feedback
 * - Multiple use cases (loyalty, payment, vouchers, in-restaurant ordering)
 * - Error handling and fallback UI
 */

import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Html5Qrcode, Html5QrcodeScanner } from 'html5-qrcode'
import { Camera, X, Zap, ZapOff, CheckCircle, AlertCircle } from 'lucide-vue-next'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'

interface QRScannerProps {
  mode?: 'loyalty' | 'payment' | 'voucher' | 'table' | 'general'
}

const props = withDefaults(defineProps<QRScannerProps>(), {
  mode: 'general'
})

const router = useRouter()
const route = useRoute()

// State
const isScanning = ref(false)
const isTorchOn = ref(false)
const hasPermission = ref(false)
const permissionDenied = ref(false)
const scanResult = ref<string | null>(null)
const scanSuccess = ref(false)
const errorMessage = ref<string>('')
const showResult = ref(false)

// Scanner instance
let html5QrCode: Html5Qrcode | null = null
const scannerId = 'qr-scanner-region'

/**
 * Initialize camera and start scanning
 */
const startScanning = async () => {
  try {
    // Request camera permission
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    hasPermission.value = true
    stream.getTracks().forEach(track => track.stop()) // Stop the test stream

    // Initialize scanner
    html5QrCode = new Html5Qrcode(scannerId)

    const config = {
      fps: 10, // Frames per second for scanning
      qrbox: { width: 250, height: 250 }, // Scanning box size
      aspectRatio: 1.0,
      disableFlip: false
    }

    // Start scanning
    await html5QrCode.start(
      { facingMode: 'environment' }, // Use back camera
      config,
      onScanSuccess,
      onScanError
    )

    isScanning.value = true
    errorMessage.value = ''
  } catch (err: any) {
    console.error('Failed to start scanner:', err)

    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      permissionDenied.value = true
      errorMessage.value = 'Camera access denied. Please enable camera permissions in your browser settings.'
    } else if (err.name === 'NotFoundError') {
      errorMessage.value = 'No camera found on this device.'
    } else {
      errorMessage.value = 'Failed to access camera. Please try again.'
    }

    hasPermission.value = false
  }
}

/**
 * Stop scanning and release camera
 */
const stopScanning = async () => {
  if (html5QrCode && isScanning.value) {
    try {
      await html5QrCode.stop()
      html5QrCode.clear()
    } catch (err) {
      console.error('Failed to stop scanner:', err)
    }
  }
  isScanning.value = false
}

/**
 * Handle successful scan
 */
const onScanSuccess = (decodedText: string, decodedResult: any) => {
  console.log('QR Code detected:', decodedText)

  scanResult.value = decodedText
  scanSuccess.value = true
  showResult.value = true

  // Vibrate on success (if supported)
  if ('vibrate' in navigator) {
    navigator.vibrate(200)
  }

  // Stop scanning
  stopScanning()

  // Process the QR code based on mode
  setTimeout(() => {
    processQRCode(decodedText)
  }, 1500) // Show success message for 1.5s
}

/**
 * Handle scan errors (not critical, happens continuously while scanning)
 */
const onScanError = (errorMessage: string) => {
  // Ignore continuous scanning errors
  // Only log actual errors
  if (!errorMessage.includes('No MultiFormat Readers')) {
    console.debug('QR Scan error:', errorMessage)
  }
}

/**
 * Process QR code based on mode and content
 */
const processQRCode = (qrData: string) => {
  try {
    // Try to parse as JSON (structured data)
    const parsed = JSON.parse(qrData)

    if (parsed.type === 'loyalty' || props.mode === 'loyalty') {
      // Loyalty points redemption
      router.push(`/loyalty/redeem?code=${parsed.code || qrData}`)
    } else if (parsed.type === 'payment' || props.mode === 'payment') {
      // Payment QR code
      router.push(`/payment/qr?data=${encodeURIComponent(qrData)}`)
    } else if (parsed.type === 'voucher' || props.mode === 'voucher') {
      // Voucher redemption
      router.push(`/vouchers/redeem?code=${parsed.code || qrData}`)
    } else if (parsed.type === 'table' || props.mode === 'table') {
      // In-restaurant table ordering
      router.push(`/restaurant/${parsed.restaurantId}/table/${parsed.tableId}`)
    } else {
      // General QR code
      handleGeneralQRCode(qrData)
    }
  } catch (err) {
    // Not JSON, treat as plain text
    handleGeneralQRCode(qrData)
  }
}

/**
 * Handle general QR codes (URLs, plain text, etc.)
 */
const handleGeneralQRCode = (qrData: string) => {
  // Check if it's a URL
  if (qrData.startsWith('http://') || qrData.startsWith('https://')) {
    // Check if it's a Garbaking URL
    if (qrData.includes('garbaking.com') || qrData.includes('localhost')) {
      // Navigate to internal route
      const url = new URL(qrData)
      router.push(url.pathname + url.search)
    } else {
      // External URL - ask user before opening
      showResult.value = true
    }
  } else {
    // Plain text or other format
    showResult.value = true
  }
}

/**
 * Toggle flashlight/torch
 */
const toggleTorch = async () => {
  if (!html5QrCode) return

  try {
    const track = html5QrCode.getRunningTrackCameraCapabilities()
    if (track && track.torch) {
      await track.applyConstraints({
        advanced: [{ torch: !isTorchOn.value } as any]
      })
      isTorchOn.value = !isTorchOn.value
    }
  } catch (err) {
    console.error('Failed to toggle torch:', err)
  }
}

/**
 * Close scanner and go back
 */
const closeScanner = () => {
  stopScanning()
  router.back()
}

/**
 * Retry scanning after error
 */
const retryScanning = () => {
  errorMessage.value = ''
  permissionDenied.value = false
  showResult.value = false
  scanSuccess.value = false
  scanResult.value = null
  startScanning()
}

/**
 * Open result in new tab (for external URLs)
 */
const openResult = () => {
  if (scanResult.value && (scanResult.value.startsWith('http://') || scanResult.value.startsWith('https://'))) {
    window.open(scanResult.value, '_blank')
    closeScanner()
  }
}

// Lifecycle
onMounted(() => {
  startScanning()
})

onUnmounted(() => {
  stopScanning()
})
</script>

<template>
  <div class="qr-scanner min-h-screen bg-black flex flex-col">
    <!-- Header -->
    <div class="qr-scanner-header relative z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
      <div class="flex items-center justify-between">
        <button
          @click="closeScanner"
          class="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
          aria-label="Close scanner"
        >
          <X :size="24" class="text-white" />
        </button>

        <h1 class="text-white font-semibold text-lg">
          {{ mode === 'loyalty' ? 'Scan Loyalty Code' :
             mode === 'payment' ? 'Scan Payment QR' :
             mode === 'voucher' ? 'Scan Voucher' :
             mode === 'table' ? 'Scan Table QR' :
             'Scan QR Code' }}
        </h1>

        <button
          v-if="isScanning"
          @click="toggleTorch"
          class="p-2 rounded-full backdrop-blur-sm transition-colors"
          :class="isTorchOn ? 'bg-orange-500' : 'bg-white/10 hover:bg-white/20'"
          aria-label="Toggle flashlight"
        >
          <Zap v-if="isTorchOn" :size="24" class="text-white" />
          <ZapOff v-else :size="24" class="text-white" />
        </button>
        <div v-else class="w-10"></div>
      </div>
    </div>

    <!-- Scanner Region -->
    <div class="qr-scanner-content flex-1 flex flex-col items-center justify-center relative">
      <!-- Camera Feed -->
      <div v-show="isScanning && !showResult" class="relative w-full h-full flex items-center justify-center">
        <div :id="scannerId" class="w-full max-w-md"></div>

        <!-- Scanning Overlay -->
        <div class="absolute inset-0 pointer-events-none">
          <div class="absolute inset-0 bg-black/50"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64">
            <!-- Corners -->
            <div class="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-orange-500 rounded-tl-2xl"></div>
            <div class="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-orange-500 rounded-tr-2xl"></div>
            <div class="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-orange-500 rounded-bl-2xl"></div>
            <div class="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-orange-500 rounded-br-2xl"></div>

            <!-- Scanning Line Animation -->
            <div class="absolute inset-0 overflow-hidden">
              <div class="absolute w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-scan"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Permission Denied State -->
      <div v-if="permissionDenied" class="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle :size="64" class="text-red-500 mb-4" />
        <h2 class="text-white text-xl font-bold mb-2">Camera Access Denied</h2>
        <p class="text-gray-300 mb-6 max-w-md">
          {{ errorMessage }}
        </p>
        <BaseButton variant="primary" @click="retryScanning">
          Retry
        </BaseButton>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage && !permissionDenied" class="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle :size="64" class="text-yellow-500 mb-4" />
        <h2 class="text-white text-xl font-bold mb-2">Scanner Error</h2>
        <p class="text-gray-300 mb-6 max-w-md">
          {{ errorMessage }}
        </p>
        <div class="flex gap-4">
          <BaseButton variant="outline" @click="closeScanner">
            Cancel
          </BaseButton>
          <BaseButton variant="primary" @click="retryScanning">
            Retry
          </BaseButton>
        </div>
      </div>

      <!-- Instructions -->
      <div v-if="isScanning && !showResult" class="absolute bottom-8 left-0 right-0 text-center px-8">
        <p class="text-white text-sm mb-2">
          Position the QR code within the frame
        </p>
        <div class="flex items-center justify-center gap-2 text-gray-400 text-xs">
          <Camera :size="16" />
          <span>Make sure the QR code is well lit</span>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <BaseModal
      :is-open="showResult && scanSuccess"
      type="bottomSheet"
      :close-on-backdrop="false"
      @close="closeScanner"
    >
      <div class="p-6 text-center">
        <div class="flex justify-center mb-4">
          <div class="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle :size="48" class="text-green-500 animate-scale-in" />
          </div>
        </div>

        <h2 class="text-2xl font-bold mb-2 dark:text-white">QR Code Scanned!</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">Processing your request...</p>

        <div v-if="scanResult" class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Scanned Data:</p>
          <p class="text-xs font-mono break-all text-gray-800 dark:text-gray-200">
            {{ scanResult.substring(0, 100) }}{{ scanResult.length > 100 ? '...' : '' }}
          </p>
        </div>

        <div v-if="scanResult && (scanResult.startsWith('http://') || scanResult.startsWith('https://'))" class="flex gap-3">
          <BaseButton variant="outline" size="md" @click="closeScanner" class="flex-1">
            Cancel
          </BaseButton>
          <BaseButton variant="primary" size="md" @click="openResult" class="flex-1">
            Open Link
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<style scoped>
/* QR Scanner Styles */
.qr-scanner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}

/* Hide default html5-qrcode UI elements */
:deep(#qr-scanner-region) {
  border: none !important;
  box-shadow: none !important;
}

:deep(#qr-scanner-region video) {
  border-radius: 0 !important;
  object-fit: cover;
}

:deep(#qr-shaded-region) {
  border: none !important;
}

/* Scanning animation */
@keyframes scan {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(256px);
  }
}

.animate-scan {
  animation: scan 2s ease-in-out infinite;
}

/* Scale in animation for success icon */
@keyframes scaleIn {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scaleIn 0.5s ease-out;
}

/* Dark overlay for scanning area */
.qr-scanner-content {
  background: radial-gradient(circle at center, transparent 30%, rgba(0, 0, 0, 0.7) 70%);
}
</style>
