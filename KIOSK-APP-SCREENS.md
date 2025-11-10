# Kiosk App - Screen-by-Screen Visual Guide

A detailed walkthrough of all 7 screens in the kiosk application.

---

## Screen 1: Welcome / Idle Screen 🏠

**File**: [WelcomeScreen.vue](frontend/kiosk-app/src/views/WelcomeScreen.vue)

### Purpose
Attract customers and initiate the ordering process.

### Visual Elements
```
┌────────────────────────────────────────────────┐
│                                                │
│          🎨 Animated Background               │
│                                                │
│           WELCOME TO GARBAKING                │
│              ──────────                       │
│                                                │
│              ┌──────────┐                     │
│              │    →     │  (Pulsing)         │
│              └──────────┘                     │
│                                                │
│         Touch anywhere to start ordering       │
│              TOUCH TO START                    │
│                                                │
│    Available 24/7 • Fast Service • Fresh Food │
└────────────────────────────────────────────────┘
```

### Features
- Full-screen gradient background (orange)
- Animated floating circles
- Pulsing touch target
- Auto-reset destination
- Touch/click anywhere to proceed

### Navigation
- **Next**: LanguageModeScreen

---

## Screen 2: Language & Mode Selection 🌍

**File**: [LanguageModeScreen.vue](frontend/kiosk-app/src/views/LanguageModeScreen.vue)

### Purpose
Let customers select their preferred language and dining mode.

### Visual Elements
```
┌────────────────────────────────────────────────┐
│  How would you like to enjoy your meal?        │
├────────────────────────────────────────────────┤
│                                                │
│  SELECT LANGUAGE                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │    🇬🇧   │ │    🇫🇷   │ │    🇦🇪   │      │
│  │ English  │ │ Français │ │ العربية  │      │
│  └──────────┘ └──────────┘ └──────────┘      │
│                                                │
│  SELECT MODE                                   │
│  ┌──────────────────┐ ┌──────────────────┐   │
│  │       🏠        │ │       🛍️        │   │
│  │   DINE IN      │ │   TAKEAWAY      │   │
│  │                │ │                 │   │
│  └──────────────────┘ └──────────────────┘   │
│                                                │
│            [ CONTINUE ] (disabled until both)  │
└────────────────────────────────────────────────┘
```

### Features
- 3 language options with flags
- 2 dining mode options with icons
- Visual selection feedback (blue border)
- Continue button activates when both selected
- Saves preferences to settings store

### Navigation
- **Back**: Header back button → WelcomeScreen
- **Next**: Continue button → MenuScreen

---

## Screen 3: Menu / Browse Screen 🍔

**File**: [MenuScreen.vue](frontend/kiosk-app/src/views/MenuScreen.vue)

### Purpose
Browse and select menu items by category.

### Visual Elements
```
┌────────────────────────────────────────────────┐
│ MENU              🛒 2 items  $25.98      │
├──────┬─────────────────────────────────────────┤
│      │                                         │
│ All  │  ┌───────┐  ┌───────┐  ┌───────┐      │
│Items │  │ 📸    │  │ 📸    │  │ 📸    │      │
│      │  │Burger │  │Pizza  │  │Salad  │      │
│ 🍔   │  │$12.99 │  │$14.99 │  │$9.99  │      │
│Burgers│  └───────┘  └───────┘  └───────┘      │
│      │                                         │
│ 🍕   │  ┌───────┐  ┌───────┐  ┌───────┐      │
│Pizza │  │ 📸    │  │ 📸    │  │ 📸    │      │
│      │  │Fries  │  │Drink  │  │Dessert│      │
│ 🥗   │  │$4.99  │  │$2.99  │  │$5.99  │      │
│Salads│  └───────┘  └───────┘  └───────┘      │
│      │                                         │
│ 🥤   │         ...more items...                │
│Drinks│                                         │
└──────┴─────────────────────────────────────────┘
```

### Features
- Left sidebar: Category navigation
- Main area: 3-column grid of items
- Each item card shows:
  - Image (or placeholder)
  - Name
  - Description
  - Price
  - Prep time
- Top-right: Cart preview with count and total
- Click item → Customize (if options) or Add to cart
- Cart button → View cart

### Navigation
- **Back**: Header back button → LanguageModeScreen
- **Item**: Click item → ItemCustomizationScreen (if has customizations)
- **Cart**: Cart button → CartSummaryScreen

---

## Screen 4: Item Customization Screen ⚙️

**File**: [ItemCustomizationScreen.vue](frontend/kiosk-app/src/views/ItemCustomizationScreen.vue)

### Purpose
Customize menu item with options and special requests.

### Visual Elements
```
┌────────────────────────────────────────────────┐
│ ← Back      CUSTOMIZE YOUR ORDER               │
├──────────────────┬─────────────────────────────┤
│                  │                             │
│   ┌──────────┐  │ QUANTITY                    │
│   │          │  │  [-]  2  [+]                │
│   │  Image   │  │                             │
│   │          │  │ SIZE (Required)             │
│   └──────────┘  │  ○ Regular  $0.00           │
│                  │  ● Large    +$2.00          │
│ Classic Burger  │                             │
│ $12.99          │ ADD-ONS (Optional)          │
│                  │  ☑ Extra Cheese  +$1.50    │
│ Juicy beef...   │  ☐ Bacon         +$2.00    │
│                  │  ☐ Avocado       +$1.00    │
│                  │                             │
│                  │ SPECIAL INSTRUCTIONS        │
│                  │ ┌─────────────────────────┐│
│                  │ │ No onions please...     ││
│                  │ └─────────────────────────┘│
└──────────────────┴─────────────────────────────┤
│ Total: $31.98          [Cancel] [Add to Cart] │
└────────────────────────────────────────────────┘
```

### Features
- Left: Item image and details
- Right: Customization options
- Quantity +/- controls
- Radio buttons for single-choice (Size)
- Checkboxes for multi-choice (Add-ons)
- Required vs optional labels
- Real-time price calculation
- Special instructions textarea
- Bottom bar: Total and action buttons

### Navigation
- **Back**: Cancel button or header back → MenuScreen
- **Next**: Add to Cart → MenuScreen (item added to cart)

---

## Screen 5: Cart Summary / Review Screen 🛒

**File**: [CartSummaryScreen.vue](frontend/kiosk-app/src/views/CartSummaryScreen.vue)

### Purpose
Review order before payment, edit or remove items.

### Visual Elements
```
┌────────────────────────────────────────────────┐
│ ← Continue Shopping    YOUR ORDER              │
├────────────────────────────────┬───────────────┤
│                                │               │
│ ┌────────────────────────────┐│ Order Summary │
│ │ 📸 Classic Burger          ││               │
│ │    • Size: Large (+$2.00)  ││ Items:      2 │
│ │    • Extra Cheese (+$1.50) ││ Subtotal: $29 │
│ │    Note: No onions         ││ Tax:     $2.9 │
│ │    [-] 2 [+]        $31.98 ││ ──────────────│
│ └────────────────────────────┘│ Total:  $31.9 │
│                                │               │
│ ┌────────────────────────────┐│               │
│ │ 📸 French Fries            ││               │
│ │    [-] 1 [+]         $4.99 ││               │
│ └────────────────────────────┘│               │
│                                │               │
│        ...more items...        │               │
│                                │  ┌──────────┐│
│                                │  │CHECKOUT  ││
│                                │  │          ││
│                                │  └──────────┘│
└────────────────────────────────┴───────────────┘
```

### Features
- Scrollable list of cart items
- Each item shows:
  - Image
  - Name
  - Customizations with prices
  - Special notes
  - Quantity controls
  - Subtotal
  - Remove button
- Right sidebar:
  - Order summary
  - Subtotal, tax, total
  - Large checkout button
- Empty state if no items

### Navigation
- **Back**: Continue Shopping button → MenuScreen
- **Next**: Checkout button → PaymentScreen

---

## Screen 6: Payment Selection Screen 💳

**File**: [PaymentScreen.vue](frontend/kiosk-app/src/views/PaymentScreen.vue)

### Purpose
Select payment method and process payment.

### Visual Elements
```
┌────────────────────────────────────────────────┐
│ ← Back      SELECT PAYMENT METHOD              │
├────────────────────────────────┬───────────────┤
│                                │               │
│  ┌──────────────┐ ┌──────────┐│ Order Summary │
│  │      💳      │ │    📱    ││               │
│  │  CREDIT/     │ │  MOBILE  ││ Items:      2 │
│  │  DEBIT CARD  │ │  MONEY   ││ Subtotal: $29 │
│  └──────────────┘ └──────────┘│ Tax:     $2.9 │
│                                │ ──────────────│
│  ┌──────────────┐ ┌──────────┐│ Total:  $31.9 │
│  │      📲      │ │    💵    ││               │
│  │   QR CODE    │ │   CASH   ││               │
│  │              │ │ AT COUNTER│               │
│  └──────────────┘ └──────────┘│  ┌──────────┐│
│                                │  │ CONFIRM  ││
│    (Selected method has blue   │  │          ││
│     border and background)     │  └──────────┘│
└────────────────────────────────┴───────────────┘
```

### Features
- 4 payment method cards (grid layout)
- Each method has icon and label
- Visual selection feedback
- Payment methods can be enabled/disabled via settings
- Processing spinner during payment
- Error messages if payment fails
- Order summary sidebar
- Confirm button (disabled until method selected)

### Navigation
- **Back**: Back button → CartSummaryScreen
- **Next**: Confirm → ConfirmationScreen (on success)

---

## Screen 7: Confirmation / Thank You Screen ✅

**File**: [ConfirmationScreen.vue](frontend/kiosk-app/src/views/ConfirmationScreen.vue)

### Purpose
Confirm order, display order number, auto-reset.

### Visual Elements
```
┌────────────────────────────────────────────────┐
│                                                │
│              ┌──────────┐                     │
│              │    ✓     │  (Bouncing)         │
│              └──────────┘                     │
│                                                │
│           ORDER CONFIRMED!                    │
│                                                │
│           ORDER NUMBER                        │
│          ┌──────────────┐                     │
│          │     #104     │                     │
│          └──────────────┘                     │
│                                                │
│        Thank you for your order               │
│   Please wait for your order to be prepared   │
│                                                │
│  ┌────────────────────────────────────────┐  │
│  │ Please find a seat. We'll bring your   │  │
│  │ order to you.                          │  │
│  └────────────────────────────────────────┘  │
│                                                │
│        Estimated time: 15 minutes             │
│                                                │
│        Start New Order in 10s...              │
└────────────────────────────────────────────────┘
```

### Features
- Full-screen green gradient
- Large checkmark animation
- Order number in big display
- Thank you message
- Mode-specific instructions:
  - Dine-in: "Find a seat, we'll bring it"
  - Takeaway: "Wait at counter, we'll call you"
- Estimated ready time
- 10-second countdown
- Auto-reset to welcome screen

### Navigation
- **Auto**: 10 seconds → WelcomeScreen (clears all data)

---

## Navigation Map

```
WelcomeScreen
    ↓ (touch anywhere)
LanguageModeScreen
    ↓ (continue)
MenuScreen ←──────────┐
    ↓ (select item)   │
ItemCustomizationScreen│
    ↓ (add to cart) ──┘
MenuScreen
    ↓ (view cart)
CartSummaryScreen
    ↓ (checkout)
PaymentScreen
    ↓ (confirm)
ConfirmationScreen
    ↓ (10s auto-reset)
WelcomeScreen
```

## Idle Detection Flow

```
Any Screen (except Welcome)
    ↓ (50s no activity)
Idle Warning Modal
    ↓ (continue shopping) → Resume
    ↓ (10s countdown)
    ↓ (60s total no activity)
WelcomeScreen (session cleared)
```

---

## Screen Specifications

| Screen | File Size | Components | API Calls | State |
|--------|-----------|------------|-----------|-------|
| Welcome | ~90 lines | 0 | 0 | None |
| Language/Mode | ~140 lines | 0 | 0 | Settings |
| Menu | ~180 lines | 0 | 2 | Menu, Cart |
| Customize | ~260 lines | 0 | 1 | Menu, Cart |
| Cart | ~200 lines | 0 | 0 | Cart |
| Payment | ~200 lines | 0 | 2 | Cart, Order |
| Confirmation | ~90 lines | 0 | 0 | Order |

---

## Color Coding

Throughout the app:
- **Primary Orange** (#FF6B35): Buttons, accents, selected states
- **White**: Backgrounds, cards
- **Gray**: Text, borders, disabled states
- **Green**: Success, confirmation screen
- **Red**: Errors, delete actions
- **Blue**: Secondary actions, info

---

## Typography Scale

All screens use the kiosk-specific font sizes:
- **Headings**: kiosk-2xl to kiosk-4xl (48px - 72px)
- **Body**: kiosk-base to kiosk-xl (24px - 36px)
- **Small**: kiosk-xs to kiosk-sm (18px - 20px)

---

## Responsive Behavior

All screens are optimized for:
- **Primary**: 1920x1080 landscape
- **Fallback**: Auto-adjusts to screen size
- **Touch**: All interactions touch-optimized
- **No hover**: No hover-dependent features

---

This completes the visual guide for all 7 kiosk screens! 🎉
