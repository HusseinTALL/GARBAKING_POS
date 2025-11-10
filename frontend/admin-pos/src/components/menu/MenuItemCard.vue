<!--
  MenuItemCard.vue
  Display card for menu items with image, details, availability status,
  and action buttons for edit and delete operations.
-->
<template>
  <div class="menu-item-card" :class="{ 'card-unavailable': !item.isAvailable }">
    <!-- Item Image -->
    <div class="item-image-container">
      <img
        v-if="item.imageUrl"
        :src="item.imageUrl"
        :alt="item.name"
        class="item-image"
      />
      <div v-else class="item-placeholder">
        <UtensilsCrossed class="w-12 h-12" />
      </div>

      <!-- Badges -->
      <div class="item-badges">
        <span v-if="item.isFeatured" class="badge badge-featured">
          <Star class="w-3 h-3" />
          Featured
        </span>
        <span v-if="item.isSpicy" class="badge badge-spicy">
          <Flame class="w-3 h-3" />
        </span>
        <span v-if="item.isVegetarian" class="badge badge-veg">
          <Leaf class="w-3 h-3" />
        </span>
      </div>

      <!-- Availability Overlay -->
      <div v-if="!item.isAvailable" class="unavailable-overlay">
        <span>Unavailable</span>
      </div>
    </div>

    <!-- Item Details -->
    <div class="item-content">
      <div class="item-header">
        <h3 class="item-name">{{ item.name }}</h3>
        <p class="item-category">{{ getCategoryName(item.categoryId) }}</p>
      </div>

      <p v-if="item.description" class="item-description">
        {{ truncateText(item.description, 80) }}
      </p>

      <div class="item-meta">
        <div class="meta-item">
          <Clock class="w-4 h-4" />
          <span>{{ item.prepTime || 15 }} min</span>
        </div>
        <div class="meta-item">
          <Package class="w-4 h-4" />
          <span>{{ item.stock || 0 }} left</span>
        </div>
      </div>

      <div class="item-footer">
        <div class="item-price">
          {{ formatPrice(item.price) }}
        </div>

        <div class="item-actions">
          <button
            @click="$emit('edit', item)"
            class="action-btn btn-edit"
            title="Edit"
          >
            <Edit2 class="w-4 h-4" />
          </button>
          <button
            @click="$emit('delete', item)"
            class="action-btn btn-delete"
            title="Delete"
          >
            <Trash2 class="w-4 h-4" />
          </button>
          <button
            @click="$emit('toggle-availability', item)"
            class="action-btn btn-toggle"
            :title="item.isAvailable ? 'Mark Unavailable' : 'Mark Available'"
          >
            <EyeOff v-if="item.isAvailable" class="w-4 h-4" />
            <Eye v-else class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  UtensilsCrossed,
  Star,
  Flame,
  Leaf,
  Clock,
  Package,
  Edit2,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-vue-next'
import { useMenuStore } from '@/stores/menu'

interface MenuItem {
  id: number
  name: string
  description?: string
  price: number
  categoryId: number | string
  imageUrl?: string
  stock?: number
  prepTime?: number
  isAvailable: boolean
  isFeatured: boolean
  isSpicy: boolean
  isVegetarian: boolean
}

interface Props {
  item: MenuItem
}

defineProps<Props>()
defineEmits(['edit', 'delete', 'toggle-availability'])

const menuStore = useMenuStore()

const getCategoryName = (categoryId: number | string): string => {
  const category = menuStore.categories?.find(c => c.id === categoryId)
  return category?.name || 'Uncategorized'
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(price)
}

const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>

<style scoped>
.menu-item-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.menu-item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  border-color: var(--accent-orange);
}

.card-unavailable {
  opacity: 0.7;
}

.item-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: var(--bg-tertiary);
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.menu-item-card:hover .item-image {
  transform: scale(1.05);
}

.item-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
}

.item-badges {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
}

.badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  backdrop-filter: blur(8px);
}

.badge-featured {
  background: rgba(255, 193, 7, 0.9);
  color: #000;
}

.badge-spicy {
  background: rgba(244, 67, 54, 0.9);
  color: white;
}

.badge-veg {
  background: rgba(76, 175, 80, 0.9);
  color: white;
}

.unavailable-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.unavailable-overlay span {
  background: var(--accent-red);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
}

.item-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.item-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
}

.item-category {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.item-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.item-meta {
  display: flex;
  gap: 1rem;
  padding: 0.75rem 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.meta-item .w-4 {
  color: var(--text-tertiary);
}

.item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.item-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--accent-orange);
}

.item-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  transform: scale(1.05);
}

.btn-edit:hover {
  background: var(--accent-orange);
  border-color: var(--accent-orange);
  color: white;
}

.btn-delete:hover {
  background: var(--accent-red);
  border-color: var(--accent-red);
  color: white;
}

.btn-toggle:hover {
  background: var(--accent-green);
  border-color: var(--accent-green);
  color: white;
}

@media (max-width: 768px) {
  .item-image-container {
    height: 180px;
  }

  .item-content {
    padding: 0.875rem;
  }

  .item-name {
    font-size: 1rem;
  }

  .item-price {
    font-size: 1.125rem;
  }
}
</style>
