<!--
  Redesigned POS Interface - TailwindCSS with Heroicons
  Clean, modern design with proper visibility and no cut-offs
-->
<template>
  <div class="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
    <!-- Mobile Header -->
    <div class="lg:hidden bg-white border-b border-gray-200 p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BuildingStorefrontIcon class="w-5 h-5 text-white" />
          </div>
          <h1 class="font-bold text-gray-900">Garbaking POS</h1>
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-600">{{ cashierName }}</span>
          <button
            @click="logout"
            class="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors duration-200"
          >
            <ArrowRightOnRectangleIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Sidebar -->
    <div class="hidden lg:flex w-64 bg-white shadow-lg flex-col">
      <!-- Logo -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <BuildingStorefrontIcon class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900">Admin POS</h1>
            <p class="text-sm text-gray-500">Restaurant System</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-2">
        <button
          v-for="item in navigationItems"
          :key="item.id"
          @click="activeTab = item.id"
          :class="[
            'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200',
            activeTab === item.id
              ? 'bg-blue-50 text-blue-600 border border-blue-200'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          ]"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span class="font-medium">{{ item.label }}</span>
          <span v-if="item.badge" class="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {{ item.badge }}
          </span>
        </button>
      </nav>

      <!-- User Section -->
      <div class="p-4 border-t border-gray-200">
        <div class="flex items-center space-x-3 mb-3">
          <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <UserIcon class="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">{{ cashierName }}</p>
            <p class="text-xs text-gray-500">Cashier 01</p>
          </div>
        </div>
        <button
          @click="logout"
          class="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <ArrowRightOnRectangleIcon class="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">{{ pageTitle }}</h2>
            <p class="text-gray-600">Manage orders and sales</p>
          </div>

          <!-- Order Tabs -->
          <div class="flex space-x-2">
            <button
              v-for="tab in orderTabs"
              :key="tab.id"
              @click="activeOrderTab = tab.id"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-colors duration-200',
                activeOrderTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center space-x-4">
            <button class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2">
              <ShoppingBagIcon class="w-4 h-4" />
              <span>Take Away</span>
            </button>
            <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
              <BuildingStorefrontIcon class="w-4 h-4" />
              <span>Dine In</span>
            </button>
            <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2">
              <TruckIcon class="w-4 h-4" />
              <span>Deliver</span>
            </button>
            <button
              @click="openCustomerDisplay"
              class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 flex items-center space-x-2"
            >
              <UserIcon class="w-4 h-4" />
              <span>Customer Display</span>
            </button>
            <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2">
              <XMarkIcon class="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Content Area -->
      <div class="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 p-4 lg:p-6">
        <!-- Menu Section -->
        <div class="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <!-- Menu Header -->
          <div class="flex-shrink-0 p-4 lg:p-6 pb-4 border-b border-gray-100">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
              <div class="flex flex-col sm:flex-row sm:items-center gap-4">
                <h3 class="text-lg lg:text-xl font-bold text-gray-900">Menu Items ({{ menuItems.length }})</h3>
                <div class="relative">
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search menu..."
                    class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                  >
                  <MagnifyingGlassIcon class="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div class="flex space-x-2">
                <button
                  @click="viewMode = 'grid'"
                  :class="[
                    'p-2 rounded-lg transition-colors duration-200',
                    viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                  ]"
                >
                  <Squares2X2Icon class="w-5 h-5" />
                </button>
                <button
                  @click="viewMode = 'list'"
                  :class="[
                    'p-2 rounded-lg transition-colors duration-200',
                    viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                  ]"
                >
                  <Bars3Icon class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Category Tabs -->
            <div class="flex space-x-2 overflow-x-auto scrollbar-thin">
              <button
                v-for="category in categories"
                :key="category.id"
                @click="selectedCategory = category.id"
                :class="[
                  'flex items-center space-x-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors duration-200',
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                <component :is="category.icon" class="w-4 h-4" />
                <span>{{ category.name }}</span>
              </button>
            </div>
          </div>

          <!-- Scrollable Menu Items -->
          <div class="flex-1 overflow-y-auto p-4 lg:p-6 pt-4 scrollbar-thin">
            <!-- Menu Items Grid -->
            <div :class="[
              'gap-4 lg:gap-6 pb-6',
              viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : 'space-y-4 lg:space-y-6'
            ]">
            <div
              v-for="item in filteredMenuItems"
              :key="item.id"
              class="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-blue-300 cursor-pointer"
              @click="getItemQuantity(item.id) === 0 && addToCart(item)"
            >
              <!-- Item Image -->
              <div class="relative overflow-hidden">
                <img
                  :src="item.image || 'https://via.placeholder.com/300x200'"
                  :alt="item.name"
                  class="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                >
                <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <!-- Badges -->
                <div class="absolute top-3 left-3 flex flex-col gap-2">
                  <div v-if="item.isNew" class="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    NEW
                  </div>
                  <div v-if="item.isPopular" class="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    POPULAR
                  </div>
                </div>

                <!-- Quick Add Button (appears on hover for items not in cart) -->
                <div v-if="getItemQuantity(item.id) === 0" class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    @click.stop="addToCart(item)"
                    class="bg-white text-blue-600 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-blue-50 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                  >
                    <PlusIcon class="w-5 h-5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>

              <!-- Item Content -->
              <div class="p-5">
                <!-- Item Info -->
                <div class="mb-4">
                  <h4 class="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{{ item.name }}</h4>
                  <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ item.description || 'Delicious and freshly prepared item from our menu.' }}</p>
                  <div class="flex items-center justify-between">
                    <div class="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      ${{ item.price.toFixed(2) }}
                    </div>
                    <div class="flex items-center space-x-1 text-amber-400">
                      <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <span class="text-sm font-medium text-gray-700">4.8</span>
                    </div>
                  </div>
                </div>

                <!-- Item Actions -->
                <div class="flex items-center justify-between">
                  <!-- Add Button (when item not in cart) -->
                  <button
                    v-if="getItemQuantity(item.id) === 0"
                    @click.stop="addToCart(item)"
                    class="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                  >
                    <PlusIcon class="w-5 h-5" />
                    <span>Add to Cart</span>
                  </button>

                  <!-- Quantity Controls (when item in cart) -->
                  <div v-else class="flex items-center justify-between w-full">
                    <div class="flex items-center space-x-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
                      <button
                        @click.stop="updateQuantity(item, getItemQuantity(item.id) - 1)"
                        class="p-3 text-red-600 hover:bg-red-50 rounded-l-xl transition-all duration-200 hover:scale-110"
                        :disabled="getItemQuantity(item.id) <= 1"
                        :class="getItemQuantity(item.id) <= 1 ? 'opacity-50 cursor-not-allowed' : ''"
                      >
                        <MinusIcon class="w-5 h-5" />
                      </button>
                      <div class="px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <span class="font-bold text-lg text-gray-900">{{ getItemQuantity(item.id) }}</span>
                      </div>
                      <button
                        @click.stop="updateQuantity(item, getItemQuantity(item.id) + 1)"
                        class="p-3 text-green-600 hover:bg-green-50 rounded-r-xl transition-all duration-200 hover:scale-110"
                      >
                        <PlusIcon class="w-5 h-5" />
                      </button>
                    </div>
                    <button
                      @click.stop="handleAddNote(item)"
                      class="ml-3 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 rounded-xl hover:from-amber-100 hover:to-orange-100 transition-all duration-200 text-sm font-medium flex items-center space-x-2 border border-amber-200 hover:border-amber-300 shadow-sm hover:shadow-md"
                    >
                      <PencilIcon class="w-4 h-4" />
                      <span>Note</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="w-full lg:w-96 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col max-h-screen lg:max-h-none">
          <!-- Order Header -->
          <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-xl text-white">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-bold">Order Summary</h3>
              <button class="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200">
                <EllipsisVerticalIcon class="w-5 h-5" />
              </button>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <UserIcon class="w-6 h-6" />
              </div>
              <div>
                <p class="font-medium">Walk-in Customer</p>
                <p class="text-blue-100 text-sm">Dine In • Table 12</p>
              </div>
              <div class="ml-auto">
                <span class="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium">
                  • Pending
                </span>
              </div>
            </div>
            <div class="mt-4 flex items-center justify-between text-sm">
              <span class="text-blue-100">Order #{{ currentOrderNumber }}</span>
              <div class="flex items-center space-x-1 text-blue-100">
                <ClockIcon class="w-4 h-4" />
                <span>{{ formatTime(new Date()) }}</span>
              </div>
            </div>
          </div>

          <!-- Cart Items -->
          <div class="flex-1 overflow-y-auto scrollbar-thin">
            <div class="p-4 space-y-3">
              <div v-if="cartItems.length === 0" class="text-center py-12">
                <div class="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCartIcon class="w-8 h-8 text-gray-400" />
                </div>
                <p class="text-gray-500 font-medium">Your cart is empty</p>
                <p class="text-gray-400 text-sm">Add items to get started</p>
              </div>

            <div
              v-for="item in cartItems"
              :key="item.cartId"
              class="bg-gray-50 rounded-lg p-3 flex items-center space-x-3"
            >
              <!-- Item Image -->
              <img
                :src="item.image || 'https://via.placeholder.com/60x60'"
                :alt="item.name"
                class="w-12 h-12 rounded-lg object-cover"
              >

              <!-- Item Details -->
              <div class="flex-1">
                <h4 class="font-medium text-gray-900 text-sm">{{ item.name }}</h4>
                <p class="text-gray-600 text-xs">${{ item.price.toFixed(2) }} each</p>
                <div class="flex items-center justify-between mt-1">
                  <div class="flex items-center space-x-2">
                    <button
                      @click="updateQuantity(item, item.quantity - 1)"
                      class="w-6 h-6 bg-red-100 text-red-600 rounded flex items-center justify-center text-xs hover:bg-red-200"
                    >
                      <MinusIcon class="w-3 h-3" />
                    </button>
                    <span class="text-sm font-medium w-8 text-center">{{ item.quantity }}</span>
                    <button
                      @click="updateQuantity(item, item.quantity + 1)"
                      class="w-6 h-6 bg-green-100 text-green-600 rounded flex items-center justify-center text-xs hover:bg-green-200"
                    >
                      <PlusIcon class="w-3 h-3" />
                    </button>
                  </div>
                  <p class="font-bold text-green-600 text-sm">${{ (item.price * item.quantity).toFixed(2) }}</p>
                </div>
              </div>

              <!-- Remove Button -->
              <button
                @click="removeFromCart(item)"
                class="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors duration-200"
              >
                <XMarkIcon class="w-4 h-4" />
              </button>
            </div>
            </div>
          </div>

          <!-- Order Totals -->
          <div class="p-4 border-t border-gray-200 space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Subtotal</span>
              <span class="font-medium">${{ subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Taxes (10%)</span>
              <span class="font-medium">${{ taxes.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Discount</span>
              <span class="font-medium text-red-600">-${{ discount.toFixed(2) }}</span>
            </div>
            <div class="border-t border-gray-200 pt-3">
              <div class="flex justify-between items-center">
                <span class="text-lg font-bold text-gray-900">Total</span>
                <span class="text-xl font-bold text-green-600">${{ total.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- Place Order Button -->
          <div class="p-4">
            <button
              @click="placeOrder"
              :disabled="cartItems.length === 0"
              :class="[
                'w-full py-3 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center space-x-2',
                cartItems.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              ]"
            >
              <CheckIcon class="w-5 h-5" />
              <span>Place Order</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// Heroicons imports
import {
  BuildingStorefrontIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ShoppingBagIcon,
  TruckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  Bars3Icon,
  CheckIcon,
  MinusIcon,
  PlusIcon,
  PencilIcon,
  EllipsisVerticalIcon,
  ClockIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  PresentationChartLineIcon,
  UsersIcon,
  CogIcon,
  TagIcon,
  GiftIcon,
  BeakerIcon,
  FireIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()

// State
const activeTab = ref('sales')
const activeOrderTab = ref('order1')
const selectedCategory = ref('all')
const searchQuery = ref('')
const viewMode = ref<'grid' | 'list'>('grid')
const cartItems = ref<CartItem[]>([])
const cashierName = ref(localStorage.getItem('cashier_name') || 'John Doe')
const currentOrderNumber = ref('219022')

// Navigation items
const navigationItems = [
  { id: 'sales', label: 'Sales Analytic', icon: ChartBarIcon, badge: '5' },
  { id: 'orders', label: 'Orders', icon: ClipboardDocumentListIcon },
  { id: 'inventory', label: 'Inventory', icon: CubeIcon },
  { id: 'reports', label: 'Reports', icon: PresentationChartLineIcon },
  { id: 'customers', label: 'Customers', icon: UsersIcon },
  { id: 'settings', label: 'Settings', icon: CogIcon }
]

// Order tabs
const orderTabs = [
  { id: 'order1', label: '#219022' },
  { id: 'order2', label: '#219021' },
  { id: 'order3', label: '#219020' }
]

// Categories
const categories = [
  { id: 'all', name: 'All Menu', icon: TagIcon },
  { id: 'meals', name: 'Meals', icon: FireIcon },
  { id: 'soups', name: 'Soups', icon: BeakerIcon },
  { id: 'beverages', name: 'Beverages', icon: BeakerIcon },
  { id: 'appetizer', name: 'Appetizer', icon: TagIcon },
  { id: 'desserts', name: 'Side Dish', icon: GiftIcon }
]

// Menu items
const menuItems = ref<MenuItem[]>([
  {
    id: '1',
    name: 'Deep Fried Wonton',
    price: 15.00,
    category: 'appetizer',
    description: 'Crispy wontons filled with seasoned pork and shrimp, served with sweet and sour sauce',
    image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400',
    isNew: false,
    isPopular: true
  },
  {
    id: '2',
    name: 'Stir-Fried Noodles',
    price: 21.00,
    category: 'meals',
    description: 'Traditional wok-fried noodles with fresh vegetables and your choice of protein',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400',
    isPopular: true
  },
  {
    id: '3',
    name: 'Spicy Chicken Tendon',
    price: 31.00,
    category: 'meals',
    description: 'Tender chicken pieces in spicy Szechuan sauce with aromatic herbs and chili',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400'
  },
  {
    id: '4',
    name: 'Fried Rice with Pork',
    price: 40.00,
    category: 'meals',
    description: 'Wok-fried jasmine rice with char siu pork, eggs, and fresh scallions',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400'
  },
  {
    id: '5',
    name: 'Sausages',
    price: 15.00,
    category: 'appetizer',
    description: 'Premium grilled sausages served with mustard and pickled vegetables',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400'
  },
  {
    id: '6',
    name: 'Lambreta Burger',
    price: 30.00,
    category: 'meals',
    description: 'Artisan beef patty with caramelized onions, aged cheddar, and special sauce',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    isNew: true
  },
  {
    id: '7',
    name: 'Tom Yum Soup',
    price: 18.00,
    category: 'soups',
    description: 'Authentic Thai hot and sour soup with shrimp, mushrooms, and lemongrass',
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=400',
    isPopular: true
  },
  {
    id: '8',
    name: 'Mango Smoothie',
    price: 12.00,
    category: 'beverages',
    description: 'Fresh mango blended with coconut milk and a touch of lime',
    image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400',
    isNew: true
  },
  {
    id: '9',
    name: 'Chocolate Lava Cake',
    price: 16.00,
    category: 'desserts',
    description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400'
  }
])

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  description?: string
  image?: string
  isNew?: boolean
  isPopular?: boolean
}

interface CartItem extends MenuItem {
  quantity: number
  cartId: string
}

// Computed
const pageTitle = computed(() =>
  activeTab.value === 'sales' ? 'Sales Analytic' : 'Admin POS'
)

const filteredMenuItems = computed(() => {
  let filtered = menuItems.value

  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(item => item.category === selectedCategory.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(query)
    )
  }

  return filtered
})

const subtotal = computed(() =>
  cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0)
)

const taxes = computed(() => subtotal.value * 0.1)
const discount = computed(() => 10.00)
const total = computed(() => subtotal.value + taxes.value - discount.value)

// Methods
function getItemQuantity(itemId: string): number {
  const cartItem = cartItems.value.find(item => item.id === itemId)
  return cartItem ? cartItem.quantity : 0
}

// Sync cart data to localStorage for customer display
function syncCustomerDisplay() {
  localStorage.setItem('customer_display_cart', JSON.stringify(cartItems.value))
  localStorage.setItem('customer_display_order', currentOrderNumber.value)
}

function addToCart(menuItem: MenuItem) {
  const existingItem = cartItems.value.find(item => item.id === menuItem.id)

  if (existingItem) {
    existingItem.quantity += 1
  } else {
    const cartId = `${menuItem.id}-${Date.now()}`
    cartItems.value.push({
      ...menuItem,
      quantity: 1,
      cartId
    })
  }

  // Sync with customer display
  syncCustomerDisplay()
}

function updateQuantity(item: MenuItem | CartItem, newQuantity: number) {
  const cartItem = cartItems.value.find(cartItem => cartItem.id === item.id)
  if (cartItem) {
    if (newQuantity <= 0) {
      removeFromCart(cartItem)
    } else {
      cartItem.quantity = newQuantity
      // Sync with customer display
      syncCustomerDisplay()
    }
  }
}

function removeFromCart(cartItem: CartItem) {
  const index = cartItems.value.findIndex(item => item.cartId === cartItem.cartId)
  if (index > -1) {
    cartItems.value.splice(index, 1)
    // Sync with customer display
    syncCustomerDisplay()
  }
}

function placeOrder() {
  if (cartItems.value.length === 0) return

  console.log('Placing order...', {
    items: cartItems.value,
    total: total.value
  })

  // Clear cart after order
  cartItems.value = []

  // Generate new order number
  currentOrderNumber.value = (parseInt(currentOrderNumber.value) + 1).toString()

  // Sync with customer display
  syncCustomerDisplay()
}

function handleAddNote(item: MenuItem) {
  console.log('Add note for item:', item.name)
}

function openCustomerDisplay() {
  // Open customer display in a new window/tab
  const customerDisplayUrl = `${window.location.origin}/customer-display`
  window.open(customerDisplayUrl, 'CustomerDisplay', 'width=1200,height=800,scrollbars=yes,resizable=yes')
}

function showSettings() {
  console.log('Settings clicked')
}

function logout() {
  localStorage.removeItem('pos_cashier_token')
  localStorage.removeItem('cashier_name')
  router.push('/login')
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom scrollbar styling */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
  transition: background-color 0.2s ease;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.scrollbar-thin::-webkit-scrollbar-corner {
  background: #f1f5f9;
}

/* Smooth scrollbar for horizontal categories */
.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Mobile optimizations */
@media (max-width: 1024px) {
  .scrollbar-thin::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
}

/* Hide scrollbars on very small screens for cleaner mobile look */
@media (max-width: 640px) {
  .scrollbar-thin {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-thin::-webkit-scrollbar {
    display: none;
  }
}

/* Ensure touch scrolling is smooth on mobile */
.overflow-y-auto, .overflow-x-auto {
  -webkit-overflow-scrolling: touch;
}
</style>