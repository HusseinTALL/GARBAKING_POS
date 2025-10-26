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
        @click="$emit('add-item', item)"
        class="menu-card"
        :class="{ 'menu-card--unavailable': !item.isAvailable }"
        role="button"
        tabindex="0"
        :aria-label="`Add ${item.name} to order`"
      >
        <!-- Image Section -->
        <div class="menu-card__image-wrapper">
          <div class="menu-card__image-container">
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :alt="item.name"
              class="menu-card__image"
              loading="lazy"
            />
            <div v-else class="menu-card__placeholder">
              <UtensilsCrossed :size="48" stroke-width="1.5" />
            </div>
          </div>

          <!-- Stock Badge -->
          <div v-if="!item.isAvailable" class="menu-card__badge menu-card__badge--out-of-stock">
            Out of Stock
          </div>
          <div v-else-if="item.stock && item.stock <= 5" class="menu-card__badge menu-card__badge--low-stock">
            Low Stock
          </div>
        </div>

        <!-- Content Section -->
        <div class="menu-card__content">
          <div class="menu-card__header">
            <h3 class="menu-card__title">{{ item.name }}</h3>
            <p v-if="item.description" class="menu-card__description">
              {{ truncateText(item.description, 60) }}
            </p>
          </div>

          <div class="menu-card__footer">
            <div class="menu-card__price-group">
              <span class="menu-card__price">{{ formatPrice(item.price) }}</span>
              <span v-if="item.stock" class="menu-card__stock">
                {{ item.stock }} available
              </span>
            </div>

            <button class="menu-card__add-btn" aria-label="Add to cart">
              <Plus :size="20" stroke-width="2.5" />
            </button>
          </div>
        </div>
      </article>

      <!-- Empty State -->
      <div v-if="filteredItems.length === 0" class="empty-state">
        <div class="empty-state__icon">
          <UtensilsCrossed :size="64" stroke-width="1" />
        </div>
        <h3 class="empty-state__title">No items found</h3>
        <p class="empty-state__description">
          Try adjusting your search or filter criteria
        </p>
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

onMounted(async () => {
  await menuStore.fetchPublicMenu()
})

defineEmits<{
  (e: 'add-item', item: any): void
}>()
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

/* Menu Items Grid */
.menu-items-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  overflow-y: auto;
  padding-right: 8px;
}

/* Menu Card - Modern Professional Design */
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

/* Image Section */
.menu-card__image-wrapper {
  position: relative;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%);
  overflow: hidden;
}

.menu-card__image-container {
  aspect-ratio: 4 / 3;
  overflow: hidden;
  position: relative;
}

.menu-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.menu-card:hover .menu-card__image {
  transform: scale(1.05);
}

.menu-card__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(100, 116, 139, 0.1);
  color: #64748b;
}

/* Badge */
.menu-card__badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(8px);
  z-index: 1;
}

.menu-card__badge--out-of-stock {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.menu-card__badge--low-stock {
  background: rgba(251, 191, 36, 0.9);
  color: #78350f;
}

/* Content Section */
.menu-card__content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 12px;
}

.menu-card__header {
  flex: 1;
}

.menu-card__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
  margin: 0 0 6px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-card__description {
  font-size: 13px;
  color: var(--text-tertiary);
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Footer with Price and Add Button */
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
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--accent-orange);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.25);
}

.menu-card__add-btn:hover {
  background: #ff8c5a;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.35);
}

.menu-card__add-btn:active {
  transform: scale(0.95);
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

/* Empty State */
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
  text-align: center;
}

.empty-state__icon {
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
  max-width: 300px;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .menu-items-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
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
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
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
    width: 36px;
    height: 36px;
  }
}

@media (max-width: 640px) {
  .menu-items-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
  }

  .menu-card__content {
    padding: 12px;
    gap: 10px;
  }

  .menu-card__title {
    font-size: 14px;
    margin-bottom: 4px;
  }

  .menu-card__price {
    font-size: 16px;
  }

  .menu-card__stock {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .menu-grid-container {
    padding: 12px;
  }

  .menu-items-grid {
    grid-template-columns: 1fr 1fr;
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

/* Scrollbar styling */
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
</style>
