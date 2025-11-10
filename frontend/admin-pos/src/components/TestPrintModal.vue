<!--
  Test Print Modal - Test receipt templates with sample data
  Allows users to test print templates with customizable sample data before deployment
-->

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div
      class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-blue-100 rounded-lg">
            <Printer class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 class="text-xl font-semibold text-gray-900">Test Print</h3>
            <p class="text-sm text-gray-600">{{ template?.name || 'Unknown Template' }}</p>
          </div>
        </div>
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X class="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-hidden">
        <div class="grid grid-cols-2 h-full">
          <!-- Sample Data Configuration Panel -->
          <div class="flex flex-col overflow-hidden border-r border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h4 class="text-lg font-medium text-gray-900">Test Data Configuration</h4>
              <p class="text-sm text-gray-600 mt-1">Customize the sample data for testing</p>
            </div>

            <div class="flex-1 overflow-y-auto p-6 space-y-6">
              <!-- Order Information -->
              <div>
                <h5 class="font-medium text-gray-900 mb-3">Order Information</h5>
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Order Number
                      </label>
                      <input
                        v-model="sampleData.orderNumber"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Table Number
                      </label>
                      <input
                        v-model="sampleData.tableNumber"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Customer Name
                      </label>
                      <input
                        v-model="sampleData.customerName"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Cashier
                      </label>
                      <input
                        v-model="sampleData.cashier"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Customer Phone
                    </label>
                    <input
                      v-model="sampleData.customerPhone"
                      type="tel"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <!-- Order Items -->
              <div>
                <div class="flex items-center justify-between mb-3">
                  <h5 class="font-medium text-gray-900">Order Items</h5>
                  <button
                    @click="addSampleItem"
                    class="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                  >
                    <Plus class="w-4 h-4 mr-1" />
                    Add Item
                  </button>
                </div>

                <div class="space-y-3">
                  <div
                    v-for="(item, index) in sampleData.items"
                    :key="index"
                    class="border border-gray-200 rounded-lg p-3 space-y-3"
                  >
                    <div class="flex items-center justify-between">
                      <span class="font-medium text-sm">Item {{ index + 1 }}</span>
                      <button
                        @click="removeSampleItem(index)"
                        class="text-red-600 hover:text-red-700"
                      >
                        <X class="w-4 h-4" />
                      </button>
                    </div>

                    <div class="grid grid-cols-2 gap-2">
                      <input
                        v-model="item.name"
                        type="text"
                        placeholder="Item name"
                        class="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        v-model.number="item.quantity"
                        type="number"
                        min="1"
                        placeholder="Qty"
                        class="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <input
                      v-model.number="item.price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Price"
                      class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <!-- Payment Information -->
              <div>
                <h5 class="font-medium text-gray-900 mb-3">Payment Information</h5>
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method
                      </label>
                      <select
                        v-model="sampleData.paymentMethod"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Card">Credit/Debit Card</option>
                        <option value="Mobile Payment">Mobile Payment</option>
                        <option value="Gift Card">Gift Card</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Tax Rate (%)
                      </label>
                      <input
                        v-model.number="sampleData.taxRate"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Amount Paid
                      </label>
                      <input
                        v-model.number="sampleData.amountPaid"
                        type="number"
                        step="0.01"
                        min="0"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Discount (%)
                      </label>
                      <input
                        v-model.number="sampleData.discountPercent"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quick Presets -->
              <div>
                <h5 class="font-medium text-gray-900 mb-3">Quick Presets</h5>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="preset in presets"
                    :key="preset.name"
                    @click="loadPreset(preset)"
                    class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors text-left"
                  >
                    {{ preset.name }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Receipt Preview Panel -->
          <div class="flex flex-col overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h4 class="text-lg font-medium text-gray-900">Receipt Preview</h4>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-500">{{ template?.config.width || 48 }} chars wide</span>
                <div :class="[
                  'w-2 h-2 rounded-full',
                  calculatedTotals.total > 0 ? 'bg-green-500' : 'bg-gray-300'
                ]"></div>
              </div>
            </div>

            <div class="flex-1 overflow-y-auto p-6 bg-gray-50">
              <!-- Receipt Paper Simulation -->
              <div class="max-w-sm mx-auto">
                <div
                  class="bg-white shadow-lg border border-gray-300 p-4 font-mono text-xs"
                  style="font-family: 'Courier New', monospace;"
                >
                  <!-- Header -->
                  <div class="text-center mb-4">
                    <div class="font-bold text-base">{{ template?.config.header.businessName || 'BUSINESS NAME' }}</div>
                    <div v-if="template?.config.header.address" class="mt-1 text-xs">
                      <div v-for="line in template.config.header.address" :key="line" class="text-gray-600">
                        {{ line }}
                      </div>
                    </div>
                    <div v-if="template?.config.header.phone" class="text-gray-600 mt-1 text-xs">
                      Tel: {{ template.config.header.phone }}
                    </div>
                    <div v-if="template?.config.header.email" class="text-gray-600 text-xs">
                      {{ template.config.header.email }}
                    </div>
                  </div>

                  <!-- Order Info -->
                  <div class="border-t border-b border-dashed border-gray-400 py-2 mb-3 text-xs">
                    <div class="flex justify-between">
                      <span>Order #:</span>
                      <span>{{ sampleData.orderNumber }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Date:</span>
                      <span>{{ formatReceiptDate(new Date().toISOString()) }}</span>
                    </div>
                    <div v-if="sampleData.tableNumber" class="flex justify-between">
                      <span>Table:</span>
                      <span>{{ sampleData.tableNumber }}</span>
                    </div>
                    <div v-if="sampleData.customerName" class="flex justify-between">
                      <span>Customer:</span>
                      <span>{{ sampleData.customerName }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Cashier:</span>
                      <span>{{ sampleData.cashier }}</span>
                    </div>
                  </div>

                  <!-- Items -->
                  <div class="mb-3 text-xs">
                    <div v-for="(item, index) in sampleData.items" :key="index" class="mb-2">
                      <div class="flex justify-between">
                        <span class="truncate pr-2">{{ item.name }}</span>
                        <span class="flex-shrink-0">{{ formatPrice(item.price * item.quantity) }}</span>
                      </div>
                      <div class="text-gray-600 text-xs pl-2">
                        {{ item.quantity }} x {{ formatPrice(item.price) }}
                      </div>
                    </div>
                  </div>

                  <!-- Totals -->
                  <div class="border-t border-dashed border-gray-400 pt-2 mb-3 text-xs">
                    <div class="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{{ formatPrice(calculatedTotals.subtotal) }}</span>
                    </div>
                    <div v-if="calculatedTotals.discount > 0" class="flex justify-between text-green-600">
                      <span>Discount ({{ sampleData.discountPercent }}%):</span>
                      <span>-{{ formatPrice(calculatedTotals.discount) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Tax ({{ sampleData.taxRate }}%):</span>
                      <span>{{ formatPrice(calculatedTotals.tax) }}</span>
                    </div>
                    <div class="flex justify-between font-bold text-sm border-t border-dashed border-gray-400 pt-1 mt-1">
                      <span>TOTAL:</span>
                      <span>{{ formatPrice(calculatedTotals.total) }}</span>
                    </div>
                  </div>

                  <!-- Payment -->
                  <div class="border-b border-dashed border-gray-400 pb-2 mb-3 text-xs">
                    <div class="flex justify-between">
                      <span>{{ sampleData.paymentMethod }}:</span>
                      <span>{{ formatPrice(sampleData.amountPaid) }}</span>
                    </div>
                    <div v-if="calculatedTotals.change > 0" class="flex justify-between">
                      <span>Change:</span>
                      <span>{{ formatPrice(calculatedTotals.change) }}</span>
                    </div>
                  </div>

                  <!-- Footer -->
                  <div class="text-center text-gray-600 text-xs">
                    <div>{{ template?.config.footer.thankYouMessage || 'Thank you for your business!' }}</div>
                    <div v-if="template?.config.footer.returnPolicy" class="mt-2">
                      {{ template.config.footer.returnPolicy }}
                    </div>
                    <div v-if="template?.config.footer.customMessage" class="mt-2">
                      {{ template.config.footer.customMessage }}
                    </div>
                    <div v-if="sampleData.customerPhone" class="mt-2">
                      SMS receipt sent to {{ sampleData.customerPhone }}
                    </div>
                  </div>

                  <!-- Barcode -->
                  <div v-if="template?.config.barcode?.enabled" class="mt-4 text-center">
                    <div v-if="template.config.barcode.type === 'QR'" class="inline-block border border-gray-400 p-2">
                      <div class="w-12 h-12 bg-gray-200 flex items-center justify-center text-xs">
                        QR
                      </div>
                    </div>
                    <div v-else class="inline-block">
                      <div class="h-8 bg-gray-800 flex items-end justify-center">
                        <div v-for="i in 15" :key="i" class="w-1 bg-gray-800 mr-px" :style="{ height: Math.random() * 20 + 10 + 'px' }"></div>
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
        >
          Cancel
        </button>
        <button
          @click="handleTestPrint"
          :disabled="loading || sampleData.items.length === 0"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Loader2
            v-if="loading"
            class="animate-spin w-4 h-4 mr-2"
          />
          <Printer v-else class="w-4 h-4 mr-2" />
          Print Test Receipt
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
  X,
  Printer,
  Plus,
  Loader2
} from 'lucide-vue-next'
import { type ReceiptTemplate } from '@/stores/receipts'

interface SampleItem {
  name: string
  quantity: number
  price: number
}

interface SampleData {
  orderNumber: string
  tableNumber: string
  customerName: string
  customerPhone: string
  cashier: string
  items: SampleItem[]
  paymentMethod: string
  amountPaid: number
  taxRate: number
  discountPercent: number
}

interface Props {
  template?: ReceiptTemplate
}

interface Emits {
  (e: 'close'): void
  (e: 'print', data: SampleData): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const loading = ref(false)

const sampleData = reactive<SampleData>({
  orderNumber: 'TEST-001',
  tableNumber: '5',
  customerName: 'John Doe',
  customerPhone: '+1234567890',
  cashier: 'Jane Smith',
  items: [
    { name: 'Coffee Americano', quantity: 2, price: 3.50 },
    { name: 'Blueberry Muffin', quantity: 1, price: 2.75 },
    { name: 'Orange Juice', quantity: 1, price: 3.25 }
  ],
  paymentMethod: 'Card',
  amountPaid: 15.00,
  taxRate: 8.5,
  discountPercent: 0
})

const presets = [
  {
    name: 'Coffee Order',
    data: {
      orderNumber: 'TEST-001',
      tableNumber: '3',
      customerName: 'Sarah Wilson',
      customerPhone: '+1234567890',
      cashier: 'Mike Johnson',
      items: [
        { name: 'Espresso Double', quantity: 1, price: 4.50 },
        { name: 'Croissant', quantity: 1, price: 3.25 }
      ],
      paymentMethod: 'Cash',
      amountPaid: 10.00,
      taxRate: 8.5,
      discountPercent: 0
    }
  },
  {
    name: 'Large Order',
    data: {
      orderNumber: 'TEST-002',
      tableNumber: '12',
      customerName: 'Business Meeting',
      customerPhone: '+0987654321',
      cashier: 'Alice Brown',
      items: [
        { name: 'Caesar Salad', quantity: 4, price: 12.50 },
        { name: 'Grilled Chicken', quantity: 2, price: 18.00 },
        { name: 'Pasta Marinara', quantity: 2, price: 14.50 },
        { name: 'Soft Drinks', quantity: 6, price: 2.50 }
      ],
      paymentMethod: 'Card',
      amountPaid: 120.00,
      taxRate: 8.5,
      discountPercent: 10
    }
  },
  {
    name: 'Takeaway Order',
    data: {
      orderNumber: 'TO-003',
      tableNumber: '',
      customerName: 'Quick Pickup',
      customerPhone: '+1122334455',
      cashier: 'Bob Wilson',
      items: [
        { name: 'Burger Combo', quantity: 1, price: 11.99 },
        { name: 'Extra Fries', quantity: 1, price: 3.50 }
      ],
      paymentMethod: 'Mobile Payment',
      amountPaid: 16.50,
      taxRate: 8.5,
      discountPercent: 0
    }
  },
  {
    name: 'Simple Order',
    data: {
      orderNumber: 'TEST-004',
      tableNumber: '7',
      customerName: '',
      customerPhone: '',
      cashier: 'Emma Davis',
      items: [
        { name: 'Hot Coffee', quantity: 1, price: 2.50 }
      ],
      paymentMethod: 'Cash',
      amountPaid: 3.00,
      taxRate: 8.5,
      discountPercent: 0
    }
  }
]

// Computed
const calculatedTotals = computed(() => {
  const subtotal = sampleData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const discount = subtotal * (sampleData.discountPercent / 100)
  const discountedSubtotal = subtotal - discount
  const tax = discountedSubtotal * (sampleData.taxRate / 100)
  const total = discountedSubtotal + tax
  const change = Math.max(0, sampleData.amountPaid - total)

  return {
    subtotal,
    discount,
    tax,
    total,
    change
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
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const addSampleItem = () => {
  sampleData.items.push({
    name: `Item ${sampleData.items.length + 1}`,
    quantity: 1,
    price: 5.00
  })
}

const removeSampleItem = (index: number) => {
  if (sampleData.items.length > 1) {
    sampleData.items.splice(index, 1)
  }
}

const loadPreset = (preset: any) => {
  Object.assign(sampleData, preset.data)
}

const handleTestPrint = async () => {
  loading.value = true

  try {
    // Add calculated totals to the sample data
    const printData = {
      ...sampleData,
      ...calculatedTotals.value,
      timestamp: new Date().toISOString()
    }

    emit('print', printData)

    // Simulate print delay
    await new Promise(resolve => setTimeout(resolve, 2000))

  } catch (error) {
    console.error('Test print failed:', error)
  } finally {
    loading.value = false
  }
}
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
