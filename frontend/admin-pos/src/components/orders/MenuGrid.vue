<!--
  MenuGrid Component
  Displays menu items in a grid layout with category filtering
  Based on Order Management screen design (Image 2)
-->
<template>
  <div class="menu-grid-container">
    <!-- Category Tabs -->
    <div class="category-tabs">
      <button
        v-for="category in categories"
        :key="category.id"
        @click="selectedCategory = category.id"
        class="category-tab"
        :class="{ 'category-tab-active': selectedCategory === category.id }"
      >
        {{ category.name }}
      </button>
    </div>

    <!-- Search Bar -->
    <div class="search-bar">
      <Search class="search-icon" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search for dishes..."
        class="search-input"
      />
    </div>

    <!-- Menu Items Grid -->
    <div class="menu-items-grid">
      <article
        v-for="item in filteredItems"
        :key="item.id"
        @click="emit('add-item', item)"
        @keydown.enter="emit('add-item', item)"
        class="menu-card"
        :class="{ 'menu-card--unavailable': !item.isAvailable }"
        role="button"
        tabindex="0"
        :aria-label="`Add ${item.name} to order`"
      >
        <!-- Image Section: Full visibility with overlay badges -->
        <div class="menu-card__image-wrapper">
          <div class="menu-card__image-container">
            <!-- Always load img (with fallback src); overlay for errors/no URL -->
            <img
              :src="item.imageUrl || '/placeholder-menu-image.jpg'"
              :alt="`${item.name} - ${item.description ? truncateText(item.description, 100) : 'Menu item'}`"
              class="menu-card__image"
              loading="lazy"
              @error="(e) => handleImageError(e, item.id)"
            />
            <!-- Overlay only on error/no image; always visible if triggered -->
            <div v-if="!item.imageUrl || imageLoadError[item.id]" class="menu-card__placeholder-overlay">
              <div class="placeholder-icon-wrapper">
                <UtensilsCrossed :size="56" stroke-width="1.5" />
              </div>
              <span class="placeholder-text">No Image Available</span>
            </div>
          </div>

          <!-- Always show a badge; added cases for in-stock/unlimited; absolute positioning -->
          <div
            v-if="!item.isAvailable"
            class="menu-card__badge menu-card__badge--out-of-stock"
            style="z-index: 10; position: absolute; top: 8px; right: 8px;"
          >
            Out of Stock
          </div>
          <div
            v-else-if="item.stock && item.stock <= 5"
            class="menu-card__badge menu-card__badge--low-stock"
            style="z-index: 10; position: absolute; top: 8px; right: 8px;"
          >
            Low Stock ({{ item.stock }} left)
          </div>
          <div
            v-else-if="item.stock"
            class="menu-card__badge menu-card__badge--in-stock"
            style="z-index: 10; position: absolute; top: 8px; right: 8px;"
          >
            {{ item.stock }} Available
          </div>
          <!-- Fallback for no stock prop -->
          <div
            v-else
            class="menu-card__badge menu-card__badge--unlimited"
            style="z-index: 10; position: absolute; top: 8px; right: 8px;"
          >
            Unlimited
          </div>
        </div>

        <!-- Content Section: Expanded for full visibility, with wrapping text -->
        <div class="menu-card__content">
          <div class="menu-card__header">
            <h3 class="menu-card__title">{{ item.name }}</h3>
            
            <!-- Full description (no truncate); fallback if empty -->
            <p v-if="item.description" class="menu-card__description">
              {{ item.description }}
            </p>
            <p v-else class="menu-card__description menu-card__description--empty">
              A delicious {{ item.name.toLowerCase() }} prepared fresh.
            </p>
          </div>

          <div class="menu-card__footer">
            <div class="menu-card__price-group">
              <span class="menu-card__price">{{ formatPrice(item.price) }}</span>
              
              <!-- Always visible stock text -->
              <span class="menu-card__stock">
                {{ item.stock ? `${item.stock} available` : 'Unlimited stock' }}
              </span>
            </div>

            <!-- Add text label; stop propagation on button click -->
            <button
              class="menu-card__add-btn"
              type="button"
              :aria-label="`Add one ${item.name} to cart`"
              @click.stop="emit('add-item', item)"
            >
              <Plus :size="20" stroke-width="2.5" />
              <span class="menu-card__add-btn-text">Add</span>
            </button>
          </div>
        </div>
      </article>

      <!-- Empty State: Enhanced visibility with better spacing -->
      <div v-if="filteredItems.length === 0" class="empty-state">
        <div class="empty-state__icon-wrapper">
          <UtensilsCrossed :size="64" stroke-width="1" />
        </div>
        <h3 class="empty-state__title">No Items Found</h3>
        <p class="empty-state__description">
          Try adjusting your search or filter criteria to see more menu options.
        </p>
        <!-- Optional clear button (emit if you have filters) -->
        <button 
          v-if="hasActiveFilters" 
          @click="clearFilters"
          class="empty-state__clear-btn"
          aria-label="Clear all filters and search"
        >
          Clear Filters
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMenuStore } from '@/stores/menu'
import { Search, UtensilsCrossed, Plus } from 'lucide-vue-next'

const menuStore = useMenuStore()

const selectedCategory = ref('all')
const searchQuery = ref('')

const categories = ref([
  { id: 'all', name: 'All Dishes' },
  { id: 'hot-dishes', name: 'Hot Dishes' },
  { id: 'cold-dishes', name: 'Cold Dishes' },
  { id: 'soup', name: 'Soup' },
  { id: 'grill', name: 'Grill' },
  { id: 'appetizer', name: 'Appetizer' },
  { id: 'dessert', name: 'Dessert' }
])

// Track image errors per item
const imageLoadError = ref<Record<string, boolean>>({})

// Optional props for empty state (if using filters externally)
defineProps<{
  hasActiveFilters?: boolean
}>()

// Emits
const emit = defineEmits<{
  'add-item': (_item: any) => void
  'clear-filters': () => void
}>()

const clearFilters = () => emit('clear-filters')

const filteredItems = computed(() => {
  let items = menuStore.menuItems || []

  // Filter by category
  if (selectedCategory.value !== 'all') {
    items = items.filter((item: any) =>
      item.category?.slug === selectedCategory.value ||
      item.category?.name?.toLowerCase() === selectedCategory.value.toLowerCase()
    )
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter((item: any) =>
      item.name?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    )
  }

  return items
})

const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('XOF', 'F CFA')
}

const truncateText = (text: string, maxLength: number): string => {
  if (!text) return ''
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
}

const handleImageError = (event: Event, itemId: string) => {
  imageLoadError.value[itemId] = true
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

onMounted(async () => {
  await menuStore.fetchPublicMenu()
})
</script>

<style scoped>
.menu-grid-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  height: 100%;
  overflow: hidden;
}

/* Category Tabs */
.category-tabs {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.category-tabs::-webkit-scrollbar {
  height: 4px;
}

.category-tab {
  padding: 10px 20px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-body);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.category-tab:hover {
  border-color: var(--accent-orange);
  color: var(--text-primary);
}

.category-tab-active {
  background: var(--accent-orange);
  border-color: var(--accent-orange);
  color: white !important;
}

/* Search Bar */
.search-bar {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--text-tertiary);
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--font-size-body);
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-orange);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

/* Menu Items Grid - Merged with visibility fixes */
.menu-items-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* Increased min width for better visibility */
  gap: 1.5rem; /* Increased gap for breathing room */
  overflow-y: auto;
  padding-right: 8px;
  max-width: 1200px;
  margin: 0 auto;
}

.menu-items-grid::-webkit-scrollbar {
  width: 8px;
}

.menu-items-grid::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 4px;
}

.menu-items-grid::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.menu-items-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* Menu Card - Original theme with visibility enhancements */
.menu-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px; /* Ensures full content fits without squishing */
  position: relative;
  will-change: transform;
}

.menu-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 107, 53, 0.3);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 107, 53, 0.1);
}

.menu-card:active {
  transform: translateY(-2px);
}

.menu-card--unavailable {
  opacity: 0.6;
  cursor: not-allowed;
}

.menu-card--unavailable:hover {
  transform: none;
  border-color: rgba(255, 255, 255, 0.05);
  box-shadow: none;
}

/* Image Section - Fixed height for consistency */
.menu-card__image-wrapper {
  position: relative;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%);
  overflow: hidden;
  height: 200px; /* Fixed height prevents layout shift */
}

.menu-card__image-container {
  aspect-ratio: 4 / 3;
  overflow: hidden;
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-card__image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* Better fill without distortion */
  transition: transform 0.3s ease, opacity 0.3s ease;
  z-index: 1;
}

.menu-card:hover .menu-card__image {
  transform: scale(1.05);
}

/* Overlay placeholder for errors (absolute, full cover) */
.menu-card__placeholder-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(135deg, rgba(100, 116, 139, 0.15) 0%, rgba(71, 85, 105, 0.1) 100%);
  color: #94a3b8;
  text-align: center;
  z-index: 5;
}

.placeholder-icon-wrapper {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  border: 2px dashed rgba(148, 163, 184, 0.3);
  margin-bottom: 0.5rem;
}

.placeholder-text {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Badge - Merged with new variants */
.menu-card__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(8px);
  z-index: 10;
  position: absolute;
  top: 8px;
  right: 8px;
}

.menu-card__badge--out-of-stock {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.menu-card__badge--low-stock {
  background: rgba(251, 191, 36, 0.9);
  color: #78350f;
}

.menu-card__badge--in-stock {
  background: rgba(251, 191, 36, 0.8); /* Similar to low-stock but softer */
  color: #78350f;
}

.menu-card__badge--unlimited {
  background: rgba(34, 197, 94, 0.9); /* Green for unlimited */
  color: white;
}

/* Content Section - Full visibility for description */
.menu-card__content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 12px;
}

.menu-card__header {
  flex: 1; /* Grows to fit full description */
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.menu-card__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
  margin: 0 0 6px 0;
  word-break: break-word; /* Prevents overflow */
}

.menu-card__description,
.menu-card__description--empty {
  font-size: 13px;
  color: var(--text-tertiary);
  line-height: 1.4;
  margin: 0;
  word-wrap: break-word; /* Full wrapping */
  overflow: visible; /* No hidden overflow */
  max-height: none; /* Full visibility */
  display: block; /* Remove webkit-clamp for full text */
}

/* Footer - Stacked price group for visibility */
.menu-card__footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.menu-card__price-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
}

.menu-card__price {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent-orange);
  line-height: 1;
}

.menu-card__stock {
  font-size: 12px;
  color: var(--text-tertiary);
  font-weight: 500;
}

.menu-card__add-btn {
  flex-shrink: 0;
  padding: 0.75rem 1rem; /* Expanded for text */
  border-radius: 8px;
  background: var(--accent-orange);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.25);
  min-width: 80px; /* Prevents shrinking */
  font-weight: 600;
}

.menu-card__add-btn:hover {
  background: #ff8c5a;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.35);
}

.menu-card__add-btn:active {
  transform: scale(0.95);
}

.menu-card__add-btn-text {
  font-size: 0.875rem; /* Visible text label */
}

.menu-card--unavailable .menu-card__add-btn {
  background: rgba(100, 116, 139, 0.3);
  color: var(--text-tertiary);
  cursor: not-allowed;
  box-shadow: none;
}

.menu-card--unavailable .menu-card__add-btn:hover {
  transform: none;
  background: rgba(100, 116, 139, 0.3);
}

/* Empty State - Enhanced for visibility */
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
  text-align: center;
  background: var(--bg-tertiary); /* Matches theme */
  border-radius: 12px;
  border: 2px dashed rgba(148, 163, 184, 0.3); /* Dashed for visibility */
  min-height: 300px;
}

.empty-state__icon-wrapper {
  color: var(--text-tertiary);
  opacity: 0.5;
}

.empty-state__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0;
}

.empty-state__description {
  font-size: 14px;
  color: var(--text-tertiary);
  margin: 0;
  max-width: 400px; /* Prevents over-wide text */
}

.empty-state__clear-btn {
  padding: 0.75rem 1.5rem;
  background: var(--accent-orange);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.empty-state__clear-btn:hover {
  background: #ff8c5a;
}

/* Responsive Design - Merged with mobile fixes */
@media (max-width: 1200px) {
  .menu-items-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .menu-grid-container {
    padding: 16px;
    gap: 16px;
  }

  .category-tabs {
    gap: 8px;
  }

  .category-tab {
    padding: 8px 16px;
    font-size: 14px;
  }

  .menu-items-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  .menu-card__content {
    padding: 14px;
  }

  .menu-card__title {
    font-size: 15px;
  }

  .menu-card__description {
    font-size: 12px;
  }

  .menu-card__price {
    font-size: 18px;
  }

  .menu-card__add-btn {
    padding: 0.75rem 1rem; /* Keep expanded */
  }
}

@media (max-width: 640px) {
  .menu-items-grid {
    grid-template-columns: 1fr; /* Single column for small screens */
    gap: 1rem;
    padding: 0.5rem;
  }

  .menu-card {
    min-height: 350px;
  }

  .menu-card__image-wrapper {
    height: 160px;
  }

  .menu-card__content {
    padding: 1rem;
  }

  .menu-card__title {
    font-size: 1.125rem;
  }

  .menu-card__price {
    font-size: 1.25rem;
  }

  .menu-card__description {
    font-size: 0.8rem; /* Slightly smaller but fully visible */
  }
}

@media (max-width: 480px) {
  .menu-grid-container {
    padding: 12px;
  }

  .menu-items-grid {
    grid-template-columns: 1fr 1fr; /* 2 columns on very small */
    gap: 12px;
  }

  .category-tabs {
    gap: 6px;
  }

  .category-tab {
    padding: 8px 12px;
    font-size: 13px;
  }
}

/* Performance optimizations */
@media (prefers-reduced-motion: reduce) {
  .menu-card,
  .menu-card__image,
  .menu-card__add-btn {
    transition: none;
  }
}

/* Accessibility */
.menu-card:focus-visible {
  outline: 2px solid var(--accent-orange);
  outline-offset: 2px;
}

.menu-card__add-btn:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
}
</style>
