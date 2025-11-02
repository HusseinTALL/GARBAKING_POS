<template>
  <div class="qr-code-display">
    <!-- QR Code Section -->
    <div class="qr-section">
      <div v-if="isLoading" class="qr-loading">
        <div class="spinner"></div>
        <p>Generating QR Code...</p>
      </div>

      <div v-else-if="error" class="qr-error">
        <div class="error-icon">⚠️</div>
        <p class="error-message">{{ error }}</p>
        <button @click="regenerateQR" class="retry-button">
          🔄 Retry
        </button>
      </div>

      <div v-else-if="isExpired" class="qr-expired">
        <div class="expired-icon">⏰</div>
        <p class="expired-message">QR Code Expired</p>
        <p class="expired-hint">This QR code has expired after {{ expiryMinutes }} minutes</p>
        <button @click="regenerateQR" class="regenerate-button">
          🔄 Generate New QR Code
        </button>
      </div>

      <div v-else class="qr-content">
        <!-- QR Code Canvas -->
        <div class="qr-code-container">
          <canvas ref="qrCanvas" class="qr-canvas"></canvas>
          <div v-if="!qrToken" class="qr-placeholder">
            <div class="placeholder-icon">📱</div>
            <p>QR Code will appear here</p>
          </div>
        </div>

        <!-- Instructions -->
        <div class="qr-instructions">
          <h3 class="instructions-title">{{ $t('qr.scanToPay') || 'Scan to Pay' }}</h3>
          <p class="instructions-text">
            {{ $t('qr.instructions') || 'Show this QR code to the cashier to complete your payment' }}
          </p>
        </div>

        <!-- Short Code Section -->
        <div v-if="shortCode" class="short-code-section">
          <div class="short-code-label">
            {{ $t('qr.shortCode') || 'Payment Code:' }}
          </div>
          <div class="short-code-value" @click="copyShortCode">
            <span class="code-text">{{ formattedShortCode }}</span>
            <span class="copy-icon">📋</span>
          </div>
          <div class="short-code-hint">
            {{ $t('qr.shortCodeHint') || 'Use this code if QR scanner is unavailable' }}
          </div>
        </div>

        <!-- Expiry Countdown -->
        <div v-if="timeRemaining > 0" class="expiry-section">
          <div class="expiry-bar-container">
            <div class="expiry-bar" :style="{ width: expiryPercentage + '%' }"></div>
          </div>
          <div class="expiry-text">
            <span class="expiry-label">{{ $t('qr.expiresIn') || 'Expires in:' }}</span>
            <span class="expiry-time" :class="{ 'expiry-warning': timeRemaining < 60 }">
              {{ formattedTimeRemaining }}
            </span>
          </div>
        </div>

        <!-- Order Details -->
        <div class="order-summary">
          <div class="summary-row">
            <span class="summary-label">{{ $t('qr.orderNumber') || 'Order:' }}</span>
            <span class="summary-value">{{ orderNumber || '—' }}</span>
          </div>
          <div class="summary-row total">
            <span class="summary-label">{{ $t('qr.total') || 'Total:' }}</span>
            <span class="summary-value">{{ formattedAmount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification for Copy -->
    <Transition name="toast">
      <div v-if="showCopyToast" class="copy-toast">
        ✓ Code copied to clipboard!
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import QRCode from 'qrcode'

// Props
interface Props {
  orderId?: number
  orderNumber?: string
  qrToken?: string
  shortCode?: string
  expiresAt?: string
  totalAmount?: number
  currency?: string
  expiryMinutes?: number
}

const props = withDefaults(defineProps<Props>(), {
  currency: 'XOF',
  expiryMinutes: 5
})

// Emits
const emit = defineEmits<{
  expired: []
  regenerate: []
}>()

// Refs
const qrCanvas = ref<HTMLCanvasElement | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const timeRemaining = ref(0)
const showCopyToast = ref(false)
const countdownInterval = ref<number | null>(null)

// Computed
const isExpired = computed(() => {
  return timeRemaining.value <= 0 && props.expiresAt !== undefined
})

const formattedTimeRemaining = computed(() => {
  const minutes = Math.floor(timeRemaining.value / 60)
  const seconds = timeRemaining.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

const expiryPercentage = computed(() => {
  const totalSeconds = props.expiryMinutes * 60
  return (timeRemaining.value / totalSeconds) * 100
})

const formattedShortCode = computed(() => {
  if (!props.shortCode) return ''
  // Format as QR-2A3B4C for better readability
  return props.shortCode.replace(/^(QR)(.*)$/, '$1-$2')
})

const formattedAmount = computed(() => {
  if (!props.totalAmount) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: props.currency,
    minimumFractionDigits: 0
  }).format(props.totalAmount)
})

// Methods
const generateQRCode = async () => {
  if (!qrCanvas.value || !props.qrToken) {
    console.warn('QR Canvas or token not available')
    return
  }

  isLoading.value = true
  error.value = null

  try {
    // Generate QR code on canvas
    await QRCode.toCanvas(qrCanvas.value, props.qrToken, {
      width: 280,
      margin: 2,
      color: {
        dark: '#1F2937',  // Tailwind gray-800
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    })
  } catch (err) {
    console.error('Failed to generate QR code:', err)
    error.value = 'Failed to generate QR code. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const startCountdown = () => {
  if (!props.expiresAt) return

  // Clear existing interval
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
  }

  // Calculate initial time remaining
  updateTimeRemaining()

  // Update every second
  countdownInterval.value = window.setInterval(() => {
    updateTimeRemaining()

    if (timeRemaining.value <= 0) {
      clearInterval(countdownInterval.value!)
      emit('expired')
    }
  }, 1000)
}

const updateTimeRemaining = () => {
  if (!props.expiresAt) return

  const expiryTime = new Date(props.expiresAt).getTime()
  const now = Date.now()
  const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000))

  timeRemaining.value = remaining
}

const copyShortCode = async () => {
  if (!props.shortCode) return

  try {
    await navigator.clipboard.writeText(props.shortCode)
    showCopyToast.value = true
    setTimeout(() => {
      showCopyToast.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy short code:', err)
    // Fallback: select text
    try {
      const range = document.createRange()
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(range)
      }
    } catch (selectErr) {
      console.error('Failed to select text:', selectErr)
    }
  }
}

const regenerateQR = () => {
  emit('regenerate')
}

// Lifecycle
onMounted(() => {
  generateQRCode()
  startCountdown()
})

onUnmounted(() => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
  }
})

// Watchers
watch(() => props.qrToken, () => {
  generateQRCode()
})

watch(() => props.expiresAt, () => {
  startCountdown()
})
</script>

<style scoped>
.qr-code-display {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.qr-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Loading State */
.qr-loading {
  text-align: center;
  padding: 40px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 4px solid #f3f4f6;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Error State */
.qr-error {
  text-align: center;
  padding: 40px 20px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-message {
  color: #dc2626;
  margin-bottom: 16px;
  font-weight: 500;
}

.retry-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-button:hover {
  background: #2563eb;
}

/* Expired State */
.qr-expired {
  text-align: center;
  padding: 40px 20px;
}

.expired-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.expired-message {
  font-size: 20px;
  font-weight: 600;
  color: #9f1239;
  margin-bottom: 8px;
}

.expired-hint {
  color: #6b7280;
  margin-bottom: 20px;
}

.regenerate-button {
  background: #10b981;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.regenerate-button:hover {
  background: #059669;
}

/* QR Content */
.qr-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.qr-code-container {
  position: relative;
  width: 280px;
  height: 280px;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
  background: white;
}

.qr-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.qr-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

/* Instructions */
.qr-instructions {
  text-align: center;
}

.instructions-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.instructions-text {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

/* Short Code */
.short-code-section {
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.short-code-label {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  font-weight: 600;
}

.short-code-value {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: all;
}

.short-code-value:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.code-text {
  font-size: 24px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  color: #111827;
  letter-spacing: 0.1em;
}

.copy-icon {
  font-size: 18px;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.short-code-value:hover .copy-icon {
  opacity: 1;
}

.short-code-hint {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 8px;
}

/* Expiry Section */
.expiry-section {
  background: #fef3c7;
  border-radius: 12px;
  padding: 16px;
}

.expiry-bar-container {
  height: 6px;
  background: #fde68a;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 12px;
}

.expiry-bar {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #f59e0b);
  transition: width 1s linear;
  border-radius: 3px;
}

.expiry-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.expiry-label {
  font-size: 12px;
  color: #92400e;
  font-weight: 600;
}

.expiry-time {
  font-size: 18px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  color: #92400e;
}

.expiry-warning {
  color: #dc2626;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* Order Summary */
.order-summary {
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 14px;
  color: #6b7280;
}

.summary-value {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.summary-row.total {
  border-top: 1px solid #e5e7eb;
  padding-top: 8px;
  margin-top: 4px;
}

.summary-row.total .summary-label {
  font-size: 16px;
  color: #111827;
  font-weight: 600;
}

.summary-row.total .summary-value {
  font-size: 20px;
  color: #10b981;
}

/* Copy Toast */
.copy-toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: #10b981;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

/* Responsive */
@media (max-width: 640px) {
  .qr-section {
    padding: 20px 16px;
  }

  .qr-code-container {
    width: 240px;
    height: 240px;
  }

  .code-text {
    font-size: 20px;
  }
}
</style>
