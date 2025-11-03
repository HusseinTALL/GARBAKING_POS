// stores/favorites.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface FavoriteItem {
  id: string
  addedAt: Date
}

export const useFavoritesStore = defineStore('favorites', () => {
  // State
  const favorites = ref<FavoriteItem[]>([])
  const isLoading = ref(false)

  // Getters
  const favoriteIds = computed(() => favorites.value.map(f => f.id))
  
  const favoriteCount = computed(() => favorites.value.length)
  
  const isFavorite = (itemId: string): boolean => {
    return favoriteIds.value.includes(itemId)
  }

  const getFavoriteItems = computed(() => {
    // Sort by most recently added
    return [...favorites.value].sort((a, b) => 
      new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    )
  })

  // Actions
  const addFavorite = async (itemId: string) => {
    if (isFavorite(itemId)) {
      console.warn(`Item ${itemId} is already in favorites`)
      return
    }

    try {
      isLoading.value = true
      
      // Add to local state immediately (optimistic update)
      favorites.value.push({
        id: itemId,
        addedAt: new Date()
      })

      // TODO: Sync with backend API
      // await api.favorites.add(itemId)
      
      // Show success toast (optional)
      // useToast().success('Added to favorites')
    } catch (error) {
      // Rollback on error
      favorites.value = favorites.value.filter(f => f.id !== itemId)
      console.error('Failed to add favorite:', error)
      // useToast().error('Failed to add to favorites')
    } finally {
      isLoading.value = false
    }
  }

  const removeFavorite = async (itemId: string) => {
    if (!isFavorite(itemId)) {
      console.warn(`Item ${itemId} is not in favorites`)
      return
    }

    try {
      isLoading.value = true
      
      // Store for potential rollback
      const removed = favorites.value.find(f => f.id === itemId)
      
      // Remove from local state immediately (optimistic update)
      favorites.value = favorites.value.filter(f => f.id !== itemId)

      // TODO: Sync with backend API
      // await api.favorites.remove(itemId)
      
      // Show success toast (optional)
      // useToast().success('Removed from favorites')
    } catch (error) {
      // Rollback on error
      if (removed) {
        favorites.value.push(removed)
      }
      console.error('Failed to remove favorite:', error)
      // useToast().error('Failed to remove from favorites')
    } finally {
      isLoading.value = false
    }
  }

  const toggleFavorite = async (itemId: string) => {
    if (isFavorite(itemId)) {
      await removeFavorite(itemId)
    } else {
      await addFavorite(itemId)
    }
  }

  const clearFavorites = () => {
    favorites.value = []
    // TODO: Clear from backend if needed
  }

  const loadFavorites = async () => {
    try {
      isLoading.value = true
      // TODO: Load from backend API
      // const response = await api.favorites.list()
      // favorites.value = response.data
    } catch (error) {
      console.error('Failed to load favorites:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Bulk operations
  const addMultipleFavorites = async (itemIds: string[]) => {
    const newFavorites = itemIds
      .filter(id => !isFavorite(id))
      .map(id => ({
        id,
        addedAt: new Date()
      }))
    
    favorites.value.push(...newFavorites)
    
    // TODO: Sync with backend
  }

  const removeMultipleFavorites = async (itemIds: string[]) => {
    favorites.value = favorites.value.filter(f => !itemIds.includes(f.id))
    
    // TODO: Sync with backend
  }

  // Persistence (if using pinia-plugin-persistedstate)
  return {
    // State
    favorites,
    isLoading,
    
    // Getters
    favoriteIds,
    favoriteCount,
    isFavorite,
    getFavoriteItems,
    
    // Actions
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
    loadFavorites,
    addMultipleFavorites,
    removeMultipleFavorites
  }
}, {
  persist: {
    key: 'food-app-favorites',
    storage: localStorage,
    // Only persist the favorites array
    paths: ['favorites']
  }
})

/**
 * Composable wrapper for easy use in components
 */
export const useFavorites = () => {
  const store = useFavoritesStore()
  
  return {
    favorites: store.favorites,
    favoriteCount: store.favoriteCount,
    isLoading: store.isLoading,
    isFavorite: store.isFavorite,
    toggleFavorite: store.toggleFavorite,
    addFavorite: store.addFavorite,
    removeFavorite: store.removeFavorite,
    loadFavorites: store.loadFavorites
  }
}

/**
 * Usage in MenuItemCard component:
 * 
 * <script setup lang="ts">
 * import { computed } from 'vue'
 * import { useFavorites } from '@/stores/favorites'
 * 
 * const props = defineProps<{ item: MenuItem }>()
 * const { isFavorite, toggleFavorite } = useFavorites()
 * 
 * const itemIsFavorite = computed(() => isFavorite(props.item.id))
 * 
 * const handleFavoriteClick = () => {
 *   toggleFavorite(props.item.id)
 * }
 * </script>
 * 
 * <template>
 *   <button @click.stop="handleFavoriteClick">
 *     <svg :class="itemIsFavorite ? 'text-danger-500 fill-current' : 'text-gray-400'">
 *       <!-- heart icon -->
 *     </svg>
 *   </button>
 * </template>
 */