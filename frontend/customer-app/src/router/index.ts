/**
 * Vue Router configuration for Customer App
 * Mobile-first navigation with smooth transitions and lazy loading
 * Includes authentication guards and onboarding flow
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Eager load critical views for instant initial render
import Splash from '@/views/Splash.vue'
import Onboarding from '@/views/Onboarding.vue'
import LocationPermission from '@/views/LocationPermission.vue'
import Welcome from '@/views/Welcome.vue'
import Home from '@/views/Home.vue'

// Auth views - eager load for better UX
import Login from '@/views/auth/Login.vue'
import SignUp from '@/views/auth/SignUp.vue'
import ForgotPassword from '@/views/auth/ForgotPassword.vue'
import Verification from '@/views/auth/Verification.vue'

// Lazy load all other views with code splitting
// This reduces the initial bundle size and improves load performance
const OrderTypeSelection = () => import('@/views/OrderTypeSelection.vue')
const CategoryView = () => import('@/views/CategoryView.vue')
const ProductDetails = () => import('@/views/ProductDetails.vue')
const RestaurantDetail = () => import('@/views/RestaurantDetail.vue')
const Menu = () => import('@/views/Menu.vue')
const SearchResults = () => import('@/views/SearchResults.vue')
const Cart = () => import('@/views/Cart.vue')
const Checkout = () => import('@/views/Checkout.vue')
const OrderConfirmation = () => import('@/views/OrderConfirmation.vue')
const OrderStatus = () => import('@/views/OrderStatus.vue')
const OrderTracking = () => import('@/views/OrderTracking.vue')
const Orders = () => import('@/views/Orders.vue')
const OrderDetail = () => import('@/views/OrderDetail.vue')
const Notifications = () => import('@/views/Notifications.vue')
const About = () => import('@/views/About.vue')
const Favorites = () => import('@/views/Favorites.vue')
const Profile = () => import('@/views/Profile.vue')
const EditProfile = () => import('@/views/EditProfile.vue')
const AddAddress = () => import('@/views/AddAddress.vue')
const ReviewOrder = () => import('@/views/ReviewOrder.vue')
const Settings = () => import('@/views/Settings.vue')
const Vouchers = () => import('@/views/Vouchers.vue')
const ComponentShowcase = () => import('@/views/ComponentShowcase.vue')

const routes: RouteRecordRaw[] = [
  // Root redirect to splash
  {
    path: '/',
    redirect: '/splash'
  },

  // Splash screen (initial app load)
  {
    path: '/splash',
    name: 'Splash',
    component: Splash,
    meta: {
      title: 'Loading',
      public: true,
      showHeader: false
    }
  },

  // Onboarding flow
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: Onboarding,
    meta: {
      title: 'Welcome',
      public: true,
      showHeader: false,
      transition: 'fade'
    }
  },

  // Location permission
  {
    path: '/location-permission',
    name: 'LocationPermission',
    component: LocationPermission,
    meta: {
      title: 'Location Access',
      public: true,
      showHeader: false,
      transition: 'slide-up'
    }
  },

  // Authentication routes
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: 'Log In',
      public: true,
      guestOnly: true,
      showHeader: false,
      transition: 'fade'
    }
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: SignUp,
    meta: {
      title: 'Sign Up',
      public: true,
      guestOnly: true,
      showHeader: false,
      transition: 'fade'
    }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: {
      title: 'Forgot Password',
      public: true,
      showHeader: false,
      transition: 'slide-left'
    }
  },
  {
    path: '/verification',
    name: 'Verification',
    component: Verification,
    meta: {
      title: 'Verification',
      public: true,
      showHeader: false,
      transition: 'slide-left'
    }
  },

  // Main app routes (require authentication)
  {
    path: '/order-type',
    name: 'OrderTypeSelection',
    component: OrderTypeSelection,
    meta: {
      title: 'Choose Order Type',
      showHeader: false,
      transition: 'slide-left'
    }
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
    path: '/category/:id',
    name: 'CategoryView',
    component: CategoryView,
    props: true,
    meta: {
      title: 'Category',
      showHeader: false,
      transition: 'slide-left'
    }
  },
  {
    path: '/product/:id',
    name: 'ProductDetails',
    component: ProductDetails,
    props: true,
    meta: {
      title: 'Product Details',
      showHeader: false,
      transition: 'slide-up'
    }
  },
  {
    path: '/restaurant/:id',
    name: 'RestaurantDetail',
    component: RestaurantDetail,
    props: true,
    meta: {
      title: 'Restaurant',
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
    path: '/order-tracking/:orderNumber',
    name: 'OrderTracking',
    component: OrderTracking,
    props: true,
    meta: {
      title: 'Track Order',
      showHeader: false,
      transition: 'slide-left'
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
    path: '/order/:id',
    name: 'OrderDetail',
    component: OrderDetail,
    props: true,
    meta: {
      title: 'Order Details',
      showHeader: false,
      transition: 'slide-left'
    }
  },
  {
    path: '/review/:orderNumber',
    name: 'ReviewOrder',
    component: ReviewOrder,
    props: true,
    meta: {
      title: 'Rate Order',
      showHeader: false,
      transition: 'slide-up'
    }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: Notifications,
    meta: {
      title: 'Notifications',
      showHeader: false,
      transition: 'slide-left'
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
    path: '/profile/edit',
    name: 'EditProfile',
    component: EditProfile,
    meta: {
      title: 'Edit Profile',
      showHeader: false,
      transition: 'slide-left'
    }
  },
  {
    path: '/address/add',
    name: 'AddAddress',
    component: AddAddress,
    meta: {
      title: 'Add Address',
      showHeader: false,
      transition: 'slide-up'
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
router.beforeEach(async (to, from, next) => {
  // Set page title
  if (to.meta.title) {
    document.title = `${to.meta.title} - Garbaking`
  } else {
    document.title = 'Garbaking - Commande en ligne'
  }

  const authStore = useAuthStore()

  // Public routes (accessible without authentication)
  const isPublicRoute = to.meta.public === true

  // Routes that should only be accessible to guests (not logged in)
  const isGuestOnlyRoute = to.meta.guestOnly === true

  // Check if user is authenticated
  const isAuthenticated = authStore.isAuthenticated && authStore.token

  // Redirect authenticated users away from guest-only pages
  if (isGuestOnlyRoute && isAuthenticated) {
    next('/home')
    return
  }

  // Redirect unauthenticated users to login (except for public routes)
  if (!isPublicRoute && !isAuthenticated) {
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
    return
  }

  // Validate cart access
  if (to.name === 'Cart' || to.name === 'Checkout') {
    // In a real app, you might check if the cart has items
    // For now, we'll allow access
  }

  // Validate order-specific routes
  if (to.name === 'OrderConfirmation' || to.name === 'OrderStatus') {
    if (!to.params.orderNumber) {
      next('/home')
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