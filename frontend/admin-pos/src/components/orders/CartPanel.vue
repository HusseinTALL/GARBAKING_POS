<!--
  CartPanel Component
  Displays current order items with quantity controls and order summary
  Based on Order Management screen design (Image 2)
-->
<template>
  <div class="cart-panel">
    <!-- Header -->
    <div class="cart-header">
      <div class="cart-title-section">
        <h2 class="cart-title">Orders #{{ orderNumber }}</h2>
        <span v-if="cartStore.hasUnsavedChanges" class="unsaved-indicator" title="Unsaved changes">
          ●
        </span>
        <span v-if="cartStore.currentDraftId" class="draft-badge">
          Draft
        </span>
      </div>
      <div class="header-actions">
        <button @click="toggleDraftsModal" class="icon-btn" title="Manage Drafts">
          <Inbox class="w-4 h-4" />
          <span v-if="draftCount > 0" class="badge">{{ draftCount }}</span>
        </button>
        <button v-if="cartItems.length > 0" @click="clearCart" class="clear-btn">
          <Trash2 class="w-4 h-4" />
          Clear
        </button>
      </div>
    </div>

    <!-- Order Type Selectors -->
    <div class="order-type-section">
      <button
        @click="orderType = 'DINE_IN'"
        class="order-type-btn"
        :class="{ 'active': orderType === 'DINE_IN' }"
      >
        Dine In
      </button>
      <button
        @click="orderType = 'TO_GO'"
        class="order-type-btn"
        :class="{ 'active': orderType === 'TO_GO' }"
      >
        To Go
      </button>
      <button
        @click="orderType = 'DELIVERY'"
        class="order-type-btn"
        :class="{ 'active': orderType === 'DELIVERY' }"
      >
        Delivery
      </button>
    </div>

    <!-- Customer Info (Optional) -->
    <div class="customer-section">
      <input
        v-model="customerName"
        @input="updateCustomerName"
        type="text"
        placeholder="Customer Name (Optional)"
        class="customer-input"
      />
      <input
        v-model="customerPhone"
        @input="updateCustomerPhone"
        type="tel"
        placeholder="Phone Number (Optional)"
        class="customer-input"
      />
    </div>

    <!-- Cart Items -->
    <div class="cart-items">
      <div v-if="cartItems.length === 0" class="empty-cart">
        <ShoppingCart class="w-16 h-16 text-gray-600" />
        <p class="empty-text">No items in cart</p>
        <p class="empty-subtext">Add items from the menu</p>
      </div>

      <div v-else>
        <!-- Column Headers -->
        <div class="items-header">
          <div class="header-item">Item</div>
          <div class="header-qty">Qty</div>
          <div class="header-price">Price</div>
        </div>

        <!-- Items List -->
        <div class="items-list">
          <div v-for="item in cartItems" :key="item.id" class="cart-item-row">
            <div class="cart-item">
              <!-- Item Image & Details -->
              <div class="cart-item-main">
                <div class="cart-item-image">
                  <img v-if="item.menuItem.imageUrl" :src="item.menuItem.imageUrl" :alt="item.menuItem.name" />
                  <div v-else class="image-placeholder">
                    <UtensilsCrossed class="w-6 h-6" />
                  </div>
                </div>

                <div class="cart-item-details">
                  <h4 class="cart-item-name">{{ truncate(item.menuItem.name, 25) }}</h4>
                  <p class="cart-item-price">{{ formatPrice(item.menuItem.price) }}</p>
                </div>
              </div>

              <!-- Quantity Controls -->
              <div class="cart-item-qty">
                <div class="quantity-controls">
                  <button @click="decreaseQuantity(item)" class="qty-btn">
                    <Minus class="w-3 h-3" />
                  </button>
                  <span class="qty-value">{{ item.quantity }}</span>
                  <button @click="increaseQuantity(item)" class="qty-btn">
                    <Plus class="w-3 h-3" />
                  </button>
                </div>
              </div>

              <!-- Item Total -->
              <div class="cart-item-total">
                {{ formatPrice((item.menuItem.price || 0) * (item.quantity || 1)) }}
              </div>
            </div>

            <!-- Order Note Section -->
            <div v-if="item.specialInstructions || showNoteFor === item.id" class="cart-item-note">
              <input
                v-model="item.specialInstructions"
                type="text"
                placeholder="Order Note..."
                class="note-input"
              />
              <button @click="removeNote(item)" class="note-delete-btn" title="Remove Note">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
            <button v-else @click="showNoteFor = item.id" class="add-note-btn">
              + Add Note
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Summary -->
    <div v-if="cartItems.length > 0" class="order-summary">
      <div class="summary-row">
        <span class="summary-label">Discount</span>
        <span class="summary-value">{{ formatPrice(discount) }}</span>
      </div>
      <div class="summary-row summary-subtotal">
        <span class="summary-label">Subtotal</span>
        <span class="summary-value">{{ formatPrice(subtotal) }}</span>
      </div>

      <!-- Action Button -->
      <button @click="placeOrder" class="btn btn-continue" :disabled="isSubmitting">
        <span v-if="isSubmitting">Processing...</span>
        <span v-else>Continue to Payment</span>
      </button>
    </div>

    <!-- Drafts Management Modal -->
    <div v-if="showDraftsModal" class="modal-overlay" @click.self="showDraftsModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Saved Drafts</h3>
          <button @click="showDraftsModal = false" class="close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <div v-if="cartStore.isLoadingDrafts" class="loading-state">
            <div class="spinner"></div>
            <p>Loading drafts...</p>
          </div>

          <div v-else-if="cartStore.availableDrafts.length === 0" class="empty-state">
            <Inbox class="w-16 h-16 text-gray-400" />
            <p>No saved drafts</p>
            <p class="text-sm text-gray-500">Save your current cart to access it later</p>
          </div>

          <div v-else class="drafts-list">
            <div
              v-for="draft in cartStore.availableDrafts"
              :key="draft.id"
              class="draft-item"
              :class="{ 'active': cartStore.currentDraftId === draft.id }"
            >
              <div class="draft-info">
                <div class="draft-name">{{ draft.name }}</div>
                <div class="draft-meta">
                  <span>{{ draft.itemCount }} items</span>
                  <span>•</span>
                  <span>{{ formatPrice(draft.total) }}</span>
                  <span>•</span>
                  <span>{{ formatDate(draft.updatedAt) }}</span>
                </div>
              </div>
              <div class="draft-actions">
                <button @click="loadDraftFromList(draft.id)" class="btn-sm btn-primary" title="Load">
                  <FolderOpen class="w-4 h-4" />
                </button>
                <button @click="confirmDeleteDraft(draft.id)" class="btn-sm btn-danger" title="Delete">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="cartStore.availableDrafts.length > 0" class="modal-footer">
          <button @click="confirmDeleteAllDrafts" class="btn btn-danger-outline">
            Delete All Drafts
          </button>
          <button @click="showDraftsModal = false" class="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Save Draft Name Modal -->
    <div v-if="showSaveDraftModal" class="modal-overlay" @click.self="showSaveDraftModal = false">
      <div class="modal-content modal-sm">
        <div class="modal-header">
          <h3>Save Draft</h3>
          <button @click="showSaveDraftModal = false" class="close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <label for="draft-name" class="input-label">Draft Name</label>
          <input
            id="draft-name"
            v-model="draftName"
            type="text"
            placeholder="Enter draft name..."
            class="modal-input"
            @keyup.enter="confirmSaveDraft"
          />
        </div>

        <div class="modal-footer">
          <button @click="showSaveDraftModal = false" class="btn btn-secondary">
            Cancel
          </button>
          <button @click="confirmSaveDraft" class="btn btn-primary" :disabled="!draftName.trim()">
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import {
  ShoppingCart,
  UtensilsCrossed,
  Plus,
  Minus,
  Trash2,
  Inbox,
  FolderOpen
} from 'lucide-vue-next'

const cartStore = useCartStore()
const router = useRouter()
const toast = useToast()

const customerName = ref('')
const customerPhone = ref('')
const paymentMethod = ref('CASH')
const isSubmitting = ref(false)
const orderType = ref('DINE_IN')
const orderNumber = ref(generateOrderNumber())
const showNoteFor = ref<string | null>(null)

// Draft management state
const showDraftsModal = ref(false)
const showSaveDraftModal = ref(false)
const draftName = ref('')
const draftCount = ref(0)

const cartItems = computed(() => cartStore.items || [])

const discount = ref(0)

function generateOrderNumber(): string {
  return Math.floor(10000 + Math.random() * 90000).toString()
}

const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    const price = parseFloat(item.menuItem.price.toString()) || 0
    const quantity = parseInt(item.quantity.toString()) || 1
    return sum + (price * quantity)
  }, 0)
})

const formatPrice = (amount: number | string | undefined): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(numAmount as number) || numAmount === undefined || numAmount === null) {
    return '0 F CFA'
  }
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numAmount as number).replace('XOF', 'F CFA')
}

const truncate = (str: string, length: number): string => {
  if (!str) return ''
  return str.length > length ? str.substring(0, length) + '...' : str
}

const removeNote = (item: any) => {
  item.specialInstructions = ''
  showNoteFor.value = null
}

const increaseQuantity = (item: any) => {
  cartStore.updateItemQuantity(item.id, item.quantity + 1)
}

const decreaseQuantity = (item: any) => {
  if (item.quantity > 1) {
    cartStore.updateItemQuantity(item.id, item.quantity - 1)
  } else {
    removeItem(item)
  }
}

const removeItem = (item: any) => {
  cartStore.removeItem(item.id)
  toast.info(`${item.menuItem.name} removed from cart`)
}

const clearCart = () => {
  if (confirm('Are you sure you want to clear the cart?')) {
    cartStore.clearCart()
    customerName.value = ''
    customerPhone.value = ''
    toast.success('Cart cleared')
  }
}

// Draft management methods
const updateCustomerName = () => {
  cartStore.updateCustomerInfo({ name: customerName.value })
}

const updateCustomerPhone = () => {
  cartStore.updateCustomerInfo({ phone: customerPhone.value })
}

const confirmSaveDraft = async () => {
  if (!draftName.value.trim()) {
    toast.warning('Please enter a draft name')
    return
  }

  await saveDraftNow()
  showSaveDraftModal.value = false
  draftName.value = ''
}

const saveDraftNow = async () => {
  const draftId = await cartStore.saveDraft(draftName.value)
  if (draftId) {
    toast.success('Draft saved successfully')
    await updateDraftCount()
  } else {
    toast.error(cartStore.draftError || 'Failed to save draft')
  }
}

const toggleDraftsModal = async () => {
  showDraftsModal.value = !showDraftsModal.value
  if (showDraftsModal.value) {
    await cartStore.loadDrafts()
  }
}

const loadDraftFromList = async (draftId: string) => {
  const success = await cartStore.loadDraft(draftId)
  if (success) {
    // Sync customer info with loaded draft
    customerName.value = cartStore.customerInfo.name || ''
    customerPhone.value = cartStore.customerInfo.phone || ''
    toast.success('Draft loaded successfully')
    showDraftsModal.value = false
  } else {
    toast.error(cartStore.draftError || 'Failed to load draft')
  }
}

const confirmDeleteDraft = async (draftId: string) => {
  if (confirm('Are you sure you want to delete this draft?')) {
    const success = await cartStore.deleteDraft(draftId)
    if (success) {
      toast.success('Draft deleted')
      await updateDraftCount()
    } else {
      toast.error(cartStore.draftError || 'Failed to delete draft')
    }
  }
}

const confirmDeleteAllDrafts = async () => {
  if (confirm('Are you sure you want to delete ALL drafts? This cannot be undone.')) {
    const success = await cartStore.deleteAllDrafts()
    if (success) {
      toast.success('All drafts deleted')
      showDraftsModal.value = false
      await updateDraftCount()
    } else {
      toast.error(cartStore.draftError || 'Failed to delete drafts')
    }
  }
}

const updateDraftCount = async () => {
  draftCount.value = await cartStore.getDraftCount()
}

const formatDate = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return 'Yesterday'
  } else if (days < 7) {
    return `${days} days ago`
  } else {
    return date.toLocaleDateString()
  }
}

const placeOrder = async () => {
  if (cartItems.value.length === 0) {
    toast.error('Cart is empty')
    return
  }

  isSubmitting.value = true
  try {
    // Process payment using cart store
    const result = await cartStore.processPayment(paymentMethod.value as 'cash' | 'card' | 'mobile')

    if (result.success) {
      toast.success('Order placed successfully!')

      // Clear form
      customerName.value = ''
      customerPhone.value = ''

      // Clear current draft ID
      cartStore.currentDraftId = null

      // Redirect to orders page
      router.push('/orders')
    } else {
      toast.error(result.error || 'Failed to place order')
    }
  } catch (error: any) {
    toast.error(error.message || 'Failed to place order')
  } finally {
    isSubmitting.value = false
  }
}

// Load draft count on mount
onMounted(async () => {
  await updateDraftCount()

  // Sync customer info from store
  customerName.value = cartStore.customerInfo.name || ''
  customerPhone.value = cartStore.customerInfo.phone || ''
})

// Watch for cart changes to update customer info
watch(() => cartStore.customerInfo, (newInfo) => {
  customerName.value = newInfo.name || ''
  customerPhone.value = newInfo.phone || ''
}, { deep: true })
</script>

<style scoped>
.cart-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border);
}

.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid var(--border);
}

.cart-title {
  font-size: var(--font-size-h2);
  font-weight: 600;
  color: var(--text-primary);
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  border-color: var(--accent-red);
  color: var(--accent-red);
}

/* Order Type Selectors */
.order-type-section {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  gap: 12px;
}

.order-type-btn {
  flex: 1;
  padding: 10px 16px;
  background: transparent;
  border: 1px solid #374151;
  border-radius: 8px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.order-type-btn.active {
  background: #ec4899;
  border-color: #ec4899;
  color: white;
  box-shadow: 0 2px 8px rgba(236, 72, 153, 0.3);
}

.order-type-btn:hover:not(.active) {
  border-color: #6b7280;
  color: var(--text-primary);
}

.customer-section {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.customer-input {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--font-size-body);
  transition: all 0.3s;
}

.customer-input:focus {
  outline: none;
  border-color: var(--accent-orange);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
}

.empty-text {
  font-size: var(--font-size-body);
  color: var(--text-secondary);
  font-weight: 500;
}

.empty-subtext {
  font-size: var(--font-size-small);
  color: var(--text-tertiary);
}

/* Items Header */
.items-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #374151;
  margin-bottom: 12px;
}

.items-header > div {
  font-size: 13px;
  font-weight: 700;
  color: #f9fafb;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.header-item {
  text-align: left;
  padding-left: 8px;
}

.header-qty {
  text-align: center;
}

.header-price {
  text-align: right;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cart-item-row {
  border-bottom: 1px solid #374151;
  padding-bottom: 12px;
}

.cart-item-row:last-child {
  border-bottom: none;
}

.cart-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 12px;
  align-items: center;
}

.cart-item-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cart-item-image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid #e5e7eb;
}

.cart-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  color: var(--text-tertiary);
}

.cart-item-details {
  flex: 1;
  min-width: 0;
}

.cart-item-name {
  font-size: 14px;
  font-weight: 600;
  color: #f9fafb;
  margin-bottom: 4px;
}

.cart-item-price {
  font-size: 13px;
  color: #9ca3af;
}

.cart-item-qty {
  display: flex;
  justify-content: center;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #1f2937;
  border-radius: 6px;
  padding: 4px 8px;
}

.qty-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid #374151;
  border-radius: 4px;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s;
}

.qty-btn:hover {
  border-color: #ec4899;
  color: #ec4899;
}

.qty-value {
  min-width: 20px;
  text-align: center;
  font-weight: 700;
  color: #f9fafb;
  font-size: 14px;
}

.cart-item-total {
  font-weight: 700;
  color: #f9fafb;
  font-size: 16px;
  text-align: right;
}

/* Note Section */
.cart-item-note {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding-left: 72px;
}

.note-input {
  flex: 1;
  padding: 8px 12px;
  background: #374151;
  border: 1px solid #4b5563;
  border-radius: 20px;
  color: #9ca3af;
  font-size: 13px;
  transition: all 0.3s;
}

.note-input:focus {
  outline: none;
  border-color: #ec4899;
  color: #f3f4f6;
}

.note-input::placeholder {
  color: #6b7280;
}

.note-delete-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid #ef4444;
  border-radius: 50%;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s;
}

.note-delete-btn:hover {
  background: #ef4444;
  color: white;
}

.add-note-btn {
  margin-top: 8px;
  margin-left: 72px;
  padding: 6px 12px;
  background: transparent;
  border: 1px dashed #374151;
  border-radius: 6px;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-note-btn:hover {
  border-color: #ec4899;
  color: #ec4899;
}

.order-summary {
  padding: 24px;
  border-top: 1px solid var(--border);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.summary-label {
  color: var(--text-secondary);
  font-size: var(--font-size-body);
}

.summary-value {
  color: var(--text-primary);
  font-weight: 600;
  font-size: var(--font-size-body);
}

.summary-subtotal {
  padding-top: 12px;
  margin-top: 12px;
  border-top: 1px solid #374151;
  margin-bottom: 20px;
}

.summary-subtotal .summary-label {
  font-size: 18px;
  font-weight: 700;
  color: #f9fafb;
}

.summary-subtotal .summary-value {
  font-size: 18px;
  font-weight: 700;
  color: #f9fafb;
}

.btn-continue {
  width: 100%;
  padding: 16px 20px;
  background: #ec4899;
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
}

.btn-continue:hover:not(:disabled) {
  background: #db2777;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(236, 72, 153, 0.4);
}

.btn-continue:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.payment-method {
  margin: 20px 0;
}

.payment-label {
  display: block;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-weight: 500;
}

.payment-select {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--font-size-body);
  cursor: pointer;
  transition: all 0.3s;
}

.payment-select:focus {
  outline: none;
  border-color: var(--accent-orange);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.btn {
  padding: 14px 20px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-body);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
}

.btn-outline:hover {
  border-color: var(--accent-orange);
  color: var(--accent-orange);
}

.btn-primary {
  background: var(--accent-orange);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #FF8C5A;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Draft Management Styles */
.cart-title-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unsaved-indicator {
  color: var(--accent-orange);
  font-size: 1.2rem;
  line-height: 1;
  animation: pulse 2s infinite;
}

.draft-badge {
  padding: 2px 8px;
  background: rgba(255, 107, 53, 0.1);
  color: var(--accent-orange);
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
  text-transform: uppercase;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:hover {
  border-color: var(--accent-orange);
  color: var(--accent-orange);
  background: rgba(255, 107, 53, 0.05);
}

.icon-btn .badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  background: var(--accent-orange);
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 9px;
  border: 2px solid var(--bg-secondary);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-content.modal-sm {
  max-width: 400px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

/* Draft List */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--accent-orange);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.drafts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.draft-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.draft-item:hover {
  border-color: var(--accent-orange);
  background: var(--bg-primary);
}

.draft-item.active {
  border-color: var(--accent-orange);
  background: rgba(255, 107, 53, 0.05);
}

.draft-info {
  flex: 1;
  min-width: 0;
}

.draft-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.draft-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-small);
  color: var(--text-tertiary);
}

.draft-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
}

.btn-sm {
  padding: 8px;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-sm.btn-primary {
  background: var(--accent-orange);
  color: white;
}

.btn-sm.btn-primary:hover {
  background: #FF8C5A;
}

.btn-sm.btn-danger {
  background: transparent;
  color: var(--accent-red);
  border: 1px solid currentColor;
}

.btn-sm.btn-danger:hover {
  background: var(--accent-red);
  color: white;
}

.btn-danger-outline {
  background: transparent;
  border: 1px solid var(--accent-red);
  color: var(--accent-red);
}

.btn-danger-outline:hover {
  background: var(--accent-red);
  color: white;
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--bg-primary);
}

.input-label {
  display: block;
  font-size: var(--font-size-small);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.modal-input {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--font-size-body);
  transition: all 0.3s;
}

.modal-input:focus {
  outline: none;
  border-color: var(--accent-orange);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .cart-item {
    grid-template-columns: 50px 1fr auto;
    grid-template-rows: auto auto;
  }

  .cart-item-total,
  .remove-btn {
    grid-column: 3;
  }

  .quantity-controls {
    grid-column: 2;
    justify-self: start;
  }

  .modal-content {
    max-width: 95%;
  }

  .header-actions {
    flex-wrap: wrap;
  }
}
</style>
