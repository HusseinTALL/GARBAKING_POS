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
        <!-- Item Image -->
        <div class="item-image">
          <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" />
          <div v-else class="item-placeholder">
            <UtensilsCrossed class="w-12 h-12" />
          </div>
        </div>

        <!-- Item Info -->
        <div class="item-info">
          <h4 class="item-name">{{ item.name }}</h4>
          <p class="item-price">{{ formatPrice(item.price) }}</p>
          <span v-if="item.isAvailable" class="availability-badge available">
            {{ item.stock || 0 }} Available
          </span>
          <span v-else class="availability-badge unavailable">
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
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
  overflow-y: auto;
  padding-right: 8px;
}

.menu-item-card {
  background: #1e293b;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  position: relative;
}

.menu-item-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
}

.item-image {
  width: 100%;
  height: 180px;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  padding: 20px;
}

.item-image img {
  width: 140px;
  height: 140px;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.item-placeholder {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.item-info {
  padding: 20px;
  text-align: center;
  background: #1e293b;
}

.item-name {
  font-size: 14px;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1.4;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-price {
  font-size: 24px;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 8px;
}

.availability-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.availability-badge.available {
  background: rgba(76, 175, 80, 0.15);
  color: #94a3b8;
}

.availability-badge.unavailable {
  background: rgba(244, 67, 54, 0.15);
  color: #ef4444;
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
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .menu-grid-container {
    padding: 16px;
  }

  .menu-items-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }

  .item-image {
    height: 120px;
  }
}
</style>
