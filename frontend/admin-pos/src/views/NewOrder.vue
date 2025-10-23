<!--
  New Order View - Rebuilt with Modern Dark Theme
  Split layout: Menu Grid (left) + Cart Panel (right)
  Based on Order Management design (Image 2)
-->
<template>
  <div class="new-order-view">
    <!-- Menu Grid (Left Panel) -->
    <div class="menu-panel">
      <MenuGrid @add-item="addToCart" />
    </div>

    <!-- Cart Panel (Right Panel) -->
    <div class="cart-panel-wrapper">
      <CartPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cart'
import { useToast } from 'vue-toastification'
import MenuGrid from '@/components/orders/MenuGrid.vue'
import CartPanel from '@/components/orders/CartPanel.vue'

const cartStore = useCartStore()
const toast = useToast()

const addToCart = (item: any) => {
  const cartItem = {
    id: item.id,
    menuItemId: item.id,
    name: item.name,
    price: item.price,
    quantity: 1,
    imageUrl: item.imageUrl,
    notes: ''
  }

  cartStore.addItem(cartItem)
  toast.success(`${item.name} added to cart!`)
}
</script>

<style scoped>
.new-order-view {
  display: grid;
  grid-template-columns: 1fr 420px;
  height: 100vh;
  background: var(--bg-primary);
  overflow: hidden;
}

.menu-panel {
  background: var(--bg-primary);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.cart-panel-wrapper {
  background: var(--bg-secondary);
  border-left: 1px solid var(--border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Responsive */
@media (max-width: 1280px) {
  .new-order-view {
    grid-template-columns: 1fr 360px;
  }
}

@media (max-width: 1024px) {
  .new-order-view {
    grid-template-columns: 1fr 320px;
  }
}

@media (max-width: 768px) {
  .new-order-view {
    grid-template-columns: 1fr;
  }

  .cart-panel-wrapper {
    position: fixed;
    top: 0;
    right: -100%;
    width: 100%;
    max-width: 400px;
    height: 100vh;
    transition: right 0.3s;
    z-index: 1000;
  }

  .cart-panel-wrapper.show {
    right: 0;
  }
}
</style>
