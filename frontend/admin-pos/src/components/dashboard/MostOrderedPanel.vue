<!--
  MostOrderedPanel Component
  Displays the top 3 most ordered dishes with images and order counts
-->
<template>
  <div class="most-ordered-panel">
    <div class="panel-header">
      <h3 class="panel-title">Most Ordered</h3>
      <button class="view-all-btn">View All</button>
    </div>

    <div class="dishes-list">
      <div v-for="(dish, index) in dishes" :key="dish.id" class="dish-card">
        <!-- Rank Badge -->
        <div class="rank-badge" :class="`rank-${index + 1}`">
          #{{ index + 1 }}
        </div>

        <!-- Dish Image -->
        <div class="dish-image">
          <img v-if="dish.image" :src="dish.image" :alt="dish.name" />
          <div v-else class="dish-placeholder">
            <UtensilsCrossed class="w-8 h-8" />
          </div>
        </div>

        <!-- Dish Info -->
        <div class="dish-info">
          <h4 class="dish-name">{{ dish.name }}</h4>
          <p class="dish-stats">
            <span class="dish-count">{{ dish.count }} orders</span>
            <span class="dish-separator">•</span>
            <span class="dish-revenue">{{ formatPrice(dish.revenue) }}</span>
          </p>
        </div>

        <!-- Trend Indicator -->
        <div class="dish-trend">
          <TrendingUp v-if="dish.trending === 'up'" class="w-5 h-5 text-green-400" />
          <TrendingDown v-else-if="dish.trending === 'down'" class="w-5 h-5 text-red-400" />
          <Minus v-else class="w-5 h-5 text-gray-400" />
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="dishes.length === 0" class="empty-state">
        <UtensilsCrossed class="w-12 h-12 text-gray-600" />
        <p class="empty-text">No orders yet</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrendingUp, TrendingDown, Minus, UtensilsCrossed } from 'lucide-vue-next'

interface Dish {
  id: number
  name: string
  image?: string
  count: number
  revenue: number
  trending?: 'up' | 'down' | 'stable'
}

interface Props {
  dishes: Dish[]
}

defineProps<Props>()

const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}
</script>

<style scoped>
.most-ordered-panel {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  padding: 24px;
  height: 100%;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.panel-title {
  font-size: var(--font-size-h3);
  font-weight: 600;
  color: var(--text-primary);
}

.view-all-btn {
  font-size: var(--font-size-small);
  color: var(--accent-orange);
  background: transparent;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s;
}

.view-all-btn:hover {
  color: #FF8C5A;
}

.dishes-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dish-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  transition: all 0.3s;
  position: relative;
}

.dish-card:hover {
  border-color: rgba(255, 107, 53, 0.3);
  background: rgba(26, 26, 46, 0.8);
  transform: translateX(4px);
}

.rank-badge {
  position: absolute;
  top: -8px;
  left: -8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.rank-1 {
  background: linear-gradient(135deg, #FFD700, #FFA500);
}

.rank-2 {
  background: linear-gradient(135deg, #C0C0C0, #808080);
}

.rank-3 {
  background: linear-gradient(135deg, #CD7F32, #8B4513);
}

.dish-image {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dish-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dish-placeholder {
  color: var(--text-tertiary);
}

.dish-info {
  flex: 1;
  min-width: 0;
}

.dish-name {
  font-size: var(--font-size-body);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dish-stats {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
}

.dish-count {
  font-weight: 500;
}

.dish-separator {
  color: var(--text-tertiary);
}

.dish-revenue {
  color: var(--accent-green);
  font-weight: 600;
}

.dish-trend {
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 12px;
}

.empty-text {
  color: var(--text-secondary);
  font-size: var(--font-size-body);
}

/* Responsive */
@media (max-width: 768px) {
  .most-ordered-panel {
    padding: 16px;
  }

  .dish-image {
    width: 50px;
    height: 50px;
  }

  .rank-badge {
    width: 24px;
    height: 24px;
    font-size: 11px;
  }
}
</style>
