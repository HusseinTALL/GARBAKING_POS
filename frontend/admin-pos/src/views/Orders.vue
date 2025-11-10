<!--
  Order management dashboard for POS staff with light theme design
  Real-time order tracking, status updates, and comprehensive order management
-->

<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-900 text-gray-100">
    <!-- Header -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4 shadow">
      <div class="flex items-center justify-between">
        <!-- Left side -->
        <div class="flex items-center space-x-4">
          <h1 class="text-2xl font-bold text-white">Order Management</h1>
          <div class="flex items-center space-x-2">
            <div :class="[
              'w-3 h-3 rounded-full',
              ordersStore.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            ]"></div>
            <span class="text-sm text-gray-400">
              {{ ordersStore.isConnected ? 'Real-time' : 'Offline' }}
            </span>
          </div>
        </div>

        <!-- Right side -->
        <div class="flex items-center space-x-3">
          <!-- Export -->
          <button
            @click="exportOrders"
            class="p-2 rounded-lg bg-gray-700 text-gray-300 interactive-fast"
            title="Export orders to CSV"
            style="transition: background-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change: background-color;"
          >
            <Download class="w-4 h-4" />
          </button>

          <!-- Refresh -->
          <button
            @click="refreshOrders"
            :disabled="ordersStore.isLoading"
            class="p-2 rounded-lg bg-gray-700 text-gray-300 disabled:opacity-50 interactive-fast"
            title="Refresh orders"
            style="transition: background-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change: background-color;"
          >
            <RefreshCw :class="{ 'animate-spin': ordersStore.isLoading }" class="w-4 h-4" />
          </button>

          <!-- Sound toggle -->
          <button
            @click="toggleSound"
            :class="[
              'p-2 rounded-lg interactive-fast',
              soundEnabled
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300'
            ]"
            title="Sound notifications"
            style="transition: background-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change: background-color;"
          >
            <Volume2 v-if="soundEnabled" class="w-4 h-4" />
            <VolumeX v-else class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div class="grid grid-cols-6 gap-4">
        <div
          v-for="stat in orderStats"
          :key="stat.label"
          class="bg-gray-900 rounded-lg p-4 text-center border border-gray-700 shadow performance-optimized"
          style="transition: border-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94); transform: translate3d(0, 0, 0); will-change: border-color, transform;"
        >
          <div :class="['text-2xl font-bold', stat.color]">
            {{ stat.value }}
          </div>
          <div class="text-sm text-gray-400 mt-1">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6">
      <div class="flex items-center justify-between py-3">
        <!-- Filter Tabs -->
        <div class="flex space-x-1">
          <button
            v-for="filter in orderFilters"
            :key="filter.status"
            @click="setActiveFilter(filter.status)"
            :class="[
              'px-4 py-2 font-medium text-sm border-b-2 interactive-fast',
              activeFilter === filter.status
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400'
            ]"
            style="transition: border-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94), color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change: border-color, color;"
          >
            {{ filter.label }}
            <span v-if="filter.count > 0" :class="[
              'ml-2 px-2 py-1 rounded-full text-xs font-bold',
              activeFilter === filter.status
                ? 'bg-blue-900 text-blue-400'
                : 'bg-gray-700 text-gray-300'
            ]">
              {{ filter.count }}
            </span>
          </button>
        </div>

        <!-- Advanced Filter Toggle -->
        <button
          @click="showAdvancedFilters = !showAdvancedFilters"
          class="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm font-medium interactive-fast flex items-center space-x-2"
        >
          <Filter class="w-4 h-4" />
          <span>Filters</span>
          <ChevronDown :class="['w-4 h-4 transition-transform', showAdvancedFilters && 'rotate-180']" />
        </button>
      </div>
    </div>

    <!-- Search and Advanced Filters -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4">
      <!-- Search Bar -->
      <div class="flex items-center space-x-3 mb-3">
        <div class="flex-1 relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by order number or customer name..."
            class="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Batch Actions -->
        <div v-if="selectedOrders.length > 0" class="flex items-center space-x-2 bg-blue-900 px-4 py-2 rounded-lg">
          <span class="text-sm font-medium text-blue-200">
            {{ selectedOrders.length }} selected
          </span>
          <button
            @click="batchUpdateStatus('CONFIRMED')"
            class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Confirm All
          </button>
          <button
            @click="batchUpdateStatus('CANCELLED')"
            class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Cancel All
          </button>
          <button
            @click="batchPrint"
            class="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
          >
            Print All
          </button>
          <button
            @click="clearSelection"
            class="p-1 text-gray-300 hover:text-white"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Advanced Filters Panel -->
      <div v-if="showAdvancedFilters" class="grid grid-cols-4 gap-3 pt-3 border-t border-gray-700">
        <!-- Date Range -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Date Range</label>
          <select
            v-model="advancedFilters.dateRange"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <!-- Payment Method -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Payment Method</label>
          <select
            v-model="advancedFilters.paymentMethod"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">All Methods</option>
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
            <option value="MOBILE_MONEY">Mobile Money</option>
          </select>
        </div>

        <!-- Order Type -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Order Type</label>
          <select
            v-model="advancedFilters.orderType"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="DINE_IN">Dine In</option>
            <option value="TAKEOUT">Takeout</option>
            <option value="DELIVERY">Delivery</option>
          </select>
        </div>

        <!-- Sort By -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Sort By</label>
          <select
            v-model="advancedFilters.sortBy"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount-high">Highest Amount</option>
            <option value="amount-low">Lowest Amount</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Orders Grid -->
    <div class="flex-1 overflow-auto p-6">
      <!-- Loading -->
      <div v-if="ordersStore.isLoading && ordersStore.orders.length === 0" class="flex items-center justify-center h-64">
        <div class="text-center">
          <Loader2 class="animate-spin text-3xl text-gray-500 mb-4 w-8 h-8" />
          <p class="text-gray-400">Loading orders...</p>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredOrders.length === 0" class="flex items-center justify-center h-64">
        <div class="text-center">
          <Inbox class="text-4xl text-gray-600 mb-4 w-16 h-16" />
          <h3 class="text-lg font-semibold text-gray-200 mb-2">No Orders</h3>
          <p class="text-gray-400">
            {{ activeFilter === 'ALL' ? 'No orders available' : `No ${getFilterLabel(activeFilter).toLowerCase()} orders` }}
          </p>
        </div>
      </div>

      <!-- Orders List -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          :class="[
            'bg-gray-800 rounded-lg border shadow p-6 cursor-pointer card-hover performance-optimized relative',
            isOrderSelected(order.id) ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-700'
          ]"
          @click="handleViewDetails(order)"
        >
          <!-- Selection Checkbox -->
          <div
            class="absolute top-4 left-4 z-10"
            @click.stop
          >
            <input
              type="checkbox"
              :checked="isOrderSelected(order.id)"
              @change="toggleOrderSelection(order.id)"
              class="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
            />
          </div>

          <!-- Header -->
          <div class="flex items-center justify-between mb-4 ml-8">
            <div>
              <h3 class="text-lg font-semibold text-gray-200">#{{ order.orderNumber }}</h3>
              <p class="text-sm text-gray-400">{{ order.customerName || 'Walk-in Customer' }}</p>
            </div>
            <div :class="getStatusBadgeClass(order.status)" class="px-3 py-1 rounded-full text-sm font-medium">
              {{ getStatusLabel(order.status) }}
            </div>
          </div>

          <!-- Items -->
          <div class="space-y-2 mb-4">
            <div
              v-for="item in order.items.slice(0, 2)"
              :key="item.id"
              class="flex justify-between text-sm"
            >
              <span class="text-gray-300">{{ item.quantity }}x {{ item.name }}</span>
              <span class="text-gray-100 font-medium">{{ formatPrice(item.totalPrice) }}</span>
            </div>
            <div v-if="order.items.length > 2" class="text-sm text-gray-500">
              +{{ order.items.length - 2 }} more items
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-700">
            <div class="text-sm text-gray-400">
              {{ formatTime(order.createdAt) }}
              <span v-if="order.tableNumber"> • Table {{ order.tableNumber }}</span>
            </div>
            <div class="text-lg font-bold text-gray-100">
              {{ formatPrice(order.total) }}
            </div>
          </div>

          <!-- Actions -->
          <div class="flex space-x-2 mt-4" @click.stop>
            <button
              v-if="canUpdateStatus(order.status, 'CONFIRMED')"
              @click="handleStatusChange(order.id, 'CONFIRMED')"
              class="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium interactive-fast"
              style="transition: background-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change: background-color;"
            >
              Confirm
            </button>
            <button
              v-if="canUpdateStatus(order.status, 'PREPARING')"
              @click="handleStatusChange(order.id, 'PREPARING')"
              class="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium interactive-fast"
              style="transition: background-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change: background-color;"
            >
              Start Prep
            </button>
            <button
              v-if="canUpdateStatus(order.status, 'READY')"
              @click="handleStatusChange(order.id, 'READY')"
              class="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium interactive-fast"
              style="transition: background-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change: background-color;"
            >
              Mark Ready
            </button>
            <button
              v-if="canUpdateStatus(order.status, 'SERVED')"
              @click="handleStatusChange(order.id, 'SERVED')"
              class="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium interactive-fast"
              style="transition: background-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change: background-color;"
            >
              Serve
            </button>
            <button
              @click="handlePrintReceipt(order)"
              class="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm font-medium interactive-fast"
              title="Print Receipt"
              style="transition: background-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change: background-color;"
            >
              <Printer class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toasts -->
    <div class="fixed top-4 right-4 z-40 space-y-2">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'bg-gray-800 rounded-lg shadow-lg border-l-4 p-4 min-w-80 animate-slide-in border border-gray-700',
          notification.type === 'success' ? 'border-l-green-500' :
          notification.type === 'warning' ? 'border-l-yellow-500' :
          notification.type === 'error' ? 'border-l-red-500' : 'border-l-blue-500'
        ]"
      >
        <div class="flex items-start">
          <component
            :is="getNotificationIcon(notification.type)"
            :class="[
              'mt-1 mr-3 w-4 h-4',
              notification.type === 'success' ? 'text-green-400' :
              notification.type === 'warning' ? 'text-yellow-400' :
              notification.type === 'error' ? 'text-red-400' : 'text-blue-400'
            ]"
          />
          <div class="flex-1">
            <h4 class="font-medium text-gray-200">{{ notification.title }}</h4>
            <p class="text-sm text-gray-400 mt-1">{{ notification.message }}</p>
          </div>
          <button
            @click="removeNotification(notification.id)"
            class="ml-2 text-gray-500 hover:text-gray-300"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div
      v-if="showOrderDetail && selectedOrder"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      @click.self="closeOrderDetail"
    >
      <div class="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white">Order #{{ selectedOrder.orderNumber }}</h2>
            <p class="text-sm text-gray-400 mt-1">
              {{ formatTime(selectedOrder.createdAt) }} • {{ selectedOrder.customerName || 'Walk-in Customer' }}
            </p>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="printOrderDetails"
              class="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 flex items-center space-x-2"
            >
              <Printer class="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              v-if="!isEditingOrder"
              @click="isEditingOrder = true"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Edit3 class="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              @click="closeOrderDetail"
              class="p-2 text-gray-400 hover:text-white"
            >
              <X class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="flex-1 overflow-y-auto p-6">
          <div class="grid grid-cols-3 gap-6">
            <!-- Left Column: Order Details -->
            <div class="col-span-2 space-y-6">
              <!-- Order Items -->
              <div class="bg-gray-900 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-white mb-4">Order Items</h3>
                <div class="space-y-3">
                  <div
                    v-for="item in selectedOrder.items"
                    :key="item.id"
                    class="flex items-center justify-between py-2 border-b border-gray-700"
                  >
                    <div class="flex-1">
                      <p class="text-gray-200 font-medium">{{ item.name }}</p>
                      <p class="text-sm text-gray-400">{{ formatPrice(item.unitPrice) }} each</p>
                      <p v-if="item.notes" class="text-xs text-gray-500 mt-1">Note: {{ item.notes }}</p>
                    </div>
                    <div class="text-right">
                      <p class="text-gray-200">× {{ item.quantity }}</p>
                      <p class="text-gray-100 font-semibold">{{ formatPrice(item.totalPrice) }}</p>
                    </div>
                  </div>
                </div>

                <!-- Order Totals -->
                <div class="mt-4 pt-4 border-t border-gray-700 space-y-2">
                  <div class="flex justify-between text-gray-300">
                    <span>Subtotal</span>
                    <span>{{ formatPrice(selectedOrder.subtotal || 0) }}</span>
                  </div>
                  <div class="flex justify-between text-gray-300">
                    <span>Tax</span>
                    <span>{{ formatPrice(selectedOrder.tax || 0) }}</span>
                  </div>
                  <div class="flex justify-between text-white text-lg font-bold pt-2 border-t border-gray-700">
                    <span>Total</span>
                    <span>{{ formatPrice(selectedOrder.total) }}</span>
                  </div>
                </div>
              </div>

              <!-- Order Notes -->
              <div class="bg-gray-900 rounded-lg p-4">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-white flex items-center space-x-2">
                    <MessageSquare class="w-5 h-5" />
                    <span>Order Notes</span>
                  </h3>
                </div>

                <textarea
                  v-model="orderNotes"
                  placeholder="Add notes about this order..."
                  rows="4"
                  class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                ></textarea>

                <button
                  @click="saveOrderNotes"
                  class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Notes
                </button>
              </div>
            </div>

            <!-- Right Column: Timeline & Status -->
            <div class="space-y-6">
              <!-- Order Status -->
              <div class="bg-gray-900 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-white mb-4">Status</h3>
                <div :class="getStatusBadgeClass(selectedOrder.status)" class="px-4 py-2 rounded-lg text-center font-medium mb-4">
                  {{ getStatusLabel(selectedOrder.status) }}
                </div>

                <!-- Status Actions -->
                <div class="space-y-2">
                  <button
                    v-if="canUpdateStatus(selectedOrder.status, 'CONFIRMED')"
                    @click="updateOrderStatusFromModal('CONFIRMED')"
                    class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Confirm Order
                  </button>
                  <button
                    v-if="canUpdateStatus(selectedOrder.status, 'PREPARING')"
                    @click="updateOrderStatusFromModal('PREPARING')"
                    class="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    Start Preparing
                  </button>
                  <button
                    v-if="canUpdateStatus(selectedOrder.status, 'READY')"
                    @click="updateOrderStatusFromModal('READY')"
                    class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Mark as Ready
                  </button>
                  <button
                    v-if="canUpdateStatus(selectedOrder.status, 'SERVED')"
                    @click="updateOrderStatusFromModal('SERVED')"
                    class="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Mark as Served
                  </button>
                  <button
                    v-if="canUpdateStatus(selectedOrder.status, 'CANCELLED')"
                    @click="updateOrderStatusFromModal('CANCELLED')"
                    class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>

              <!-- Order Timeline -->
              <div class="bg-gray-900 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Clock class="w-5 h-5" />
                  <span>Timeline</span>
                </h3>

                <div class="space-y-4">
                  <div class="flex">
                    <div class="flex-shrink-0 w-8">
                      <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    </div>
                    <div class="flex-1">
                      <p class="text-gray-200 font-medium">Order Created</p>
                      <p class="text-sm text-gray-400">{{ formatTime(selectedOrder.createdAt) }}</p>
                    </div>
                  </div>

                  <div v-if="selectedOrder.confirmedAt" class="flex">
                    <div class="flex-shrink-0 w-8">
                      <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    </div>
                    <div class="flex-1">
                      <p class="text-gray-200 font-medium">Confirmed</p>
                      <p class="text-sm text-gray-400">{{ formatTime(selectedOrder.confirmedAt) }}</p>
                    </div>
                  </div>

                  <div v-if="selectedOrder.preparingAt" class="flex">
                    <div class="flex-shrink-0 w-8">
                      <div class="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    </div>
                    <div class="flex-1">
                      <p class="text-gray-200 font-medium">Started Preparing</p>
                      <p class="text-sm text-gray-400">{{ formatTime(selectedOrder.preparingAt) }}</p>
                    </div>
                  </div>

                  <div v-if="selectedOrder.readyAt" class="flex">
                    <div class="flex-shrink-0 w-8">
                      <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    </div>
                    <div class="flex-1">
                      <p class="text-gray-200 font-medium">Ready</p>
                      <p class="text-sm text-gray-400">{{ formatTime(selectedOrder.readyAt) }}</p>
                    </div>
                  </div>

                  <div v-if="selectedOrder.servedAt" class="flex">
                    <div class="flex-shrink-0 w-8">
                      <div class="w-2 h-2 bg-gray-500 rounded-full mt-2"></div>
                    </div>
                    <div class="flex-1">
                      <p class="text-gray-200 font-medium">Served</p>
                      <p class="text-sm text-gray-400">{{ formatTime(selectedOrder.servedAt) }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Order Info -->
              <div class="bg-gray-900 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-white mb-4">Order Info</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-400">Order Type</span>
                    <span class="text-gray-200">{{ selectedOrder.orderType || 'DINE_IN' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-400">Payment Method</span>
                    <span class="text-gray-200">{{ selectedOrder.paymentMethod || 'CASH' }}</span>
                  </div>
                  <div v-if="selectedOrder.tableNumber" class="flex justify-between">
                    <span class="text-gray-400">Table</span>
                    <span class="text-gray-200">{{ selectedOrder.tableNumber }}</span>
                  </div>
                  <div v-if="selectedOrder.customerPhone" class="flex justify-between">
                    <span class="text-gray-400">Phone</span>
                    <span class="text-gray-200">{{ selectedOrder.customerPhone }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useOrdersStore, OrderStatus } from '@/stores/orders'
import {
  RefreshCw,
  Volume2,
  VolumeX,
  Loader2,
  Inbox,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  X,
  Printer,
  Search,
  Filter,
  ChevronDown,
  Edit3,
  MessageSquare,
  Clock,
  Download
} from 'lucide-vue-next'

// Types
interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'warning' | 'error' | 'info'
  timestamp: Date
}

// Stores
const ordersStore = useOrdersStore()

// State
const soundEnabled = ref(true)
const activeFilter = ref<string>('ALL')
const notifications = ref<Notification[]>([])

// Search and filter state
const searchQuery = ref('')
const showAdvancedFilters = ref(false)
const advancedFilters = ref({
  dateRange: 'today',
  paymentMethod: '',
  orderType: '',
  sortBy: 'newest'
})

// Batch operations state
const selectedOrders = ref<string[]>([])

// Order detail modal state
const showOrderDetail = ref(false)
const selectedOrder = ref<any>(null)
const orderNotes = ref('')
const isEditingOrder = ref(false)

// Computed
const orderStats = computed(() => [
  {
    label: 'Pending',
    value: ordersStore.pendingOrders.length,
    color: 'text-yellow-600'
  },
  {
    label: 'Confirmed',
    value: ordersStore.orders.filter(o => o.status === OrderStatus.CONFIRMED).length,
    color: 'text-blue-600'
  },
  {
    label: 'Preparing',
    value: ordersStore.orders.filter(o => o.status === OrderStatus.PREPARING).length,
    color: 'text-orange-600'
  },
  {
    label: 'Ready',
    value: ordersStore.orders.filter(o => o.status === OrderStatus.READY).length,
    color: 'text-green-600'
  },
  {
    label: 'Served',
    value: ordersStore.orders.filter(o => o.status === OrderStatus.SERVED).length,
    color: 'text-gray-600'
  },
  {
    label: 'Total',
    value: ordersStore.orders.length,
    color: 'text-purple-600'
  }
])

const orderFilters = computed(() => [
  {
    status: 'ALL',
    label: 'All',
    count: ordersStore.orders.length
  },
  {
    status: 'PENDING',
    label: 'Pending',
    count: ordersStore.pendingOrders.length
  },
  {
    status: 'CONFIRMED',
    label: 'Confirmed',
    count: ordersStore.orders.filter(o => o.status === OrderStatus.CONFIRMED).length
  },
  {
    status: 'PREPARING',
    label: 'Preparing',
    count: ordersStore.orders.filter(o => o.status === OrderStatus.PREPARING).length
  },
  {
    status: 'READY',
    label: 'Ready',
    count: ordersStore.orders.filter(o => o.status === OrderStatus.READY).length
  },
  {
    status: 'SERVED',
    label: 'Served',
    count: ordersStore.orders.filter(o => o.status === OrderStatus.SERVED).length
  }
])

const filteredOrders = computed(() => {
  let filtered = ordersStore.orders

  // Status filter
  if (activeFilter.value !== 'ALL') {
    filtered = filtered.filter(order => order.status === activeFilter.value)
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(order =>
      order.orderNumber?.toString().includes(query) ||
      order.customerName?.toLowerCase().includes(query) ||
      order.customerPhone?.includes(query)
    )
  }

  // Date range filter
  if (advancedFilters.value.dateRange !== 'all') {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    filtered = filtered.filter(order => {
      const orderDate = new Date(order.createdAt)

      switch (advancedFilters.value.dateRange) {
        case 'today':
          return orderDate >= today
        case 'yesterday': {
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)
          return orderDate >= yesterday && orderDate < today
        }
        case 'week': {
          const weekAgo = new Date(today)
          weekAgo.setDate(weekAgo.getDate() - 7)
          return orderDate >= weekAgo
        }
        case 'month': {
          const monthAgo = new Date(today)
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          return orderDate >= monthAgo
        }
        default:
          return true
      }
    })
  }

  // Payment method filter
  if (advancedFilters.value.paymentMethod) {
    filtered = filtered.filter(order =>
      order.paymentMethod === advancedFilters.value.paymentMethod
    )
  }

  // Order type filter
  if (advancedFilters.value.orderType) {
    filtered = filtered.filter(order =>
      order.orderType === advancedFilters.value.orderType
    )
  }

  // Sorting
  filtered = [...filtered].sort((a, b) => {
    switch (advancedFilters.value.sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'amount-high':
        return (b.total || 0) - (a.total || 0)
      case 'amount-low':
        return (a.total || 0) - (b.total || 0)
      default: {
        // Default: Priority + newest
        const statusPriority = {
          'READY': 5,
          'PREPARING': 4,
          'CONFIRMED': 3,
          'PENDING': 2,
          'SERVED': 1,
          'CANCELLED': 0
        }

        const aPriority = statusPriority[a.status] || 0
        const bPriority = statusPriority[b.status] || 0

        if (aPriority !== bPriority) {
          return bPriority - aPriority
        }

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    }
  })

  return filtered
})

// Methods
const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(amount)
}

const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const refreshOrders = async () => {
  try {
    await ordersStore.fetchOrders()
    addNotification('Success', 'Orders refreshed successfully', 'success')
  } catch (error) {
    addNotification('Error', 'Failed to refresh orders', 'error')
  }
}

const handleStatusChange = async (orderId: string, newStatus: string) => {
  try {
    await ordersStore.updateOrderStatus(orderId, newStatus)

    const order = ordersStore.getOrderById(orderId)
    addNotification(
      'Status Updated',
      `Order #${order?.orderNumber} ${getStatusLabel(newStatus)}`,
      'success'
    )

    // Play sound notification
    if (soundEnabled.value && (newStatus === 'READY' || newStatus === 'SERVED')) {
      playNotificationSound()
    }
  } catch (error) {
    addNotification('Error', 'Unable to update status', 'error')
  }
}

const handleViewDetails = (order: any) => {
  openOrderDetail(order)
}

const handlePrintReceipt = async (order: any) => {
  try {
    await ordersStore.printReceipt(order.id)
    addNotification('Receipt Printed', `Receipt printed for #${order.orderNumber}`, 'success')
  } catch (error) {
    addNotification('Print Error', 'Unable to print receipt', 'error')
  }
}

const setActiveFilter = (status: string) => {
  activeFilter.value = status
}

const toggleSound = () => {
  soundEnabled.value = !soundEnabled.value
  localStorage.setItem('pos-sound-enabled', soundEnabled.value.toString())
}

const getFilterLabel = (status: string): string => {
  const labels = {
    'PENDING': 'pending',
    'CONFIRMED': 'confirmed',
    'PREPARING': 'preparing',
    'READY': 'ready',
    'SERVED': 'served',
    'CANCELLED': 'cancelled'
  }
  return labels[status] || status
}

const getStatusLabel = (status: string): string => {
  const labels = {
    'PENDING': 'Pending',
    'CONFIRMED': 'Confirmed',
    'PREPARING': 'Preparing',
    'READY': 'Ready',
    'SERVED': 'Served',
    'CANCELLED': 'Cancelled'
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status: string): string => {
  const classes = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'CONFIRMED': 'bg-blue-100 text-blue-800',
    'PREPARING': 'bg-orange-100 text-orange-800',
    'READY': 'bg-green-100 text-green-800',
    'SERVED': 'bg-gray-100 text-gray-800',
    'CANCELLED': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const canUpdateStatus = (currentStatus: string, newStatus: string): boolean => {
  // Define valid status transitions
  const validTransitions = {
    'PENDING': ['CONFIRMED', 'CANCELLED'],
    'CONFIRMED': ['PREPARING', 'CANCELLED'],
    'PREPARING': ['READY', 'CANCELLED'],
    'READY': ['SERVED'],
    'SERVED': [],
    'CANCELLED': []
  }

  return validTransitions[currentStatus]?.includes(newStatus) || false
}

const getNotificationIcon = (type: string) => {
  const icons = {
    'success': CheckCircle,
    'warning': AlertTriangle,
    'error': XCircle,
    'info': Info
  }
  return icons[type] || Info
}

const addNotification = (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => {
  const notification: Notification = {
    id: Date.now().toString(),
    title,
    message,
    type,
    timestamp: new Date()
  }

  notifications.value.unshift(notification)

  // Auto-remove after 5 seconds
  setTimeout(() => {
    removeNotification(notification.id)
  }, 5000)
}

const removeNotification = (id: string) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

const playNotificationSound = () => {
  if (soundEnabled.value) {
    // Create audio notification
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAYBDuNy/LNeSUEJHfH8N2QQgQVXbPp66hVFApGn+DyvmEYBDuLyPLVaiEEKXfH8N+QQgUVXLPq66hWFApFn+DyzmEYAzuLyPPVaR0EKXfH8N+QQgUUXLPq66pYFAhFnuDyz2QXATS')
    audio.volume = 0.3
    audio.play().catch(() => {
      // Ignore audio play errors
    })
  }
}

// Batch operations methods
const isOrderSelected = (orderId: string): boolean => {
  return selectedOrders.value.includes(orderId)
}

const toggleOrderSelection = (orderId: string) => {
  const index = selectedOrders.value.indexOf(orderId)
  if (index > -1) {
    selectedOrders.value.splice(index, 1)
  } else {
    selectedOrders.value.push(orderId)
  }
}

const clearSelection = () => {
  selectedOrders.value = []
}

const batchUpdateStatus = async (newStatus: string) => {
  if (selectedOrders.value.length === 0) return

  if (!confirm(`Are you sure you want to ${newStatus.toLowerCase()} ${selectedOrders.value.length} orders?`)) {
    return
  }

  try {
    const promises = selectedOrders.value.map(orderId =>
      ordersStore.updateOrderStatus(orderId, newStatus)
    )

    await Promise.all(promises)

    addNotification(
      'Batch Update Complete',
      `${selectedOrders.value.length} orders updated to ${getStatusLabel(newStatus)}`,
      'success'
    )

    clearSelection()
  } catch (error) {
    addNotification('Error', 'Failed to update some orders', 'error')
  }
}

const batchPrint = async () => {
  if (selectedOrders.value.length === 0) return

  try {
    for (const orderId of selectedOrders.value) {
      await ordersStore.printReceipt(orderId)
      // Small delay between prints
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    addNotification(
      'Batch Print Complete',
      `${selectedOrders.value.length} receipts printed`,
      'success'
    )

    clearSelection()
  } catch (error) {
    addNotification('Error', 'Failed to print some receipts', 'error')
  }
}

// Export orders
const exportOrders = () => {
  const data = filteredOrders.value.map(order => ({
    orderNumber: order.orderNumber,
    customer: order.customerName || 'Walk-in',
    status: getStatusLabel(order.status),
    total: order.total,
    items: order.items.length,
    date: new Date(order.createdAt).toLocaleString(),
    paymentMethod: order.paymentMethod,
    orderType: order.orderType
  }))

  const csv = [
    Object.keys(data[0]).join(','),
    ...data.map(row => Object.values(row).join(','))
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)

  addNotification('Export Complete', 'Orders exported to CSV', 'success')
}

// Order detail modal methods
const openOrderDetail = (order: any) => {
  selectedOrder.value = order
  orderNotes.value = order.notes || ''
  showOrderDetail.value = true
  isEditingOrder.value = false
}

const closeOrderDetail = () => {
  showOrderDetail.value = false
  selectedOrder.value = null
  orderNotes.value = ''
  isEditingOrder.value = false
}

const saveOrderNotes = async () => {
  if (!selectedOrder.value) return

  try {
    // Update order notes
    await ordersStore.updateOrderNotes(selectedOrder.value.id, orderNotes.value)

    addNotification('Notes Saved', 'Order notes updated successfully', 'success')

    // Update the selected order
    if (selectedOrder.value) {
      selectedOrder.value.notes = orderNotes.value
    }
  } catch (error) {
    addNotification('Error', 'Failed to save notes', 'error')
  }
}

const updateOrderStatusFromModal = async (newStatus: string) => {
  if (!selectedOrder.value) return

  try {
    await ordersStore.updateOrderStatus(selectedOrder.value.id, newStatus)

    addNotification(
      'Status Updated',
      `Order #${selectedOrder.value.orderNumber} ${getStatusLabel(newStatus)}`,
      'success'
    )

    // Update local state
    selectedOrder.value.status = newStatus

    // Play sound
    if (soundEnabled.value && (newStatus === 'READY' || newStatus === 'SERVED')) {
      playNotificationSound()
    }
  } catch (error) {
    addNotification('Error', 'Failed to update order status', 'error')
  }
}

const printOrderDetails = () => {
  if (!selectedOrder.value) return

  // Create a printable receipt
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order #${selectedOrder.value.orderNumber}</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          max-width: 300px;
          margin: 20px auto;
          padding: 10px;
        }
        h1 { text-align: center; font-size: 24px; margin: 10px 0; }
        .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
        .items { margin: 20px 0; }
        .item { display: flex; justify-between; margin: 5px 0; }
        .item-name { flex: 1; }
        .item-qty { width: 40px; text-align: center; }
        .item-price { width: 80px; text-align: right; }
        .totals { border-top: 2px dashed #000; padding-top: 10px; margin-top: 10px; }
        .total-row { display: flex; justify-between; margin: 5px 0; }
        .total-row.grand { font-weight: bold; font-size: 18px; border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; }
        .footer { text-align: center; margin-top: 20px; border-top: 2px dashed #000; padding-top: 10px; }
        @media print { button { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>GARBAKING POS</h1>
        <div>Order #${selectedOrder.value.orderNumber}</div>
        <div>${new Date(selectedOrder.value.createdAt).toLocaleString()}</div>
        <div>${selectedOrder.value.customerName || 'Walk-in Customer'}</div>
        ${selectedOrder.value.tableNumber ? `<div>Table ${selectedOrder.value.tableNumber}</div>` : ''}
      </div>

      <div class="items">
        ${selectedOrder.value.items.map((item: any) => `
          <div class="item">
            <span class="item-name">${item.name}</span>
            <span class="item-qty">x${item.quantity}</span>
            <span class="item-price">${formatPrice(item.totalPrice)}</span>
          </div>
          ${item.notes ? `<div style="font-size: 12px; margin-left: 20px; color: #666;">Note: ${item.notes}</div>` : ''}
        `).join('')}
      </div>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>${formatPrice(selectedOrder.value.subtotal || 0)}</span>
        </div>
        <div class="total-row">
          <span>Tax:</span>
          <span>${formatPrice(selectedOrder.value.tax || 0)}</span>
        </div>
        <div class="total-row grand">
          <span>TOTAL:</span>
          <span>${formatPrice(selectedOrder.value.total)}</span>
        </div>
      </div>

      <div class="footer">
        <div>Payment: ${selectedOrder.value.paymentMethod || 'CASH'}</div>
        <div>Type: ${selectedOrder.value.orderType || 'DINE_IN'}</div>
        <div style="margin-top: 10px;">Thank you for your order!</div>
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Print</button>
        <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; margin-left: 10px;">Close</button>
      </div>
    </body>
    </html>
  `

  printWindow.document.write(receiptHTML)
  printWindow.document.close()
}

// Watch for filter changes to clear selection
watch([activeFilter, searchQuery, advancedFilters], () => {
  clearSelection()
}, { deep: true })

// Lifecycle
onMounted(async () => {
  // Load sound settings from localStorage
  const savedSoundSetting = localStorage.getItem('pos-sound-enabled')
  if (savedSoundSetting) {
    soundEnabled.value = savedSoundSetting === 'true'
  }

  // Initialize orders store
  await ordersStore.fetchOrders()
  ordersStore.connectWebSocket()

  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
})

onUnmounted(() => {
  ordersStore.disconnectWebSocket()
})
</script>

<style scoped>
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translate3d(100%, 0, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.animate-slide-in {
  animation: slide-in 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform, opacity;
}
</style>
