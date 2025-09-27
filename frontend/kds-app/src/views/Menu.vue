<!-- 
  Menu management view for adding, editing, and organizing menu items and categories
  Provides comprehensive CRUD operations with real-time updates -->

<template>
  <div class="h-full flex flex-col bg-gray-900 text-gray-100">
    <!-- Header -->
    <div class="flex-shrink-0 p-6 border-b border-gray-700 bg-gray-800 shadow">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Menu Management</h1>
          <p class="text-sm text-gray-400 mt-1">
            Manage your restaurant's menu categories and items
          </p>
        </div>
        <div class="flex gap-3">
          <button @click="showCategoryModal = true" class="btn btn-secondary">
            <Plus class="w-4 h-4 mr-2" />
            Add Category
          </button>
          <button @click="showItemModal = true" class="btn btn-primary">
            <Plus class="w-4 h-4 mr-2" />
            Add Item
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1 flex overflow-hidden">
      <!-- Categories Sidebar -->
      <div class="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div class="p-4 border-b border-gray-700">
          <h2 class="font-semibold text-white">Categories</h2>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-2">
          <!-- All Items -->
          <button
            @click="menuStore.setSelectedCategory(null)"
            :class="[
              'w-full text-left p-3 rounded-lg transition-colors border',
              !menuStore.selectedCategory
                ? 'bg-blue-900 text-blue-400 border-blue-600'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600'
            ]"
          >
            <div class="flex items-center justify-between">
              <span class="font-medium">All Items</span>
              <span class="text-sm text-gray-400">{{ menuStore.menuItems.length }}</span>
            </div>
          </button>

          <!-- Category List -->
          <div
            v-for="category in menuStore.categoriesWithCounts"
            :key="category.id"
            class="group"
          >
            <button
              @click="menuStore.setSelectedCategory(category.id)"
              :class="[
                'w-full text-left p-3 rounded-lg border performance-optimized',
                menuStore.selectedCategory === category.id
                  ? 'bg-blue-900 text-blue-400 border-blue-600'
                  : 'bg-gray-700 text-gray-300 border-gray-600'
              ]"
              style="transition: background-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94); transform: translate3d(0, 0, 0); will-change: transform, background-color;"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                  <h3 class="font-medium truncate">{{ category.name }}</h3>
                  <p class="text-sm text-gray-500 truncate">{{ category.description }}</p>
                </div>
                <div class="flex items-center gap-2 ml-2">
                  <span class="text-sm text-gray-400">{{ category.itemCount }}</span>
                  <div class="opacity-0 group-hover:opacity-100 performance-optimized"
                       style="transition: opacity 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change: opacity;">
                    <button
                      @click.stop="editCategory(category)"
                      class="p-1 rounded interactive-fast"
                    >
                      <Edit class="w-3 h-3 text-gray-300" />
                    </button>
                  </div>
                </div>
              </div>
            </button>
          </div>

          <!-- Loading state -->
          <div v-if="menuStore.loading" class="text-center py-4">
            <div
              class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"
            ></div>
          </div>
        </div>
      </div>

      <!-- Menu Items Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Filters and Search -->
        <div class="p-4 border-b border-gray-700 bg-gray-800">
          <div class="flex items-center gap-4">
            <div class="flex-1">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search menu items..."
                class="input w-full"
              />
            </div>
            <select v-model="sortBy" class="input">
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="category">Sort by Category</option>
              <option value="created">Sort by Created Date</option>
            </select>
            <button
              @click="refreshMenu"
              class="btn btn-secondary"
              :disabled="menuStore.loading"
            >
              <RotateCcw class="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        <!-- Menu Items Grid -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Empty state -->
          <div
            v-if="filteredAndSortedItems.length === 0"
            class="text-center py-12"
          >
            <Utensils class="w-20 h-20 text-gray-600 mb-4" />
            <h3 class="text-lg font-medium text-gray-200 mb-2">
              No menu items found
            </h3>
            <p class="text-gray-400 mb-4">
              {{
                searchQuery
                  ? "Try adjusting your search criteria"
                  : "Start by adding your first menu item"
              }}
            </p>
            <button
              v-if="!searchQuery"
              @click="showItemModal = true"
              class="btn btn-primary"
            >
              <Plus class="w-4 h-4 mr-2" />
              Add First Item
            </button>
          </div>

          <!-- Items -->
          <div
            v-else
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <div
              v-for="item in filteredAndSortedItems"
              :key="item.id"
              class="bg-gray-800 rounded-xl border border-gray-700 shadow card-hover performance-optimized"
            >
              <!-- Item Image -->
              <div
                class="aspect-video bg-gray-700 rounded-t-xl overflow-hidden"
              >
                <img
                  v-if="item.imageUrl"
                  :src="item.imageUrl"
                  :alt="item.name"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center"
                >
                  <Utensils class="w-12 h-12 text-gray-500" />
                </div>
              </div>

              <!-- Item Details -->
              <div class="p-4">
                <div class="flex items-start justify-between mb-2">
                  <h3 class="font-semibold text-white truncate">
                    {{ item.name }}
                  </h3>
                  <div class="flex items-center gap-1 ml-2">
                    <!-- Availability Toggle -->
                    <button
                      @click="toggleAvailability(item)"
                      :class="[
                        'w-5 h-5 rounded-full border-2 interactive-fast',
                        item.isAvailable
                          ? 'bg-green-500 border-green-500'
                          : 'bg-gray-600 border-gray-600'
                      ]"
                      style="transition: background-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change: background-color, border-color;"
                    >
                      <Check
                        v-if="item.isAvailable"
                        class="w-3 h-3 text-white"
                      />
                    </button>
                  </div>
                </div>

                <p class="text-sm text-gray-400 mb-3 line-clamp-2">
                  {{ item.description }}
                </p>

                <div class="flex items-center justify-between mb-3">
                  <div class="text-lg font-bold text-green-400">
                    {{ formatCurrency(item.price) }}
                  </div>
                  <div class="text-xs text-gray-500">SKU: {{ item.sku }}</div>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-400">
                    {{ getCategoryName(item.categoryId) }}
                  </span>
                  <div class="flex gap-1">
                    <button
                      @click="editItem(item)"
                      class="p-2 text-gray-400 interactive-fast"
                      style="transition: color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change: color;"
                    >
                      <Edit class="w-3 h-3" />
                    </button>
                    <button
                      @click="confirmDeleteItem(item)"
                      class="p-2 text-gray-400 interactive-fast"
                      style="transition: color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change: color;"
                    >
                      <Trash2 class="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mock Modals -->
    <div
      v-if="showCategoryModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center"
    >
      <div class="bg-gray-800 p-6 rounded-xl w-96">
        <h2 class="text-lg font-bold text-white mb-4">Category Modal</h2>
        <button
          class="btn btn-secondary w-full"
          @click="showCategoryModal = false"
        >
          Close
        </button>
      </div>
    </div>

    <div
      v-if="showItemModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center"
    >
      <div class="bg-gray-800 p-6 rounded-xl w-96">
        <h2 class="text-lg font-bold text-white mb-4">Item Modal</h2>
        <button class="btn btn-secondary w-full" @click="showItemModal = false">
          Close
        </button>
      </div>
    </div>

    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center"
    >
      <div class="bg-gray-800 p-6 rounded-xl w-96">
        <h2 class="text-lg font-bold text-white mb-4">{{ deleteConfirmTitle }}</h2>
        <p class="text-gray-300 mb-4">{{ deleteConfirmMessage }}</p>
        <div class="flex gap-2">
          <button class="btn btn-secondary flex-1" @click="showDeleteConfirm = false">
            Cancel
          </button>
          <button class="btn btn-primary flex-1" @click="handleDeleteConfirm">
            Confirm
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Plus, RotateCcw, Utensils, Check, Edit, Trash2 } from "lucide-vue-next";

/** 🔹 Mock Menu Store (replace with Pinia later if needed) */
const menuStore = {
  loading: false,
  selectedCategory: null as string | null,
  categories: ref([
    { id: "c1", name: "Drinks", description: "Beverages", itemCount: 2 },
    { id: "c2", name: "Food", description: "Main dishes", itemCount: 2 },
  ]),
  menuItems: ref([
    {
      id: "i1",
      name: "Coke",
      description: "Chilled soft drink",
      price: 2.5,
      sku: "DR001",
      categoryId: "c1",
      isAvailable: true,
      imageUrl: "",
      createdAt: "2025-01-01",
    },
    {
      id: "i2",
      name: "Burger",
      description: "Juicy beef burger",
      price: 8,
      sku: "FD001",
      categoryId: "c2",
      isAvailable: true,
      imageUrl: "",
      createdAt: "2025-01-02",
    },
  ]),
  setSelectedCategory(id: string | null) {
    this.selectedCategory = id;
  },
  get categoriesWithCounts() {
    return this.categories.value.map((c) => ({
      ...c,
      itemCount: this.menuItems.value.filter((i) => i.categoryId === c.id).length,
    }));
  },
  categoriesForSelect: computed(() =>
    menuStore.categories.value.map((c) => ({ label: c.name, value: c.id }))
  ),
  fetchMenu() {
    console.log("Fetching menu...");
  },
  addCategory(c) {
    this.categories.value.push(c);
  },
  updateCategory(c) {
    const idx = this.categories.value.findIndex((x) => x.id === c.id);
    if (idx > -1) this.categories.value[idx] = c;
  },
  addItem(i) {
    this.menuItems.value.push(i);
  },
  updateItem(i) {
    const idx = this.menuItems.value.findIndex((x) => x.id === i.id);
    if (idx > -1) this.menuItems.value[idx] = i;
  },
  deleteItem(id) {
    this.menuItems.value = this.menuItems.value.filter((i) => i.id !== id);
  },
};

// State
const showCategoryModal = ref(false);
const showItemModal = ref(false);
const showDeleteConfirm = ref(false);

const editingCategory = ref(null);
const editingItem = ref(null);
const deletingItem = ref(null);

const searchQuery = ref("");
const sortBy = ref("name");

// Filtering + Sorting
const filteredAndSortedItems = computed(() => {
  let items = menuStore.menuItems.value;

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    items = items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q) ||
        i.sku?.toLowerCase().includes(q)
    );
  }

  return [...items].sort((a, b) => {
    switch (sortBy.value) {
      case "price":
        return a.price - b.price;
      case "category":
        return a.categoryId.localeCompare(b.categoryId);
      case "created":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      default:
        return a.name.localeCompare(b.name);
    }
  });
});

// Methods
function refreshMenu() {
  menuStore.fetchMenu();
}
function toggleAvailability(item) {
  item.isAvailable = !item.isAvailable;
  menuStore.updateItem(item);
}
function editCategory(category) {
  editingCategory.value = category;
  showCategoryModal.value = true;
}
function editItem(item) {
  editingItem.value = item;
  showItemModal.value = true;
}
function confirmDeleteItem(item) {
  deletingItem.value = item;
  showDeleteConfirm.value = true;
}
function handleDeleteConfirm() {
  if (deletingItem.value) {
    menuStore.deleteItem(deletingItem.value.id);
  }
  showDeleteConfirm.value = false;
  deletingItem.value = null;
}
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
function getCategoryName(categoryId) {
  const category = menuStore.categories.value.find((c) => c.id === categoryId);
  return category ? category.name : "Uncategorized";
}

const deleteConfirmTitle = "Delete Item";
const deleteConfirmMessage = "Are you sure you want to delete this menu item?";
</script>

<style scoped>
.btn {
  @apply inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2;
}
.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-500;
}
.btn-secondary {
  @apply bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-gray-500;
}
.input {
  @apply block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
