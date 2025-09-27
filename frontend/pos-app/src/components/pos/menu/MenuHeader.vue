<!--
  Menu Header Component
  Search box, view toggle buttons, and menu title with item count
-->
<template>
  <div class="menu-header">
    <h2 class="menu-title">Menu Items ({{ itemCount }})</h2>

    <div class="menu-controls">
      <!-- Search -->
      <div class="search-box">
        <Search class="search-icon" />
        <input
          :value="searchQuery"
          @input="$emit('searchChange', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Search menu..."
          class="search-input"
        />
      </div>

      <!-- View Toggle -->
      <div class="view-toggle">
        <button
          @click="$emit('viewModeChange', 'grid')"
          :class="['view-btn', { active: viewMode === 'grid' }]"
        >
          <Grid3x3 class="w-4 h-4" />
        </button>
        <button
          @click="$emit('viewModeChange', 'list')"
          :class="['view-btn', { active: viewMode === 'list' }]"
        >
          <List class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, Grid3x3, List } from 'lucide-vue-next'

interface Props {
  itemCount: number
  searchQuery: string
  viewMode: 'grid' | 'list'
}

defineProps<Props>()

defineEmits<{
  searchChange: [query: string]
  viewModeChange: [mode: 'grid' | 'list']
}>()
</script>

<style scoped>
.menu-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.menu-controls {
  display: flex;
  gap: 12px;
}

.search-box {
  position: relative;
  width: 240px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #6b7280;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #5b63d3;
}

.view-toggle {
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
}

.view-btn {
  padding: 6px 10px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: background-color 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: background-color;
  transform: translate3d(0, 0, 0);
}

.view-btn.active {
  background: white;
  color: #5b63d3;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .menu-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .menu-controls {
    width: 100%;
    flex-direction: column;
  }

  .search-box {
    width: 100%;
  }
}
</style>