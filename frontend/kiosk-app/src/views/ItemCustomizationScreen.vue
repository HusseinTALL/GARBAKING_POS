<!--
  ItemCustomizationScreen: Customize menu item with options and quantity
  Professional component library, improved UX, and accessibility
-->
<template>
  <div class="customize-screen h-screen w-screen flex flex-col bg-brand-50">
    <!-- Professional Header -->
    <KioskHeader
      :title="t('customize.title')"
      :show-back-button="true"
      @back="goBack"
      :gradient="true"
    />

    <!-- Professional Loading State -->
    <div v-if="loading" class="flex-1 overflow-y-auto p-8">
      <div class="grid grid-cols-2 gap-8">
        <LoadingSkeleton variant="card" :count="1" />
        <div class="space-y-6">
          <LoadingSkeleton variant="card" :count="3" />
        </div>
      </div>
    </div>

    <!-- Professional Error State -->
    <ErrorState
      v-else-if="!item"
      title="Article introuvable"
      description="Nous n'avons pas pu trouver cet article. Veuillez retourner au menu."
      :show-retry="false"
      :show-secondary-action="true"
      secondary-action-label="Retour au menu"
      @secondary-action="goBack"
    />

    <div v-else class="flex-1 flex overflow-hidden">
      <!-- Left: Item Image and Info -->
      <div class="w-2/5 bg-white p-8 flex flex-col">
        <div class="aspect-square bg-gray-200 rounded-2xl mb-6 overflow-hidden">
          <img
            v-if="item.imageUrl"
            :src="item.imageUrl"
            :alt="item.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <svg class="w-32 h-32 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
        </div>

        <h2 class="text-4xl font-brand font-semibold text-neutral-900 mb-4">{{ item.name }}</h2>
        <p class="text-lg text-neutral-600 mb-6">{{ item.description }}</p>
        <PriceDisplay :price="item.price" size="xl" color="primary" />
      </div>

      <!-- Right: Customizations -->
      <div class="flex-1 overflow-y-auto p-8">
        <!-- Quantity Selector -->
        <div class="bg-white rounded-2xl p-6 mb-6 shadow-lg">
          <h3 class="text-2xl font-brand font-semibold text-neutral-900 mb-4">{{ t('customize.quantity') }}</h3>
          <div class="flex items-center gap-4">
            <button
              @click="decrementQuantity"
              :disabled="quantity <= 1"
              class="w-16 h-16 rounded-full bg-neutral-200 hover:bg-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed text-3xl font-semibold text-neutral-700 transition-colors"
            >
              −
            </button>
            <div class="text-3xl font-brand font-semibold text-neutral-900 w-20 text-center">{{ quantity }}</div>
            <button
              @click="incrementQuantity"
              class="w-16 h-16 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-3xl font-semibold transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <!-- Customization Options -->
        <div
          v-for="customization in item.customizations"
          :key="customization.id"
          class="bg-white rounded-2xl p-6 mb-6 shadow-lg"
        >
          <div class="flex items-center gap-3 mb-2">
            <h3 class="text-2xl font-brand font-semibold text-neutral-900">
              {{ customization.name }}
            </h3>
            <KioskBadge
              :variant="customization.required ? 'error' : 'neutral'"
              size="sm"
            >
              {{ customization.required ? t('customize.required') : t('customize.optional') }}
            </KioskBadge>
          </div>

          <div class="space-y-3 mt-4">
            <label
              v-for="option in customization.options"
              :key="option.id"
              class="flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer hover:bg-neutral-50 transition-all duration-normal"
              :class="isOptionSelected(customization.id, option.id) ? 'border-brand-500 bg-brand-50 shadow-md' : 'border-neutral-200 bg-white'"
            >
              <div class="flex items-center gap-4">
                <input
                  :type="customization.type === 'single' ? 'radio' : 'checkbox'"
                  :name="customization.id"
                  :value="option.id"
                  @change="toggleOption(customization, option)"
                  :checked="isOptionSelected(customization.id, option.id)"
                  class="w-8 h-8 accent-brand-500"
                />
                <span class="text-lg font-medium text-neutral-800">{{ option.name }}</span>
              </div>
              <PriceDisplay
                v-if="option.priceModifier !== 0"
                :price="option.priceModifier"
                size="md"
                color="primary"
                :show-currency="true"
              />
            </label>
          </div>
        </div>

        <!-- Special Instructions -->
        <div class="bg-white rounded-2xl p-6 shadow-lg">
          <h3 class="text-2xl font-brand font-semibold text-neutral-900 mb-4">{{ t('customize.specialInstructions') }}</h3>
          <textarea
            v-model="notes"
            rows="3"
            class="w-full p-4 border-2 border-neutral-200 rounded-xl text-lg text-neutral-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-400/40 focus:outline-none"
            placeholder="Any special requests..."
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Professional Bottom Action Bar -->
    <div v-if="item" class="bg-white/95 border-t border-neutral-200 px-10 py-6 shadow-2xl flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="text-2xl font-brand font-semibold text-neutral-900">Total:</span>
        <PriceDisplay :price="totalPrice" size="2xl" color="primary" />
      </div>
      <div class="flex gap-4">
        <KioskButton
          variant="ghost"
          size="lg"
          @click="goBack"
        >
          {{ t('customize.cancel') }}
        </KioskButton>
        <KioskButton
          variant="primary"
          size="lg"
          @click="addToCart"
          :disabled="!canAddToCart"
        >
          {{ t('customize.addToCart') }}
        </KioskButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMenuStore } from '@/stores/menu'
import { useCartStore } from '@/stores/cart'
import type { MenuItem, MenuItemCustomization, CustomizationOption, SelectedCustomization } from '@/types'
import KioskHeader from '@/components/layout/KioskHeader.vue'
import PriceDisplay from '@/components/ui/PriceDisplay.vue'
import KioskBadge from '@/components/ui/KioskBadge.vue'
import KioskButton from '@/components/KioskButton.vue'
import LoadingSkeleton from '@/components/feedback/LoadingSkeleton.vue'
import ErrorState from '@/components/feedback/ErrorState.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n({ inheritLocale: true, useScope: 'global' })
const menuStore = useMenuStore()
const cartStore = useCartStore()

const item = ref<MenuItem | null>(null)
const loading = ref(true)
const quantity = ref(1)
const selectedOptions = ref<Map<string, Set<string>>>(new Map())
const notes = ref('')

const totalPrice = computed(() => {
  if (!item.value) return 0
  let price = item.value.price

  // Add customization prices
  selectedOptions.value.forEach((optionIds, customizationId) => {
    const customization = item.value?.customizations?.find(c => c.id === customizationId)
    if (customization) {
      optionIds.forEach(optionId => {
        const option = customization.options.find(o => o.id === optionId)
        if (option) {
          price += option.priceModifier
        }
      })
    }
  })

  return price * quantity.value
})

const canAddToCart = computed(() => {
  if (!item.value) return false

  // Check all required customizations are selected
  const requiredCustomizations = item.value.customizations?.filter(c => c.required) || []
  return requiredCustomizations.every(customization => {
    const selected = selectedOptions.value.get(customization.id)
    return selected && selected.size > 0
  })
})

onMounted(async () => {
  const itemId = route.params.itemId as string
  item.value = await menuStore.fetchMenuItem(itemId)

  // Initialize with default options
  if (item.value?.customizations) {
    item.value.customizations.forEach(customization => {
      const defaultOptions = customization.options.filter(o => o.default)
      if (defaultOptions.length > 0) {
        const optionSet = new Set(defaultOptions.map(o => o.id))
        selectedOptions.value.set(customization.id, optionSet)
      }
    })
  }

  loading.value = false
})

const incrementQuantity = () => {
  quantity.value++
}

const decrementQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const isOptionSelected = (customizationId: string, optionId: string): boolean => {
  const options = selectedOptions.value.get(customizationId)
  return options ? options.has(optionId) : false
}

const toggleOption = (customization: MenuItemCustomization, option: CustomizationOption) => {
  let options = selectedOptions.value.get(customization.id) || new Set()

  if (customization.type === 'single') {
    // Radio button behavior - only one option
    options = new Set([option.id])
  } else {
    // Checkbox behavior - multiple options
    if (options.has(option.id)) {
      options.delete(option.id)
    } else {
      options.add(option.id)
    }
  }

  selectedOptions.value.set(customization.id, options)
}

const addToCart = () => {
  if (!item.value || !canAddToCart.value) return

  // Build selected customizations array
  const customizations: SelectedCustomization[] = []
  selectedOptions.value.forEach((optionIds, customizationId) => {
    const customization = item.value?.customizations?.find(c => c.id === customizationId)
    if (customization) {
      optionIds.forEach(optionId => {
        const option = customization.options.find(o => o.id === optionId)
        if (option) {
          customizations.push({
            customizationId,
            customizationName: customization.name,
            optionId,
            optionName: option.name,
            priceModifier: option.priceModifier
          })
        }
      })
    }
  })

  cartStore.addItem(item.value, quantity.value, customizations, notes.value || undefined)
  router.push('/menu')
}

const goBack = () => {
  router.push('/menu')
}
</script>
