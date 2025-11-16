<!--
  SavedAddresses Component - Manage delivery addresses
  List, add, edit, and delete saved addresses
-->

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white">
        {{ $t('profile.savedAddresses') }}
      </h3>
      <button
        @click="showAddForm = true"
        class="px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        {{ $t('profile.addAddress') }}
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-if="!profileStore.hasAddresses && !showAddForm"
      class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl"
    >
      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
      <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {{ $t('profile.noAddresses') }}
      </h4>
      <p class="text-gray-600 dark:text-gray-400">
        {{ $t('profile.addFirstAddress') }}
      </p>
    </div>

    <!-- Addresses List -->
    <div v-else class="space-y-3">
      <div
        v-for="address in profileStore.addresses"
        :key="address.id"
        class="bg-white dark:bg-gray-800 rounded-2xl p-4 border-2 transition-all"
        :class="address.isDefault ? 'border-primary-500' : 'border-gray-200 dark:border-gray-700'"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <h4 class="font-semibold text-gray-900 dark:text-white">{{ address.label }}</h4>
              <span
                v-if="address.isDefault"
                class="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-medium rounded-full"
              >
                {{ $t('profile.default') }}
              </span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ address.street }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ address.city }}, {{ address.postalCode }}
            </p>
            <p v-if="address.deliveryInstructions" class="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {{ address.deliveryInstructions }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <button
              @click="editAddress(address)"
              class="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button
              @click="confirmDelete(address)"
              class="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Set as default button (if not already default) -->
        <button
          v-if="!address.isDefault"
          @click="setAsDefault(address.id)"
          class="mt-3 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
        >
          {{ $t('profile.setAsDefault') }}
        </button>
      </div>
    </div>

    <!-- Add/Edit Address Modal -->
    <teleport to="body">
      <div
        v-if="showAddForm || editingAddress"
        class="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
        @click.self="closeForm"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          @click.stop
        >
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {{ editingAddress ? $t('profile.editAddress') : $t('profile.addAddress') }}
            </h3>

            <form @submit.prevent="saveAddress" class="space-y-4">
              <!-- Label -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ $t('profile.addressLabel') }} *
                </label>
                <select
                  v-model="addressForm.label"
                  required
                  class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Home">{{ $t('profile.home') }}</option>
                  <option value="Work">{{ $t('profile.work') }}</option>
                  <option value="Other">{{ $t('profile.other') }}</option>
                </select>
              </div>

              <!-- Street -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ $t('profile.street') }} *
                </label>
                <input
                  v-model="addressForm.street"
                  type="text"
                  required
                  :placeholder="$t('profile.streetPlaceholder')"
                  class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <!-- City & Postal Code -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {{ $t('profile.city') }} *
                  </label>
                  <input
                    v-model="addressForm.city"
                    type="text"
                    required
                    :placeholder="$t('profile.cityPlaceholder')"
                    class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {{ $t('profile.postalCode') }} *
                  </label>
                  <input
                    v-model="addressForm.postalCode"
                    type="text"
                    required
                    :placeholder="$t('profile.postalCodePlaceholder')"
                    class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <!-- Country -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ $t('profile.country') }} *
                </label>
                <input
                  v-model="addressForm.country"
                  type="text"
                  required
                  :placeholder="$t('profile.countryPlaceholder')"
                  class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <!-- Delivery Instructions -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ $t('profile.deliveryInstructions') }}
                </label>
                <textarea
                  v-model="addressForm.deliveryInstructions"
                  rows="2"
                  :placeholder="$t('profile.deliveryInstructionsPlaceholder')"
                  class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                ></textarea>
              </div>

              <!-- Set as Default -->
              <div class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <input
                  v-model="addressForm.isDefault"
                  type="checkbox"
                  id="setDefault"
                  class="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                />
                <label for="setDefault" class="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  {{ $t('profile.setAsDefaultAddress') }}
                </label>
              </div>

              <!-- Actions -->
              <div class="flex gap-3 pt-4">
                <button
                  type="button"
                  @click="closeForm"
                  class="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {{ $t('buttons.cancel') }}
                </button>
                <button
                  type="submit"
                  class="flex-1 px-6 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
                >
                  {{ $t('buttons.save') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Delete Confirmation Modal -->
    <teleport to="body">
      <div
        v-if="deleteConfirmAddress"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        @click.self="deleteConfirmAddress = null"
      >
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full" @click.stop>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {{ $t('profile.deleteAddress') }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            {{ $t('profile.deleteAddressConfirm', { label: deleteConfirmAddress.label }) }}
          </p>
          <div class="flex gap-3">
            <button
              @click="deleteConfirmAddress = null"
              class="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {{ $t('buttons.cancel') }}
            </button>
            <button
              @click="deleteAddress"
              class="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
            >
              {{ $t('buttons.delete') }}
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import { useProfileStore, type Address } from '@/stores/profile'

const { t } = useI18n()
const toast = useToast()
const profileStore = useProfileStore()

// State
const showAddForm = ref(false)
const editingAddress = ref<Address | null>(null)
const deleteConfirmAddress = ref<Address | null>(null)

const addressForm = reactive({
  label: 'Home',
  street: '',
  city: '',
  postalCode: '',
  country: '',
  deliveryInstructions: '',
  isDefault: false
})

// Methods
function editAddress(address: Address) {
  editingAddress.value = address
  addressForm.label = address.label
  addressForm.street = address.street
  addressForm.city = address.city
  addressForm.postalCode = address.postalCode
  addressForm.country = address.country
  addressForm.deliveryInstructions = address.deliveryInstructions || ''
  addressForm.isDefault = address.isDefault
}

function saveAddress() {
  if (editingAddress.value) {
    // Update existing address
    profileStore.updateAddress(editingAddress.value.id, { ...addressForm })
    toast.success(t('profile.addressUpdated'))
  } else {
    // Add new address
    profileStore.addAddress({ ...addressForm })
    toast.success(t('profile.addressAdded'))
  }

  closeForm()
}

function closeForm() {
  showAddForm.value = false
  editingAddress.value = null
  // Reset form
  addressForm.label = 'Home'
  addressForm.street = ''
  addressForm.city = ''
  addressForm.postalCode = ''
  addressForm.country = ''
  addressForm.deliveryInstructions = ''
  addressForm.isDefault = false
}

function confirmDelete(address: Address) {
  deleteConfirmAddress.value = address
}

function deleteAddress() {
  if (deleteConfirmAddress.value) {
    profileStore.removeAddress(deleteConfirmAddress.value.id)
    toast.success(t('profile.addressDeleted'))
    deleteConfirmAddress.value = null
  }
}

function setAsDefault(id: string) {
  profileStore.setDefaultAddress(id)
  toast.success(t('profile.defaultAddressUpdated'))
}
</script>
