<!--
  Voucher Card Component
  Displays voucher information with claim/use actions
-->

<template>
  <div
    class="bg-white rounded-3xl shadow-sm border transition-all duration-300 overflow-hidden cursor-pointer"
    :class="[
      isUsed ? 'border-gray-200 opacity-60' : isClaimed ? 'border-green-200 bg-green-50/50' : 'border-gray-100 hover:shadow-lg hover:border-primary-200'
    ]"
    @click="$emit('view-details', voucher)"
  >
    <div class="p-5">
      <!-- Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <!-- Badges -->
          <div class="flex items-center gap-2 mb-2">
            <span v-if="voucher.isNewUser" class="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
              ⭐ {{ t('vouchers.new_user') }}
            </span>
            <span v-if="isClaimed && !isUsed" class="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
              ✓ {{ t('vouchers.claimed') }}
            </span>
            <span v-if="isUsed" class="px-2 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
              {{ t('vouchers.used') }}
            </span>
          </div>

          <!-- Title -->
          <h3 class="text-lg font-bold text-gray-900 mb-1">
            {{ voucher.title }}
          </h3>

          <!-- Description -->
          <p class="text-sm text-gray-600 line-clamp-2">
            {{ voucher.description }}
          </p>
        </div>

        <!-- Icon -->
        <div
          class="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ml-4"
          :class="getIconBackground()"
        >
          <span class="text-3xl">{{ getVoucherIcon() }}</span>
        </div>
      </div>

      <!-- Discount Info -->
      <div class="mb-4 p-3 rounded-xl" :class="getDiscountBackground()">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-600 mb-0.5">{{ t('vouchers.you_save') }}</p>
            <p class="text-2xl font-bold" :class="getDiscountColor()">
              {{ formatDiscount() }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-xs text-gray-600 mb-0.5">{{ t('vouchers.min_order') }}</p>
            <p class="text-lg font-bold text-gray-900">
              {{ voucher.minOrderAmount ? `$${voucher.minOrderAmount}` : t('vouchers.no_min') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Code Section -->
      <div class="flex items-center gap-3 mb-4">
        <div class="flex-1 px-4 py-3 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <p class="text-xs text-gray-500 mb-1">{{ t('vouchers.promo_code') }}</p>
          <p class="font-mono font-bold text-lg text-gray-900">{{ voucher.code }}</p>
        </div>
        <button
          @click.stop="copyCode"
          class="px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          :class="{ 'bg-green-100 text-green-600': copied }"
        >
          <svg v-if="!copied" class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
          <svg v-else class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </button>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between pt-3 border-t border-gray-100">
        <!-- Expiry Date -->
        <div class="flex items-center gap-1.5 text-xs text-gray-500">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <span>{{ t('vouchers.valid_until', { date: formatDate(voucher.validUntil) }) }}</span>
        </div>

        <!-- Action Button -->
        <button
          v-if="!isClaimed && !isUsed"
          @click.stop="$emit('claim', voucher)"
          class="px-6 py-2 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 active:scale-95 transition-all shadow-sm"
        >
          {{ t('vouchers.claim_now') }}
        </button>
        <button
          v-else-if="isClaimed && !isUsed"
          @click.stop="$emit('view-details', voucher)"
          class="px-6 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 active:scale-95 transition-all shadow-sm"
        >
          {{ t('vouchers.use_now') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import type { Voucher } from '@/types/voucher'
import { VoucherType } from '@/types/voucher'

const { t } = useI18n()

interface Props {
  voucher: Voucher
  isClaimed?: boolean
  isUsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isClaimed: false,
  isUsed: false
})

const emit = defineEmits<{
  'claim': [voucher: Voucher]
  'view-details': [voucher: Voucher]
}>()

const toast = useToast()
const copied = ref(false)

const getVoucherIcon = (): string => {
  switch (props.voucher.type) {
    case VoucherType.PERCENTAGE:
      return '%'
    case VoucherType.FIXED_AMOUNT:
      return '💵'
    case VoucherType.FREE_DELIVERY:
      return '🚚'
    case VoucherType.BUY_ONE_GET_ONE:
      return '🎁'
    case VoucherType.CATEGORY_DISCOUNT:
      return '🏷️'
    default:
      return '🎫'
  }
}

const getIconBackground = (): string => {
  if (props.isUsed) return 'bg-gray-100'
  if (props.isClaimed) return 'bg-green-100'

  switch (props.voucher.type) {
    case VoucherType.PERCENTAGE:
      return 'bg-gradient-to-br from-orange-400 to-pink-500'
    case VoucherType.FIXED_AMOUNT:
      return 'bg-gradient-to-br from-green-400 to-emerald-500'
    case VoucherType.FREE_DELIVERY:
      return 'bg-gradient-to-br from-blue-400 to-cyan-500'
    case VoucherType.BUY_ONE_GET_ONE:
      return 'bg-gradient-to-br from-purple-400 to-pink-500'
    case VoucherType.CATEGORY_DISCOUNT:
      return 'bg-gradient-to-br from-yellow-400 to-orange-500'
    default:
      return 'bg-gradient-to-br from-gray-400 to-gray-500'
  }
}

const getDiscountBackground = (): string => {
  if (props.isUsed) return 'bg-gray-50'
  if (props.isClaimed) return 'bg-green-50'
  return 'bg-orange-50'
}

const getDiscountColor = (): string => {
  if (props.isUsed) return 'text-gray-600'
  if (props.isClaimed) return 'text-green-600'
  return 'text-orange-600'
}

const formatDiscount = (): string => {
  const { type, discountValue } = props.voucher
  switch (type) {
    case VoucherType.PERCENTAGE:
      return `${discountValue}% OFF`
    case VoucherType.FIXED_AMOUNT:
      return `$${discountValue} OFF`
    case VoucherType.FREE_DELIVERY:
      return t('vouchers.free_delivery')
    case VoucherType.BUY_ONE_GET_ONE:
      return t('vouchers.bogo', { value: discountValue })
    case VoucherType.CATEGORY_DISCOUNT:
      return `${discountValue}% OFF`
    default:
      return 'DISCOUNT'
  }
}

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.voucher.code)
    copied.value = true
    toast.success(t('vouchers.copied'))
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    toast.error('Failed to copy code')
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
