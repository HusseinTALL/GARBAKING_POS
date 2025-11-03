<!--
  Voucher Details Modal
  Shows detailed information about a voucher including terms and conditions
-->

<template>
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 px-4 animate-fade-in"
    @click="$emit('close')"
  >
    <div
      @click.stop
      class="bg-white rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-hidden animate-slide-up shadow-2xl"
    >
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
        <h2 class="text-xl font-bold text-gray-900">{{ t('vouchers.details_title') }}</h2>
        <button
          @click="$emit('close')"
          class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="overflow-y-auto max-h-[calc(90vh-140px)] px-6 py-6">
        <!-- Voucher Visual -->
        <div
          class="relative rounded-3xl p-6 mb-6 overflow-hidden"
          :style="{ background: getGradientBackground() }"
        >
          <!-- Decorative circles -->
          <div class="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -mr-16 -mt-16"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 -ml-12 -mb-12"></div>

          <div class="relative z-10">
            <!-- Badges -->
            <div class="flex items-center gap-2 mb-4">
              <span v-if="voucher.isNewUser" class="px-3 py-1 bg-white/30 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                ⭐ {{ t('vouchers.new_user') }}
              </span>
              <span v-if="isClaimed" class="px-3 py-1 bg-white/30 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                ✓ {{ t('vouchers.claimed') }}
              </span>
            </div>

            <!-- Title & Icon -->
            <div class="flex items-start justify-between mb-6">
              <div class="flex-1">
                <h3 class="text-2xl font-bold text-white mb-2">
                  {{ voucher.title }}
                </h3>
                <p class="text-white/90 text-sm">
                  {{ voucher.description }}
                </p>
              </div>
              <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl ml-4">
                {{ getVoucherIcon() }}
              </div>
            </div>

            <!-- Code -->
            <div class="bg-white/20 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p class="text-white/80 text-xs mb-1">{{ t('vouchers.promo_code') }}</p>
                <p class="font-mono font-bold text-2xl text-white tracking-wider">{{ voucher.code }}</p>
              </div>
              <button
                @click="copyCode"
                class="px-4 py-2 bg-white text-gray-900 rounded-xl font-semibold text-sm hover:bg-white/90 transition-colors"
                :class="{ 'bg-green-500 text-white': copied }"
              >
                {{ copied ? t('vouchers.copied') : t('vouchers.copy') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Info Cards -->
        <div class="grid grid-cols-2 gap-3 mb-6">
          <div class="bg-orange-50 rounded-2xl p-4">
            <p class="text-xs text-gray-600 mb-1">{{ t('vouchers.discount_value') }}</p>
            <p class="text-lg font-bold text-orange-600">{{ formatDiscount() }}</p>
          </div>
          <div class="bg-blue-50 rounded-2xl p-4">
            <p class="text-xs text-gray-600 mb-1">{{ t('vouchers.min_order') }}</p>
            <p class="text-lg font-bold text-blue-600">
              {{ voucher.minOrderAmount ? `$${voucher.minOrderAmount}` : t('vouchers.no_min') }}
            </p>
          </div>
          <div class="bg-green-50 rounded-2xl p-4">
            <p class="text-xs text-gray-600 mb-1">{{ t('vouchers.valid_from') }}</p>
            <p class="text-sm font-bold text-green-600">{{ formatDate(voucher.validFrom) }}</p>
          </div>
          <div class="bg-red-50 rounded-2xl p-4">
            <p class="text-xs text-gray-600 mb-1">{{ t('vouchers.valid_until', { date: '' }) }}</p>
            <p class="text-sm font-bold text-red-600">{{ formatDate(voucher.validUntil) }}</p>
          </div>
        </div>

        <!-- Additional Info -->
        <div v-if="voucher.maxDiscount" class="mb-6 p-4 bg-yellow-50 rounded-2xl">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
            <div>
              <p class="text-sm font-semibold text-yellow-900 mb-1">{{ t('vouchers.max_discount') }}</p>
              <p class="text-sm text-yellow-700">{{ t('vouchers.max_discount_desc', { amount: voucher.maxDiscount }) }}</p>
            </div>
          </div>
        </div>

        <!-- Terms & Conditions -->
        <div class="mb-6">
          <h4 class="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            {{ t('vouchers.terms_title') }}
          </h4>
          <ul class="space-y-2">
            <li
              v-for="(term, index) in voucher.termsAndConditions"
              :key="index"
              class="flex items-start gap-3 text-sm text-gray-600"
            >
              <svg class="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>{{ term }}</span>
            </li>
          </ul>
        </div>

        <!-- Usage Info -->
        <div v-if="voucher.maxUsage" class="mb-6 p-4 bg-gray-50 rounded-2xl">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-600 mb-1">{{ t('vouchers.usage_limit') }}</p>
              <p class="text-sm font-semibold text-gray-900">
                {{ t('vouchers.can_be_used', voucher.maxUsage) }}
              </p>
            </div>
            <div class="w-12 h-12 rounded-full bg-white flex items-center justify-center">
              <span class="text-lg font-bold text-primary-600">{{ voucher.maxUsage }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4">
        <div class="flex gap-3">
          <button
            @click="$emit('close')"
            class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
          >
            {{ t('vouchers.close') }}
          </button>
          <button
            v-if="!isClaimed"
            @click="handleClaim"
            class="flex-1 py-3 bg-primary-500 text-white rounded-2xl font-semibold hover:bg-primary-600 active:scale-95 transition-all shadow-lg shadow-primary-500/30"
          >
            {{ t('vouchers.claim_voucher') }}
          </button>
          <button
            v-else
            @click="goToCart"
            class="flex-1 py-3 bg-green-500 text-white rounded-2xl font-semibold hover:bg-green-600 active:scale-95 transition-all shadow-lg shadow-green-500/30"
          >
            {{ t('vouchers.use_in_cart') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import type { Voucher } from '@/types/voucher'
import { VoucherType } from '@/types/voucher'

const { t } = useI18n()

interface Props {
  voucher: Voucher
  isClaimed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isClaimed: false
})

const emit = defineEmits<{
  'close': []
  'claim': [voucher: Voucher]
}>()

const router = useRouter()
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

const getGradientBackground = (): string => {
  switch (props.voucher.type) {
    case VoucherType.PERCENTAGE:
      return 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)'
    case VoucherType.FIXED_AMOUNT:
      return 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    case VoucherType.FREE_DELIVERY:
      return 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'
    case VoucherType.BUY_ONE_GET_ONE:
      return 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
    case VoucherType.CATEGORY_DISCOUNT:
      return 'linear-gradient(135deg, #facc15 0%, #f97316 100%)'
    default:
      return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
  }
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

const handleClaim = () => {
  emit('claim', props.voucher)
  emit('close')
}

const goToCart = () => {
  emit('close')
  router.push('/cart')
}
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
</style>
