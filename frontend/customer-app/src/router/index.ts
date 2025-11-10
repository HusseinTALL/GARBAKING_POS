/**
 * Vue Router configuration for Customer App
 * Mobile-first navigation with smooth transitions
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Import views
import Welcome from '@/views/Welcome.vue'
import Home from '@/views/Home.vue'
import Menu from '@/views/Menu.vue'
import Cart from '@/views/Cart.vue'
import Checkout from '@/views/Checkout.vue'
import OrderConfirmation from '@/views/OrderConfirmation.vue'
import OrderStatus from '@/views/OrderStatus.vue'
import About from '@/views/About.vue'
import Favorites from '@/views/Favorites.vue'
import Profile from '@/views/Profile.vue'
import Vouchers from '@/views/Vouchers.vue'
import ComponentShowcase from '@/views/ComponentShowcase.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/welcome',
    name: 'Welcome',
    component: Welcome,
    meta: {
      title: 'Bienvenue chez Garbaking',
      showHeader: false,
      transition: 'slide-right'
    }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: {
      title: 'Menu',
      showHeader: false,
      transition: 'slide-left'
    }
  },
  {
    path: '/menu',
    name: 'Menu',
    component: Menu,
    meta: {
      title: 'Notre Menu',
      showHeader: true,
      transition: 'slide-left'
    }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: Favorites,
    meta: {
      title: 'Mes Favoris',
      showHeader: false,
      transition: 'fade'
    }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart,
    meta: {
      title: 'Mon Panier',
      showHeader: true,
      showBackButton: true,
      transition: 'slide-up'
    }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: Checkout,
    meta: {
      title: 'Finaliser la commande',
      showHeader: true,
      showBackButton: true,
      transition: 'slide-left'
    }
  },
  {
    path: '/order-confirmation/:orderNumber',
    name: 'OrderConfirmation',
    component: OrderConfirmation,
    props: true,
    meta: {
      title: 'Commande confirmée',
      showHeader: true,
      transition: 'bounce-in'
    }
  },
  {
    path: '/order-status/:orderNumber',
    name: 'OrderStatus',
    component: OrderStatus,
    props: true,
    meta: {
      title: 'Suivi de commande',
      showHeader: true,
      showBackButton: true,
      transition: 'fade'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: {
      title: 'À propos',
      showHeader: true,
      showBackButton: true,
      transition: 'slide-left'
    }
  },
  {
    path: '/vouchers',
    name: 'Vouchers',
    component: Vouchers,
    meta: {
      title: 'Mes Bons',
      showHeader: false,
      transition: 'fade'
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: {
      title: 'Profil',
      showHeader: false,
      transition: 'fade'
    }
  },
  {
    path: '/showcase',
    name: 'ComponentShowcase',
    component: ComponentShowcase,
    meta: {
      title: 'Component Showcase',
      showHeader: false,
      transition: 'fade'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/home'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach((to, from, next) => {
  // Set page title
  if (to.meta.title) {
    document.title = `${to.meta.title} - Garbaking`
  } else {
    document.title = 'Garbaking - Commande en ligne'
  }

  // Validate cart access
  if (to.name === 'Cart' || to.name === 'Checkout') {
    // In a real app, you might check if the cart has items
    // For now, we'll allow access
  }

  // Validate order-specific routes
  if (to.name === 'OrderConfirmation' || to.name === 'OrderStatus') {
    if (!to.params.orderNumber) {
      next('/')
      return
    }
  }

  next()
})

// Add transition classes based on route meta
router.afterEach((to, from) => {
  // This will be used by the transition component
  const app = document.getElementById('app')
  if (app && to.meta.transition) {
    app.setAttribute('data-transition', to.meta.transition as string)
  }
})

export default router