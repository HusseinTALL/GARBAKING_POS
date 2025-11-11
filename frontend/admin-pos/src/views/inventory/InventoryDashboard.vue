<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-900 text-gray-100">
    <!-- Header -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4 shadow-lg">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400">
          Inventory Dashboard
        </h1>
        <div class="flex items-center space-x-3">
          <button
            @click="refresh"
            :disabled="isLoading"
            class="p-2 rounded-lg bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white transition-all duration-300 disabled:opacity-50"
          >
            <RotateCw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <!-- Summary Cards -->
      <div v-if="dashboard" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <!-- Total Items -->
        <div class="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6 border border-blue-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-400 text-sm font-medium mb-1">Total Items</p>
              <p class="text-3xl font-bold text-blue-400">{{ dashboard.totalItems }}</p>
              <p class="text-xs text-blue-300 mt-1">Active inventory items</p>
            </div>
            <Package class="w-12 h-12 text-blue-400 opacity-50" />
          </div>
        </div>

        <!-- Low Stock Items -->
        <div class="bg-gradient-to-br from-red-900 to-red-800 rounded-lg p-6 border border-red-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-red-400 text-sm font-medium mb-1">Low Stock</p>
              <p class="text-3xl font-bold text-red-400">{{ dashboard.lowStockItems }}</p>
              <p class="text-xs text-red-300 mt-1">Items need reorder</p>
            </div>
            <AlertTriangle class="w-12 h-12 text-red-400 opacity-50" />
          </div>
        </div>

        <!-- Total Stock Value -->
        <div class="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-6 border border-green-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-400 text-sm font-medium mb-1">Stock Value</p>
              <p class="text-3xl font-bold text-green-400">${{ dashboard.totalStockValue?.toFixed(2) || '0.00' }}</p>
              <p class="text-xs text-green-300 mt-1">Current inventory value</p>
            </div>
            <DollarSign class="w-12 h-12 text-green-400 opacity-50" />
          </div>
        </div>

        <!-- Total Locations -->
        <div class="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-6 border border-purple-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-400 text-sm font-medium mb-1">Locations</p>
              <p class="text-3xl font-bold text-purple-400">{{ dashboard.totalLocations }}</p>
              <p class="text-xs text-purple-300 mt-1">Storage locations</p>
            </div>
            <MapPin class="w-12 h-12 text-purple-400 opacity-50" />
          </div>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Low Stock Alerts -->
        <div class="bg-gray-800 rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-white flex items-center gap-2">
              <AlertTriangle class="w-5 h-5 text-red-400" />
              Low Stock Alerts
            </h3>
            <router-link
              to="/inventory/items?filter=low-stock"
              class="text-sm text-blue-400 hover:text-blue-300"
            >
              View All
            </router-link>
          </div>

          <div v-if="dashboard && dashboard.lowStockAlerts && dashboard.lowStockAlerts.length > 0" class="space-y-3">
            <div
              v-for="stock in dashboard.lowStockAlerts"
              :key="stock.id"
              class="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <p class="text-white font-medium">{{ stock.itemName }}</p>
                  <p class="text-sm text-gray-400">SKU: {{ stock.itemSku }} • {{ stock.locationName }}</p>
                </div>
                <div class="text-right">
                  <p class="text-red-400 font-bold">{{ stock.quantityOnHand }} {{ stock.unit }}</p>
                  <p class="text-xs text-gray-400">Reorder: {{ stock.reorderPoint }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8">
            <CheckCircle class="w-12 h-12 mx-auto text-green-600 mb-3" />
            <p class="text-gray-400">No low stock items</p>
          </div>
        </div>

        <!-- Recent Updates -->
        <div class="bg-gray-800 rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-white flex items-center gap-2">
              <Clock class="w-5 h-5 text-blue-400" />
              Recent Updates
            </h3>
          </div>

          <div v-if="dashboard && dashboard.recentUpdates && dashboard.recentUpdates.length > 0" class="space-y-3">
            <div
              v-for="stock in dashboard.recentUpdates"
              :key="stock.id"
              class="bg-gray-700 rounded-lg p-4"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <p class="text-white font-medium">{{ stock.itemName }}</p>
                  <p class="text-sm text-gray-400">{{ stock.locationName }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ formatDateTime(stock.lastUpdated) }}</p>
                </div>
                <div class="text-right">
                  <p class="text-white font-bold">{{ stock.quantityOnHand }} {{ stock.unit }}</p>
                  <p class="text-xs text-gray-400">Available: {{ stock.quantityAvailable }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8">
            <p class="text-gray-400">No recent updates</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-6 bg-gray-800 rounded-lg p-6">
        <h3 class="text-xl font-bold text-white mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <router-link
            to="/inventory/items?action=add"
            class="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 text-center transition-colors"
          >
            <Plus class="w-8 h-8 mx-auto mb-2" />
            <p class="font-medium">Add Item</p>
          </router-link>
          <router-link
            to="/inventory/items"
            class="bg-green-600 hover:bg-green-700 text-white rounded-lg p-4 text-center transition-colors"
          >
            <List class="w-8 h-8 mx-auto mb-2" />
            <p class="font-medium">View Items</p>
          </router-link>
          <router-link
            to="/inventory/purchase-orders"
            class="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-4 text-center transition-colors"
          >
            <ShoppingCart class="w-8 h-8 mx-auto mb-2" />
            <p class="font-medium">Purchase Orders</p>
          </router-link>
          <router-link
            to="/inventory/stock-adjustment"
            class="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-4 text-center transition-colors"
          >
            <RefreshCcw class="w-8 h-8 mx-auto mb-2" />
            <p class="font-medium">Adjust Stock</p>
          </router-link>
          <router-link
            to="/suppliers"
            class="bg-orange-600 hover:bg-orange-700 text-white rounded-lg p-4 text-center transition-colors"
          >
            <Truck class="w-8 h-8 mx-auto mb-2" />
            <p class="font-medium">Vendors</p>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  RotateCw, Package, AlertTriangle, DollarSign, MapPin,
  CheckCircle, Clock, Plus, List, RefreshCcw, Truck, ShoppingCart
} from 'lucide-vue-next'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

// State
const dashboard = ref<any>(null)
const isLoading = ref(false)

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080'

// Methods
const loadDashboard = async () => {
  isLoading.value = true
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/inventory/dashboard`)
    dashboard.value = response.data
  } catch (error: any) {
    console.error('Failed to load dashboard:', error)
    toast.error('Failed to load inventory dashboard')
  } finally {
    isLoading.value = false
  }
}

const refresh = () => {
  loadDashboard()
  toast.success('Dashboard refreshed')
}

const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  loadDashboard()
})
</script>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1f2937;
}

::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
