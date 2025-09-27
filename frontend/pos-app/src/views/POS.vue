<!--
  Modern POS interface with clean design and modular components
  Orchestrates all POS components for a complete point of sale experience
-->
<template>
  <div class="pos-wrapper" :class="{ 'menu-open': mobileMenuOpen }">
    <!-- Fixed Sidebar -->
    <POSSidebar
      :active-tab="activeTab"
      @tab-change="activeTab = $event"
      @show-settings="showSettings"
      @logout="logout"
    />

    <!-- Main Content -->
    <div class="main-content">
      <!-- Header -->
      <POSHeader
        :page-title="activeTab === 'sales' ? 'Sales Analytic' : 'Admin POS'"
        :active-order-tab="activeOrderTab"
        :cashier-name="cashierName"
        @order-tab-change="activeOrderTab = $event"
      />

      <!-- Content Area -->
      <div class="content-area">
        <!-- Main Layout -->
        <div class="main-layout">
          <!-- Menu Section -->
          <MenuSection
            :filtered-menu-items="filteredMenuItems"
            :categories="categories"
            :selected-category="selectedCategory"
            :search-query="searchQuery"
            :view-mode="viewMode"
            :cart-items="cartItems"
            @search-change="searchQuery = $event"
            @view-mode-change="viewMode = $event"
            @category-change="selectedCategory = $event"
            @add-to-cart="addToCart"
            @quantity-change="updateQuantity"
            @add-note="handleAddNote"
          />

          <!-- Order Summary -->
          <OrderSummary
            :cart-items="cartItems"
            :cart-item-count="cartItemCount"
            :current-order-number="currentOrderNumber"
            :subtotal="subtotal"
            :taxes="taxes"
            :discount="discount"
            :total="total"
            @remove-from-cart="removeFromCart"
            @place-order="placeOrder"
          />
        </div>
      </div>
    </div>

    <!-- Mobile Menu Toggle -->
    <MobileMenuToggle @toggle="mobileMenuOpen = !mobileMenuOpen" />

    <!-- Mobile Overlay -->
    <MobileOverlay
      :is-open="mobileMenuOpen"
      @close="mobileMenuOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

// Component imports
import POSSidebar from '@/components/pos/navigation/POSSidebar.vue'
import POSHeader from '@/components/pos/navigation/POSHeader.vue'
import MenuSection from '@/components/pos/menu/MenuSection.vue'
import OrderSummary from '@/components/pos/order/OrderSummary.vue'
import MobileMenuToggle from '@/components/pos/mobile/MobileMenuToggle.vue'
import MobileOverlay from '@/components/pos/mobile/MobileOverlay.vue'

// Icon imports for categories
import { Coffee, Pizza, Soup, Wine, IceCream2, Utensils as Utensils2 } from 'lucide-vue-next'

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  image?: string
  isNew?: boolean
}

interface CartItem extends MenuItem {
  quantity: number
  cartId: string
}

const router = useRouter()

// State
const activeTab = ref('sales')
const activeOrderTab = ref('order1')
const selectedCategory = ref('all')
const searchQuery = ref('')
const viewMode = ref<'grid' | 'list'>('grid')
const cartItems = ref<CartItem[]>([])
const mobileMenuOpen = ref(false)
const cashierName = ref(localStorage.getItem('cashier_name') || 'John Doe')
const currentOrderNumber = ref('219021')

// Categories
const categories = [
  { id: 'all', name: 'All Menu', icon: Utensils2 },
  { id: 'meals', name: 'Meals', icon: Pizza },
  { id: 'soups', name: 'Soups', icon: Soup },
  { id: 'beverages', name: 'Beverages', icon: Coffee },
  { id: 'appetizer', name: 'Appetizer', icon: Utensils2 },
  { id: 'desserts', name: 'Side Dish', icon: IceCream2 }
]

// Menu items
const menuItems = ref<MenuItem[]>([
  {
    id: '1',
    name: 'Deep Fried Wonton',
    price: 15.00,
    category: 'appetizer',
    image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400',
    isNew: false
  },
  {
    id: '2',
    name: 'Stir-Fried Noodles',
    price: 21.00,
    category: 'meals',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400'
  },
  {
    id: '3',
    name: 'Spicy Chicken Tendon',
    price: 31.00,
    category: 'meals',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400'
  },
  {
    id: '4',
    name: 'Fried Rice with Pork',
    price: 40.00,
    category: 'meals',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400'
  },
  {
    id: '5',
    name: 'Sausages',
    price: 15.00,
    category: 'appetizer',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400'
  },
  {
    id: '6',
    name: 'Lambreta Burger',
    price: 30.00,
    category: 'meals',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    isNew: true
  }
])

// Computed
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

const cartItemCount = computed(() =>
  cartItems.value.reduce((total, item) => total + item.quantity, 0)
)

const subtotal = computed(() =>
  cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0)
)

const taxes = computed(() => subtotal.value * 0.1)
const discount = computed(() => 10.00)
const total = computed(() => subtotal.value + taxes.value - discount.value)

// Methods
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
}

function updateQuantity(menuItem: MenuItem, newQuantity: number) {
  const cartItem = cartItems.value.find(item => item.id === menuItem.id)
  if (cartItem) {
    if (newQuantity <= 0) {
      removeFromCart(cartItem)
    } else {
      cartItem.quantity = newQuantity
    }
  }
}

function removeFromCart(cartItem: CartItem) {
  const index = cartItems.value.findIndex(item => item.cartId === cartItem.cartId)
  if (index > -1) {
    cartItems.value.splice(index, 1)
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
}

function handleAddNote(item: MenuItem) {
  console.log('Add note for item:', item.name)
}

function showSettings() {
  console.log('Settings clicked')
}

function logout() {
  localStorage.removeItem('pos_cashier_token')
  localStorage.removeItem('cashier_name')
  router.push('/login')
}

// Handle window resize
function handleResize() {
  if (window.innerWidth > 768) {
    mobileMenuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.pos-wrapper {
  display: flex;
  height: 100vh;
  background: #f8f9fb;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  position: relative;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Content Area */
.content-area {
  flex: 1;
  overflow-y: auto;
}

/* Main Layout */
.main-layout {
  display: flex;
  gap: 24px;
  padding: 24px;
  height: calc(100vh - 200px);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .main-layout {
    flex-direction: column;
    height: auto;
  }
}

@media (max-width: 768px) {
  .main-layout {
    padding: 16px;
  }
}

/* Mobile sidebar behavior */
@media (max-width: 768px) {
  .pos-wrapper :deep(.sidebar) {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
    z-index: 999;
  }

  .pos-wrapper.menu-open :deep(.sidebar) {
    transform: translateX(0);
  }
}
</style>