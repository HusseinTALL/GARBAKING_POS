<script setup lang="ts">
/**
 * AddAddress - Add delivery address (Page 18)
 *
 * Features:
 * - Map preview (placeholder)
 * - Address type selector (Home/Work/Other)
 * - Form fields for address details
 * - Save address functionality
 */

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAddressesStore } from '@/stores/addresses'

const router = useRouter()
const addressesStore = useAddressesStore()

type AddressType = 'home' | 'work' | 'other'

// Form data
const addressType = ref<AddressType>('home')
const formData = ref({
  name: '',
  address: '',
  city: '',
  zipCode: '',
  phone: '',
  instructions: '',
  isDefault: false
})

function goBack() {
  router.back()
}

function selectType(type: AddressType) {
  addressType.value = type
  // Auto-fill name based on type
  if (type === 'home') {
    formData.value.name = 'Home'
  } else if (type === 'work') {
    formData.value.name = 'Office'
  } else {
    formData.value.name = ''
  }
}

async function saveAddress() {
  try {
    await addressesStore.addAddress({
      type: addressType.value,
      name: formData.value.name,
      address: formData.value.address,
      city: formData.value.city,
      zipCode: formData.value.zipCode,
      phone: formData.value.phone,
      instructions: formData.value.instructions,
      isDefault: formData.value.isDefault
    })
    router.back()
  } catch (error) {
    console.error('Failed to save address:', error)
  }
}

function openMap() {
  // TODO: Implement map selection
  console.log('Open map')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-warm pb-24">
    <!-- Header -->
    <div class="px-6 pt-8 pb-4 bg-white rounded-b-3xl shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <button
          @click="goBack"
          class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"
        >
          <i class="fas fa-arrow-left text-black"></i>
        </button>
        <h2 class="text-black font-bold text-lg">Add Address</h2>
        <button
          @click="saveAddress"
          class="text-primary-500 text-sm font-semibold"
        >
          Save
        </button>
      </div>
    </div>

    <div class="px-6 py-6">
      <!-- Map Preview (Placeholder) -->
      <div class="bg-white rounded-3xl overflow-hidden shadow-md mb-4 cursor-pointer" @click="openMap">
        <div class="relative h-48 bg-gray-100">
          <!-- Map placeholder - replace with actual map component -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <i class="fas fa-map-location-dot text-4xl text-gray-400 mb-2"></i>
              <p class="text-black opacity-60 text-sm">Tap to select location on map</p>
            </div>
          </div>
          <div class="absolute bottom-4 right-4">
            <button class="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
              <i class="fas fa-location-crosshairs text-primary-500"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Address Type Selector -->
      <div class="bg-white rounded-3xl p-6 shadow-md mb-4">
        <h3 class="text-black font-bold text-sm mb-3">Address Type</h3>
        <div class="flex gap-3">
          <button
            @click="selectType('home')"
            :class="[
              'flex-1 py-3 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2',
              addressType === 'home'
                ? 'bg-gradient-primary text-white shadow-lg'
                : 'bg-gray-50 text-black'
            ]"
          >
            <i class="fas fa-home"></i>
            <span>Home</span>
          </button>
          <button
            @click="selectType('work')"
            :class="[
              'flex-1 py-3 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2',
              addressType === 'work'
                ? 'bg-gradient-primary text-white shadow-lg'
                : 'bg-gray-50 text-black'
            ]"
          >
            <i class="fas fa-briefcase"></i>
            <span>Work</span>
          </button>
          <button
            @click="selectType('other')"
            :class="[
              'flex-1 py-3 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2',
              addressType === 'other'
                ? 'bg-gradient-primary text-white shadow-lg'
                : 'bg-gray-50 text-black'
            ]"
          >
            <i class="fas fa-location-dot"></i>
            <span>Other</span>
          </button>
        </div>
      </div>

      <!-- Address Form -->
      <div class="bg-white rounded-3xl p-6 shadow-md space-y-4">
        <!-- Address Name -->
        <div>
          <label class="text-black font-semibold text-sm mb-2 block">Address Label</label>
          <input
            v-model="formData.name"
            type="text"
            class="w-full px-4 py-3 bg-gray-50 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
            placeholder="e.g., Home, Office, Mom's House"
          />
        </div>

        <!-- Street Address -->
        <div>
          <label class="text-black font-semibold text-sm mb-2 block">Street Address</label>
          <input
            v-model="formData.address"
            type="text"
            class="w-full px-4 py-3 bg-gray-50 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
            placeholder="123 Main Street, Apt 4B"
          />
        </div>

        <!-- City and Zip Code -->
        <div class="flex gap-3">
          <div class="flex-1">
            <label class="text-black font-semibold text-sm mb-2 block">City</label>
            <input
              v-model="formData.city"
              type="text"
              class="w-full px-4 py-3 bg-gray-50 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="New York"
            />
          </div>
          <div class="w-32">
            <label class="text-black font-semibold text-sm mb-2 block">Zip Code</label>
            <input
              v-model="formData.zipCode"
              type="text"
              class="w-full px-4 py-3 bg-gray-50 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="10001"
            />
          </div>
        </div>

        <!-- Phone Number -->
        <div>
          <label class="text-black font-semibold text-sm mb-2 block">Phone Number</label>
          <input
            v-model="formData.phone"
            type="tel"
            class="w-full px-4 py-3 bg-gray-50 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
            placeholder="+1 234 567 8900"
          />
        </div>

        <!-- Delivery Instructions -->
        <div>
          <label class="text-black font-semibold text-sm mb-2 block">Delivery Instructions (Optional)</label>
          <textarea
            v-model="formData.instructions"
            rows="2"
            class="w-full px-4 py-3 bg-gray-50 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
            placeholder="e.g., Ring doorbell twice, Leave at door"
          ></textarea>
        </div>

        <!-- Set as Default -->
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
          <div>
            <p class="text-black font-semibold text-sm">Set as default address</p>
            <p class="text-black opacity-60 text-xs">Use this address by default</p>
          </div>
          <label class="relative inline-block w-12 h-7">
            <input
              v-model="formData.isDefault"
              type="checkbox"
              class="opacity-0 w-0 h-0 peer"
            />
            <span class="absolute cursor-pointer inset-0 bg-gray-300 rounded-full transition-all peer-checked:bg-primary-500">
              <span class="absolute h-5 w-5 left-1 top-1 bg-white rounded-full transition-all peer-checked:translate-x-5"></span>
            </span>
          </label>
        </div>
      </div>

      <!-- Save Button -->
      <button
        @click="saveAddress"
        class="w-full bg-gradient-primary text-white font-semibold py-4 rounded-2xl shadow-lg mt-6"
      >
        Save Address
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Toggle switch styling */
input:checked ~ span {
  background-color: #f59e0b;
}

input:checked ~ span span {
  transform: translateX(1.25rem);
}
</style>
