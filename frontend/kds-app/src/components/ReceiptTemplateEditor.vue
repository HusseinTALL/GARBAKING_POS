<!--
  Receipt Template Editor - Create and edit receipt templates
  Visual editor for customizing receipt layout, content, and formatting
-->

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div
      class="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden animate-scale-in"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-xl font-semibold text-gray-900">
          {{ isEditing ? 'Edit Template' : 'New Receipt Template' }}
        </h3>
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X class="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-hidden">
        <div class="grid grid-cols-5 h-full">
          <!-- Template Settings Panel -->
          <div class="col-span-2 flex flex-col overflow-hidden border-r border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h4 class="text-lg font-medium text-gray-900">Template Settings</h4>
            </div>

            <div class="flex-1 overflow-y-auto p-6 space-y-6">
              <!-- Basic Settings -->
              <div>
                <h5 class="font-medium text-gray-900 mb-3">Basic Information</h5>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Template Name *
                    </label>
                    <input
                      v-model="form.name"
                      type="text"
                      required
                      placeholder="Enter template name"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      :class="{ 'border-red-500': errors.name }"
                    />
                    <p v-if="errors.name" class="mt-1 text-sm text-red-600">
                      {{ errors.name }}
                    </p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Receipt Type
                    </label>
                    <select
                      v-model="form.type"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="SALE">Sale Receipt</option>
                      <option value="REFUND">Refund Receipt</option>
                      <option value="KITCHEN">Kitchen Ticket</option>
                      <option value="BAR">Bar Ticket</option>
                      <option value="CUSTOMER_COPY">Customer Copy</option>
                      <option value="MERCHANT_COPY">Merchant Copy</option>
                    </select>
                  </div>

                  <div class="flex items-center">
                    <input
                      v-model="form.isDefault"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label class="ml-2 text-sm text-gray-700">
                      Set as default template for this type
                    </label>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Paper Width
                    </label>
                    <select
                      v-model.number="form.config.width"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option :value="32">58mm (32 characters)</option>
                      <option :value="48">80mm (48 characters)</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Header Settings -->
              <div>
                <h5 class="font-medium text-gray-900 mb-3">Header Settings</h5>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Business Name
                    </label>
                    <input
                      v-model="form.config.header.businessName"
                      type="text"
                      placeholder="Your Business Name"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      v-model="addressText"
                      rows="3"
                      placeholder="123 Main Street&#10;City, State 12345"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    ></textarea>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        v-model="form.config.header.phone"
                        type="tel"
                        placeholder="+1234567890"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        v-model="form.config.header.email"
                        type="email"
                        placeholder="info@business.com"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Tax Number
                    </label>
                    <input
                      v-model="form.config.header.taxNumber"
                      type="text"
                      placeholder="Tax/VAT Number"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <!-- Footer Settings -->
              <div>
                <h5 class="font-medium text-gray-900 mb-3">Footer Settings</h5>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Thank You Message
                    </label>
                    <input
                      v-model="form.config.footer.thankYouMessage"
                      type="text"
                      placeholder="Thank you for your business!"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Return Policy
                    </label>
                    <textarea
                      v-model="form.config.footer.returnPolicy"
                      rows="2"
                      placeholder="Returns accepted within 30 days with receipt"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    ></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Custom Message
                    </label>
                    <textarea
                      v-model="form.config.footer.customMessage"
                      rows="2"
                      placeholder="Visit us online at www.business.com"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Formatting Settings -->
              <div>
                <h5 class="font-medium text-gray-900 mb-3">Formatting</h5>
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Font Size
                      </label>
                      <select
                        v-model="form.config.formatting.fontSize"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="small">Small</option>
                        <option value="normal">Normal</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Copies
                      </label>
                      <input
                        v-model.number="form.config.formatting.copies"
                        type="number"
                        min="1"
                        max="5"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div class="space-y-3">
                    <div class="flex items-center">
                      <input
                        v-model="form.config.formatting.cutPaper"
                        type="checkbox"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label class="ml-2 text-sm text-gray-700">
                        Cut paper after printing
                      </label>
                    </div>
                    <div class="flex items-center">
                      <input
                        v-model="form.config.formatting.openDrawer"
                        type="checkbox"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label class="ml-2 text-sm text-gray-700">
                        Open cash drawer after printing
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Barcode Settings -->
              <div>
                <h5 class="font-medium text-gray-900 mb-3">Barcode Settings</h5>
                <div class="space-y-4">
                  <div class="flex items-center">
                    <input
                      v-model="form.config.barcode.enabled"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label class="ml-2 text-sm text-gray-700">
                      Include barcode on receipt
                    </label>
                  </div>

                  <div v-if="form.config.barcode.enabled" class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <select
                        v-model="form.config.barcode.type"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="CODE128">Code 128</option>
                        <option value="QR">QR Code</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Position
                      </label>
                      <select
                        v-model="form.config.barcode.position"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Preview Panel -->
          <div class="col-span-3 flex flex-col overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h4 class="text-lg font-medium text-gray-900">Preview</h4>
              <div class="flex items-center space-x-2">
                <button
                  @click="refreshPreview"
                  class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Refresh preview"
                >
                  <RefreshCw class="w-4 h-4 text-gray-600" />
                </button>
                <span class="text-sm text-gray-500">{{ form.config.width }} chars</span>
              </div>
            </div>

            <div class="flex-1 overflow-y-auto p-6 bg-gray-50">
              <!-- Receipt Preview -->
              <div class="max-w-sm mx-auto">
                <div
                  class="bg-white shadow-lg border border-gray-300 p-4 font-mono text-xs"
                  :class="getFontSizeClass(form.config.formatting.fontSize)"
                >
                  <!-- Header -->
                  <div class="text-center mb-4">
                    <div class="font-bold text-lg">{{ form.config.header.businessName || 'BUSINESS NAME' }}</div>
                    <div v-if="form.config.header.address.length" class="mt-1">
                      <div v-for="line in form.config.header.address" :key="line" class="text-gray-600">
                        {{ line || 'Address Line' }}
                      </div>
                    </div>
                    <div v-if="form.config.header.phone" class="text-gray-600 mt-1">
                      Tel: {{ form.config.header.phone }}
                    </div>
                    <div v-if="form.config.header.email" class="text-gray-600">
                      Email: {{ form.config.header.email }}
                    </div>
                    <div v-if="form.config.header.taxNumber" class="text-gray-600">
                      Tax: {{ form.config.header.taxNumber }}
                    </div>
                  </div>

                  <!-- Order Info -->
                  <div class="border-t border-b border-dashed border-gray-400 py-2 mb-4">
                    <div class="flex justify-between">
                      <span>Order #:</span>
                      <span>{{ sampleData.orderNumber }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Date:</span>
                      <span>{{ formatReceiptDate(new Date().toISOString()) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Cashier:</span>
                      <span>{{ sampleData.cashier }}</span>
                    </div>
                  </div>

                  <!-- Items -->
                  <div class="mb-4">
                    <div v-for="item in sampleData.items" :key="item.id" class="mb-2">
                      <div class="flex justify-between">
                        <span>{{ item.name }}</span>
                        <span>{{ formatPrice(item.price * item.quantity) }}</span>
                      </div>
                      <div class="text-gray-600 text-xs pl-2">
                        {{ item.quantity }} x {{ formatPrice(item.price) }}
                      </div>
                    </div>
                  </div>

                  <!-- Totals -->
                  <div class="border-t border-dashed border-gray-400 pt-2 mb-4">
                    <div class="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{{ formatPrice(sampleData.subtotal) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Tax:</span>
                      <span>{{ formatPrice(sampleData.tax) }}</span>
                    </div>
                    <div class="flex justify-between font-bold text-base">
                      <span>TOTAL:</span>
                      <span>{{ formatPrice(sampleData.total) }}</span>
                    </div>
                  </div>

                  <!-- Payment -->
                  <div class="border-b border-dashed border-gray-400 pb-2 mb-4">
                    <div class="flex justify-between">
                      <span>Payment:</span>
                      <span>{{ sampleData.paymentMethod }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Change:</span>
                      <span>{{ formatPrice(sampleData.change) }}</span>
                    </div>
                  </div>

                  <!-- Footer -->
                  <div class="text-center text-gray-600">
                    <div>{{ form.config.footer.thankYouMessage || 'Thank you for your business!' }}</div>
                    <div v-if="form.config.footer.returnPolicy" class="mt-2 text-xs">
                      {{ form.config.footer.returnPolicy }}
                    </div>
                    <div v-if="form.config.footer.customMessage" class="mt-2">
                      {{ form.config.footer.customMessage }}
                    </div>
                  </div>

                  <!-- Barcode -->
                  <div v-if="form.config.barcode?.enabled" class="mt-4 text-center">
                    <div v-if="form.config.barcode.type === 'QR'" class="inline-block border border-gray-400 p-2">
                      <div class="w-16 h-16 bg-gray-200 flex items-center justify-center text-xs">
                        QR Code
                      </div>
                    </div>
                    <div v-else class="inline-block">
                      <div class="h-12 bg-gray-800 flex items-end">
                        <div v-for="i in 20" :key="i" class="w-1 bg-gray-800 mr-px" :style="{ height: Math.random() * 40 + 20 + 'px' }"></div>
                      </div>
                      <div class="text-xs mt-1">{{ sampleData.orderNumber }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          :disabled="loading"
        >
          Cancel
        </button>
        <button
          @click="handleSave"
          :disabled="loading || !isFormValid"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Loader2
            v-if="loading"
            class="animate-spin w-4 h-4 mr-2"
          />
          {{ isEditing ? 'Update' : 'Create' }} Template
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import {
  X,
  RefreshCw,
  Loader2
} from 'lucide-vue-next'
import { type ReceiptTemplate, type ReceiptConfig, ReceiptType } from '@/stores/receipts'

interface Props {
  template?: ReceiptTemplate | null
}

interface Emits {
  (e: 'close'): void
  (e: 'save', template: ReceiptTemplate): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const loading = ref(false)
const addressText = ref('')

const form = reactive<ReceiptTemplate>({
  id: '',
  name: '',
  type: ReceiptType.SALE,
  isDefault: false,
  config: {
    width: 48,
    header: {
      businessName: 'GARBAKING POS',
      address: [],
      phone: '',
      email: '',
      taxNumber: ''
    },
    footer: {
      thankYouMessage: 'Thank you for your business!',
      returnPolicy: '',
      customMessage: ''
    },
    formatting: {
      fontSize: 'normal',
      alignment: 'left',
      cutPaper: true,
      openDrawer: false,
      copies: 1
    },
    barcode: {
      enabled: false,
      type: 'CODE128',
      position: 'bottom'
    }
  },
  createdAt: '',
  updatedAt: ''
})

const errors = reactive({
  name: ''
})

const sampleData = reactive({
  orderNumber: 'ORD-001',
  cashier: 'John Doe',
  items: [
    { id: '1', name: 'Coffee Americano', quantity: 2, price: 3.50 },
    { id: '2', name: 'Croissant', quantity: 1, price: 2.25 },
    { id: '3', name: 'Orange Juice', quantity: 1, price: 4.00 }
  ],
  subtotal: 13.25,
  tax: 1.32,
  total: 14.57,
  paymentMethod: 'Card',
  change: 0.00
})

// Computed
const isEditing = computed(() => !!props.template?.id)

const isFormValid = computed(() => {
  return form.name.trim().length > 0 && !Object.values(errors).some(error => error)
})

// Watchers
watch(addressText, (newValue) => {
  form.config.header.address = newValue.split('\n').filter(line => line.trim().length > 0)
})

watch(() => form.name, (newValue) => {
  if (newValue.trim().length === 0) {
    errors.name = 'Template name is required'
  } else {
    errors.name = ''
  }
})

// Methods
const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(amount)
}

const formatReceiptDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getFontSizeClass = (size: string): string => {
  const classes = {
    'small': 'text-xs',
    'normal': 'text-sm',
    'large': 'text-base'
  }
  return classes[size] || classes.normal
}

const refreshPreview = () => {
  // Force reactive updates
  Object.assign(sampleData, { ...sampleData })
}

const handleSave = async () => {
  if (!isFormValid.value) return

  loading.value = true

  try {
    const templateData: ReceiptTemplate = {
      ...form,
      id: form.id || crypto.randomUUID(),
      createdAt: form.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    emit('save', templateData)
  } catch (error) {
    console.error('Error saving template:', error)
  } finally {
    loading.value = false
  }
}

// Initialize form
onMounted(() => {
  if (props.template) {
    Object.assign(form, props.template)
    addressText.value = form.config.header.address.join('\n')
  } else {
    // Set defaults for new template
    form.createdAt = new Date().toISOString()
    form.updatedAt = new Date().toISOString()
  }
})
</script>

<style scoped>
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}
</style>