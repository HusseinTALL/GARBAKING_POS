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
      <div
        v-for="item in filteredItems"
        :key="item.id"
        @click="$emit('add-item', item)"
        class="menu-item-card"
      >
        <!-- Item Image Container -->
        <div class="item-image-container">
          <div class="item-image-circle">
            <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" class="item-image" />
            <div v-else class="item-placeholder">
              <UtensilsCrossed class="placeholder-icon" />
            </div>
          </div>
        </div>

        <!-- Item Info -->
        <div class="item-info">
          <h4 class="item-name">{{ item.name }}</h4>
          <p class="item-price">{{ formatPrice(item.price) }}</p>
          <span v-if="item.isAvailable" class="availability-text available">
            {{ item.stock || 20 }} Bowls available
          </span>
          <span v-else class="availability-text unavailable">
            Out of Stock
          </span>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredItems.length === 0" class="empty-state">
        <UtensilsCrossed class="w-16 h-16 text-gray-600" />
        <p class="empty-text">No items found</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMenuStore } from '@/stores/menu'
import { Search, UtensilsCrossed } from 'lucide-vue-next'

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
  }).format(amount)
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 32px;
  overflow-y: auto;
  padding-right: 8px;
}

.menu-item-card {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  min-height: 380px;
  display: flex;
  flex-direction: column;
}

.menu-item-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}

.menu-item-card:active {
  transform: translateY(-4px) scale(1.01);
}

/* Item Image Container - Top 60% */
.item-image-container {
  height: 60%;
  min-height: 240px;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* Circular Image Frame */
.item-image-circle {
  width: 250px;
  height: 250px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
  position: relative;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.menu-item-card:hover .item-image {
  transform: scale(1.1);
}

.item-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(100, 116, 139, 0.1);
}

.placeholder-icon {
  width: 80px;
  height: 80px;
  color: #64748b;
  opacity: 0.5;
}

/* Item Info - Bottom 40% */
.item-info {
  flex: 1;
  padding: 24px 20px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

.item-name {
  font-size: 18px;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: 0.5px;
  line-height: 1.4;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  margin: 0;
}

.item-price {
  font-size: 28px;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
}

.availability-text {
  display: block;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.3px;
}

.availability-text.available {
  color: #d1d5db;
}

.availability-text.unavailable {
  color: #ef4444;
  font-weight: 500;
}

/* Empty State */
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
}

.empty-text {
  color: var(--text-secondary);
  font-size: var(--font-size-body);
}

/* Responsive */
@media (max-width: 1024px) {
  .menu-items-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 24px;
  }

  .item-image-circle {
    width: 200px;
    height: 200px;
  }
}

@media (max-width: 768px) {
  .menu-grid-container {
    padding: 16px;
  }

  .menu-items-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }

  .menu-item-card {
    min-height: 320px;
  }

  .item-image-container {
    min-height: 200px;
  }

  .item-image-circle {
    width: 180px;
    height: 180px;
  }

  .item-name {
    font-size: 16px;
    min-height: 44px;
  }

  .item-price {
    font-size: 24px;
  }

  .availability-text {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .menu-items-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .menu-item-card {
    max-width: 100%;
  }
}
</style>
