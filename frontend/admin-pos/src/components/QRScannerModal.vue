<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
        <div class="modal-container" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <!-- Modal Header -->
          <div class="modal-header">
            <h2 id="modal-title" class="modal-title">
              {{ currentStep === 'scan' ? 'Scan QR Code' : currentStep === 'details' ? 'Order Details' : 'Confirm Payment' }}
            </h2>
            <button
              @click="handleClose"
              class="close-button"
              aria-label="Close modal"
              :disabled="isProcessing"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <!-- Step 1: Scan QR Code -->
            <div v-if="currentStep === 'scan'" class="scan-step">
              <!-- Tab Selector -->
              <div class="tabs">
                <button
                  @click="scanMode = 'camera'"
                  :class="['tab', { active: scanMode === 'camera' }]"
                  :disabled="!cameraAvailable"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span>Camera Scan</span>
                </button>
                <button
                  @click="scanMode = 'manual'"
                  :class="['tab', { active: scanMode === 'manual' }]"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                  </svg>
                  <span>Manual Code</span>
                </button>
              </div>

              <!-- Camera Scanner -->
              <div v-if="scanMode === 'camera'" class="camera-section">
                <div v-if="cameraError" class="error-alert">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                  </svg>
                  <span>{{ cameraError }}</span>
                </div>

                <div v-else class="camera-container">
                  <div ref="qrReaderElement" class="qr-reader"></div>
                  <div v-if="isScanning" class="scanning-overlay">
                    <div class="scan-line"></div>
                    <div class="scan-corners"></div>
                  </div>
                  <div v-if="!isScanning" class="camera-placeholder">
                    <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                    </svg>
                    <p class="text-gray-500 mt-2">Camera will activate when ready</p>
                  </div>
                </div>

                <div class="camera-controls">
                  <button
                    v-if="!isScanning"
                    @click="startScanning"
                    class="btn-primary"
                    :disabled="isProcessing"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Start Camera
                  </button>
                  <button
                    v-else
                    @click="stopScanning"
                    class="btn-secondary"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/>
                    </svg>
                    Stop Camera
                  </button>
                </div>
              </div>

              <!-- Manual Code Entry -->
              <div v-else class="manual-section">
                <div class="form-group">
                  <label for="short-code" class="form-label">
                    Enter 8-Character Payment Code
                  </label>
                  <input
                    id="short-code"
                    v-model="manualCode"
                    type="text"
                    maxlength="8"
                    placeholder="QR2A3B4C"
                    class="form-input code-input"
                    @input="formatManualCode"
                    @keyup.enter="submitManualCode"
                    :disabled="isProcessing"
                  />
                  <p class="form-hint">
                    Code format: QR + 6 characters (e.g., QR2A3B4C)
                  </p>
                </div>

                <button
                  @click="submitManualCode"
                  class="btn-primary w-full"
                  :disabled="!isValidManualCode || isProcessing"
                >
                  <svg v-if="isProcessing" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                  {{ isProcessing ? 'Validating...' : 'Submit Code' }}
                </button>
              </div>

              <!-- Error Display -->
              <div v-if="scanError" class="error-alert">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                <div>
                  <p class="font-medium">{{ scanError }}</p>
                  <p v-if="scanErrorCode === 'TOKEN_EXPIRED'" class="text-sm mt-1">
                    Please ask the customer to regenerate their QR code
                  </p>
                  <p v-if="scanErrorCode === 'ORDER_ALREADY_PAID'" class="text-sm mt-1">
                    This order has already been paid for
                  </p>
                </div>
              </div>
            </div>

            <!-- Step 2: Order Details -->
            <div v-if="currentStep === 'details'" class="details-step">
              <div v-if="scannedOrder" class="order-details">
                <!-- Order Header -->
                <div class="order-header">
                  <div class="order-number">
                    <span class="label">Order Number</span>
                    <span class="value">{{ scannedOrder.orderNumber }}</span>
                  </div>
                  <div class="order-status">
                    <span :class="['badge', `badge-${scannedOrder.status.toLowerCase()}`]">
                      {{ scannedOrder.status }}
                    </span>
                  </div>
                </div>

                <!-- Customer Info -->
                <div v-if="scannedOrder.customerName" class="info-section">
                  <h3 class="section-title">Customer Information</h3>
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="info-label">Name:</span>
                      <span class="info-value">{{ scannedOrder.customerName }}</span>
                    </div>
                    <div v-if="scannedOrder.tableNumber" class="info-item">
                      <span class="info-label">Table:</span>
                      <span class="info-value">{{ scannedOrder.tableNumber }}</span>
                    </div>
                    <div v-if="scannedOrder.customerPhone" class="info-item">
                      <span class="info-label">Phone:</span>
                      <span class="info-value">{{ scannedOrder.customerPhone }}</span>
                    </div>
                  </div>
                </div>

                <!-- Order Items -->
                <div class="info-section">
                  <h3 class="section-title">Order Items</h3>
                  <div class="items-list">
                    <div
                      v-for="item in scannedOrder.items"
                      :key="item.id"
                      class="item-row"
                    >
                      <div class="item-info">
                        <span class="item-qty">{{ item.quantity }}×</span>
                        <span class="item-name">{{ item.menuItemName }}</span>
                      </div>
                      <span class="item-price">{{ formatCurrency(item.subtotal) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Order Total -->
                <div class="total-section">
                  <div class="total-row">
                    <span class="total-label">Subtotal:</span>
                    <span class="total-value">{{ formatCurrency(scannedOrder.subtotal) }}</span>
                  </div>
                  <div v-if="scannedOrder.taxAmount > 0" class="total-row">
                    <span class="total-label">Tax:</span>
                    <span class="total-value">{{ formatCurrency(scannedOrder.taxAmount) }}</span>
                  </div>
                  <div v-if="scannedOrder.discountAmount > 0" class="total-row discount">
                    <span class="total-label">Discount:</span>
                    <span class="total-value">-{{ formatCurrency(scannedOrder.discountAmount) }}</span>
                  </div>
                  <div class="total-row grand-total">
                    <span class="total-label">Total:</span>
                    <span class="total-value">{{ formatCurrency(scannedOrder.totalAmount) }}</span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="actions-grid">
                  <button @click="currentStep = 'scan'" class="btn-secondary">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                    </svg>
                    Back to Scan
                  </button>
                  <button @click="currentStep = 'payment'" class="btn-primary">
                    Confirm Payment
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Step 3: Payment Confirmation -->
            <div v-if="currentStep === 'payment'" class="payment-step">
              <div class="payment-form">
                <!-- Payment Method -->
                <div class="form-group">
                  <label class="form-label required">Payment Method</label>
                  <div class="payment-methods">
                    <button
                      v-for="method in paymentMethods"
                      :key="method.value"
                      @click="paymentData.method = method.value"
                      :class="['payment-method-btn', { active: paymentData.method === method.value }]"
                    >
                      <span class="method-icon">{{ method.icon }}</span>
                      <span class="method-name">{{ method.label }}</span>
                    </button>
                  </div>
                </div>

                <!-- Amount Received (for CASH) -->
                <div v-if="paymentData.method === 'CASH'" class="form-group">
                  <label for="amount-received" class="form-label">Amount Received</label>
                  <div class="input-with-currency">
                    <input
                      id="amount-received"
                      v-model.number="paymentData.amountReceived"
                      type="number"
                      min="0"
                      :placeholder="scannedOrder?.totalAmount?.toString()"
                      class="form-input"
                    />
                    <span class="currency-suffix">XOF</span>
                  </div>
                  <p v-if="changeAmount > 0" class="change-display">
                    Change: <strong>{{ formatCurrency(changeAmount) }}</strong>
                  </p>
                  <p v-else-if="changeAmount < 0" class="error-text">
                    Insufficient amount ({{ formatCurrency(Math.abs(changeAmount)) }} short)
                  </p>
                </div>

                <!-- Transaction ID (for CARD, MOBILE_MONEY) -->
                <div v-if="paymentData.method !== 'CASH'" class="form-group">
                  <label for="transaction-id" class="form-label">Transaction ID</label>
                  <input
                    id="transaction-id"
                    v-model="paymentData.transactionId"
                    type="text"
                    placeholder="TXN-2025-001"
                    class="form-input"
                  />
                </div>

                <!-- Notes -->
                <div class="form-group">
                  <label for="payment-notes" class="form-label">Notes (Optional)</label>
                  <textarea
                    id="payment-notes"
                    v-model="paymentData.notes"
                    rows="2"
                    placeholder="Additional payment notes..."
                    class="form-input"
                  ></textarea>
                </div>

                <!-- Summary -->
                <div class="payment-summary">
                  <div class="summary-row">
                    <span>Order Total:</span>
                    <strong>{{ formatCurrency(scannedOrder?.totalAmount || 0) }}</strong>
                  </div>
                  <div class="summary-row">
                    <span>Payment Method:</span>
                    <strong>{{ selectedPaymentMethodLabel }}</strong>
                  </div>
                </div>

                <!-- Actions -->
                <div class="actions-grid">
                  <button
                    @click="currentStep = 'details'"
                    class="btn-secondary"
                    :disabled="isProcessing"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                    </svg>
                    Back
                  </button>
                  <button
                    @click="confirmPayment"
                    class="btn-success"
                    :disabled="!canConfirmPayment || isProcessing"
                  >
                    <svg v-if="isProcessing" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    {{ isProcessing ? 'Processing...' : 'Confirm Payment' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount, nextTick } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import type { Html5QrcodeResult } from 'html5-qrcode/esm/core'

// Types
interface OrderItem {
  id: number
  menuItemId: number
  menuItemName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

interface ScannedOrder {
  id: number
  orderNumber: string
  status: string
  paymentStatus: string
  totalAmount: number
  subtotal: number
  taxAmount: number
  discountAmount: number
  customerName?: string
  customerPhone?: string
  tableNumber?: string
  items: OrderItem[]
}

interface PaymentMethod {
  value: string
  label: string
  icon: string
}

interface PaymentData {
  method: string
  amountReceived: number
  transactionId: string
  notes: string
}

// Props
interface Props {
  isOpen: boolean
  deviceId?: string
}

const props = withDefaults(defineProps<Props>(), {
  deviceId: 'POS-001'
})

// Emits
const emit = defineEmits<{
  close: []
  paymentConfirmed: [orderId: number, paymentData: any]
}>()

// Refs
const qrReaderElement = ref<HTMLDivElement | null>(null)
const html5QrCode = ref<Html5Qrcode | null>(null)
const currentStep = ref<'scan' | 'details' | 'payment'>('scan')
const scanMode = ref<'camera' | 'manual'>('camera')
const isScanning = ref(false)
const isProcessing = ref(false)
const cameraAvailable = ref(true)
const cameraError = ref<string | null>(null)
const scanError = ref<string | null>(null)
const scanErrorCode = ref<string | null>(null)
const manualCode = ref('')
const scannedOrder = ref<ScannedOrder | null>(null)
const scannedTokenId = ref<string | null>(null)

const paymentData = ref<PaymentData>({
  method: 'CASH',
  amountReceived: 0,
  transactionId: '',
  notes: ''
})

// Payment Methods
const paymentMethods: PaymentMethod[] = [
  { value: 'CASH', label: 'Cash', icon: '💵' },
  { value: 'CARD', label: 'Card', icon: '💳' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money', icon: '📱' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: '🏦' }
]

// Computed
const isValidManualCode = computed(() => {
  const code = manualCode.value.toUpperCase()
  return /^QR[A-Z0-9]{6}$/.test(code)
})

const selectedPaymentMethodLabel = computed(() => {
  return paymentMethods.find(m => m.value === paymentData.value.method)?.label || 'Cash'
})

const changeAmount = computed(() => {
  if (paymentData.value.method !== 'CASH') return 0
  return (paymentData.value.amountReceived || 0) - (scannedOrder.value?.totalAmount || 0)
})

const canConfirmPayment = computed(() => {
  if (!paymentData.value.method) return false
  if (paymentData.value.method === 'CASH' && changeAmount.value < 0) return false
  return true
})

// Methods
const startScanning = async () => {
  if (!qrReaderElement.value) return

  try {
    cameraError.value = null
    scanError.value = null

    // Initialize QR scanner
    html5QrCode.value = new Html5Qrcode('qr-reader')

    await html5QrCode.value.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      onScanSuccess,
      onScanFailure
    )

    isScanning.value = true
  } catch (err: any) {
    console.error('Failed to start camera:', err)
    cameraError.value = 'Failed to access camera. Please check permissions.'
    cameraAvailable.value = false
  }
}

const stopScanning = async () => {
  if (html5QrCode.value && isScanning.value) {
    try {
      await html5QrCode.value.stop()
      isScanning.value = false
    } catch (err) {
      console.error('Failed to stop scanner:', err)
    }
  }
}

const onScanSuccess = (decodedText: string, result: Html5QrcodeResult) => {
  console.log('QR Code scanned:', decodedText)
  stopScanning()
  processScan(decodedText, 'qr')
}

const onScanFailure = (error: string) => {
  // Ignore scan failures (expected when no QR in frame)
}

const formatManualCode = () => {
  manualCode.value = manualCode.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

const submitManualCode = () => {
  if (!isValidManualCode.value) return
  processScan(manualCode.value, 'shortCode')
}

const processScan = async (code: string, type: 'qr' | 'shortCode') => {
  isProcessing.value = true
  scanError.value = null
  scanErrorCode.value = null

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/qr-payment/${type === 'qr' ? 'scan' : 'scan-short-code'}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        [type === 'qr' ? 'qrToken' : 'shortCode']: code,
        deviceId: props.deviceId
      })
    })

    const result = await response.json()

    if (result.success) {
      scannedOrder.value = result.order
      scannedTokenId.value = result.tokenId
      paymentData.value.amountReceived = result.order.totalAmount
      currentStep.value = 'details'
    } else {
      scanError.value = result.errorMessage || 'Failed to scan QR code'
      scanErrorCode.value = result.errorCode
    }
  } catch (err: any) {
    console.error('Scan error:', err)
    scanError.value = 'Network error. Please try again.'
  } finally {
    isProcessing.value = false
  }
}

const confirmPayment = async () => {
  if (!scannedOrder.value || !scannedTokenId.value) return

  isProcessing.value = true

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/qr-payment/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        orderId: scannedOrder.value.id,
        tokenId: scannedTokenId.value,
        paymentMethod: paymentData.value.method,
        transactionId: paymentData.value.transactionId || undefined,
        amountReceived: paymentData.value.method === 'CASH' ? paymentData.value.amountReceived : undefined,
        notes: paymentData.value.notes || undefined,
        deviceId: props.deviceId
      })
    })

    const result = await response.json()

    if (result.success) {
      emit('paymentConfirmed', scannedOrder.value.id, {
        ...paymentData.value,
        order: result.order
      })
      resetModal()
    } else {
      scanError.value = result.errorMessage || 'Failed to confirm payment'
    }
  } catch (err: any) {
    console.error('Payment confirmation error:', err)
    scanError.value = 'Network error. Please try again.'
  } finally {
    isProcessing.value = false
  }
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(amount)
}

const handleClose = () => {
  if (!isProcessing.value) {
    resetModal()
    emit('close')
  }
}

const resetModal = () => {
  stopScanning()
  currentStep.value = 'scan'
  scanMode.value = 'camera'
  scannedOrder.value = null
  scannedTokenId.value = null
  manualCode.value = ''
  scanError.value = null
  scanErrorCode.value = null
  paymentData.value = {
    method: 'CASH',
    amountReceived: 0,
    transactionId: '',
    notes: ''
  }
}

// Watchers
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    if (scanMode.value === 'camera') {
      // Auto-start camera when modal opens
      setTimeout(() => startScanning(), 500)
    }
  } else {
    resetModal()
  }
})

// Lifecycle
onBeforeUnmount(() => {
  stopScanning()
})
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 16px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Modal Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.close-button {
  padding: 8px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.close-button:hover:not(:disabled) {
  background: #e5e7eb;
  color: #111827;
}

.close-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal Body */
.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  background: #f9fafb;
  padding: 4px;
  border-radius: 12px;
}

.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover:not(:disabled) {
  background: white;
  color: #111827;
}

.tab.active {
  background: white;
  color: #3b82f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tab:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Camera Section */
.camera-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.camera-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: #111827;
  border-radius: 12px;
  overflow: hidden;
}

.qr-reader {
  width: 100%;
  height: 100%;
}

.camera-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #1f2937;
  color: white;
}

.scanning-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.scan-line {
  position: absolute;
  top: 50%;
  left: 10%;
  right: 10%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #10b981, transparent);
  animation: scan 2s linear infinite;
}

@keyframes scan {
  0%, 100% {
    transform: translateY(-100px);
  }
  50% {
    transform: translateY(100px);
  }
}

.scan-corners {
  position: absolute;
  inset: 20%;
  border: 2px solid #10b981;
  border-radius: 12px;
}

.scan-corners::before,
.scan-corners::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border: 3px solid #10b981;
}

.scan-corners::before {
  top: -3px;
  left: -3px;
  border-right: none;
  border-bottom: none;
}

.scan-corners::after {
  bottom: -3px;
  right: -3px;
  border-left: none;
  border-top: none;
}

.camera-controls {
  display: flex;
  gap: 12px;
}

/* Manual Section */
.manual-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Form Elements */
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.form-label.required::after {
  content: ' *';
  color: #ef4444;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
  background: #f9fafb;
  cursor: not-allowed;
}

.code-input {
  font-family: 'Courier New', monospace;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-align: center;
}

.form-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

/* Payment Methods */
.payment-methods {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.payment-method-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-method-btn:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.payment-method-btn.active {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.method-icon {
  font-size: 32px;
}

.method-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.input-with-currency {
  position: relative;
}

.currency-suffix {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-weight: 600;
  color: #6b7280;
  pointer-events: none;
}

.change-display {
  margin-top: 8px;
  padding: 8px 12px;
  background: #d1fae5;
  border-radius: 6px;
  font-size: 14px;
  color: #065f46;
}

.error-text {
  margin-top: 8px;
  font-size: 14px;
  color: #dc2626;
}

/* Order Details */
.order-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
}

.order-number .label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.order-number .value {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-pending {
  background: #fef3c7;
  color: #92400e;
}

.badge-confirmed {
  background: #dbeafe;
  color: #1e40af;
}

.badge-preparing {
  background: #e0e7ff;
  color: #3730a3;
}

.info-section {
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 12px;
}

.info-grid {
  display: grid;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.info-label {
  color: #6b7280;
}

.info-value {
  font-weight: 500;
  color: #111827;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-qty {
  font-weight: 700;
  color: #3b82f6;
  min-width: 30px;
}

.item-name {
  font-size: 14px;
  color: #111827;
}

.item-price {
  font-weight: 600;
  color: #111827;
}

.total-section {
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.total-row.discount .total-label {
  color: #10b981;
}

.total-row.discount .total-value {
  color: #10b981;
}

.total-row.grand-total {
  padding-top: 12px;
  margin-top: 8px;
  border-top: 2px solid #e5e7eb;
  font-size: 18px;
  font-weight: 700;
}

.total-row.grand-total .total-value {
  color: #3b82f6;
}

.payment-summary {
  padding: 16px;
  background: #eff6ff;
  border: 2px solid #3b82f6;
  border-radius: 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

/* Buttons */
.btn-primary,
.btn-secondary,
.btn-success {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
}

.btn-primary:disabled,
.btn-secondary:disabled,
.btn-success:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.w-full {
  width: 100%;
}

.actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* Alerts */
.error-alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  color: #991b1b;
  font-size: 14px;
}

.error-alert svg {
  flex-shrink: 0;
  margin-top: 2px;
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}

/* Responsive */
@media (max-width: 640px) {
  .modal-container {
    max-width: 100%;
    border-radius: 16px 16px 0 0;
    align-self: flex-end;
  }

  .payment-methods {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}

/* Utility */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
