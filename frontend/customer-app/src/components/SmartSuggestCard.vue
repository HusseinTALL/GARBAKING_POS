<template>
  <section class="mb-6">
    <div class="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-3xl p-5 shadow-lg">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="text-xl font-semibold mb-1">Smart Suggest</h2>
          <p class="text-sm text-white/80">
            Trouvez un menu adapté à votre budget en un clic.
          </p>
        </div>
        <button
          class="bg-white/15 hover:bg-white/25 transition-colors rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
          @click="runSuggestions"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Patientez…' : 'Générer' }}
        </button>
      </div>

      <div class="mt-5 space-y-4">
        <div>
          <div class="flex items-center justify-between text-xs uppercase tracking-wider text-white/80 mb-2">
            <span>Budget</span>
            <span>{{ formattedBudget }}</span>
          </div>
          <input
            type="range"
            min="2000"
            max="20000"
            step="500"
            v-model.number="localBudget"
            class="w-full accent-white"
          />
          <div class="flex justify-between text-[11px] text-white/70 mt-1">
            <span>{{ formatCurrency(2000) }}</span>
            <span>{{ formatCurrency(20000) }}</span>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between text-xs uppercase tracking-wider text-white/80 mb-2">
            <span>Convives</span>
            <span>{{ localPartySize }}</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-lg"
              @click="adjustPartySize(-1)"
              :disabled="localPartySize <= 1"
            >
              −
            </button>
            <input
              type="number"
              min="1"
              max="12"
              v-model.number="localPartySize"
              class="w-16 text-center bg-white/15 border border-white/30 rounded-xl py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              class="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-lg"
              @click="adjustPartySize(1)"
              :disabled="localPartySize >= 12"
            >
              +
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs">
          <button
            v-for="diet in dietaryOptions"
            :key="diet.value"
            @click="setDiet(diet.value)"
            class="rounded-full border border-white/30 px-2 py-1 transition-colors"
            :class="dietaryFilter === diet.value
              ? 'bg-white text-primary-600 font-semibold'
              : 'text-white/80 hover:bg-white/15'"
          >
            {{ diet.label }}
          </button>
        </div>

        <div class="grid grid-cols-4 gap-2 text-[11px]">
          <button
            v-for="slot in timeOptions"
            :key="slot.value"
            @click="setTime(slot.value)"
            class="rounded-full border border-white/25 px-2 py-1 transition-colors"
            :class="timeFilter === slot.value
              ? 'bg-white text-primary-600 font-semibold'
              : 'text-white/80 hover:bg-white/15'"
          >
            {{ slot.label }}
          </button>
        </div>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="suggestions.length" class="mt-4 space-y-3">
        <div
          v-for="bundle in suggestions"
          :key="bundle.id"
          class="border border-gray-100 rounded-3xl p-4 shadow-sm bg-white"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {{ bundle.title }}
                <span
                  v-if="bundle.tags.includes('BUDGET')"
                  class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold"
                >
                  Budget
                </span>
                <span
                  v-else-if="bundle.tags.includes('UPSELL')"
                  class="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold"
                >
                  Bonus
                </span>
              </h3>
              <p class="text-sm text-gray-500 mt-1" v-if="bundle.description">
                {{ bundle.description }}
              </p>
              <p class="text-xs text-primary-600 mt-1" v-if="bundle.highlight">
                {{ bundle.highlight }}
              </p>
            </div>
          <div class="text-right">
            <span class="text-base font-bold text-gray-900">
              {{ formatCurrency(bundle.total) }}
            </span>
            <p class="text-xs text-gray-500">
              {{ partySizeLabel }}
            </p>
            <p v-if="bundle.savings" class="text-xs text-emerald-600 font-semibold">
              Écono. {{ formatCurrency(bundle.savings) }}
            </p>
            <p v-if="offlineMode" class="text-[11px] text-amber-600 mt-1">
              Mode hors ligne
              </p>
            </div>
          </div>

          <ul class="mt-3 space-y-2">
            <li
              v-for="item in bundle.items"
              :key="item.menuItemId"
              class="flex items-center justify-between text-sm text-gray-700"
            >
              <span class="truncate">
                {{ item.quantity }} × {{ item.name }}
              </span>
              <span class="font-medium">{{ formatCurrency(item.price * item.quantity) }}</span>
            </li>
          </ul>

          <button
            class="mt-4 w-full bg-primary-500 hover:bg-primary-600 text-white rounded-2xl py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            @click="addToCart(bundle)"
          >
            Ajouter au panier
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <p v-if="!isLoading && !suggestions.length && hasTried" class="mt-4 text-sm text-center text-gray-500">
      Aucune suggestion pour ce budget pour le moment. Essayez d'augmenter légèrement le montant.
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useBudgetSuggestionsStore } from '@/stores/budgetSuggestions'
import { formatCurrency as formatCurrencyUtil } from '@/utils/currency'

const suggestionStore = useBudgetSuggestionsStore()
const { state, hasSuggestions, formattedBudget } = storeToRefs(suggestionStore)

const localBudget = ref(state.value.budget)
const dietaryFilter = ref(state.value.lastUsedFilters.dietary)
const timeFilter = ref(state.value.lastUsedFilters.timeOfDay)
const localPartySize = ref(state.value.partySize)
const hasTried = ref(false)
let partySizeDebounce: ReturnType<typeof setTimeout> | null = null

const dietaryOptions = [
  { value: 'ALL', label: 'Tout' },
  { value: 'VEGETARIAN', label: 'Veggie' },
  { value: 'VEGAN', label: 'Vegan' }
] as const

const timeOptions = [
  { value: 'AUTO', label: 'Auto' },
  { value: 'BREAKFAST', label: 'Matin' },
  { value: 'LUNCH', label: 'Midi' },
  { value: 'DINNER', label: 'Soir' }
] as const

const isLoading = computed(() => state.value.isLoading)
const suggestions = computed(() => state.value.suggestions)
const offlineMode = computed(() => state.value.offlineMode)
const partySize = computed(() => state.value.partySize)

const formatCurrency = (value: number) => formatCurrencyUtil(value)

const partySizeLabel = computed(() => {
  const count = partySize.value
  return `${count} convive${count > 1 ? 's' : ''}`
})

const runSuggestions = async () => {
  hasTried.value = true
  await suggestionStore.fetchSuggestions()
}

const setDiet = (diet: typeof dietaryOptions[number]['value']) => {
  dietaryFilter.value = diet
  suggestionStore.setFilters({ dietary: diet })
  runSuggestions()
}

const setTime = (time: typeof timeOptions[number]['value']) => {
  timeFilter.value = time
  suggestionStore.setFilters({ timeOfDay: time })
  runSuggestions()
}

const addToCart = (bundle: (typeof suggestions.value)[number]) => {
  suggestionStore.addBundleToCart(bundle)
}

const adjustPartySize = (delta: number) => {
  const nextValue = localPartySize.value + delta
  if (nextValue < 1 || nextValue > 12) return
  localPartySize.value = nextValue
}

watch(localBudget, (value) => {
  suggestionStore.setBudget(value)
})

watch(localPartySize, (value) => {
  const normalized = Math.max(1, Math.min(12, Math.round(value)))
  if (normalized !== value) {
    localPartySize.value = normalized
    return
  }
  suggestionStore.setPartySize(normalized)
  if (hasTried.value) {
    if (partySizeDebounce) {
      clearTimeout(partySizeDebounce)
    }
    partySizeDebounce = setTimeout(() => {
      suggestionStore.fetchSuggestions()
    }, 300)
  }
})

onMounted(() => {
  suggestionStore.loadCache()
  localBudget.value = state.value.budget
  dietaryFilter.value = state.value.lastUsedFilters.dietary
  timeFilter.value = state.value.lastUsedFilters.timeOfDay
  localPartySize.value = state.value.partySize
  if (!hasSuggestions.value && !state.value.isLoading) {
    hasTried.value = false
  } else {
    hasTried.value = true
  }
})

onBeforeUnmount(() => {
  if (partySizeDebounce) {
    clearTimeout(partySizeDebounce)
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
