# Garbaking Kiosk Design System

A professional, enterprise-grade design system for the Garbaking Point of Sale kiosk application. This design system ensures consistency, accessibility, and a polished user experience across all touchpoints.

## 🎨 Design Principles

### 1. **Touch-First Design**
- Minimum touch target: 60px (comfortable: 80px, generous: 100px)
- Large, readable typography (minimum 18px)
- Generous spacing for fat-finger friendly interactions
- Clear visual feedback on all interactions

### 2. **Accessibility First**
- WCAG AA compliant color contrast (4.5:1 for normal text)
- Semantic HTML with proper ARIA labels
- Keyboard navigable for all interactions
- Screen reader optimized content

### 3. **Performance Optimized**
- Smooth 60fps animations
- Optimized transitions (200-300ms sweet spot)
- Lazy-loaded images with loading skeletons
- Minimal re-renders with proper component composition

### 4. **Visual Hierarchy**
- Clear information architecture
- Consistent spacing scale
- Elevation system for depth
- Strategic use of color to guide attention

## 📐 Spacing System

### Base Spacing Scale
```
0   → 0px
1   → 4px    (0.25rem)
2   → 8px    (0.5rem)
3   → 12px   (0.75rem)
4   → 16px   (1rem)
5   → 20px   (1.25rem)
6   → 24px   (1.5rem)
8   → 32px   (2rem)
10  → 40px   (2.5rem)
12  → 48px   (3rem)
16  → 64px   (4rem)
20  → 80px   (5rem)
24  → 96px   (6rem)
```

### Kiosk-Specific Spacing
```
kiosk-xs  → 16px   (tight spacing)
kiosk-sm  → 24px   (compact spacing)
kiosk-md  → 32px   (standard spacing)
kiosk-lg  → 48px   (comfortable spacing)
kiosk-xl  → 64px   (generous spacing)
kiosk-2xl → 96px   (extra generous)
```

### Usage Guidelines
- **Between sections**: Use `kiosk-lg` or `kiosk-xl`
- **Card padding**: Use `kiosk-md` (32px)
- **List items**: Use `kiosk-sm` (24px) between items
- **Form fields**: Use `kiosk-sm` (24px) vertical spacing
- **Page margins**: Use `kiosk-lg` (48px) or `kiosk-xl` (64px)

## 🔤 Typography

### Font Hierarchy
```
Heading 1 (Hero)    → 4.5rem (72px) / Bold
Heading 2 (Page)    → 3rem   (48px) / Bold
Heading 3 (Section) → 2.5rem (40px) / Semibold
Heading 4 (Card)    → 2rem   (32px) / Semibold
Body Large          → 1.75rem (28px) / Normal
Body                → 1.5rem  (24px) / Normal
Body Small          → 1.25rem (20px) / Normal
Caption             → 1.125rem (18px) / Normal
```

### Font Weights
- **Normal (400)**: Body text
- **Medium (500)**: Subtle emphasis
- **Semibold (600)**: Headings, labels
- **Bold (700)**: Primary headings, CTAs
- **Extrabold (800)**: Hero text

### Usage Examples
```vue
<!-- Page Title -->
<h1 class="text-kiosk-4xl font-bold">Welcome</h1>

<!-- Section Heading -->
<h2 class="text-kiosk-3xl font-semibold">Choose Your Items</h2>

<!-- Card Title -->
<h3 class="text-kiosk-xl font-semibold">Croissant</h3>

<!-- Body Text -->
<p class="text-kiosk-base font-normal">Fresh baked daily</p>

<!-- Small Text / Caption -->
<span class="text-kiosk-sm text-neutral-500">Prep time: 5 mins</span>
```

## 🎨 Color System

### Primary Colors (Brand Orange)
```
primary-50  → #FFF5F0 (lightest - backgrounds)
primary-100 → #FFE8DB
primary-200 → #FFD1B8
primary-300 → #FFB994
primary-400 → #FFA170
primary-500 → #FF6B35 ★ Main brand color
primary-600 → #E65A28 (hover states)
primary-700 → #CC4A1C (active states)
primary-800 → #B33A11
primary-900 → #992A05 (darkest)
```

### Secondary Colors (Sky Blue)
```
secondary-500 → #0EA5E9 ★ Main secondary
secondary-600 → #0284C7 (hover)
```

### Neutral Colors
```
neutral-50  → #FAFAFA (backgrounds)
neutral-100 → #F5F5F5 (subtle backgrounds)
neutral-200 → #E5E5E5 (borders, dividers)
neutral-300 → #D4D4D4 (disabled states)
neutral-400 → #A3A3A3 (muted text)
neutral-500 → #737373 (secondary text)
neutral-600 → #525252
neutral-700 → #404040 (primary text)
neutral-800 → #262626
neutral-900 → #171717 (darkest text)
```

### Semantic Colors
```
Success → #22C55E (green)
Warning → #F59E0B (amber)
Error   → #EF4444 (red)
Info    → #3B82F6 (blue)
```

### Color Usage Guidelines
- **Primary**: CTAs, active states, brand moments
- **Secondary**: Supporting actions, info badges
- **Neutral**: Text, backgrounds, borders
- **Semantic**: Status indicators, alerts, feedback

### Contrast Requirements
- Primary-500 on white: ✅ 4.5:1 (WCAG AA)
- Neutral-700 on white: ✅ 10.7:1 (WCAG AAA)
- White on Primary-500: ✅ 4.5:1 (WCAG AA)

## 💫 Shadows & Elevation

### Soft Shadow System (Professional Look)
```
soft-sm  → Subtle lift (cards at rest)
soft-md  → Standard elevation (interactive cards)
soft-lg  → Prominent (modals, popovers)
soft-xl  → Maximum depth (toasts, alerts)
```

### Elevation Guidelines
- **Level 0**: Base page, no shadow
- **Level 1**: Cards, buttons (shadow-soft-sm)
- **Level 2**: Hover states, dropdowns (shadow-soft-md)
- **Level 3**: Modals, dialogs (shadow-soft-lg)
- **Level 4**: Toasts, tooltips (shadow-soft-xl)

### Glow Effects
Use sparingly for active/focused states:
```
glow-primary   → Orange glow
glow-secondary → Blue glow
glow-success   → Green glow
```

## 🔘 Border Radius

### Scale
```
sm      → 6px   (subtle rounding)
base    → 8px   (standard)
md      → 12px  (moderate)
lg      → 16px  (pronounced)
xl      → 24px  (generous)
2xl     → 32px  (extra generous)
3xl     → 48px  (maximum)
full    → 9999px (pill shape)
```

### Component Guidelines
- **Buttons**: `button` token (16px)
- **Cards**: `card` token (24px)
- **Inputs**: `input` token (12px)
- **Modals**: `modal` token (32px)
- **Images**: `lg` (16px) or `xl` (24px)

## ⚡ Animation & Motion

### Duration Guidelines
```
instant → 100ms  (micro-interactions)
fast    → 200ms  (state changes, hovers)
normal  → 300ms  (default transitions)
slow    → 500ms  (page transitions)
slower  → 700ms  (complex animations)
```

### Easing Functions
```
smooth  → cubic-bezier(0.4, 0, 0.2, 1)      [Default]
snappy  → cubic-bezier(0.25, 0.46, 0.45, 0.94)  [Quick response]
bounce  → cubic-bezier(0.68, -0.55, 0.265, 1.55) [Playful]
spring  → cubic-bezier(0.175, 0.885, 0.32, 1.275) [Natural]
```

### Animation Principles
1. **Purposeful**: Every animation should have a reason
2. **Subtle**: Don't distract from content
3. **Smooth**: 60fps performance
4. **Consistent**: Same duration/easing for similar actions
5. **Responsive**: Immediate feedback (<100ms)

### Common Transitions
```vue
<!-- Fade -->
<Transition name="fade">
  <div v-if="show">Content</div>
</Transition>

<!-- Scale -->
<Transition name="scale">
  <div v-if="show">Content</div>
</Transition>

<!-- Slide Up -->
<Transition name="slide-up">
  <div v-if="show">Content</div>
</Transition>
```

## 📱 Touch Targets

### Minimum Sizes
```
Minimum      → 60px  (acceptable for secondary actions)
Comfortable  → 80px  (recommended for primary actions)
Generous     → 100px (best for high-traffic buttons)
```

### Guidelines
- Primary CTAs: 80px minimum
- Secondary actions: 60px minimum
- Text links: 60px vertical padding
- Form inputs: 60px height minimum
- Icon buttons: 60px × 60px minimum

## 🎯 Component Patterns

### Button Variants
```vue
<!-- Primary (Main CTA) -->
<KioskButton variant="primary">Add to Cart</KioskButton>

<!-- Secondary (Alternative action) -->
<KioskButton variant="secondary">View Details</KioskButton>

<!-- Ghost (Subtle action) -->
<KioskButton variant="ghost">Cancel</KioskButton>

<!-- Danger (Destructive action) -->
<KioskButton variant="danger">Remove Item</KioskButton>
```

### Card Patterns
```vue
<!-- Standard Card -->
<KioskCard>
  <template #header>Title</template>
  <template #content>Body</template>
  <template #footer>Actions</template>
</KioskCard>

<!-- Interactive Card -->
<KioskCard hoverable @click="handleClick">
  Content
</KioskCard>
```

### Loading States
```vue
<!-- Skeleton (preferred for content loading) -->
<LoadingSkeleton type="card" count="3" />

<!-- Spinner (for actions/processing) -->
<LoadingSpinner size="lg" />
```

### Empty States
```vue
<EmptyState
  icon="shopping-cart"
  title="Your cart is empty"
  description="Add items to get started"
  action="Browse Menu"
  @action="goToMenu"
/>
```

## ♿ Accessibility Guidelines

### ARIA Labels
Always provide labels for icon buttons:
```vue
<button aria-label="Add to cart">
  <PlusIcon />
</button>
```

### Focus Management
Ensure visible focus indicators:
```css
.focus-visible:focus {
  outline: 2px solid theme('colors.primary.500');
  outline-offset: 2px;
}
```

### Semantic HTML
Use proper elements:
```vue
<!-- ❌ Bad -->
<div @click="submit">Submit</div>

<!-- ✅ Good -->
<button @click="submit">Submit</button>
```

### Keyboard Navigation
All interactive elements must be keyboard accessible:
- Tab to navigate
- Enter/Space to activate
- Escape to close modals
- Arrow keys for lists/grids

## 📦 Component Library

### Layout Components
- `KioskHeader` - Page header with back button
- `KioskSidebar` - Sidebar container
- `KioskContainer` - Page wrapper
- `OrderSummary` - Reusable order summary

### Form Components
- `KioskInput` - Text input with validation
- `KioskTextarea` - Multiline input
- `KioskRadioGroup` - Radio button group
- `KioskCheckboxGroup` - Checkbox group
- `KioskSelect` - Dropdown select

### Feedback Components
- `KioskToast` - Toast notifications
- `KioskModal` - Modal dialogs
- `LoadingSkeleton` - Content placeholders
- `ErrorState` - Error displays
- `EmptyState` - Empty state messages

### UI Components
- `KioskButton` - Primary button component
- `KioskBadge` - Status badges
- `PriceDisplay` - Formatted prices
- `QuantitySelector` - Increment/decrement
- `KioskCard` - Card container

## 🚀 Usage Examples

### Import Tokens
```typescript
import { spacing, colors, animations } from '@/design-system/tokens'

// Use in component
const buttonStyle = {
  padding: spacing.kiosk.md,
  backgroundColor: colors.primary[500],
  transition: animations.transition.normal,
}
```

### Tailwind Classes
```vue
<div class="p-kiosk-md bg-primary-500 rounded-card shadow-soft-md">
  <h2 class="text-kiosk-2xl font-bold text-neutral-text">
    Title
  </h2>
</div>
```

## 📚 Resources

- [Tailwind CSS Docs](https://tailwindcss.com)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design](https://material.io/design)
- [Inclusive Components](https://inclusive-components.design/)

---

**Version**: 1.0.0
**Last Updated**: 2025-11-04
**Maintained by**: Garbaking Development Team
