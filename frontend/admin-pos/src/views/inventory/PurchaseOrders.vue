<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-900 text-gray-100">
    <!-- Header -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-white">Purchase Orders</h1>
        <div class="flex items-center gap-3">
          <select
            v-model="statusFilter"
            class="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="loadPurchaseOrders"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED">Approved</option>
            <option value="PARTIALLY_RECEIVED">Partially Received</option>
            <option value="RECEIVED">Received</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button
            @click="loadPurchaseOrders"
            :disabled="isLoading"
            class="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <RotateCw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
          </button>
          <button
            @click="showCreateModal = true"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus class="w-4 h-4" />
            New PO
          </button>
        </div>
      </div>
    </div>

    <!-- PO List -->
    <div class="flex-1 overflow-y-auto p-6">
      <div v-if="purchaseOrders.length > 0" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <div
          v-for="po in purchaseOrders"
          :key="po.id"
          class="bg-gray-800 rounded-lg p-4 border"
          :class="po.isOverdue ? 'border-red-500' : 'border-gray-700'"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="text-white font-medium">{{ po.orderNumber }}</h3>
              <p class="text-sm text-gray-400">{{ po.supplierName }}</p>
            </div>
            <span
              class="px-2 py-1 rounded-full text-xs font-medium"
              :class="getStatusColor(po.status)"
            >
              {{ formatStatus(po.status) }}
            </span>
          </div>

          <div class="space-y-2 mb-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">Order Date:</span>
              <span class="text-white">{{ formatDate(po.orderDate) }}</span>
            </div>
            <div v-if="po.expectedDeliveryDate" class="flex justify-between text-sm">
              <span class="text-gray-400">Expected:</span>
              <span class="text-white" :class="po.isOverdue ? 'text-red-400' : ''">
                {{ formatDate(po.expectedDeliveryDate) }}
              </span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">Items:</span>
              <span class="text-white">{{ po.totalItems }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">Total:</span>
              <span class="text-white font-medium">${{ po.totalAmount?.toFixed(2) }}</span>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              v-if="po.canBeEdited"
              @click="submitPO(po)"
              class="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
            >
              Submit
            </button>
            <button
              v-if="po.canBeReceived"
              @click="openReceiveModal(po)"
              class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
            >
              Receive
            </button>
            <button
              @click="viewPO(po)"
              class="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
            >
              View
            </button>
            <button
              v-if="po.status !== 'RECEIVED' && po.status !== 'CANCELLED'"
              @click="cancelPO(po)"
              class="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="!isLoading" class="text-center py-12">
        <Truck class="w-16 h-16 mx-auto text-gray-600 mb-4" />
        <p class="text-gray-400">No purchase orders found</p>
        <button
          @click="showCreateModal = true"
          class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Create Your First PO
        </button>
      </div>
    </div>

    <!-- Create PO Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-white">Create Purchase Order</h2>
            <button @click="closeCreateModal" class="text-gray-400 hover:text-white">
              <X class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="createPO" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Supplier *</label>
                <select
                  v-model.number="poForm.supplierId"
                  required
                  class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>Select supplier</option>
                  <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                    {{ supplier.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Delivery Location *</label>
                <select
                  v-model.number="poForm.deliveryLocationId"
                  required
                  class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>Select location</option>
                  <option v-for="loc in locations" :key="loc.id" :value="loc.id">
                    {{ loc.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Order Date *</label>
                <input
                  v-model="poForm.orderDate"
                  type="date"
                  required
                  class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Expected Delivery</label>
                <input
                  v-model="poForm.expectedDeliveryDate"
                  type="date"
                  class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <!-- Line Items -->
            <div class="border border-gray-700 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-white font-medium">Items</h3>
                <button
                  type="button"
                  @click="addLineItem"
                  class="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                >
                  Add Item
                </button>
              </div>

              <div v-for="(item, index) in poForm.items" :key="index" class="grid grid-cols-12 gap-2 mb-2">
                <select
                  v-model.number="item.itemId"
                  required
                  class="col-span-5 bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="" disabled>Select item</option>
                  <option v-for="invItem in inventoryItems" :key="invItem.id" :value="invItem.id">
                    {{ invItem.name }} ({{ invItem.sku }})
                  </option>
                </select>
                <input
                  v-model.number="item.quantityOrdered"
                  type="number"
                  step="0.01"
                  placeholder="Qty"
                  required
                  class="col-span-2 bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  v-model.number="item.unitCost"
                  type="number"
                  step="0.01"
                  placeholder="Cost"
                  required
                  class="col-span-2 bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <div class="col-span-2 flex items-center text-white text-sm">
                  ${{ calculateLineTotal(item).toFixed(2) }}
                </div>
                <button
                  type="button"
                  @click="removeLineItem(index)"
                  class="col-span-1 text-red-400 hover:text-red-300"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>

              <div v-if="poForm.items.length === 0" class="text-center text-gray-400 text-sm py-4">
                No items added. Click "Add Item" to get started.
              </div>
            </div>

            <!-- Totals -->
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Tax</label>
                <input
                  v-model.number="poForm.taxAmount"
                  type="number"
                  step="0.01"
                  class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Shipping</label>
                <input
                  v-model.number="poForm.shippingCost"
                  type="number"
                  step="0.01"
                  class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Total</label>
                <div class="text-2xl font-bold text-green-400 mt-2">
                  ${{ calculateTotal().toFixed(2) }}
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Notes</label>
              <textarea
                v-model="poForm.notes"
                rows="2"
                class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                @click="closeCreateModal"
                class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSaving || poForm.items.length === 0"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {{ isSaving ? 'Creating...' : 'Create PO' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Receive Goods Modal -->
    <div v-if="showReceiveModal && selectedPO" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-xl font-bold text-white">Receive Goods</h2>
              <p class="text-sm text-gray-400">{{ selectedPO.orderNumber }} - {{ selectedPO.supplierName }}</p>
            </div>
            <button @click="closeReceiveModal" class="text-gray-400 hover:text-white">
              <X class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="receiveGoods" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Received Date</label>
              <input
                v-model="receiveForm.receivedDate"
                type="date"
                class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Receive Items -->
            <div class="border border-gray-700 rounded-lg p-4">
              <h3 class="text-white font-medium mb-3">Items to Receive</h3>

              <div v-for="item in receiveForm.items" :key="item.poItemId" class="bg-gray-700 rounded p-3 mb-2">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex-1">
                    <p class="text-white font-medium">{{ item.itemName }}</p>
                    <p class="text-sm text-gray-400">SKU: {{ item.itemSku }}</p>
                  </div>
                  <div class="text-right text-sm">
                    <p class="text-gray-400">Ordered: {{ item.quantityOrdered }} {{ item.unit }}</p>
                    <p class="text-yellow-400">Remaining: {{ item.remainingQuantity }} {{ item.unit }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <label class="text-sm text-gray-300">Receive:</label>
                  <input
                    v-model.number="item.quantityReceived"
                    type="number"
                    step="0.01"
                    min="0"
                    :max="item.remainingQuantity"
                    class="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span class="text-gray-400 text-sm">{{ item.unit }}</span>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Received By</label>
              <input
                v-model="receiveForm.receivedBy"
                type="text"
                class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Notes</label>
              <textarea
                v-model="receiveForm.notes"
                rows="2"
                class="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                @click="closeReceiveModal"
                class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSaving"
                class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {{ isSaving ? 'Receiving...' : 'Receive Goods' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View PO Modal -->
    <div v-if="showViewModal && selectedPO" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-xl font-bold text-white">{{ selectedPO.orderNumber }}</h2>
              <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getStatusColor(selectedPO.status)">
                {{ formatStatus(selectedPO.status) }}
              </span>
            </div>
            <button @click="showViewModal = false" class="text-gray-400 hover:text-white">
              <X class="w-6 h-6" />
            </button>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p class="text-sm text-gray-400">Supplier</p>
              <p class="text-white">{{ selectedPO.supplierName }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-400">Delivery Location</p>
              <p class="text-white">{{ selectedPO.deliveryLocationName }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-400">Order Date</p>
              <p class="text-white">{{ formatDate(selectedPO.orderDate) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-400">Expected Delivery</p>
              <p class="text-white">{{ formatDate(selectedPO.expectedDeliveryDate) || 'N/A' }}</p>
            </div>
          </div>

          <div class="border border-gray-700 rounded-lg p-4 mb-4">
            <h3 class="text-white font-medium mb-3">Items</h3>
            <div class="space-y-2">
              <div v-for="item in selectedPO.items" :key="item.id" class="bg-gray-700 rounded p-3">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="text-white font-medium">{{ item.itemName }}</p>
                    <p class="text-sm text-gray-400">{{ item.itemSku }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-white">${{ item.lineTotal?.toFixed(2) }}</p>
                    <p class="text-sm text-gray-400">{{ item.quantityOrdered }} × ${{ item.unitCost }}</p>
                  </div>
                </div>
                <div v-if="item.quantityReceived > 0" class="mt-2 text-sm">
                  <span class="text-green-400">Received: {{ item.quantityReceived }} / {{ item.quantityOrdered }} {{ item.unit }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-700 rounded-lg p-4">
            <div class="flex justify-between mb-2">
              <span class="text-gray-400">Subtotal</span>
              <span class="text-white">${{ selectedPO.subtotal?.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between mb-2">
              <span class="text-gray-400">Tax</span>
              <span class="text-white">${{ selectedPO.taxAmount?.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between mb-2">
              <span class="text-gray-400">Shipping</span>
              <span class="text-white">${{ selectedPO.shippingCost?.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between pt-2 border-t border-gray-600">
              <span class="text-white font-bold">Total</span>
              <span class="text-white font-bold text-lg">${{ selectedPO.totalAmount?.toFixed(2) }}</span>
            </div>
          </div>

          <div v-if="selectedPO.notes" class="mt-4">
            <p class="text-sm text-gray-400">Notes</p>
            <p class="text-white">{{ selectedPO.notes }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RotateCw, Plus, Truck, X } from 'lucide-vue-next'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080'

// State
const purchaseOrders = ref<any[]>([])
const suppliers = ref<any[]>([])
const locations = ref<any[]>([])
const inventoryItems = ref<any[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const statusFilter = ref('')
const showCreateModal = ref(false)
const showReceiveModal = ref(false)
const showViewModal = ref(false)
const selectedPO = ref<any>(null)

const poForm = ref({
  supplierId: '',
  deliveryLocationId: '',
  orderDate: new Date().toISOString().split('T')[0],
  expectedDeliveryDate: '',
  items: [] as any[],
  taxAmount: 0,
  shippingCost: 0,
  notes: '',
  createdBy: 'Current User'
})

const receiveForm = ref({
  purchaseOrderId: 0,
  receivedDate: new Date().toISOString().split('T')[0],
  items: [] as any[],
  receivedBy: 'Current User',
  notes: ''
})

// Methods
const loadPurchaseOrders = async () => {
  isLoading.value = true
  try {
    const url = statusFilter.value
      ? `${API_GATEWAY_URL}/api/inventory/purchase-orders?status=${statusFilter.value}`
      : `${API_GATEWAY_URL}/api/inventory/purchase-orders`
    const response = await axios.get(url)
    purchaseOrders.value = response.data
  } catch (error) {
    console.error('Failed to load purchase orders:', error)
    toast.error('Failed to load purchase orders')
  } finally {
    isLoading.value = false
  }
}

const loadSuppliers = async () => {
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/suppliers`)
    suppliers.value = response.data
  } catch (error) {
    console.error('Failed to load suppliers:', error)
  }
}

const loadLocations = async () => {
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/inventory/locations/active`)
    locations.value = response.data
  } catch (error) {
    console.error('Failed to load locations:', error)
  }
}

const loadInventoryItems = async () => {
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/inventory/items?activeOnly=true`)
    inventoryItems.value = response.data
  } catch (error) {
    console.error('Failed to load inventory items:', error)
  }
}

const addLineItem = () => {
  poForm.value.items.push({
    itemId: '',
    quantityOrdered: 0,
    unitCost: 0,
    notes: ''
  })
}

const removeLineItem = (index: number) => {
  poForm.value.items.splice(index, 1)
}

const calculateLineTotal = (item: any) => {
  return (item.quantityOrdered || 0) * (item.unitCost || 0)
}

const calculateTotal = () => {
  const subtotal = poForm.value.items.reduce((sum, item) => sum + calculateLineTotal(item), 0)
  return subtotal + (poForm.value.taxAmount || 0) + (poForm.value.shippingCost || 0)
}

const createPO = async () => {
  if (poForm.value.items.length === 0) {
    toast.error('Please add at least one item')
    return
  }

  isSaving.value = true
  try {
    const response = await axios.post(`${API_GATEWAY_URL}/api/inventory/purchase-orders`, poForm.value)
    toast.success('Purchase order created successfully')
    closeCreateModal()
    loadPurchaseOrders()
  } catch (error: any) {
    console.error('Failed to create PO:', error)
    toast.error(error.response?.data?.message || 'Failed to create purchase order')
  } finally {
    isSaving.value = false
  }
}

const submitPO = async (po: any) => {
  if (!confirm(`Submit PO ${po.orderNumber} to supplier?`)) return

  try {
    await axios.post(`${API_GATEWAY_URL}/api/inventory/purchase-orders/${po.id}/submit`)
    toast.success('Purchase order submitted')
    loadPurchaseOrders()
  } catch (error) {
    console.error('Failed to submit PO:', error)
    toast.error('Failed to submit purchase order')
  }
}

const openReceiveModal = (po: any) => {
  selectedPO.value = po
  receiveForm.value = {
    purchaseOrderId: po.id,
    receivedDate: new Date().toISOString().split('T')[0],
    items: po.items.map((item: any) => ({
      poItemId: item.id,
      itemName: item.itemName,
      itemSku: item.itemSku,
      unit: item.unit,
      quantityOrdered: item.quantityOrdered,
      remainingQuantity: item.remainingQuantity,
      quantityReceived: item.remainingQuantity,
      notes: ''
    })),
    receivedBy: 'Current User',
    notes: ''
  }
  showReceiveModal.value = true
}

const receiveGoods = async () => {
  isSaving.value = true
  try {
    await axios.post(`${API_GATEWAY_URL}/api/inventory/purchase-orders/receive`, receiveForm.value)
    toast.success('Goods received successfully - Stock levels updated!')
    closeReceiveModal()
    loadPurchaseOrders()
  } catch (error: any) {
    console.error('Failed to receive goods:', error)
    toast.error(error.response?.data?.message || 'Failed to receive goods')
  } finally {
    isSaving.value = false
  }
}

const viewPO = (po: any) => {
  selectedPO.value = po
  showViewModal.value = true
}

const cancelPO = async (po: any) => {
  if (!confirm(`Cancel PO ${po.orderNumber}? This cannot be undone.`)) return

  try {
    await axios.delete(`${API_GATEWAY_URL}/api/inventory/purchase-orders/${po.id}`)
    toast.success('Purchase order cancelled')
    loadPurchaseOrders()
  } catch (error) {
    console.error('Failed to cancel PO:', error)
    toast.error('Failed to cancel purchase order')
  }
}

const closeCreateModal = () => {
  showCreateModal.value = false
  poForm.value = {
    supplierId: '',
    deliveryLocationId: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    items: [],
    taxAmount: 0,
    shippingCost: 0,
    notes: '',
    createdBy: 'Current User'
  }
}

const closeReceiveModal = () => {
  showReceiveModal.value = false
  selectedPO.value = null
}

const getStatusColor = (status: string) => {
  const colors: any = {
    DRAFT: 'bg-gray-600 text-gray-200',
    SUBMITTED: 'bg-blue-600 text-blue-200',
    APPROVED: 'bg-green-600 text-green-200',
    PARTIALLY_RECEIVED: 'bg-yellow-600 text-yellow-200',
    RECEIVED: 'bg-green-700 text-green-200',
    CANCELLED: 'bg-red-600 text-red-200'
  }
  return colors[status] || 'bg-gray-600 text-gray-200'
}

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ')
}

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Lifecycle
onMounted(() => {
  loadPurchaseOrders()
  loadSuppliers()
  loadLocations()
  loadInventoryItems()
})
</script>
