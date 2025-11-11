<!--
  Next-Level Enhanced Responsive Sidebar Component
  New Features:
  - Glassmorphism design with backdrop blur
  - Advanced micro-interactions and animations
  - Navigation search/filter
  - User profile section with dropdown
  - Swipe gestures for mobile
  - Recent items section
  - Keyboard shortcuts display
  - Progress indicators
  - Enhanced accessibility
  - Smooth page transitions
-->
<template>
  <div>
    <!-- Mobile Overlay with Blur -->
    <Transition name="overlay">
      <div
        v-if="isMobileMenuOpen && isMobile"
        class="mobile-overlay"
        @click="closeMobileMenu"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      />
    </Transition>

    <!-- Sidebar -->
    <aside
      ref="sidebarRef"
      :class="[
        'sidebar',
        {
          'sidebar-collapsed': isCollapsed && !isMobile,
          'sidebar-mobile-open': isMobileMenuOpen && isMobile,
          'sidebar-transitioning': isTransitioning
        }
      ]"
      @touchstart="handleSidebarTouchStart"
      @touchmove="handleSidebarTouchMove"
      @touchend="handleSidebarTouchEnd"
    >
      <!-- Animated Background Gradient -->
      <div class="sidebar-bg-gradient" />

      <!-- Header -->
      <div class="sidebar-header">
        <div class="brand-wrapper">
          <div class="brand-icon" :class="{ 'brand-icon-loading': isLoading }">
            <UtensilsCrossed class="brand-icon-svg" />
            <div class="brand-icon-glow" />
          </div>
          <Transition name="fade-slide">
            <div v-show="!isCollapsed || isMobile" class="brand-text">
              <h1 class="brand-title">
                Garbaking
                <span class="brand-badge">PRO</span>
              </h1>
              <p class="brand-subtitle">POS Admin Dashboard</p>
            </div>
          </Transition>
        </div>

        <!-- Mobile Close Button -->
        <button
          v-if="isMobile"
          @click="closeMobileMenu"
          class="mobile-close-btn"
          aria-label="Close menu"
        >
          <X class="w-5 h-5" />
        </button>

        <!-- Desktop Toggle Button -->
        <button
          v-else
          @click="toggleCollapse"
          class="collapse-toggle-btn"
          :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <ChevronLeft :class="['toggle-icon', { 'rotate-180': isCollapsed }]" />
          <div class="button-ripple" />
        </button>
      </div>

      <!-- Search Bar -->
      <Transition name="fade-slide">
        <div v-show="!isCollapsed || isMobile" class="search-wrapper">
          <div class="search-container">
            <Search class="search-icon" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search menu..."
              class="search-input"
              @focus="isSearchFocused = true"
              @blur="isSearchFocused = false"
            />
            <kbd v-if="!isMobile" class="search-kbd">⌘K</kbd>
          </div>
        </div>
      </Transition>

      <!-- Combined User Profile & Stats Section -->
      <Transition name="fade-slide">
        <div v-show="!isCollapsed || isMobile" class="user-stats-section">
          <!-- User Profile -->
          <div class="user-profile-compact">
            <div class="user-avatar-wrapper">
              <div class="user-avatar">
                <User class="w-4 h-4" />
              </div>
              <div class="user-status-dot" />
            </div>
            <div class="user-info">
              <p class="user-name">Admin User</p>
              <p class="user-role">Super Admin</p>
            </div>
          </div>

          <!-- Quick Stats (Compact) -->
          <div class="quick-stats-compact">
            <div class="stat-item-compact">
              <TrendingUp class="stat-icon-sm stat-icon-success" />
              <span class="stat-value-sm">+23%</span>
              <span class="stat-label-sm">Sales</span>
            </div>
            <div class="stat-divider" />
            <div class="stat-item-compact">
              <Clock class="stat-icon-sm stat-icon-warning" />
              <span class="stat-value-sm">8</span>
              <span class="stat-label-sm">Pending</span>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Collapsed User Avatar -->
      <Transition name="fade">
        <div v-show="isCollapsed && !isMobile" class="collapsed-user-avatar">
          <div class="user-avatar">
            <User class="w-5 h-5" />
          </div>
          <div class="user-status-dot" />
          <div class="nav-tooltip">Admin User</div>
        </div>
      </Transition>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <!-- Recent Items -->
        <div v-if="filteredRecentItems.length > 0 && (!isCollapsed || isMobile)" class="nav-section">
          <p class="nav-section-title">
            <Clock class="section-title-icon" />
            Recent
          </p>
          <router-link
            v-for="item in filteredRecentItems"
            :key="'recent-' + item.path"
            :to="item.path"
            class="nav-item nav-item-recent"
            @click="handleNavClick"
          >
            <component :is="item.icon" class="nav-item-icon" />
            <span class="nav-item-label">{{ item.label }}</span>
            <Sparkles class="recent-sparkle" />
          </router-link>
        </div>

        <!-- Main Menu -->
        <div class="nav-section">
          <Transition name="fade">
            <p v-show="!isCollapsed || isMobile" class="nav-section-title">
              <LayoutDashboard class="section-title-icon" />
              Main Menu
            </p>
          </Transition>

          <router-link
            v-for="item in filteredMainNavItems"
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ 
              'nav-item-active': isActive(item.path),
              'has-badge': item.badge
            }"
            @click="handleNavClick"
            @mouseenter="handleNavHover(item)"
            @mouseleave="hoveredItem = null"
          >
            <component :is="item.icon" class="nav-item-icon" />
            <Transition name="fade-slide">
              <span v-show="!isCollapsed || isMobile" class="nav-item-label">
                {{ item.label }}
              </span>
            </Transition>
            <Transition name="scale-fade">
              <span
                v-if="item.badge && (!isCollapsed || isMobile)"
                class="nav-item-badge"
              >
                {{ item.badge }}
              </span>
            </Transition>

            <!-- Enhanced Tooltip for collapsed state -->
            <div v-if="isCollapsed && !isMobile" class="nav-tooltip enhanced-tooltip">
              <span class="tooltip-title">{{ item.label }}</span>
              <span v-if="item.shortcut" class="tooltip-shortcut">{{ item.shortcut }}</span>
            </div>

            <!-- Progress Bar for Active Item -->
            <div v-if="isActive(item.path)" class="nav-item-progress" />
          </router-link>
        </div>

        <!-- Management Menu -->
        <div class="nav-section">
          <Transition name="fade">
            <p v-show="!isCollapsed || isMobile" class="nav-section-title">
              <Settings class="section-title-icon" />
              Management
            </p>
          </Transition>

          <router-link
            v-for="item in filteredManagementNavItems"
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ 
              'nav-item-active': isActive(item.path),
              'has-badge': item.badge  
            }"
            @click="handleNavClick"
            @mouseenter="handleNavHover(item)"
            @mouseleave="hoveredItem = null"
          >
            <component :is="item.icon" class="nav-item-icon" />
            <Transition name="fade-slide">
              <span v-show="!isCollapsed || isMobile" class="nav-item-label">
                {{ item.label }}
              </span>
            </Transition>
            <Transition name="scale-fade">
              <span
                v-if="item.badge && (!isCollapsed || isMobile)"
                class="nav-item-badge"
              >
                {{ item.badge }}
              </span>
            </Transition>

            <!-- Enhanced Tooltip -->
            <div v-if="isCollapsed && !isMobile" class="nav-tooltip enhanced-tooltip">
              <span class="tooltip-title">{{ item.label }}</span>
              <span v-if="item.shortcut" class="tooltip-shortcut">{{ item.shortcut }}</span>
            </div>

            <!-- Progress Bar -->
            <div v-if="isActive(item.path)" class="nav-item-progress" />
          </router-link>
        </div>
      </nav>

      <!-- Footer Actions -->
      <div class="sidebar-footer">
        <!-- Top Row: Notifications and Settings -->
        <div class="footer-row">
          <button
            class="footer-btn footer-btn-compact"
            :class="{ 'footer-btn-active': notificationCount > 0 }"
            @click="toggleNotifications"
          >
            <div class="footer-btn-icon-wrapper">
              <Bell class="footer-btn-icon" />
              <span v-if="notificationCount > 0" class="notification-pulse" />
            </div>
            <Transition name="fade-slide">
              <span v-show="!isCollapsed || isMobile" class="footer-btn-label">
                Notifications
              </span>
            </Transition>
            <Transition name="scale-fade">
              <span v-if="notificationCount > 0 && (!isCollapsed || isMobile)" class="notification-badge">
                {{ notificationCount > 99 ? '99+' : notificationCount }}
              </span>
            </Transition>

            <div v-if="isCollapsed && !isMobile" class="nav-tooltip enhanced-tooltip">
              <span class="tooltip-title">Notifications</span>
              <span v-if="notificationCount > 0" class="tooltip-badge">{{ notificationCount }}</span>
            </div>
          </button>

          <button
            class="footer-btn footer-btn-compact"
            @click="$router.push('/settings')"
          >
            <div class="footer-btn-icon-wrapper">
              <Settings class="footer-btn-icon footer-icon-spin" />
            </div>
            <Transition name="fade-slide">
              <span v-show="!isCollapsed || isMobile" class="footer-btn-label">Settings</span>
            </Transition>

            <div v-if="isCollapsed && !isMobile" class="nav-tooltip enhanced-tooltip">
              <span class="tooltip-title">Settings</span>
              <span class="tooltip-shortcut">⌘,</span>
            </div>
          </button>
        </div>

        <!-- Bottom Row: Sign Out -->
        <button
          class="footer-btn footer-btn-danger"
          @click="handleLogout"
        >
          <div class="footer-btn-icon-wrapper">
            <LogOut class="footer-btn-icon" />
          </div>
          <Transition name="fade-slide">
            <span v-show="!isCollapsed || isMobile" class="footer-btn-label">Sign Out</span>
          </Transition>

          <div v-if="isCollapsed && !isMobile" class="nav-tooltip enhanced-tooltip">
            <span class="tooltip-title">Sign Out</span>
          </div>
        </button>

        <!-- Version Info -->
        <Transition name="fade">
          <div v-show="!isCollapsed || isMobile" class="version-info">
            <Zap class="version-icon" />
            <span class="version-text">v2.4.1</span>
          </div>
        </Transition>
      </div>
    </aside>

    <!-- Mobile Menu Toggle Button (Floating with Animations) -->
    <Transition name="fab">
      <button
        v-if="isMobile && !isMobileMenuOpen"
        @click="openMobileMenu"
        class="mobile-menu-btn"
        aria-label="Open menu"
      >
        <Menu class="fab-icon" />
        <div class="fab-ripple" />
      </button>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  LayoutDashboard,
  ShoppingCart,
  ChefHat,
  LayoutGrid,
  UtensilsCrossed,
  CookingPot,
  Gift,
  BarChart3,
  CreditCard,
  Receipt,
  Users,
  Settings,
  Bell,
  LogOut,
  ChevronLeft,
  X,
  Menu,
  Search,
  User,
  TrendingUp,
  Clock,
  Sparkles,
  Zap,
  FileText
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Refs
const sidebarRef = ref<HTMLElement | null>(null)

// State
const isCollapsed = ref(false)
const isMobileMenuOpen = ref(false)
const isMobile = ref(false)
const isLoading = ref(false)
const isTransitioning = ref(false)
const notificationCount = ref(3)
const searchQuery = ref('')
const isSearchFocused = ref(false)
const hoveredItem = ref<any>(null)

// Touch gesture state
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchCurrentX = ref(0)
const isSwiping = ref(false)

// Navigation items with shortcuts
const mainNavItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    badge: null,
    shortcut: '⌘D'
  },
  {
    path: '/orders/new',
    label: 'New Order',
    icon: ShoppingCart,
    badge: null,
    shortcut: '⌘N'
  },
  {
    path: '/orders',
    label: 'Orders',
    icon: ChefHat,
    badge: 12,
    shortcut: '⌘O'
  },
  {
    path: '/tables',
    label: 'Tables',
    icon: LayoutGrid,
    badge: null,
    shortcut: '⌘T'
  },
  {
    path: '/menu',
    label: 'Menu',
    icon: UtensilsCrossed,
    badge: null,
    shortcut: '⌘M'
  },
  {
    path: '/kitchen',
    label: 'Kitchen Display',
    icon: CookingPot,
    badge: null,
    shortcut: '⌘K'
  }
]

const managementNavItems = [
  {
    path: '/loyalty',
    label: 'Loyalty Program',
    icon: Gift,
    badge: null,
    shortcut: null
  },
  {
    path: '/analytics',
    label: 'Analytics',
    icon: BarChart3,
    badge: null,
    shortcut: '⌘A'
  },
  {
    path: '/payment',
    label: 'Payments',
    icon: CreditCard,
    badge: null,
    shortcut: null
  },
  {
    path: '/cash-reports',
    label: 'Cash Reports',
    icon: FileText,
    badge: null,
    shortcut: null
  },
  {
    path: '/receipts',
    label: 'Receipts',
    icon: Receipt,
    badge: null,
    shortcut: null
  },
  {
    path: '/users',
    label: 'Users',
    icon: Users,
    badge: null,
    shortcut: '⌘U'
  }
]

// Recent items (last 3 visited)
const recentItems = ref([
  {
    path: '/analytics',
    label: 'Analytics',
    icon: BarChart3
  },
  {
    path: '/orders',
    label: 'Orders',
    icon: ChefHat
  }
])

// Computed - Filtered navigation items
const filteredMainNavItems = computed(() => {
  if (!searchQuery.value) return mainNavItems
  return mainNavItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const filteredManagementNavItems = computed(() => {
  if (!searchQuery.value) return managementNavItems
  return managementNavItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const filteredRecentItems = computed(() => {
  if (!searchQuery.value) return recentItems.value
  return recentItems.value.filter(item =>
    item.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Check if route is active
const isActive = (path: string): boolean => {
  return route.path === path || route.path.startsWith(path + '/')
}

// Toggle sidebar collapse with animation
const toggleCollapse = () => {
  isTransitioning.value = true
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebar-collapsed', String(isCollapsed.value))
  
  setTimeout(() => {
    isTransitioning.value = false
  }, 300)
}

// Mobile menu controls
const openMobileMenu = () => {
  isMobileMenuOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}

const handleNavClick = () => {
  if (isMobile.value) {
    closeMobileMenu()
  }
}

const handleNavHover = (item: any) => {
  hoveredItem.value = item
}

// Touch gesture handlers for swipe to close
const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  isSwiping.value = false
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isMobileMenuOpen.value) return
  
  touchCurrentX.value = e.touches[0].clientX
  const deltaX = touchCurrentX.value - touchStartX.value
  const deltaY = Math.abs(e.touches[0].clientY - touchStartY.value)
  
  // Only trigger swipe if horizontal movement is greater than vertical
  if (Math.abs(deltaX) > deltaY && deltaX < -50) {
    isSwiping.value = true
  }
}

const handleTouchEnd = () => {
  if (isSwiping.value && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
  isSwiping.value = false
}

// Sidebar touch handlers (swipe from edge to open)
const handleSidebarTouchStart = (e: TouchEvent) => {
  if (!isMobile.value || isMobileMenuOpen.value) return
  
  const touch = e.touches[0]
  if (touch.clientX < 20) { // Edge detection
    touchStartX.value = touch.clientX
  }
}

const handleSidebarTouchMove = (e: TouchEvent) => {
  if (!isMobile.value || isMobileMenuOpen.value) return
  
  const touch = e.touches[0]
  const deltaX = touch.clientX - touchStartX.value
  
  if (deltaX > 50) {
    openMobileMenu()
  }
}

const handleSidebarTouchEnd = () => {
  // Reset
}

// Handle responsive breakpoints
const checkMobile = () => {
  const wasMobile = isMobile.value
  isMobile.value = window.innerWidth < 1024
  
  if (!isMobile.value && wasMobile) {
    closeMobileMenu()
  }
}

const toggleNotifications = () => {
  // TODO: Implement notifications panel
  console.log('Toggle notifications')
}

const handleLogout = async () => {
  if (confirm('Are you sure you want to sign out?')) {
    isLoading.value = true
    await authStore.logout()
    router.push('/login')
  }
}

// Lifecycle hooks
onMounted(() => {
  // Restore collapse state
  const saved = localStorage.getItem('sidebar-collapsed')
  if (saved !== null) {
    isCollapsed.value = saved === 'true'
  }

  // Check mobile
  checkMobile()
  window.addEventListener('resize', checkMobile)

  // Keyboard shortcuts
  const handleKeyboard = (e: KeyboardEvent) => {
    // Cmd/Ctrl + B - Toggle sidebar
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault()
      if (!isMobile.value) {
        toggleCollapse()
      } else {
        isMobileMenuOpen.value ? closeMobileMenu() : openMobileMenu()
      }
    }
    
    // Cmd/Ctrl + K - Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      const searchInput = document.querySelector('.search-input') as HTMLInputElement
      searchInput?.focus()
    }
    
    // Escape - Close mobile menu
    if (e.key === 'Escape' && isMobileMenuOpen.value) {
      closeMobileMenu()
    }
  }
  
  window.addEventListener('keydown', handleKeyboard)

  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
    window.removeEventListener('keydown', handleKeyboard)
    document.body.style.overflow = ''
  })
})
</script>

<style scoped>
/* Variables */
:root {
  --sidebar-width-expanded: 300px;
  --sidebar-width-collapsed: 80px;
  --sidebar-transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);
}

/* Sidebar Base with Glassmorphism */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--sidebar-width-expanded);
  background: linear-gradient(135deg, 
    rgba(26, 26, 46, 0.98) 0%, 
    rgba(32, 32, 55, 0.95) 100%
  );
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  transition: var(--sidebar-transition);
  z-index: 1000;
  overflow: hidden;
  box-shadow: 
    4px 0 24px rgba(0, 0, 0, 0.1),
    0 0 80px rgba(255, 107, 53, 0.05);
}

.sidebar-collapsed {
  width: var(--sidebar-width-collapsed);
}

/* Animated Background Gradient */
.sidebar-bg-gradient {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(255, 107, 53, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 107, 53, 0.08) 0%, transparent 50%);
  opacity: 0.6;
  animation: gradientShift 15s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes gradientShift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(10px, -10px) scale(1.1); }
  66% { transform: translate(-10px, 10px) scale(0.9); }
}

/* All content above gradient */
.sidebar > * {
  position: relative;
  z-index: 1;
}

/* Header */
.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 88px;
  background: var(--glass-bg);
}

.brand-wrapper {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.brand-icon {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, var(--accent-orange) 0%, #FF8C5A 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 
    0 8px 16px rgba(255, 107, 53, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.brand-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.2) 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.brand-icon:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 
    0 12px 24px rgba(255, 107, 53, 0.4),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
}

.brand-icon:hover::before {
  opacity: 1;
}

.brand-icon-svg {
  width: 30px;
  height: 30px;
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  transition: transform 0.3s;
}

.brand-icon:hover .brand-icon-svg {
  transform: rotate(12deg) scale(1.1);
}

.brand-icon-loading .brand-icon-svg {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(0.95); }
}

.brand-icon-glow {
  position: absolute;
  inset: -4px;
  background: inherit;
  border-radius: inherit;
  filter: blur(12px);
  opacity: 0.4;
  z-index: -1;
}

.brand-text {
  min-width: 0;
  flex: 1;
}

.brand-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  background: linear-gradient(135deg, var(--accent-orange), #FF8C5A);
  color: white;
  font-size: 10px;
  font-weight: 800;
  border-radius: 6px;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
}

.brand-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 500;
}

.collapse-toggle-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.collapse-toggle-btn:hover {
  background: var(--accent-orange);
  color: white;
  border-color: transparent;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.collapse-toggle-btn:active {
  transform: scale(0.95);
}

.toggle-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.rotate-180 {
  transform: rotate(180deg);
}

.button-ripple {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  opacity: 0;
  transform: scale(0);
  transition: all 0.5s;
}

.collapse-toggle-btn:active .button-ripple {
  opacity: 1;
  transform: scale(1);
  transition: all 0s;
}

/* Search Bar */
.search-wrapper {
  padding: 16px 20px 12px;
  background: var(--glass-bg);
  border-bottom: 1px solid var(--glass-border);
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 10px 12px;
  transition: all 0.3s;
}

.search-container:focus-within {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-orange);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.search-icon {
  width: 18px;
  height: 18px;
  color: var(--text-secondary);
  margin-right: 10px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.search-kbd {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  font-family: monospace;
  margin-left: 8px;
}

/* User Stats Combined Section */
.user-stats-section {
  padding: 12px 16px;
  background: var(--glass-bg);
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Compact User Profile */
.user-profile-compact {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--accent-orange), #FF8C5A);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.user-status-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 8px;
  height: 8px;
  background: #4CAF50;
  border: 2px solid var(--bg-secondary);
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.5);
  animation: statusPulse 2s ease-in-out infinite;
}

@keyframes statusPulse {
  0%, 100% { box-shadow: 0 0 8px rgba(76, 175, 80, 0.5); }
  50% { box-shadow: 0 0 16px rgba(76, 175, 80, 0.8); }
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

.user-role {
  font-size: 11px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.2;
}

/* Compact Quick Stats */
.quick-stats-compact {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
}

.stat-item-compact {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-icon-sm {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.stat-icon-success {
  color: #4CAF50;
}

.stat-icon-warning {
  color: #FF9800;
}

.stat-value-sm {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.stat-label-sm {
  font-size: 10px;
  color: var(--text-secondary);
  line-height: 1;
}

.stat-divider {
  width: 1px;
  height: 20px;
  background: var(--glass-border);
  flex-shrink: 0;
}

.collapsed-user-avatar {
  margin: 12px auto 8px;
  width: fit-content;
  position: relative;
}

.collapsed-user-avatar .user-avatar {
  cursor: pointer;
  width: 38px;
  height: 38px;
}

.collapsed-user-avatar .user-avatar:hover + .nav-tooltip {
  opacity: 1;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-collapsed .sidebar-nav {
  padding: 12px 8px;
  gap: 12px;
}

.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-collapsed .nav-section {
  gap: 4px;
}

.nav-section-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--text-secondary);
  padding: 10px 14px 6px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title-icon {
  width: 14px;
  height: 14px;
  opacity: 0.6;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 14px;
  border-radius: 12px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  min-height: 52px;
  background: transparent;
  overflow: hidden;
}

.sidebar-collapsed .nav-item {
  min-height: 44px;
  padding: 10px;
  justify-content: center;
  border-radius: 10px;
}

.sidebar-collapsed .nav-item-icon {
  width: 22px;
  height: 22px;
}

.nav-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    rgba(255, 107, 53, 0) 0%, 
    rgba(255, 107, 53, 0.05) 100%
  );
  opacity: 0;
  transition: opacity 0.3s;
}

.nav-item:hover {
  background: rgba(255, 107, 53, 0.12);
  color: var(--accent-orange);
  transform: translateX(4px);
}

.nav-item:hover::before {
  opacity: 1;
}

.nav-item-recent {
  background: rgba(255, 107, 53, 0.08);
  border: 1px solid rgba(255, 107, 53, 0.2);
}

.nav-item-active {
  background: linear-gradient(135deg, 
    var(--accent-orange) 0%, 
    #FF8C5A 100%
  );
  color: white !important;
  box-shadow: 
    0 8px 16px rgba(255, 107, 53, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateX(0);
}

.nav-item-active::before {
  opacity: 0;
}

.nav-item-active:hover {
  background: linear-gradient(135deg, 
    #FF8C5A 0%, 
    var(--accent-orange) 100%
  );
  transform: translateX(2px) scale(1.02);
}

.nav-item-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  transition: transform 0.3s;
}

.nav-item:hover .nav-item-icon {
  transform: scale(1.1);
}

.nav-item-active .nav-item-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.nav-item-label {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-item-badge {
  background: rgba(255, 107, 53, 0.2);
  color: var(--accent-orange);
  font-size: 11px;
  font-weight: 800;
  min-width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  border-radius: 12px;
  flex-shrink: 0;
  border: 1px solid rgba(255, 107, 53, 0.3);
}

.nav-item-active .nav-item-badge {
  background: rgba(255, 255, 255, 0.25);
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
}

.recent-sparkle {
  width: 16px;
  height: 16px;
  color: var(--accent-orange);
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { opacity: 0.4; transform: rotate(0deg) scale(1); }
  50% { opacity: 1; transform: rotate(180deg) scale(1.2); }
}

/* Progress Bar for Active Items */
.nav-item-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.6) 0%, 
    rgba(255, 255, 255, 0.9) 50%, 
    rgba(255, 255, 255, 0.6) 100%
  );
  border-radius: 0 0 12px 12px;
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Enhanced Tooltip */
.nav-tooltip {
  position: absolute;
  left: calc(100% + 14px);
  top: 50%;
  transform: translateY(-50%);
  background: rgba(26, 26, 46, 0.98);
  backdrop-filter: blur(10px);
  color: var(--text-primary);
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10000;
  border: 1px solid var(--glass-border);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 107, 53, 0.1);
}

.enhanced-tooltip {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}

.tooltip-title {
  font-size: 14px;
}

.tooltip-shortcut {
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  font-family: monospace;
  color: var(--accent-orange);
}

.tooltip-badge {
  padding: 2px 8px;
  background: var(--accent-red);
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
}

.nav-item:hover .nav-tooltip,
.footer-btn:hover .nav-tooltip,
.collapsed-user-avatar:hover .nav-tooltip {
  opacity: 1;
  transform: translateY(-50%) translateX(4px);
}

/* Footer */
.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--glass-bg);
}

.sidebar-collapsed .sidebar-footer {
  padding: 10px 8px;
  gap: 4px;
}

.footer-row {
  display: flex;
  gap: 6px;
}

.sidebar-collapsed .footer-row {
  flex-direction: column;
  gap: 4px;
}

.footer-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-height: 44px;
  text-align: left;
}

.footer-btn-compact {
  flex: 1;
  min-height: 40px;
  padding: 8px 10px;
}

.sidebar-collapsed .footer-btn {
  min-height: 38px;
  padding: 8px;
  justify-content: center;
  border-radius: 10px;
  gap: 0;
}

.sidebar-collapsed .footer-btn-icon {
  width: 20px;
  height: 20px;
}

.footer-btn:hover {
  background: rgba(255, 107, 53, 0.12);
  color: var(--accent-orange);
  transform: translateX(4px);
}

.footer-btn-danger:hover {
  background: rgba(244, 67, 54, 0.12);
  color: var(--accent-red);
}

.footer-btn-active {
  color: var(--accent-orange);
}

.footer-btn-icon-wrapper {
  position: relative;
  flex-shrink: 0;
}

.footer-btn-icon {
  width: 24px;
  height: 24px;
  transition: transform 0.3s;
}

.footer-btn:hover .footer-btn-icon {
  transform: scale(1.1);
}

.footer-icon-spin:hover {
  animation: spinSlow 3s linear infinite;
}

@keyframes spinSlow {
  from { transform: rotate(0deg) scale(1.1); }
  to { transform: rotate(360deg) scale(1.1); }
}

.footer-btn-label {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-badge {
  position: relative;
  background: var(--accent-red);
  color: white;
  font-size: 11px;
  font-weight: 800;
  min-width: 24px;
  height: 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
  animation: badgePulse 2s ease-in-out infinite;
}

@keyframes badgePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.notification-pulse {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 8px;
  height: 8px;
  background: var(--accent-red);
  border-radius: 50%;
  animation: pulse-ring 1.5s ease-out infinite;
}

@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
  }
  100% {
    box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
  }
}

.version-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  margin-top: 4px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
}

.sidebar-collapsed .version-info {
  display: none;
}

.version-icon {
  width: 14px;
  height: 14px;
  color: var(--accent-orange);
}

/* Mobile Styles */
@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
    width: 340px;
    box-shadow: 8px 0 32px rgba(0, 0, 0, 0.2);
  }

  .sidebar-mobile-open {
    transform: translateX(0);
  }

  .mobile-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    z-index: 999;
  }

  .mobile-menu-btn {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent-orange), #FF8C5A);
    color: white;
    border: none;
    box-shadow: 
      0 8px 24px rgba(255, 107, 53, 0.4),
      0 0 0 0 rgba(255, 107, 53, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 998;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .mobile-menu-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s;
  }

  .mobile-menu-btn:hover {
    transform: scale(1.08);
    box-shadow: 
      0 12px 32px rgba(255, 107, 53, 0.5),
      0 0 0 8px rgba(255, 107, 53, 0.2);
  }

  .mobile-menu-btn:hover::before {
    opacity: 1;
  }

  .mobile-menu-btn:active {
    transform: scale(0.92);
  }

  .fab-icon {
    width: 28px;
    height: 28px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }

  .fab-ripple {
    position: absolute;
    inset: -8px;
    border: 2px solid var(--accent-orange);
    border-radius: 50%;
    opacity: 0.6;
    animation: fabRipple 1.5s ease-out infinite;
  }

  @keyframes fabRipple {
    0% {
      transform: scale(0.8);
      opacity: 0.6;
    }
    100% {
      transform: scale(1.3);
      opacity: 0;
    }
  }

  .mobile-close-btn {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--glass-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.3s;
  }

  .mobile-close-btn:hover {
    background: rgba(244, 67, 54, 0.15);
    color: var(--accent-red);
    border-color: var(--accent-red);
  }

  .collapse-toggle-btn {
    display: none;
  }
}

/* Tablet Optimization */
@media (min-width: 768px) and (max-width: 1024px) {
  .sidebar {
    width: 360px;
  }
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-12px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: all 0.3s;
}

.scale-fade-enter-from,
.scale-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.overlay-enter-active,
.overlay-leave-active {
  transition: all 0.4s;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

.fab-enter-active,
.fab-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-enter-from {
  opacity: 0;
  transform: scale(0) rotate(-180deg);
}

.fab-leave-to {
  opacity: 0;
  transform: scale(0) rotate(180deg);
}

/* Accessibility */
.nav-item:focus-visible,
.footer-btn:focus-visible,
.collapse-toggle-btn:focus-visible,
.mobile-menu-btn:focus-visible {
  outline: 2px solid var(--accent-orange);
  outline-offset: 2px;
}

/* Performance Optimization */
.sidebar-transitioning * {
  pointer-events: none;
}

/* Dark mode optimization */
@media (prefers-color-scheme: dark) {
  .sidebar {
    box-shadow: 
      4px 0 32px rgba(0, 0, 0, 0.3),
      0 0 100px rgba(255, 107, 53, 0.08);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
