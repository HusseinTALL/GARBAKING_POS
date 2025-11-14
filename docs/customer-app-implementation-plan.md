# Customer App - Complete Implementation Plan
## Garbaking POS System - Phase 6 Enhancement

**Document Version:** 1.0
**Date:** 2025-11-12
**Status:** Planning Phase
**Priority:** High

---

## 📋 Executive Summary

This document outlines a comprehensive, detailed implementation plan for all missing UI components and features in the Garbaking POS Customer App. The plan is structured into 15 major feature groups with 87 specific implementation tasks, organized by priority and dependencies.

**Current State:**
- Basic menu browsing ✅
- Simple cart functionality ✅
- Basic checkout flow ✅
- Order confirmation ✅

**Target State:**
- Full-featured food ordering app with 40+ screens
- Complete user authentication and profile management
- Advanced search and filtering
- Real-time order tracking with maps
- Payment integration
- Review and rating system
- Chat/messaging system
- Address management with maps
- Wallet/balance system
- Push notifications

---

## 🎯 Implementation Overview

### Total Features: 15 Major Groups
### Total Screens: 40+ Screens
### Total Components: 60+ Components
### Estimated Timeline: 8-10 Weeks
### Team Size: 2-3 Developers

---

## 📊 Feature Groups Priority Matrix

| Priority | Feature Group | Screens | Components | Complexity | Estimated Time |
|----------|--------------|---------|------------|------------|----------------|
| P0 (Critical) | Authentication & Onboarding | 6 | 8 | Medium | 1 week |
| P0 (Critical) | Enhanced Home Screen | 3 | 12 | High | 1.5 weeks |
| P0 (Critical) | Search & Filter System | 2 | 6 | Medium | 1 week |
| P1 (High) | Restaurant View & Details | 3 | 10 | Medium | 1 week |
| P1 (High) | Enhanced Food Details | 2 | 8 | Medium | 1 week |
| P1 (High) | Advanced Cart Management | 2 | 5 | Low | 3 days |
| P1 (High) | Payment Methods | 3 | 6 | High | 1 week |
| P2 (Medium) | Address Management | 4 | 8 | High | 1.5 weeks |
| P2 (Medium) | Order Tracking & History | 4 | 10 | High | 1.5 weeks |
| P2 (Medium) | Profile & Wallet System | 5 | 12 | Medium | 1 week |
| P3 (Low) | Notifications Center | 2 | 4 | Low | 3 days |
| P3 (Low) | Messages/Chat System | 3 | 8 | High | 1 week |
| P3 (Low) | Reviews & Ratings | 3 | 6 | Medium | 4 days |
| P3 (Low) | Favorites & Lists | 2 | 4 | Low | 2 days |
| P3 (Low) | Settings & Preferences | 3 | 6 | Low | 3 days |

---

## 🏗️ PHASE 1: AUTHENTICATION & ONBOARDING (P0 - Week 1)

### 1.1 Onboarding Screens ✅ (Started)
**File:** `/views/Onboarding.vue` (Created)

**Screens:**
- Slide 1: "All your favorites" with illustration
- Slide 2: "Order from chosen chef" with illustration
- Slide 3: "Free delivery offers" with illustration

**Components Needed:**
- [x] OnboardingSlide component (inline in view)
- [ ] Illustration components (SVG-based)
- [ ] Progress indicator dots
- [ ] Skip button
- [ ] Next/Get Started buttons

**Features:**
- Swipe gesture support for navigation
- Auto-advance option
- Skip to home functionality
- LocalStorage flag to show once
- Smooth slide transitions

**Technical Requirements:**
```typescript
// Store onboarding completion status
localStorage.setItem('onboarding_completed', 'true')

// Check on app mount
const showOnboarding = !localStorage.getItem('onboarding_completed')
```

---

### 1.2 Authentication Screens
**Files:**
- `/views/auth/Login.vue`
- `/views/auth/SignUp.vue`
- `/views/auth/ForgotPassword.vue`
- `/views/auth/Verification.vue`

#### 1.2.1 Login Screen
**Elements:**
- [ ] Email input field
- [ ] Password input field with show/hide toggle
- [ ] "Remember me" checkbox
- [ ] "Forgot Password" link
- [ ] "LOG IN" primary button
- [ ] "Don't have an account? SIGN UP" link
- [ ] Social login buttons (Facebook, Twitter, Apple)
- [ ] Dark background with decorative patterns

**Validation:**
- Email format validation
- Password minimum length (8 characters)
- Show error messages below fields
- Disable button while submitting

**API Integration:**
```typescript
POST /api/auth/login
Body: { email: string, password: string, remember: boolean }
Response: { token: string, user: User }
```

#### 1.2.2 Sign Up Screen
**Elements:**
- [ ] Full name input field
- [ ] Email input field
- [ ] Password input field with show/hide toggle
- [ ] Confirm password input field with show/hide toggle
- [ ] "SIGN UP" primary button
- [ ] Terms and conditions checkbox
- [ ] Social sign-up options

**Validation:**
- All fields required
- Email format validation
- Password strength indicator
- Password match validation
- Terms acceptance required

**API Integration:**
```typescript
POST /api/auth/register
Body: { name: string, email: string, password: string }
Response: { token: string, user: User, requiresVerification: boolean }
```

#### 1.2.3 Forgot Password Screen
**Elements:**
- [ ] Email input field
- [ ] "SEND CODE" primary button
- [ ] Back button
- [ ] Informative text

**Flow:**
1. User enters email
2. System sends verification code
3. Navigate to Verification screen

**API Integration:**
```typescript
POST /api/auth/forgot-password
Body: { email: string }
Response: { success: boolean, message: string }
```

#### 1.2.4 Verification Screen
**Elements:**
- [ ] 4-digit code input (separate boxes)
- [ ] "VERIFY" primary button
- [ ] "Resend in 50sec" link with countdown
- [ ] Email display showing where code was sent
- [ ] Numeric keyboard (mobile)

**Features:**
- Auto-focus next input on entry
- Auto-submit when 4 digits entered
- Countdown timer for resend
- Code expiration handling

**API Integration:**
```typescript
POST /api/auth/verify
Body: { email: string, code: string }
Response: { success: boolean, token?: string }
```

---

### 1.3 Location Permission Screen
**File:** `/views/LocationPermission.vue`

**Elements:**
- [ ] Large location icon illustration
- [ ] "ACCESS LOCATION" primary button
- [ ] Informative text about privacy
- [ ] Skip option

**Features:**
- Request geolocation permission
- Store permission status
- Show only on first launch
- Handle permission denial gracefully

---

## 🏗️ PHASE 2: ENHANCED HOME SCREEN (P0 - Week 2-3)

### 2.1 Main Home Screen Enhancement
**File:** `/views/Home.vue` (Enhance existing)

#### 2.1.1 Header Section
**Elements:**
- [ ] Hamburger menu icon (left)
- [ ] "DELIVER TO" label with location dropdown
- [ ] Location name (e.g., "Halal Lab office")
- [ ] Shopping bag icon with badge (right)
- [ ] Personalized greeting ("Hey Halal, Good Afternoon!")

**Components:**
```vue
<HeaderBar>
  <LocationSelector />
  <CartBadge />
</HeaderBar>
```

#### 2.1.2 Search Bar
**Elements:**
- [ ] Search icon
- [ ] "Search dishes, restaurants" placeholder
- [ ] Clear button (when text entered)
- [ ] Auto-suggest dropdown

**Features:**
- Debounced search (300ms)
- Recent searches storage
- Popular searches suggestions
- Navigate to Search screen on focus

#### 2.1.3 Category Section
**Design Variations:** 2 layouts shown

**Layout 1: Horizontal Pill Buttons**
- [ ] "All" button (with fire icon, active state)
- [ ] "Hot Dog" button (with icon)
- [ ] "Burger" button (with icon)
- [ ] "Pizza" button (with icon)
- [ ] More categories (horizontal scroll)

**Layout 2: Grid Cards with Images**
- [ ] Pizza card (circular image, name, "Starting $70")
- [ ] Burger card
- [ ] More categories in grid
- [ ] "See All" link

**Components:**
```vue
<CategorySection>
  <CategoryPillButton v-for="cat in categories" />
  <!-- OR -->
  <CategoryCard v-for="cat in categories" />
</CategorySection>
```

#### 2.1.4 Promotional Banner/Modal
**Elements:**
- [ ] Full-screen overlay with blur background
- [ ] Yellow-orange gradient card
- [ ] "Hurry Offers!" headline
- [ ] Coupon code display (e.g., "#1243CD2")
- [ ] "Use the coupon get 25% discount" text
- [ ] "GOT IT" button
- [ ] Close (X) button
- [ ] Decorative elements (triangles, shapes)

**Features:**
- Show on home page load (conditional)
- Dismissible
- Store "don't show again" preference
- Auto-dismiss after 10 seconds
- Copy coupon code on tap

**Component:**
```vue
<PromoBannerModal
  :show="showPromo"
  :coupon="promoCoupon"
  @dismiss="hidePromo"
  @apply="applyPromo"
/>
```

#### 2.1.5 Open Restaurants Section
**Design Variations:** 2 image styles shown

**Elements:**
- [ ] "Open Restaurants" heading
- [ ] "See All" link
- [ ] Restaurant cards (horizontal scroll OR vertical list)

**Restaurant Card Details:**
- Restaurant image (wide or styled with food)
- Restaurant name
- Cuisine categories (e.g., "Burger - Chicken - Riche - Wings")
- Rating (star icon + number, e.g., "4.7")
- Delivery status ("Free" with icon)
- Delivery time ("20 min" with icon)

**Component:**
```vue
<RestaurantCard
  :restaurant="restaurant"
  :image-style="'wide' | 'styled'"
  @click="navigateToRestaurant"
/>
```

#### 2.1.6 Bottom Navigation
**Elements:**
- [ ] Grid icon (Home - active state)
- [ ] List icon (Menu)
- [ ] Plus icon (large, centered, elevated)
- [ ] Bell icon (Notifications) with badge
- [ ] User icon (Profile)

**Features:**
- Active state highlighting (orange)
- Badge counts on notifications
- Smooth transitions
- Haptic feedback on tap (mobile)

---

### 2.2 Category Filter Variations
**Designs show 2 distinct approaches:**

#### Option A: Horizontal Pill Buttons
- Compact, scrollable
- Active state with fire icon
- Good for many categories

#### Option B: Grid Cards with Images
- More visual
- Shows pricing info
- Better for discovery

**Implementation Decision:**
- Use Option A on Home screen (space-efficient)
- Use Option B on dedicated Categories screen

---

## 🏗️ PHASE 3: SEARCH & FILTER SYSTEM (P0 - Week 3)

### 3.1 Search Screen
**File:** `/views/Search.vue`

**Elements:**
- [ ] Back button
- [ ] Search bar (auto-focused)
- [ ] Shopping cart icon with badge
- [ ] Search input field with "Pizza" example
- [ ] Clear button (X)

**Sections:**

#### 3.1.1 Recent Keywords
- [ ] "Recent Keywords" heading
- [ ] Keyword chips (e.g., "Burger", "Sandwich", "Pizza")
- [ ] Clear all button
- [ ] Tappable chips to search

**Data Storage:**
```typescript
// LocalStorage
interface RecentSearch {
  keyword: string
  timestamp: number
}
const recentSearches: RecentSearch[] = []
```

#### 3.1.2 Suggested Restaurants
- [ ] "Suggested Restaurants" heading
- [ ] Restaurant list with thumbnail, name, rating

#### 3.1.3 Popular Fast Food (Search Results)
- [ ] "Popular Fast Food" heading
- [ ] Food item cards in grid (2 columns)
- [ ] Each card: image, name, restaurant, price

**Search API:**
```typescript
GET /api/search?q={query}&type=all|restaurants|dishes
Response: {
  restaurants: Restaurant[],
  dishes: Dish[]
}
```

---

### 3.2 Filter Panel
**File:** `/components/FilterPanel.vue` (Enhance existing)

**Trigger:** Filter icon button (top right of search/restaurant view)

**Design:** Bottom sheet modal with white background

**Filter Sections:**

#### 3.2.1 Offers Section
- [ ] "OFFERS" heading
- [ ] "Delivery" chip
- [ ] "Pick Up" chip
- [ ] "Offer" chip
- [ ] "Online payment available" chip (full width)

#### 3.2.2 Delivery Time Section
- [ ] "DELIVER TIME" heading
- [ ] "10-15 min" chip (selected - orange)
- [ ] "20 min" chip
- [ ] "30 min" chip

#### 3.2.3 Pricing Section
- [ ] "PRICING" heading
- [ ] "$" chip
- [ ] "$$" chip (selected - orange)
- [ ] "$$$" chip

#### 3.2.4 Rating Section
- [ ] "RATING" heading
- [ ] 5 star icons (individually selectable)
- [ ] Minimum rating selection

**Bottom Actions:**
- [ ] "FILTER" primary button (orange, full width)

**Features:**
- Multi-select capabilities
- Active state styling (orange background)
- Reset filters option
- Apply filters updates URL query params
- Persistent filter state

**Filter State Management:**
```typescript
interface FilterState {
  offers: string[]        // ['delivery', 'pickup', 'offer']
  onlinePayment: boolean
  deliveryTime: number    // 10, 20, 30
  pricing: string         // '$', '$$', '$$$'
  minRating: number       // 1-5
}

// Apply filters
const filteredResults = applyFilters(allItems, filterState)
```

---

## 🏗️ PHASE 4: RESTAURANT VIEW & DETAILS (P1 - Week 4)

### 4.1 Restaurant Detail View
**File:** `/views/RestaurantView.vue`

**Design:** 2 variations shown (different image presentations)

**Header:**
- [ ] Back button (left)
- [ ] "Restaurant View" title
- [ ] Three-dot menu (right)
- [ ] Large restaurant hero image (top)
  - Option A: Kitchen/cooking scene
  - Option B: Styled food photography

#### 4.1.1 Restaurant Info Card
**Elements:**
- [ ] Restaurant name (e.g., "Spicy Restaurant")
- [ ] Description text (2-3 lines)
- [ ] Rating (star icon + number)
- [ ] Delivery status ("Free" with icon)
- [ ] Estimated time ("20 min" with icon)

#### 4.1.2 Menu Category Tabs
**Design:** Horizontal scrollable pill buttons
- [ ] "Burger" (selected - orange background)
- [ ] "Sandwich"
- [ ] "Pizza"
- [ ] "Sandwich" (duplicate shown - likely more categories)
- [ ] Smooth scroll with active indicator

#### 4.1.3 Category Section with Items
**Elements:**
- [ ] Category heading (e.g., "Burger (10)")
- [ ] Item count in heading
- [ ] Grid of food items (2 columns)

**Food Item Card:**
- [ ] Food image (rounded rectangle)
- [ ] Food name (e.g., "Burger Ferguson", "Rockin' Burgers")
- [ ] Restaurant name (smaller, gray)
- [ ] Price (e.g., "$40")
- [ ] Add button (orange circle with plus icon)

**Sticky Elements:**
- Category tabs stick to top on scroll
- Header collapses on scroll

**Component Structure:**
```vue
<RestaurantView>
  <RestaurantHeader :restaurant="restaurant" />
  <RestaurantInfoCard :restaurant="restaurant" />
  <CategoryTabs
    :categories="categories"
    :active="activeCategory"
    @change="scrollToCategory"
  />
  <CategorySection
    v-for="category in categories"
    :ref="`category-${category.id}`"
    :category="category"
    :items="getCategoryItems(category)"
  >
    <FoodItemCard
      v-for="item in items"
      :item="item"
      @add="addToCart"
    />
  </CategorySection>
</RestaurantView>
```

**Scroll Behavior:**
- Smooth scroll to category on tab click
- Update active tab based on scroll position (IntersectionObserver)
- Parallax effect on hero image

---

## 🏗️ PHASE 5: ENHANCED FOOD DETAILS (P1 - Week 4)

### 5.1 Food Detail Screen
**File:** `/views/FoodDetail.vue`

**Design Elements:**

#### 5.1.1 Header
- [ ] Back button (left)
- [ ] "Details" title
- [ ] Favorite/heart icon (right, outline/filled state)

#### 5.1.2 Hero Image
- [ ] Large food image (rounded corners, orange/yellow background)
- [ ] Image occupies ~40% of screen height

#### 5.1.3 Restaurant Badge
- [ ] Small restaurant icon
- [ ] Restaurant name (e.g., "Uttora Coffe House")
- [ ] Positioned below image

#### 5.1.4 Product Info
**Elements:**
- [ ] Food name (large, bold, e.g., "Pizza Calzone European")
- [ ] Description (2-3 lines, gray text)
- [ ] Rating (star icon + "4.7")
- [ ] Delivery status ("Free" with icon)
- [ ] Estimated time ("20 min" with icon)

#### 5.1.5 Size Selector
**Elements:**
- [ ] "SIZE:" label
- [ ] Three size options (pill buttons)
  - "10"" chip
  - "14"" chip (selected - orange)
  - "16"" chip
- [ ] Single selection
- [ ] Price updates based on size

#### 5.1.6 Ingredients Display
**Elements:**
- [ ] "INGREDIENTS" heading
- [ ] Circular ingredient icons in horizontal scroll
  - Salt icon
  - Chicken icon
  - Onion icon
  - Garlic icon
  - Peppers icon
  - More (scrollable)
- [ ] Icon labels below each icon

**Alternative Design (from "Add New Items" screen):**
Shows ingredient selection with categories:
- Basic ingredients (selectable)
- Fruit ingredients (selectable)
- Selected state highlighting

#### 5.1.7 Bottom Section
**Elements:**
- [ ] Price (large, bold, e.g., "$32")
- [ ] Quantity selector (-, number, +)
- [ ] Dark background pill for quantity

**Component:**
```vue
<FoodDetail>
  <FoodHeroImage :image="food.image" />
  <RestaurantBadge :restaurant="food.restaurant" />
  <FoodInfo :food="food" />
  <SizeSelector
    :sizes="food.sizes"
    :selected="selectedSize"
    @change="updateSize"
  />
  <IngredientsDisplay :ingredients="food.ingredients" />
  <BottomPriceBar
    :price="calculatePrice()"
    :quantity="quantity"
    @add="addToCart"
    @remove="removeFromCart"
  />
</FoodDetail>
```

---

### 5.2 Add/Edit Menu Item Screen (Admin/Restaurant)
**File:** `/views/admin/AddMenuItem.vue`

**Note:** This appears in the designs but is likely for restaurant/admin interface

**Elements:**
- [ ] Back button
- [ ] "Add New Items" title
- [ ] "RESET" link (top right)
- [ ] Item name input
- [ ] Photo/video upload (3 slots)
- [ ] Price input with currency
- [ ] Pickup/Delivery toggle
- [ ] Ingredients selector with categories
  - Basic (Salt, Chicken, Onion, Garlic, Peppers, Ginger)
  - Fruit (Avocado, Apple, Blueberry, Broccoli, Orange, Walnut)
  - "See All" expansion
- [ ] Details text area
- [ ] "SAVE CHANGES" button

**For Customer App:** Mark as Phase 2 enhancement or exclude

---

## 🏗️ PHASE 6: ADVANCED CART MANAGEMENT (P1 - Week 5)

### 6.1 Enhanced Cart Screen
**File:** `/views/Cart.vue` (Enhance existing)

**Design:** 2 states shown (view mode and edit mode)

#### 6.1.1 Header
- [ ] Back button (left)
- [ ] "Cart" title
- [ ] "EDIT ITEMS" link (top right - view mode)
- [ ] "DONE" link (top right - edit mode)

#### 6.1.2 Cart Items List (View Mode)
**Elements:**
- [ ] Dark background (navy/black)
- [ ] Each cart item card:
  - Food image (rounded square)
  - Food name (e.g., "Pizza Calzone European")
  - Size indicator (e.g., "14"")
  - Price (e.g., "$64")
  - Quantity selector (-, number, +)
  - Dark background with rounded corners

#### 6.1.3 Cart Items List (Edit Mode)
**Additional Elements:**
- [ ] Red delete button (X) on each item (top right)
- [ ] Item shake animation on long press
- [ ] Confirm delete dialog

#### 6.1.4 Delivery Address Section
**Elements:**
- [ ] "DELIVERY ADDRESS" label
- [ ] Address text (e.g., "2118 Thornridge Cir. Syracuse")
- [ ] "EDIT" link (orange, right aligned)

#### 6.1.5 Total Section
**Elements:**
- [ ] "TOTAL" label (gray)
- [ ] Total amount (large, white, e.g., "$96")
- [ ] "Breakdown >" link (orange, small)

#### 6.1.6 Bottom Action
- [ ] "PLACE ORDER" button (orange, full width, rounded)

**Features:**
- Real-time price calculation
- Quantity updates with animation
- Empty cart state with illustration
- "Continue shopping" link
- Save cart to localStorage
- Cart item count badge updates

**Cart State Management:**
```typescript
interface CartItem {
  id: string
  foodId: string
  name: string
  image: string
  size?: string
  price: number
  quantity: number
  customizations?: Customization[]
  restaurant: {
    id: string
    name: string
  }
}

interface Cart {
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  tax: number
  discount: number
  total: number
}

// Pinia store
const cartStore = useCartStore()
```

---

### 6.2 Cart Breakdown Modal
**File:** `/components/CartBreakdown.vue`

**Elements:**
- [ ] Bottom sheet modal
- [ ] Subtotal row
- [ ] Delivery fee row
- [ ] Service fee row
- [ ] Tax row
- [ ] Discount row (if applicable, in green)
- [ ] Divider
- [ ] Total row (bold)
- [ ] Close button

---

## 🏗️ PHASE 7: PAYMENT METHODS (P1 - Week 5)

### 7.1 Payment Selection Screen
**File:** `/views/Payment.vue`

**Design:** 2 states shown (empty and with card added)

#### 7.1.1 Header
- [ ] Back button (left)
- [ ] "Payment" title

#### 7.1.2 Payment Method Options
**Elements:**
- [ ] Four payment type chips (horizontal scroll)
  - "Cash" (hand icon)
  - "Visa" (logo)
  - "Mastercard" (logo, selected)
  - "PayPal" (logo)
  - More options...

#### 7.1.3 Card Display Section

**Empty State:**
- [ ] Decorative credit card illustration (geometric pattern)
- [ ] "No master card added" message
- [ ] "You can add a mastercard and save it for later" subtext
- [ ] "+ ADD NEW" button (orange text)

**With Card Added:**
- [ ] Actual card display with masked number
  - "Master Card" heading
  - "************ 436" (masked number)
  - Mastercard logo
- [ ] Dropdown arrow (for multiple cards)
- [ ] "+ ADD NEW" button

#### 7.1.4 Total Section
- [ ] "TOTAL" label
- [ ] "$96" amount (large)

#### 7.1.5 Bottom Action
- [ ] "PAY & CONFIRM" button (orange, full width)

**Component Structure:**
```vue
<PaymentScreen>
  <PaymentMethodTabs
    :methods="paymentMethods"
    :selected="selectedMethod"
    @change="changeMethod"
  />
  <SavedCardsList
    v-if="selectedMethod === 'mastercard'"
    :cards="savedCards"
    :selected="selectedCard"
    @select="selectCard"
    @add="showAddCard"
  />
  <EmptyCardState
    v-else-if="selectedMethod === 'mastercard' && !savedCards.length"
    @add="showAddCard"
  />
  <TotalDisplay :amount="cartTotal" />
  <PayButton @click="processPayment" />
</PaymentScreen>
```

---

### 7.2 Add Card Modal
**File:** `/components/AddCardModal.vue`

**Elements:**
- [ ] "Add Card" title
- [ ] Close button (X, top left)
- [ ] "CARD HOLDER NAME" input
- [ ] "CARD NUMBER" input (with card type detection)
- [ ] "EXPIRE DATE" input (mm/yyyy format)
- [ ] "CVC" input (3-4 digits, password field)
- [ ] "ADD & MAKE PAYMENT" button (orange, full width)

**Features:**
- Card number formatting (spaces every 4 digits)
- Card type detection (Visa, Mastercard, Amex)
- Expiry date validation
- CVC masking
- Luhn algorithm validation
- Save card checkbox
- 3D Secure integration placeholder

**Card Validation:**
```typescript
interface CardDetails {
  holderName: string
  cardNumber: string
  expiryDate: string  // MM/YYYY
  cvc: string
  saveCard: boolean
}

const validateCard = (card: CardDetails): ValidationResult => {
  // Luhn algorithm
  // Expiry date check
  // CVC length check
  return { valid: boolean, errors: string[] }
}
```

---

### 7.3 Payment Success Screen
**File:** `/views/PaymentSuccess.vue`

**Elements:**
- [ ] Confetti animation background
- [ ] Wallet icon with coins illustration
- [ ] "Congratulations!" heading
- [ ] "You successfully made a payment, enjoy our service!" text
- [ ] "TRACK ORDER" button (orange, full width)

**Features:**
- Auto-redirect to order tracking after 3 seconds
- Celebration animation (Lottie or CSS)
- Sound effect (optional, with user permission)

---

## 🏗️ PHASE 8: ADDRESS MANAGEMENT (P2 - Week 6)

### 8.1 Address List Screen
**File:** `/views/AddressList.vue`

**Elements:**
- [ ] Back button
- [ ] "My Address" title

#### 8.1.1 Saved Addresses
**Each address card:**
- [ ] Address type icon (home/work/other)
- [ ] Address label ("HOME" / "WORK")
- [ ] Full address text (multi-line)
- [ ] Edit icon (orange)
- [ ] Delete icon (red)
- [ ] Card with shadow and border

**Examples from design:**
- HOME: "2464 Royal Ln. Mesa, New Jersey 45463"
- WORK: "3891 Ranchview Dr. Richardson, California 62639"

#### 8.1.2 Bottom Action
- [ ] "ADD NEW ADDRESS" button (orange, full width)

**Features:**
- Set default address
- Swipe to delete
- Confirm before delete
- Empty state with illustration

---

### 8.2 Add/Edit Address Screen
**File:** `/views/AddressForm.vue`

**Elements:**

#### 8.2.1 Map Section
- [ ] Interactive map (top 40% of screen)
- [ ] Location pin (red marker)
- [ ] "Move to edit location" tooltip
- [ ] Current location button (top left)
- [ ] Draggable pin for precise location

**Map Integration:**
```typescript
// Use Google Maps or Mapbox
import { GoogleMap, Marker } from '@vue-google-maps/community'

interface Location {
  lat: number
  lng: number
  address: string
}
```

#### 8.2.2 Address Form Section
**Elements:**
- [ ] "ADDRESS" label
- [ ] Full address display (from geocoding)
  - Example: "3235 Royal Ln. Mesa, New Jersy 34567"
- [ ] "STREET" input field
- [ ] "POST CODE" input field
- [ ] "APARTMENT" input field (optional)

#### 8.2.3 Address Label Section
- [ ] "LABEL AS" text
- [ ] Three options (radio buttons styled as chips)
  - "Home" (selected - orange)
  - "Work"
  - "Other"

#### 8.2.4 Bottom Action
- [ ] "SAVE LOCATION" button (orange, full width)

**Features:**
- Reverse geocoding (coordinates → address)
- Address autocomplete
- Current location detection
- Manual pin adjustment
- Form validation
- Set as default option

**Address API:**
```typescript
POST /api/user/addresses
Body: {
  label: 'home' | 'work' | 'other',
  street: string,
  postCode: string,
  apartment?: string,
  coordinates: { lat: number, lng: number },
  isDefault: boolean
}
```

---

## 🏗️ PHASE 9: ORDER TRACKING & HISTORY (P2 - Week 7)

### 9.1 Order Tracking Screen
**File:** `/views/OrderTracking.vue`

**Design:** Full-screen map with order details card at bottom

#### 9.1.1 Map View
**Elements:**
- [ ] Full-screen interactive map
- [ ] Delivery route (orange line)
- [ ] Restaurant marker (starting point)
- [ ] Delivery address marker (destination, green)
- [ ] Delivery person marker (moving, current location)
- [ ] Back button (top left, floating)
- [ ] "Track Order" title (top, centered, floating)

**Map Features:**
- Real-time driver location updates
- Animated route polyline
- Auto-zoom to show full route
- ETA calculation
- Traffic layer (optional)

#### 9.1.2 Order Info Card (Bottom Sheet)
**Elements:**
- [ ] Restaurant thumbnail image
- [ ] Restaurant name
- [ ] Order time ("Ordered At 06 Sept, 10:00pm")
- [ ] Order items summary ("2x Burger, 4x Sandwich")

**Features:**
- Draggable to expand/collapse
- Shows full order details when expanded
- Real-time status updates

**WebSocket Integration:**
```typescript
// Real-time order tracking
const socket = io(API_URL)

socket.on('order:location-update', (data: {
  orderId: string
  driverLocation: { lat: number, lng: number }
  eta: number
}) => {
  updateDriverMarker(data.driverLocation)
  updateETA(data.eta)
})
```

---

### 9.2 Order History Screen
**File:** `/views/OrderHistory.vue`

**Design:** Two tabs - Ongoing and History

#### 9.2.1 Header
- [ ] Back button
- [ ] "My Orders" title
- [ ] Three-dot menu (options)

#### 9.2.2 Tab Navigation
- [ ] "Ongoing" tab (selected - orange underline)
- [ ] "History" tab

#### 9.2.3 Ongoing Orders Tab
**Each order card:**
- [ ] Category label ("Food" / "Drink")
- [ ] Restaurant thumbnail
- [ ] Restaurant name
- [ ] Order number (e.g., "#162432")
- [ ] Order total (e.g., "$35.25")
- [ ] Item count (e.g., "03 Items")
- [ ] "Track Order" button (orange)
- [ ] "Cancel" button (white with orange border)

**Examples from design:**
- Pizza Hut: $35.25, #162432, 03 Items
- McDonald: $40.15, #242432, 02 Items
- Starbucks: $10.20, #240112, 01 Items

#### 9.2.4 History Orders Tab
**Each order card:**
- [ ] Same basic info as ongoing
- [ ] Status label ("Completed" green / "Canceled" red)
- [ ] Order date and time (e.g., "29 JAN, 12:30")
- [ ] "Rate" button (white with orange border)
- [ ] "Re-Order" button (orange)

**Features:**
- Pull to refresh
- Infinite scroll
- Filter by status
- Search orders
- Order details modal

**Order State:**
```typescript
interface Order {
  id: string
  orderNumber: string
  restaurant: {
    id: string
    name: string
    image: string
  }
  items: OrderItem[]
  total: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out-for-delivery' | 'delivered' | 'canceled'
  createdAt: Date
  deliveryTime?: Date
}
```

---

### 9.3 Running Orders Modal (Kitchen/Admin View)
**File:** `/components/RunningOrdersModal.vue`

**Note:** This appears to be for restaurant/admin side

**Elements:**
- [ ] "20 Running Orders" heading
- [ ] Scrollable list of orders
- [ ] Each order:
  - Food image
  - Category tag ("#Breakfast")
  - Food name
  - Order ID
  - Price
  - "Done" button (orange)
  - "Cancel" button (white)

---

## 🏗️ PHASE 10: PROFILE & WALLET SYSTEM (P2 - Week 7-8)

### 10.1 Profile Menu Screen
**File:** `/views/Profile.vue` (Enhance existing)

**Design:** Two variations shown

#### Variation A: Simple Menu List
**Elements:**
- [ ] Back button
- [ ] "Profile" title
- [ ] Three-dot menu
- [ ] User profile section (top)
  - Profile photo (circular)
  - User name (e.g., "Vishal Khadok")
  - Bio/tagline (e.g., "I love fast food")

**Menu Items:**
- [ ] Personal Info (icon + text + arrow)
- [ ] Addresses (icon + text + arrow)
- [ ] Cart (icon + text + arrow)
- [ ] Favourite (icon + text + arrow)
- [ ] Notifications (icon + text + arrow)
- [ ] Payment Method (icon + text + arrow)

**Divider**

- [ ] FAQs (icon + text + arrow)
- [ ] User Reviews (icon + text + arrow)
- [ ] Settings (icon + text + arrow)

**Divider**

- [ ] Log Out (icon + text + arrow, red color)

#### Variation B: Profile with Wallet
**Elements:**
- [ ] Back button
- [ ] "My Profile" title

**Wallet Card (Top):**
- [ ] Orange gradient background
- [ ] "Available Balance" label
- [ ] "$500.00" amount (large, white)
- [ ] "Withdraw" button (white bordered)

**Menu Items:**
- [ ] Personal Info
- [ ] Settings
- [ ] Withdrawal History
- [ ] Number of Orders (with count: "29K")
- [ ] User Reviews
- [ ] Log Out

**Component Structure:**
```vue
<ProfileScreen>
  <ProfileHeader
    :user="currentUser"
    :editable="true"
    @edit="navigateToEditProfile"
  />
  <WalletCard
    v-if="walletEnabled"
    :balance="userBalance"
    @withdraw="showWithdrawModal"
  />
  <MenuList :items="menuItems" />
</ProfileScreen>
```

---

### 10.2 Edit Profile Screen
**File:** `/views/EditProfile.vue`

**Elements:**
- [ ] Back button
- [ ] "Edit Profile" title
- [ ] Profile photo (circular, large)
- [ ] Edit icon overlay on photo (orange circle with pencil)
- [ ] "FULL NAME" input field
- [ ] "EMAIL" input field
- [ ] "PHONE NUMBER" input field
- [ ] "BIO" text area
- [ ] "SAVE" button (orange, full width)

**Features:**
- Photo upload from gallery
- Photo capture from camera
- Photo crop/resize
- Form validation
- Email verification on change
- Phone verification on change

**API:**
```typescript
PUT /api/user/profile
Body: {
  name: string
  email: string
  phone: string
  bio: string
  avatar?: File
}
```

---

### 10.3 Wallet & Withdrawal

#### 10.3.1 Wallet Overview (in Profile)
- [ ] Balance display
- [ ] Recent transactions
- [ ] Add money button
- [ ] Withdraw button

#### 10.3.2 Withdrawal Modal
**Elements:**
- [ ] "Withdraw Funds" title
- [ ] Available balance display
- [ ] Amount input
- [ ] Bank account selector
- [ ] "WITHDRAW" button
- [ ] Transaction fee info

#### 10.3.3 Withdrawal Success
**Elements:**
- [ ] Checkmark icon (orange circle)
- [ ] "Withdraw Successful" message
- [ ] "OK" button

#### 10.3.4 Withdrawal History
**File:** `/views/WithdrawalHistory.vue`

**Elements:**
- [ ] List of past withdrawals
- [ ] Each entry:
  - Date
  - Amount
  - Status (Pending/Completed/Failed)
  - Bank account (last 4 digits)
  - Transaction ID

---

## 🏗️ PHASE 11: NOTIFICATIONS CENTER (P3 - Week 8)

### 11.1 Notifications Screen
**File:** `/views/Notifications.vue`

**Design:** Tab-based interface

#### 11.1.1 Header
- [ ] Back button
- [ ] "Notifications" title

#### 11.1.2 Tab Navigation
- [ ] "Notifications" tab (selected - orange underline)
- [ ] "Messages (3)" tab (with count badge)

#### 11.1.3 Notifications List
**Each notification item:**
- [ ] User/Restaurant avatar (circular)
- [ ] Name (bold)
- [ ] Action text (e.g., "Placed a new order")
- [ ] Time ago (e.g., "20 min ago")
- [ ] Related food image (right side, small)
- [ ] Unread indicator (orange dot or background)

**Examples from design:**
- "Tanbir Ahmed Placed a new order" - 20 min ago
- "Salim Smith left a 5 star review" - 20 min ago
- "Royal Bengal agreed to cancel" - 20 min ago
- "Pabel Vuiya Placed a new order" - 20 min ago

**Notification Types:**
- Order placed
- Order status update
- New review
- Order canceled
- Promotional offers
- Payment success/failure

**Features:**
- Mark as read
- Mark all as read
- Delete notification
- Swipe gestures
- Pull to refresh
- Notification grouping by date

---

### 11.2 Push Notifications

#### 11.2.1 Browser Notifications
- [ ] Request notification permission
- [ ] Show browser notifications
- [ ] Handle notification clicks

#### 11.2.2 Service Worker Setup
```typescript
// sw.js
self.addEventListener('push', (event) => {
  const data = event.data.json()
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icons/notification-icon.png',
    badge: '/icons/badge-icon.png',
    data: data.url
  })
})
```

---

### 11.3 Bottom Navigation Badge
- [ ] Show unread count on bell icon
- [ ] Max display: 99+
- [ ] Red background badge
- [ ] Animate on new notification

---

## 🏗️ PHASE 12: MESSAGES/CHAT SYSTEM (P3 - Week 9)

### 12.1 Messages List Screen
**File:** `/views/Messages.vue`

**Elements:**
- [ ] Back button
- [ ] "Messages" title

**Tab Navigation:**
- [ ] "Notifications" tab
- [ ] "Messages (3)" tab (selected - orange underline)

**Messages List:**
Each conversation item:
- [ ] Contact avatar (circular)
- [ ] Contact name (bold)
- [ ] Last message preview
- [ ] Time (right aligned)
- [ ] Unread badge (orange, with count)
- [ ] Online indicator (green dot)

**Examples from design:**
- Royal Parvej: "Sounds awesome!" - 15:37 - 1 unread
- Cameron Williamson: "Ok, just hurry up little bit..." - 15:37 - 2 unread
- Ralph Edwards: "Thanks dude." - 15:37
- Cody Fisher: "How is going...?" - 15:37
- Eleanor Pena: "Thanks for the awesome food man...!" - 15:37

**Features:**
- Real-time message updates (WebSocket)
- Swipe to delete conversation
- Search conversations
- Archive conversations
- Mute conversations

---

### 12.2 Chat Screen
**File:** `/views/Chat.vue`

**Elements:**
- [ ] Close button (X, top left)
- [ ] Contact name (title, e.g., "Robert Fox")
- [ ] Contact avatar (top right, circular)

**Message Bubbles:**

**Sent Messages (Right, Orange):**
- [ ] Orange background
- [ ] White text
- [ ] Avatar on right
- [ ] Timestamp (e.g., "8:10 pm")
- [ ] Checkmark (sent/read indicator)
- [ ] Examples:
  - "Are you coming?"
  - "Hey Where are you now?"
  - "Hurry Up, Man"

**Received Messages (Left, Gray):**
- [ ] Light gray background
- [ ] Dark text
- [ ] Avatar on left
- [ ] Timestamp
- [ ] Examples:
  - "Hay, Congratulation for order"
  - "I'm Coming, just wait ..."

**Message Input:**
- [ ] Emoji button (left)
- [ ] Text input field ("Write something" placeholder)
- [ ] Send button (paper plane icon, orange)

**Features:**
- Real-time messaging (WebSocket/Socket.io)
- Typing indicators
- Read receipts
- Emoji picker
- Image/file sharing
- Message timestamps
- Auto-scroll to bottom
- Load more on scroll up

**WebSocket Integration:**
```typescript
const socket = io(API_URL)

// Send message
socket.emit('message:send', {
  conversationId: string
  content: string
  type: 'text' | 'image' | 'file'
})

// Receive message
socket.on('message:new', (message: Message) => {
  addMessageToChat(message)
})

// Typing indicator
socket.emit('typing:start', { conversationId })
socket.on('typing', ({ userId, conversationId }) => {
  showTypingIndicator(userId)
})
```

---

### 12.3 Video/Voice Call Screen
**File:** `/views/Call.vue`

**Elements:**
- [ ] Large avatar background (blurred)
- [ ] Contact avatar (circular, centered)
- [ ] Contact name (e.g., "Robert Fox")
- [ ] Status text ("Connecting......")

**Call Controls (Bottom):**
- [ ] Mute microphone button (left, gray circle)
- [ ] End call button (center, large red circle with phone icon)
- [ ] Speaker button (right, gray circle)

**Features:**
- WebRTC integration
- Audio/video toggle
- Mute/unmute
- Speaker on/off
- Call duration timer
- Incoming call UI
- Call history

**WebRTC Setup:**
```typescript
import { ref } from 'vue'

const localStream = ref<MediaStream>()
const remoteStream = ref<MediaStream>()
const peerConnection = ref<RTCPeerConnection>()

const startCall = async () => {
  localStream.value = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false
  })
  // Setup peer connection, signaling, etc.
}
```

---

## 🏗️ PHASE 13: REVIEWS & RATINGS (P3 - Week 9)

### 13.1 Reviews List Screen
**File:** `/views/Reviews.vue`

**Elements:**
- [ ] Back button
- [ ] "Reviews" title
- [ ] Three-dot menu

**Each Review Card:**
- [ ] Reviewer avatar (circular)
- [ ] Review date (e.g., "20/12/2020")
- [ ] Review title (bold, e.g., "Great Food and Service")
- [ ] Star rating (5 stars, filled/unfilled)
- [ ] Review text (multi-line)
- [ ] Three-dot menu (per review, for actions)

**Examples from design:**
1. "Great Food and Service" - 5 stars
   "This Food so tasty & delicious. Breakfast so fast Delivered in my place. Chef is very friendly. I'm really like chef for Home Food Order. Thanks."

2. "Awesome and Nice" - 4 stars
   "This Food so tasty & delicious. Breakfast so fast Delivered in my place."

3. Multiple more reviews...

**Features:**
- Sort by: Recent, Rating (high/low), Helpful
- Filter by rating
- Pagination/infinite scroll
- Report review
- Helpful button (thumbs up)
- Admin response to review

---

### 13.2 Write Review Modal
**File:** `/components/WriteReviewModal.vue`

**Elements:**
- [ ] "Rate Your Experience" title
- [ ] Restaurant/Food name
- [ ] Star selector (interactive, 1-5 stars)
- [ ] Review title input
- [ ] Review text area
- [ ] Photo upload (optional)
- [ ] "SUBMIT REVIEW" button

**Validation:**
- Minimum 10 characters
- Star rating required
- Title optional but recommended

**API:**
```typescript
POST /api/reviews
Body: {
  orderId: string
  restaurantId: string
  rating: number
  title?: string
  comment: string
  photos?: File[]
}
```

---

### 13.3 Food Detail - Reviews Section
Add to FoodDetail screen:
- [ ] Average rating display
- [ ] Total review count
- [ ] "See all reviews" link
- [ ] Top 2-3 reviews preview

---

## 🏗️ PHASE 14: FAVORITES & LISTS (P3 - Week 10)

### 14.1 Favorites Screen
**File:** `/views/Favorites.vue` (Enhance existing)

**Elements:**
- [ ] Back button
- [ ] "My Food List" title

**Tab Navigation:**
- [ ] "All" tab (selected)
- [ ] "Breakfast" tab
- [ ] "Lunch" tab
- [ ] "Dinner" tab

**Item Count:**
- [ ] "Total 03 Items" display

**Food List:**
Each food card:
- [ ] Food image (square, rounded corners)
- [ ] Food name
- [ ] Category badge (e.g., "Breakfast" - orange background)
- [ ] Rating (star icon + number)
- [ ] Review count (e.g., "(10 Review)")
- [ ] Order type (e.g., "Pick UP")
- [ ] Price (e.g., "$60")
- [ ] Three-dot menu (options)

**Examples from design:**
- Chicken Thai Biriyani - 4.9 (10 Review) - Pick UP - $60
- Chicken Bhuna - 4.9 (10 Review) - Pick UP - $30
- Mazalichiken Halim - 4.9 (10 Review) - Pick UP - $25

**Features:**
- Add to favorites (heart icon)
- Remove from favorites
- Create custom lists
- Share favorites list
- Quick add to cart

---

### 14.2 Custom Lists

#### 14.2.1 Create List Modal
**Elements:**
- [ ] "Create New List" title
- [ ] List name input
- [ ] List icon/emoji selector
- [ ] Privacy toggle (Private/Public)
- [ ] "CREATE" button

#### 14.2.2 Add to List Modal
**Elements:**
- [ ] "Add to List" title
- [ ] List of user's lists (checkboxes)
- [ ] "+ Create new list" option
- [ ] "SAVE" button

---

## 🏗️ PHASE 15: SETTINGS & PREFERENCES (P3 - Week 10)

### 15.1 Settings Screen
**File:** `/views/Settings.vue`

**Elements:**
- [ ] Back button
- [ ] "Settings" title

**Setting Groups:**

#### 15.1.1 Account Settings
- [ ] Language (dropdown: English, French, Arabic, etc.)
- [ ] Currency (dropdown: USD, EUR, etc.)
- [ ] Country/Region

#### 15.1.2 Notification Settings
- [ ] Push notifications (toggle)
- [ ] Email notifications (toggle)
- [ ] SMS notifications (toggle)
- [ ] Order updates (toggle)
- [ ] Promotions (toggle)

#### 15.1.3 Privacy Settings
- [ ] Profile visibility (dropdown)
- [ ] Show online status (toggle)
- [ ] Share location (toggle)

#### 15.1.4 App Settings
- [ ] Dark mode (toggle)
- [ ] Sound effects (toggle)
- [ ] Haptic feedback (toggle)
- [ ] Auto-play videos (toggle)

#### 15.1.5 Other
- [ ] Clear cache
- [ ] App version display
- [ ] Terms & Conditions link
- [ ] Privacy Policy link
- [ ] Help & Support link
- [ ] About link

---

### 15.2 FAQs Screen
**File:** `/views/FAQs.vue`

**Elements:**
- [ ] Back button
- [ ] "FAQs" title
- [ ] Search bar
- [ ] Category tabs (General, Orders, Payments, Delivery, etc.)
- [ ] Expandable FAQ items (accordion)

**FAQ Categories:**
- General
- Account & Profile
- Orders & Checkout
- Payments & Refunds
- Delivery & Tracking
- Restaurants & Menus

---

### 15.3 Help & Support
**File:** `/views/Support.vue`

**Elements:**
- [ ] "Contact Us" section
  - Email link
  - Phone link
  - Live chat button
- [ ] "Report an Issue" form
- [ ] "Submit Feedback" form

---

## 📱 ADDITIONAL SCREENS & FEATURES

### 16.1 Splash Screen
**File:** `/views/Splash.vue`

**Design:** 2 variations shown

**Variation A: Simple Logo**
- [ ] White background
- [ ] "Food" logo (Food with chef hat icon)
- [ ] Centered

**Variation B: Animated**
- [ ] White background
- [ ] "Food" logo (centered)
- [ ] Orange radiating lines animation (corner)
- [ ] Fade-in animation

**Features:**
- Show for 2-3 seconds
- Check authentication status
- Check onboarding status
- Navigate to appropriate screen
- Load initial data

**Logic:**
```typescript
const checkAppState = async () => {
  const hasSeenOnboarding = localStorage.getItem('onboarding_completed')
  const authToken = localStorage.getItem('auth_token')

  if (!hasSeenOnboarding) {
    router.push('/onboarding')
  } else if (!authToken) {
    router.push('/login')
  } else {
    // Validate token
    const isValid = await validateToken(authToken)
    router.push(isValid ? '/home' : '/login')
  }
}
```

---

### 16.2 Empty States

#### 16.2.1 Empty Cart
- [ ] Illustration (empty bag/basket)
- [ ] "Your cart is empty" message
- [ ] "Start shopping" button

#### 16.2.2 No Orders
- [ ] Illustration (empty box)
- [ ] "No orders yet" message
- [ ] "Browse menu" button

#### 16.2.3 No Favorites
- [ ] Illustration (heart)
- [ ] "No favorites yet" message
- [ ] "Explore dishes" button

#### 16.2.4 No Addresses
- [ ] Illustration (location pin)
- [ ] "No saved addresses" message
- [ ] "Add address" button

#### 16.2.5 No Reviews
- [ ] "No reviews yet" message
- [ ] "Be the first to review!" text

---

### 16.3 Error States

#### 16.3.1 Network Error
- [ ] Illustration (disconnected wifi)
- [ ] "No internet connection" message
- [ ] "Try again" button
- [ ] Offline mode indicator

#### 16.3.2 Server Error
- [ ] Illustration (server/tools)
- [ ] "Something went wrong" message
- [ ] "Retry" button
- [ ] Error details (in dev mode)

#### 16.3.3 Not Found
- [ ] Illustration (magnifying glass)
- [ ] "Page not found" message
- [ ] "Go home" button

---

### 16.4 Loading States

#### 16.4.1 Page Loader
- [ ] Full-screen overlay
- [ ] Spinner (orange)
- [ ] Optional loading message

#### 16.4.2 Skeleton Screens
Create skeleton screens for:
- [ ] Home screen categories
- [ ] Restaurant list
- [ ] Food items grid
- [ ] Order history
- [ ] Profile menu

**Example:**
```vue
<template>
  <div class="animate-pulse">
    <div class="h-48 bg-gray-200 rounded-lg mb-4"></div>
    <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div class="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
</template>
```

#### 16.4.3 Button Loading State
- [ ] Spinner inside button
- [ ] Disabled state
- [ ] Loading text (e.g., "Processing...")

---

### 16.5 Confirmation Dialogs

#### 16.5.1 Delete Confirmation
- [ ] "Are you sure?" title
- [ ] Explanation text
- [ ] "Cancel" button
- [ ] "Delete" button (red)

#### 16.5.2 Logout Confirmation
- [ ] "Log out?" title
- [ ] "You will need to log in again" text
- [ ] "Cancel" button
- [ ] "Log out" button

#### 16.5.3 Cancel Order Confirmation
- [ ] "Cancel order?" title
- [ ] "This action cannot be undone" text
- [ ] Cancellation reason selector
- [ ] "Keep order" button
- [ ] "Cancel order" button

---

### 16.6 Success Modals

#### 16.6.1 Order Placed
- [ ] Checkmark animation
- [ ] "Order placed!" message
- [ ] Order number
- [ ] "Track order" button

#### 16.6.2 Address Saved
- [ ] Checkmark animation
- [ ] "Address saved!" message
- [ ] "OK" button

#### 16.6.3 Profile Updated
- [ ] Checkmark animation
- [ ] "Profile updated!" message
- [ ] Auto-dismiss after 2s

---

### 16.7 Coupon/Voucher Features

#### 16.7.1 Vouchers Screen (Already exists)
Enhance `/views/Vouchers.vue`:
- [ ] Active vouchers
- [ ] Expired vouchers (separate tab)
- [ ] Voucher details modal
- [ ] Apply voucher to cart
- [ ] Share voucher

#### 16.7.2 Apply Coupon in Cart
Add to Cart screen:
- [ ] "Have a coupon?" section
- [ ] Coupon input field
- [ ] "Apply" button
- [ ] Applied coupon display (with discount)
- [ ] Remove coupon button

#### 16.7.3 Coupon Modal (Home Screen)
**Already designed** - see Section 2.1.4
- [ ] Implement show/hide logic
- [ ] Copy coupon code
- [ ] Auto-apply option
- [ ] Don't show again preference

---

### 16.8 Restaurant Features

#### 16.8.1 Restaurant Filters
Add to Restaurant list:
- [ ] Sort by: Rating, Delivery time, Distance, Price
- [ ] Filter by: Cuisine type, Open now, Delivery/Pickup
- [ ] Price range filter

#### 16.8.2 Restaurant Info Modal
- [ ] Full restaurant details
- [ ] Opening hours
- [ ] Contact info
- [ ] Address with map
- [ ] Reviews summary
- [ ] Photos gallery

---

### 16.9 Smart Suggestions

#### 16.9.1 Related Items
On Food Detail screen:
- [ ] "You might also like" section
- [ ] Horizontal scroll of related items
- [ ] Based on category/ingredients

#### 16.9.2 Frequently Bought Together
On Food Detail screen:
- [ ] "Frequently bought together" section
- [ ] Combo deal pricing
- [ ] "Add all to cart" button

#### 16.9.3 Reorder Suggestions
On Home screen:
- [ ] "Order again" section
- [ ] Based on order history
- [ ] Quick reorder button

---

## 🔧 TECHNICAL IMPLEMENTATION DETAILS

### 17.1 State Management (Pinia Stores)

#### 17.1.1 Auth Store
```typescript
// stores/auth.ts
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem('auth_token') || null,
    isAuthenticated: false
  }),

  actions: {
    async login(credentials: LoginCredentials) {
      const response = await api.post('/auth/login', credentials)
      this.setUser(response.user)
      this.setToken(response.token)
    },

    async register(data: RegisterData) {
      const response = await api.post('/auth/register', data)
      this.setUser(response.user)
      this.setToken(response.token)
    },

    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      localStorage.removeItem('auth_token')
      router.push('/login')
    },

    setUser(user: User) {
      this.user = user
      this.isAuthenticated = true
    },

    setToken(token: string) {
      this.token = token
      localStorage.setItem('auth_token', token)
    }
  }
})
```

#### 17.1.2 Cart Store
```typescript
// stores/cart.ts
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    deliveryAddress: null as Address | null,
    deliveryFee: 0,
    appliedCoupon: null as Coupon | null
  }),

  getters: {
    itemCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),

    subtotal: (state) => state.items.reduce((sum, item) =>
      sum + (item.price * item.quantity), 0
    ),

    discount: (state) => {
      if (!state.appliedCoupon) return 0
      if (state.appliedCoupon.type === 'percentage') {
        return state.subtotal * (state.appliedCoupon.value / 100)
      }
      return state.appliedCoupon.value
    },

    total: (state) => {
      const subtotal = state.subtotal
      const delivery = state.deliveryFee
      const discount = state.discount
      return subtotal + delivery - discount
    }
  },

  actions: {
    addItem(item: CartItem) {
      const existing = this.items.find(i =>
        i.foodId === item.foodId && i.size === item.size
      )
      if (existing) {
        existing.quantity += item.quantity
      } else {
        this.items.push(item)
      }
      this.saveToLocalStorage()
    },

    removeItem(itemId: string) {
      this.items = this.items.filter(i => i.id !== itemId)
      this.saveToLocalStorage()
    },

    updateQuantity(itemId: string, quantity: number) {
      const item = this.items.find(i => i.id === itemId)
      if (item) {
        item.quantity = quantity
        if (quantity <= 0) {
          this.removeItem(itemId)
        }
      }
      this.saveToLocalStorage()
    },

    clearCart() {
      this.items = []
      this.appliedCoupon = null
      this.saveToLocalStorage()
    },

    applyCoupon(coupon: Coupon) {
      this.appliedCoupon = coupon
      this.saveToLocalStorage()
    },

    saveToLocalStorage() {
      localStorage.setItem('cart', JSON.stringify(this.items))
    },

    loadFromLocalStorage() {
      const saved = localStorage.getItem('cart')
      if (saved) {
        this.items = JSON.parse(saved)
      }
    }
  }
})
```

#### 17.1.3 User Store
```typescript
// stores/user.ts
export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null as UserProfile | null,
    addresses: [] as Address[],
    paymentMethods: [] as PaymentMethod[],
    favorites: [] as string[],
    orderHistory: [] as Order[],
    balance: 0
  }),

  actions: {
    async fetchProfile() {
      this.profile = await api.get('/user/profile')
    },

    async updateProfile(data: Partial<UserProfile>) {
      this.profile = await api.put('/user/profile', data)
    },

    async fetchAddresses() {
      this.addresses = await api.get('/user/addresses')
    },

    async addAddress(address: Address) {
      const newAddress = await api.post('/user/addresses', address)
      this.addresses.push(newAddress)
    },

    async toggleFavorite(foodId: string) {
      const index = this.favorites.indexOf(foodId)
      if (index > -1) {
        this.favorites.splice(index, 1)
        await api.delete(`/user/favorites/${foodId}`)
      } else {
        this.favorites.push(foodId)
        await api.post('/user/favorites', { foodId })
      }
    }
  }
})
```

#### 17.1.4 Restaurant Store
```typescript
// stores/restaurant.ts
export const useRestaurantStore = defineStore('restaurant', {
  state: () => ({
    restaurants: [] as Restaurant[],
    categories: [] as Category[],
    currentRestaurant: null as Restaurant | null,
    filters: {
      cuisine: [],
      priceRange: [],
      rating: 0,
      deliveryTime: 0,
      offers: []
    } as FilterState
  }),

  actions: {
    async fetchRestaurants() {
      this.restaurants = await api.get('/restaurants', {
        params: this.filters
      })
    },

    async fetchRestaurantById(id: string) {
      this.currentRestaurant = await api.get(`/restaurants/${id}`)
    },

    async searchRestaurants(query: string) {
      return await api.get('/restaurants/search', { params: { q: query } })
    },

    setFilters(filters: Partial<FilterState>) {
      this.filters = { ...this.filters, ...filters }
      this.fetchRestaurants()
    },

    clearFilters() {
      this.filters = {
        cuisine: [],
        priceRange: [],
        rating: 0,
        deliveryTime: 0,
        offers: []
      }
      this.fetchRestaurants()
    }
  }
})
```

#### 17.1.5 Order Store
```typescript
// stores/order.ts
export const useOrderStore = defineStore('order', {
  state: () => ({
    activeOrders: [] as Order[],
    orderHistory: [] as Order[],
    currentOrder: null as Order | null
  }),

  actions: {
    async placeOrder(orderData: CreateOrderDto) {
      const order = await api.post('/orders', orderData)
      this.currentOrder = order
      return order
    },

    async fetchActiveOrders() {
      this.activeOrders = await api.get('/orders/active')
    },

    async fetchOrderHistory() {
      this.orderHistory = await api.get('/orders/history')
    },

    async trackOrder(orderId: string) {
      return await api.get(`/orders/${orderId}/track`)
    },

    async cancelOrder(orderId: string, reason: string) {
      await api.post(`/orders/${orderId}/cancel`, { reason })
      await this.fetchActiveOrders()
    }
  }
})
```

#### 17.1.6 Notification Store
```typescript
// stores/notification.ts
export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [] as Notification[],
    unreadCount: 0
  }),

  actions: {
    async fetchNotifications() {
      this.notifications = await api.get('/notifications')
      this.updateUnreadCount()
    },

    async markAsRead(id: string) {
      await api.put(`/notifications/${id}/read`)
      const notif = this.notifications.find(n => n.id === id)
      if (notif) notif.read = true
      this.updateUnreadCount()
    },

    async markAllAsRead() {
      await api.put('/notifications/read-all')
      this.notifications.forEach(n => n.read = true)
      this.unreadCount = 0
    },

    updateUnreadCount() {
      this.unreadCount = this.notifications.filter(n => !n.read).length
    },

    addNotification(notification: Notification) {
      this.notifications.unshift(notification)
      this.unreadCount++
    }
  }
})
```

---

### 17.2 API Integration

#### 17.2.1 API Client Setup
```typescript
// services/api.ts
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
    }
    return Promise.reject(error)
  }
)
```

#### 17.2.2 API Endpoints Map
```typescript
// services/endpoints.ts
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  VERIFY_CODE: '/auth/verify',
  REFRESH_TOKEN: '/auth/refresh',

  // User
  USER_PROFILE: '/user/profile',
  USER_ADDRESSES: '/user/addresses',
  USER_PAYMENT_METHODS: '/user/payment-methods',
  USER_FAVORITES: '/user/favorites',
  USER_ORDERS: '/user/orders',

  // Restaurants
  RESTAURANTS: '/restaurants',
  RESTAURANT_DETAIL: (id: string) => `/restaurants/${id}`,
  RESTAURANT_MENU: (id: string) => `/restaurants/${id}/menu`,
  RESTAURANT_REVIEWS: (id: string) => `/restaurants/${id}/reviews`,

  // Menu
  MENU_ITEMS: '/menu',
  MENU_ITEM_DETAIL: (id: string) => `/menu/${id}`,
  MENU_CATEGORIES: '/menu/categories',

  // Orders
  ORDERS: '/orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  ORDER_TRACK: (id: string) => `/orders/${id}/track`,
  ORDER_CANCEL: (id: string) => `/orders/${id}/cancel`,

  // Cart
  CART: '/cart',
  CART_ADD: '/cart/add',
  CART_UPDATE: '/cart/update',
  CART_REMOVE: '/cart/remove',
  CART_CLEAR: '/cart/clear',

  // Payment
  PAYMENT_METHODS: '/payment/methods',
  PAYMENT_PROCESS: '/payment/process',
  PAYMENT_VERIFY: '/payment/verify',

  // Search
  SEARCH: '/search',
  SEARCH_SUGGESTIONS: '/search/suggestions',

  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATION_READ: (id: string) => `/notifications/${id}/read`,

  // Messages
  CONVERSATIONS: '/messages/conversations',
  MESSAGES: (conversationId: string) => `/messages/${conversationId}`,

  // Reviews
  REVIEWS: '/reviews',
  REVIEW_CREATE: '/reviews/create',

  // Coupons
  COUPONS: '/coupons',
  COUPON_VALIDATE: '/coupons/validate',
  COUPON_APPLY: '/coupons/apply'
}
```

---

### 17.3 Real-time Features (WebSocket)

#### 17.3.1 Socket Setup
```typescript
// services/socket.ts
import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null

  connect(token: string) {
    this.socket = io(import.meta.env.VITE_WS_URL, {
      auth: { token },
      transports: ['websocket']
    })

    this.socket.on('connect', () => {
      console.log('Socket connected')
    })

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })
  }

  disconnect() {
    this.socket?.disconnect()
  }

  // Order tracking
  subscribeToOrder(orderId: string, callback: (data: any) => void) {
    this.socket?.on(`order:${orderId}:update`, callback)
  }

  unsubscribeFromOrder(orderId: string) {
    this.socket?.off(`order:${orderId}:update`)
  }

  // Messages
  subscribeToConversation(conversationId: string, callback: (message: any) => void) {
    this.socket?.on(`conversation:${conversationId}:message`, callback)
  }

  sendMessage(conversationId: string, message: string) {
    this.socket?.emit('message:send', { conversationId, message })
  }

  // Typing indicator
  startTyping(conversationId: string) {
    this.socket?.emit('typing:start', { conversationId })
  }

  stopTyping(conversationId: string) {
    this.socket?.emit('typing:stop', { conversationId })
  }

  // Notifications
  subscribeToNotifications(callback: (notification: any) => void) {
    this.socket?.on('notification:new', callback)
  }
}

export const socketService = new SocketService()
```

#### 17.3.2 Usage in Components
```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { socketService } from '@/services/socket'

const orderId = 'order-123'

onMounted(() => {
  socketService.subscribeToOrder(orderId, (data) => {
    console.log('Order update:', data)
    // Update order status, location, etc.
  })
})

onUnmounted(() => {
  socketService.unsubscribeFromOrder(orderId)
})
</script>
```

---

### 17.4 Composables (Reusable Logic)

#### 17.4.1 useGeolocation
```typescript
// composables/useGeolocation.ts
import { ref } from 'vue'

export function useGeolocation() {
  const location = ref<{ lat: number; lng: number } | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)

  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      loading.value = true

      if (!navigator.geolocation) {
        error.value = 'Geolocation not supported'
        loading.value = false
        reject(error.value)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          location.value = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          loading.value = false
          resolve(location.value)
        },
        (err) => {
          error.value = err.message
          loading.value = false
          reject(err)
        }
      )
    })
  }

  return {
    location,
    error,
    loading,
    getCurrentLocation
  }
}
```

#### 17.4.2 useDebounce
```typescript
// composables/useDebounce.ts
import { ref, watch } from 'vue'

export function useDebounce<T>(value: Ref<T>, delay: number = 300) {
  const debouncedValue = ref(value.value) as Ref<T>
  let timeout: NodeJS.Timeout

  watch(value, (newValue) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  })

  return debouncedValue
}
```

#### 17.4.3 useInfiniteScroll
```typescript
// composables/useInfiniteScroll.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useInfiniteScroll(callback: () => void, threshold: number = 100) {
  const loading = ref(false)
  const hasMore = ref(true)

  const handleScroll = () => {
    if (loading.value || !hasMore.value) return

    const scrollPosition = window.innerHeight + window.scrollY
    const threshold = document.body.offsetHeight - threshold

    if (scrollPosition >= threshold) {
      callback()
    }
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return {
    loading,
    hasMore
  }
}
```

#### 17.4.4 useToast
```typescript
// composables/useToast.ts
import { ref } from 'vue'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration: number
}

const toasts = ref<Toast[]>([])

export function useToast() {
  const show = (
    message: string,
    type: Toast['type'] = 'info',
    duration: number = 3000
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: Toast = { id, message, type, duration }

    toasts.value.push(toast)

    setTimeout(() => {
      remove(id)
    }, duration)
  }

  const remove = (id: string) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return {
    toasts,
    show,
    success: (msg: string) => show(msg, 'success'),
    error: (msg: string) => show(msg, 'error'),
    warning: (msg: string) => show(msg, 'warning'),
    info: (msg: string) => show(msg, 'info')
  }
}
```

---

### 17.5 Utilities

#### 17.5.1 Format Currency
```typescript
// utils/formatters.ts
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}
```

#### 17.5.2 Format Date/Time
```typescript
export const formatDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

export const formatTime = (date: Date | string): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date(date))
}

export const timeAgo = (date: Date | string): string => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  }

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit)
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`
    }
  }

  return 'just now'
}
```

#### 17.5.3 Validation
```typescript
// utils/validation.ts
export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePhone = (phone: string): boolean => {
  const re = /^\+?[\d\s-()]+$/
  return re.test(phone) && phone.replace(/\D/g, '').length >= 10
}

export const validatePassword = (password: string): {
  valid: boolean
  errors: string[]
} => {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export const validateCardNumber = (cardNumber: string): boolean => {
  // Luhn algorithm
  const digits = cardNumber.replace(/\D/g, '')
  let sum = 0
  let isEven = false

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i])

    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}
```

---

## 📅 IMPLEMENTATION TIMELINE

### Week 1: Authentication & Onboarding (P0)
- Day 1-2: Onboarding screens with animations
- Day 3-4: Login, Sign Up, Forgot Password flows
- Day 5: Verification, Location permission screens

### Week 2-3: Enhanced Home Screen (P0)
- Day 1-2: Header, search bar, location selector
- Day 3-4: Category sections (both layouts)
- Day 5-6: Promotional banners/modals
- Day 7-8: Restaurant cards and lists
- Day 9-10: Bottom navigation, polish

### Week 3: Search & Filter System (P0)
- Day 1-2: Search screen with suggestions
- Day 3-4: Filter panel with all options
- Day 5: Integration and testing

### Week 4: Restaurant & Food Details (P1)
- Day 1-2: Restaurant view with tabs
- Day 3-4: Enhanced food details with size/ingredients
- Day 5: Polish and transitions

### Week 5: Cart & Payment (P1)
- Day 1-2: Advanced cart management
- Day 3-4: Payment methods and card management
- Day 5: Payment success flow

### Week 6: Address Management (P2)
- Day 1-2: Address list and form
- Day 3-4: Map integration
- Day 5: Geocoding and testing

### Week 7: Order Tracking & History (P2)
- Day 1-2: Order tracking with maps
- Day 3-4: Order history with tabs
- Day 5: WebSocket integration

### Week 8: Profile & Wallet (P2)
- Day 1-2: Profile screens and edit
- Day 3-4: Wallet and withdrawal
- Day 5: Settings and preferences

### Week 9: Notifications, Messages, Reviews (P3)
- Day 1-2: Notifications center
- Day 3-4: Messages and chat
- Day 5: Reviews and ratings

### Week 10: Polish & Testing (P3)
- Day 1-2: Favorites and lists
- Day 3-4: Empty/error/loading states
- Day 5: Final polish and bug fixes

---

## 🧪 TESTING STRATEGY

### Unit Tests
- [ ] Store actions and getters
- [ ] Utility functions
- [ ] Validation functions
- [ ] Composables

### Component Tests
- [ ] Base components (buttons, inputs, modals)
- [ ] Complex components (cart, order tracking)
- [ ] Form validations
- [ ] User interactions

### E2E Tests
- [ ] Complete user flows:
  - Onboarding → Login → Browse → Add to Cart → Checkout → Payment
  - Search → Filter → View Restaurant → Order
  - Order Tracking
  - Profile Management

### Integration Tests
- [ ] API integration
- [ ] WebSocket connections
- [ ] Payment gateway
- [ ] Map services

---

## 📊 PROGRESS TRACKING

### Component Completion Checklist

#### Phase 1: Authentication & Onboarding
- [x] Onboarding.vue (Started)
- [ ] Login.vue
- [ ] SignUp.vue
- [ ] ForgotPassword.vue
- [ ] Verification.vue
- [ ] LocationPermission.vue

#### Phase 2: Enhanced Home Screen
- [ ] Enhanced Home.vue
- [ ] HeaderBar component
- [ ] LocationSelector component
- [ ] SearchBar component
- [ ] CategoryPillButton component
- [ ] CategoryCard component
- [ ] PromoBannerModal component
- [ ] Enhanced RestaurantCard component

#### Phase 3: Search & Filter
- [ ] Search.vue
- [ ] Enhanced FilterPanel component
- [ ] SearchSuggestions component
- [ ] RecentSearches component

#### Phase 4: Restaurant & Food Details
- [ ] RestaurantView.vue
- [ ] Enhanced FoodDetail.vue
- [ ] SizeSelector component
- [ ] IngredientsDisplay component
- [ ] CategoryTabs component

#### Phase 5: Cart & Payment
- [ ] Enhanced Cart.vue
- [ ] CartBreakdown component
- [ ] Payment.vue
- [ ] AddCardModal component
- [ ] PaymentSuccess.vue

#### Phase 6: Address Management
- [ ] AddressList.vue
- [ ] AddressForm.vue
- [ ] MapSelector component

#### Phase 7: Order Tracking & History
- [ ] OrderTracking.vue
- [ ] OrderHistory.vue
- [ ] OrderCard component
- [ ] LiveMap component

#### Phase 8: Profile & Wallet
- [ ] Enhanced Profile.vue
- [ ] EditProfile.vue
- [ ] WalletCard component
- [ ] WithdrawalHistory.vue

#### Phase 9: Notifications, Messages, Reviews
- [ ] Notifications.vue
- [ ] Messages.vue
- [ ] Chat.vue
- [ ] Call.vue
- [ ] Reviews.vue
- [ ] WriteReviewModal component

#### Phase 10: Polish
- [ ] Splash.vue
- [ ] All empty states
- [ ] All error states
- [ ] All loading states
- [ ] All confirmation dialogs

---

## 📦 DEPENDENCIES TO ADD

```json
{
  "dependencies": {
    "@vueuse/core": "^10.7.0",
    "socket.io-client": "^4.6.0",
    "@googlemaps/js-api-loader": "^1.16.2",
    "chart.js": "^4.4.0",
    "vue-chartjs": "^5.3.0",
    "swiper": "^11.0.5",
    "emoji-picker-element": "^1.18.0",
    "qrcode": "^1.5.3",
    "html2canvas": "^1.4.1",
    "lottie-web": "^5.12.2"
  },
  "devDependencies": {
    "@types/google.maps": "^3.54.0",
    "cypress": "^13.6.0"
  }
}
```

---

## ✅ DEFINITION OF DONE

Each feature is considered complete when:
- [ ] UI matches design specifications
- [ ] All interactions work smoothly
- [ ] API integration complete
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Empty states implemented
- [ ] Responsive on all screen sizes
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Unit tests written and passing
- [ ] Component tests written and passing
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Browser tested (Chrome, Safari, Firefox)
- [ ] Mobile tested (iOS, Android)

---

## 📝 NOTES & DECISIONS

### Design System Notes
- Primary color: Orange (#FF6B35, #FF8C42)
- Dark backgrounds: Navy/Black (#1A1D29, #2C2F3E)
- Text: White on dark, Dark on light
- Border radius: 8px (small), 12px (medium), 16px (large)
- Shadows: Soft, subtle
- Animations: Smooth, 200-300ms duration

### Responsive Breakpoints
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

### Performance Targets
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: > 90

---

**End of Implementation Plan**

**Next Steps:**
1. Review and approve this plan
2. Set up project board with tasks
3. Assign team members to phases
4. Begin Phase 1 implementation
5. Daily standups to track progress
6. Weekly demos to stakeholders