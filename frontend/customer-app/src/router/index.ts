/**
 * Vue Router configuration for Customer App
 * Mobile-first navigation with smooth transitions and lazy loading
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Eager load critical views for instant initial render
import Welcome from '@/views/Welcome.vue'
import Home from '@/views/Home.vue'

// Lazy load all other views with code splitting
// This reduces the initial bundle size and improves load performance
const Menu = () => import('@/views/Menu.vue')
const SearchResults = () => import('@/views/SearchResults.vue')
const Cart = () => import('@/views/Cart.vue')
const Checkout = () => import('@/views/Checkout.vue')
const OrderConfirmation = () => import('@/views/OrderConfirmation.vue')
const OrderStatus = () => import('@/views/OrderStatus.vue')
const Orders = () => import('@/views/Orders.vue')
const About = () => import('@/views/About.vue')
const Favorites = () => import('@/views/Favorites.vue')
const Profile = () => import('@/views/Profile.vue')
const Settings = () => import('@/views/Settings.vue')
const Vouchers = () => import('@/views/Vouchers.vue')
const ComponentShowcase = () => import('@/views/ComponentShowcase.vue')

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
    path: '/search',
    name: 'SearchResults',
    component: SearchResults,
    meta: {
      title: 'Recherche',
      showHeader: false,
      transition: 'slide-up'
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
    path: '/orders',
    name: 'Orders',
    component: Orders,
    meta: {
      title: 'Mes Commandes',
      showHeader: false,
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
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: {
      title: 'Paramètres',
      showHeader: false,
      transition: 'slide-left'
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