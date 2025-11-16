<!--
  AddressSelector.vue
  Address selection and management for delivery orders
  Features: saved addresses, add new address, delivery instructions
-->

<template>
  <div class="bg-white rounded-2xl p-4 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h3 class="font-semibold text-gray-900">Delivery Address</h3>
      </div>
      <button
        v-if="savedAddresses.length > 0"
        @click="showAddForm = true"
        class="text-sm text-orange-500 hover:text-orange-600 font-medium"
      >
        + Add New
      </button>
    </div>

    <!-- Saved Addresses List -->
    <div v-if="savedAddresses.length > 0 && !showAddForm" class="space-y-3">
      <label
        v-for="address in savedAddresses"
        :key="address.id"
        class="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all"
        :class="[
          selectedAddressId === address.id
            ? 'border-orange-500 bg-orange-50'
            : 'border-gray-200 hover:border-gray-300'
        ]"
      >
        <input
          type="radio"
          name="address"
          :value="address.id"
          v-model="selectedAddressId"
          class="w-5 h-5 text-orange-500 focus:ring-orange-500 mt-0.5"
        />
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <component :is="getAddressIcon(address.type)" class="w-4 h-4 text-gray-600" />
            <span class="font-semibold text-gray-900 capitalize">{{ address.type }}</span>
            <span v-if="address.isDefault" class="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
              Default
            </span>
          </div>
          <p class="text-sm text-gray-700 mb-1">{{ address.street }}</p>
          <p class="text-sm text-gray-600">{{ address.city }}, {{ address.zipCode }}</p>
          <p v-if="address.instructions" class="text-xs text-gray-500 mt-2 italic">
            {{ address.instructions }}
          </p>
        </div>
        <button
          v-if="selectedAddressId === address.id"
          @click.prevent="editAddress(address)"
          class="p-1 hover:bg-orange-100 rounded transition-colors"
        >
          <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </label>
    </div>

    <!-- Add/Edit Address Form -->
    <div v-if="showAddForm || savedAddresses.length === 0" class="space-y-4">
      <div v-if="savedAddresses.length > 0" class="flex items-center justify-between mb-3">
        <h4 class="font-semibold text-gray-900">
          {{ editingAddress ? 'Edit Address' : 'Add New Address' }}
        </h4>
        <button
          @click="cancelForm"
          class="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Address Type Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
        <div class="flex gap-2">
          <button
            v-for="type in addressTypes"
            :key="type.value"
            @click="formData.type = type.value"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg transition-all"
            :class="[
              formData.type === type.value
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 text-gray-700 hover:border-gray-300'
            ]"
          >
            <component :is="type.icon" class="w-5 h-5" />
            <span class="font-medium capitalize">{{ type.label }}</span>
          </button>
        </div>
      </div>

      <!-- Street Address -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
        <input
          v-model="formData.street"
          type="text"
          placeholder="123 Main Street, Apt 4B"
          class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          required
        />
      </div>

      <!-- City and Zip Code -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">City *</label>
          <input
            v-model="formData.city"
            type="text"
            placeholder="City"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Zip Code *</label>
          <input
            v-model="formData.zipCode"
            type="text"
            placeholder="12345"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <!-- Delivery Instructions -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Delivery Instructions (Optional)</label>
        <textarea
          v-model="formData.instructions"
          placeholder="e.g., Ring doorbell, leave at door, gate code..."
          rows="3"
          class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
        ></textarea>
      </div>

      <!-- Set as Default -->
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          v-model="formData.isDefault"
          type="checkbox"
          class="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
        />
        <span class="text-sm text-gray-700">Set as default address</span>
      </label>

      <!-- Action Buttons -->
      <div class="flex gap-3 pt-2">
        <button
          v-if="savedAddresses.length > 0"
          @click="cancelForm"
          class="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          @click="saveAddress"
          :disabled="!isFormValid"
          class="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {{ editingAddress ? 'Update Address' : 'Save Address' }}
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <p v-if="error" class="mt-3 text-sm text-red-600">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, watch } from 'vue'

// Types
interface DeliveryAddress {
  id: string
  type: 'home' | 'work' | 'other'
  street: string
  city: string
  zipCode: string
  instructions?: string
  isDefault: boolean
}

// Props
interface Props {
  initialAddress?: DeliveryAddress
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  (e: 'select', address: DeliveryAddress): void
}>()

// State
const selectedAddressId = ref<string | null>(null)
const showAddForm = ref(false)
const editingAddress = ref<DeliveryAddress | null>(null)
const error = ref('')

const formData = ref({
  type: 'home' as 'home' | 'work' | 'other',
  street: '',
  city: '',
  zipCode: '',
  instructions: '',
  isDefault: false
})

// Load saved addresses from localStorage
const savedAddresses = ref<DeliveryAddress[]>([])

const loadAddresses = () => {
  const stored = localStorage.getItem('delivery_addresses')
  if (stored) {
    savedAddresses.value = JSON.parse(stored)

    // Auto-select default or first address
    if (!selectedAddressId.value) {
      const defaultAddr = savedAddresses.value.find(a => a.isDefault)
      const addrToSelect = defaultAddr || savedAddresses.value[0]
      if (addrToSelect) {
        selectedAddressId.value = addrToSelect.id
        emit('select', addrToSelect)
      }
    }
  }
}

// Address types
const addressTypes = [
  {
    value: 'home',
    label: 'Home',
    icon: h('svg', {
      class: 'w-5 h-5',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
      })
    ])
  },
  {
    value: 'work',
    label: 'Work',
    icon: h('svg', {
      class: 'w-5 h-5',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
      })
    ])
  },
  {
    value: 'other',
    label: 'Other',
    icon: h('svg', {
      class: 'w-5 h-5',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
      }),
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M15 11a3 3 0 11-6 0 3 3 0 016 0z'
      })
    ])
  }
]

// Computed
const isFormValid = computed(() => {
  return (
    formData.value.street.trim() !== '' &&
    formData.value.city.trim() !== '' &&
    formData.value.zipCode.trim() !== ''
  )
})

// Methods
const getAddressIcon = (type: string) => {
  const addressType = addressTypes.find(t => t.value === type)
  return addressType?.icon || addressTypes[2].icon
}

const editAddress = (address: DeliveryAddress) => {
  editingAddress.value = address
  formData.value = {
    type: address.type,
    street: address.street,
    city: address.city,
    zipCode: address.zipCode,
    instructions: address.instructions || '',
    isDefault: address.isDefault
  }
  showAddForm.value = true
}

const saveAddress = () => {
  if (!isFormValid.value) {
    error.value = 'Please fill in all required fields'
    return
  }

  error.value = ''

  const addressData: DeliveryAddress = {
    id: editingAddress.value?.id || Date.now().toString(),
    type: formData.value.type,
    street: formData.value.street.trim(),
    city: formData.value.city.trim(),
    zipCode: formData.value.zipCode.trim(),
    instructions: formData.value.instructions.trim() || undefined,
    isDefault: formData.value.isDefault
  }

  // If setting as default, unset other defaults
  if (addressData.isDefault) {
    savedAddresses.value.forEach(addr => {
      addr.isDefault = false
    })
  }

  if (editingAddress.value) {
    // Update existing address
    const index = savedAddresses.value.findIndex(a => a.id === editingAddress.value!.id)
    if (index !== -1) {
      savedAddresses.value[index] = addressData
    }
  } else {
    // Add new address
    savedAddresses.value.push(addressData)
  }

  // Save to localStorage
  localStorage.setItem('delivery_addresses', JSON.stringify(savedAddresses.value))

  // Select the saved address
  selectedAddressId.value = addressData.id
  emit('select', addressData)

  // Reset form
  cancelForm()
}

const cancelForm = () => {
  showAddForm.value = false
  editingAddress.value = null
  formData.value = {
    type: 'home',
    street: '',
    city: '',
    zipCode: '',
    instructions: '',
    isDefault: false
  }
  error.value = ''
}

// Watch selected address
watch(selectedAddressId, (newId) => {
  if (newId) {
    const address = savedAddresses.value.find(a => a.id === newId)
    if (address) {
      emit('select', address)
    }
  }
})

// Initialize
loadAddresses()

// Set initial address if provided
if (props.initialAddress) {
  selectedAddressId.value = props.initialAddress.id
}
</script>
