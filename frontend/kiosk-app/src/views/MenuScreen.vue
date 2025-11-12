<!--
  Menu Screen - light, spacious kiosk presentation inspired by senior-level UI references
-->
<template>
  <div class="menu-screen flex h-screen w-screen flex-col overflow-hidden bg-neutral-50 font-body text-neutral-900">
    <!-- Header -->
    <header class="border-b border-neutral-200 bg-white px-12 py-8">
      <div class="flex items-start justify-between gap-8">
        <div class="space-y-2">
          <h1 class="text-4xl font-semibold tracking-tight text-neutral-900">
            {{ t('menu.title') }}
          </h1>
          <p class="text-base text-neutral-500">
            {{ menuStore.availableItems.length }} {{ t('menu.items') }} disponibles
          </p>
        </div>

        <!-- Cart Button -->
        <Transition name="scale">
          <button
            v-if="cartStore.itemCount > 0"
            @click="viewCart"
            class="relative inline-flex items-center gap-4 rounded-2xl bg-gradient-primary px-6 py-5 text-left text-white shadow-button transition-all duration-normal hover:shadow-button-hover hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 border border-brand-600/20"
          >
            <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </span>
            <div class="space-y-1">
              <span class="block text-sm font-medium text-white/80">Voir le panier</span>
              <span class="block text-2xl font-semibold">{{ formatPrice(cartStore.total) }}</span>
            </div>
            <span class="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-semibold text-brand-500 shadow-sm">
              {{ cartStore.itemCount }}
            </span>
          </button>
        </Transition>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <!-- Category Sidebar -->
      <aside class="w-72 border-r border-neutral-200 bg-white">
        <div class="flex h-full flex-col overflow-y-auto px-6 py-8 scrollbar-thin">
          <p class="text-xs font-medium uppercase tracking-[0.28em] text-neutral-400">
            Catégories
          </p>
          <nav class="mt-6 flex flex-col gap-2">
            <!-- All Items -->
            <button
              @click="selectCategory(null, null)"
              :class="[
                'flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-all duration-normal focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-200',
                selectedCategoryId === null
                  ? 'border-brand-300 bg-gradient-soft text-brand-700 shadow-md'
                  : 'border-transparent text-neutral-600 hover:bg-neutral-100 hover:shadow-sm'
              ]"
            >
              <span :class="[
                'flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-colors',
                selectedCategoryId === null ? 'bg-brand-100 text-brand-600' : 'bg-neutral-100 text-neutral-500'
              ]">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </span>
              <div class="space-y-1">
                <span class="block text-base font-medium tracking-tight">Tous les plats</span>
                <span class="block text-sm text-neutral-500">{{ menuStore.items.length }} items</span>
              </div>
            </button>

            <!-- Category Buttons -->
            <button
              v-for="category in menuStore.categories"
              :key="category.id"
              @click="selectCategory(category.id, category.name)"
              :class="[
                'flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-all duration-normal focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-200',
                selectedCategoryId === category.id
                  ? 'border-brand-300 bg-gradient-soft text-brand-700 shadow-md'
                  : 'border-transparent text-neutral-600 hover:bg-neutral-100 hover:shadow-sm'
              ]"
            >
              <span :class="[
                'flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-colors',
                selectedCategoryId === category.id ? 'bg-brand-100 text-brand-600' : 'bg-neutral-100 text-neutral-500'
              ]">
                {{ getCategoryEmoji(category.name) }}
              </span>
              <div class="space-y-1">
                <span class="block text-base font-medium tracking-tight">{{ category.name }}</span>
                <span class="block text-sm text-neutral-500">{{ getCategoryItemCount(category.id) }} items</span>
              </div>
            </button>
          </nav>
        </div>
      </aside>

      <!-- Menu Items Grid -->
      <main ref="scrollContainer" class="flex-1 overflow-y-auto bg-neutral-50 scrollbar-thin">
        <div class="mx-auto flex h-full w-full max-w-6xl flex-col px-10 py-10">
          <!-- Loading State -->
          <div v-if="menuStore.loading" class="grid grid-cols-3 gap-8">
            <div v-for="i in 6" :key="i" class="animate-pulse rounded-3xl border border-neutral-200 bg-white">
              <div class="aspect-[4/3] rounded-t-3xl bg-neutral-100"></div>
              <div class="space-y-3 p-6">
                <div class="h-6 rounded-lg bg-neutral-100"></div>
                <div class="h-4 w-3/4 rounded-lg bg-neutral-100"></div>
                <div class="h-8 w-1/2 rounded-lg bg-neutral-100"></div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="displayedItems.length === 0" class="flex flex-1 flex-col items-center justify-center text-center">
            <svg class="mb-6 h-28 w-28 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
            </svg>
            <h2 class="mb-2 text-3xl font-semibold tracking-tight text-neutral-800">Aucun article disponible</h2>
            <p class="text-lg text-neutral-500">Essayez une autre catégorie</p>
          </div>

          <!-- Menu Items Grid -->
          <TransitionGroup
            v-else
            name="grid"
            tag="div"
            class="grid grid-cols-3 gap-8"
          >
            <button
              v-for="(item, index) in displayedItems"
              :key="item.id"
              @click="selectItem(item)"
              class="group flex flex-col overflow-hidden rounded-3xl border border-neutral-100 bg-white text-left shadow-card transition-all duration-normal hover:-translate-y-2 hover:shadow-card-hover hover:scale-[1.02] animate-fadeIn"
              :style="{ animationDelay: `${index * 50}ms` }"
            >
              <!-- Item Image -->
              <div class="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                <img
                  v-if="item.imageUrl"
                  :src="item.imageUrl"
                  :alt="item.name"
                  class="h-full w-full object-cover transition-transform duration-slow group-hover:scale-110"
                />
                <div v-else class="flex h-full w-full items-center justify-center text-neutral-400">
                  <svg class="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>

                <!-- Gradient overlay for depth -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>

                <!-- Interactive overlay on hover -->
                <div class="absolute inset-0 bg-gradient-to-t from-brand-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                <!-- Popular Badge -->
                <div
                  v-if="item.popular"
                  class="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm"
                >
                  <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  Populaire
                </div>
              </div>

              <!-- Item Info -->
              <div class="flex flex-1 flex-col gap-5 p-6">
                <div class="space-y-1">
                  <h3 class="text-xl font-semibold tracking-tight text-neutral-900 line-clamp-1">
                    {{ item.name }}
                  </h3>
                  <p class="text-sm text-neutral-500 line-clamp-2 min-h-[3.5rem]">
                    {{ item.description }}
                  </p>
                </div>
                <div class="mt-auto flex items-center justify-between">
                  <span class="text-2xl font-semibold text-neutral-900">
                    {{ formatPrice(item.price) }}
                  </span>
                  <span class="inline-flex items-center gap-2 rounded-xl bg-gradient-warm px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-normal group-hover:shadow-lg group-hover:scale-105">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m7-7H5"></path>
                    </svg>
                    Ajouter
                  </span>
                </div>
              </div>
            </button>
          </TransitionGroup>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
import { useCartStore } from '@/stores/cart'
import { useI18n } from 'vue-i18n'
import type { MenuItem } from '@/types'

const router = useRouter()
const menuStore = useMenuStore()
const cartStore = useCartStore()
const { t } = useI18n()

const selectedCategoryId = ref<string | number | null>(null)
const selectedCategoryName = ref<string | null>(null)
const scrollContainer = ref<HTMLElement | null>(null)

const displayedItems = computed(() => {
  if (!selectedCategoryId.value && !selectedCategoryName.value) {
    return menuStore.availableItems
  }
  return menuStore.filteredItems
})

function selectCategory(categoryId: string | number | null, categoryName: string | null) {
  selectedCategoryId.value = categoryId
  selectedCategoryName.value = categoryName
  menuStore.selectedCategoryId = categoryId
  menuStore.selectedCategoryName = categoryName

  if (scrollContainer.value) {
    scrollContainer.value.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function selectItem(item: MenuItem) {
  router.push({ name: 'customize', params: { id: String(item.id) } })
}

function viewCart() {
  router.push({ name: 'cart' })
}

function getCategoryItemCount(categoryId: string | number): number {
  return menuStore.items.filter((item) => {
    if (item.categoryId) {
      return String(item.categoryId) === String(categoryId)
    }
    return false
  }).length
}

function getCategoryEmoji(categoryName: string): string {
  const emojiMap: Record<string, string> = {
    'Pizzas': '🍕',
    'Burgers': '🍔',
    'Desserts': '🍰',
    'Boissons': '🥤',
    'Salades': '🥗',
    'Pâtes': '🍝',
    'Entrées': '🥟',
  }
  return emojiMap[categoryName] || '🍴'
}

function formatPrice(price: number): string {
  return `${price.toFixed(2)} €`
}

onMounted(async () => {
  if (menuStore.items.length === 0) {
    await menuStore.fetchMenu()
  }
})
</script>

<style scoped>
/* Scale transition for cart button */
.scale-enter-active,
.scale-leave-active {
  transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Grid transition */
.grid-enter-active {
  transition: all 0.3s ease-out;
}

.grid-leave-active {
  transition: all 0.2s ease-in;
  position: absolute;
}

.grid-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.grid-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Scrollbar styling */
.scrollbar-thin::-webkit-scrollbar {
  width: 8px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #d4d4d4;
  border-radius: 4px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #bdbdbd;
}

/* Line clamp utility */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
