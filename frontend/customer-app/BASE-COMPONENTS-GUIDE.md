# Base Components Guide

Complete reference for all base components in the Customer App. All components follow the design system and support dark mode out of the box.

---

## 📚 Table of Contents

1. [BaseButton](#basebutton)
2. [BaseInput](#baseinput)
3. [BaseCard](#basecard)
4. [BaseModal](#basemodal)
5. [BaseToast](#basetoast)
6. [BaseLoader](#baseloader)
7. [BaseBadge](#basebadge)
8. [BaseChip](#basechip)
9. [Design System](#design-system)
10. [Testing](#testing)

---

## BaseButton

Versatile button component with multiple variants, sizes, and states.

### Import
```vue
import BaseButton from '@/components/base/BaseButton.vue'
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'cta'` | `'primary'` | Button style variant |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Button size |
| `disabled` | `boolean` | `false` | Disabled state |
| `loading` | `boolean` | `false` | Loading state with spinner |
| `label` | `string` | - | Button text |
| `icon` | `Component` | - | Icon component (left) |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
| `fullWidth` | `boolean` | `false` | Full width button |
| `rounded` | `boolean` | `false` | Fully rounded (pill shape) |

### Events
- `@click` - Emitted when button is clicked (not when disabled or loading)

### Slots
- `default` - Button content (alternative to `label` prop)
- `icon` - Left icon slot
- `iconRight` - Right icon slot

### Usage Examples

```vue
<!-- Basic usage -->
<BaseButton label="Click Me" />

<!-- With variant and size -->
<BaseButton
  variant="cta"
  size="lg"
  label="Get Started Now"
/>

<!-- With loading state -->
<BaseButton
  :loading="isSubmitting"
  label="Submit"
  @click="handleSubmit"
/>

<!-- With icon -->
<BaseButton variant="outline">
  <template #icon>
    <svg>...</svg>
  </template>
  Add to Cart
</BaseButton>

<!-- Full width -->
<BaseButton
  fullWidth
  variant="primary"
  label="Continue"
/>
```

### Variants Preview

- **Primary**: Orange background, white text - main CTAs
- **Secondary**: Gray background - secondary actions
- **Outline**: Transparent with orange border - subtle actions
- **Ghost**: Transparent, no border - minimal actions
- **CTA**: Gradient background, larger - hero CTAs

---

## BaseInput

Accessible input field with validation, icons, and multiple types.

### Import
```vue
import BaseInput from '@/components/base/BaseInput.vue'
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string \| number \| null` | `''` | v-model value |
| `type` | `'text' \| 'email' \| 'password' \| 'tel' \| 'number' \| 'url' \| 'search'` | `'text'` | Input type |
| `label` | `string` | - | Label text |
| `placeholder` | `string` | - | Placeholder text |
| `hint` | `string` | - | Helper text |
| `error` | `string` | - | Error message |
| `prefixIcon` | `Component` | - | Left icon |
| `suffixIcon` | `Component` | - | Right icon |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Input size |
| `disabled` | `boolean` | `false` | Disabled state |
| `required` | `boolean` | `false` | Required field |
| `autocomplete` | `string` | - | HTML autocomplete attribute |
| `maxlength` | `number` | - | Maximum character length |
| `minlength` | `number` | - | Minimum character length |

### Events
- `@update:modelValue` - Emitted when value changes
- `@focus` - Emitted when input is focused
- `@blur` - Emitted when input loses focus

### Slots
- `prefix` - Left icon/content
- `suffix` - Right icon/content

### Exposed Methods
- `focus()` - Focus the input
- `blur()` - Blur the input
- `inputRef` - Access to the input element

### Usage Examples

```vue
<!-- Basic usage -->
<BaseInput
  v-model="name"
  label="Full Name"
  placeholder="Enter your name"
/>

<!-- With validation -->
<BaseInput
  v-model="email"
  type="email"
  label="Email Address"
  :error="emailError"
  required
/>

<!-- Password input (auto show/hide toggle) -->
<BaseInput
  v-model="password"
  type="password"
  label="Password"
  hint="Minimum 8 characters"
/>

<!-- With icon -->
<BaseInput
  v-model="search"
  placeholder="Search..."
>
  <template #prefix>
    <SearchIcon class="w-5 h-5" />
  </template>
</BaseInput>

<!-- Number input -->
<BaseInput
  v-model="quantity"
  type="number"
  label="Quantity"
  :min="1"
  :max="99"
/>
```

---

## BaseCard

Versatile container with variants and slots for structured content.

### Import
```vue
import BaseCard from '@/components/base/BaseCard.vue'
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'solid' \| 'elevated' \| 'outline' \| 'ghost'` | `'elevated'` | Card style variant |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Internal padding |
| `title` | `string` | - | Card title |
| `subtitle` | `string` | - | Card subtitle |
| `as` | `string \| Component` | `'div'` | HTML element or component |

### Slots
- `default` - Main card content
- `header` - Header content (below title/subtitle)
- `actions` - Action buttons in header
- `footer` - Footer content

### Usage Examples

```vue
<!-- Basic card -->
<BaseCard>
  <p>Card content here</p>
</BaseCard>

<!-- With title and subtitle -->
<BaseCard
  title="Order #1234"
  subtitle="Placed on Jan 15, 2025"
>
  <div>Order details...</div>
</BaseCard>

<!-- With header actions -->
<BaseCard title="Settings">
  <template #actions>
    <button>Edit</button>
  </template>
  <div>Settings content...</div>
</BaseCard>

<!-- With footer -->
<BaseCard variant="outline">
  <p>Card content</p>
  <template #footer>
    <div class="flex justify-end gap-2">
      <BaseButton variant="ghost" label="Cancel" />
      <BaseButton label="Confirm" />
    </div>
  </template>
</BaseCard>

<!-- As clickable link -->
<BaseCard
  as="a"
  href="/products/123"
  variant="elevated"
>
  <h3>Product Name</h3>
  <p>Product description</p>
</BaseCard>
```

---

## BaseModal

Accessible modal dialog with overlay, focus trapping, and animations.

### Import
```vue
import BaseModal from '@/components/base/BaseModal.vue'
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | `false` | v-model for open/close state |
| `title` | `string` | - | Modal title |
| `subtitle` | `string` | - | Modal subtitle |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Modal width |
| `closable` | `boolean` | `true` | Show close button |
| `closeOnBackdrop` | `boolean` | `true` | Close when clicking overlay |
| `showHeader` | `boolean` | `true` | Show header section |

### Events
- `@update:modelValue` - Emitted when modal opens/closes
- `@open` - Emitted when modal opens
- `@close` - Emitted when modal closes

### Slots
- `default` - Modal content
- `header` - Custom header content
- `footer` - Footer content

### Exposed Methods
- `close()` - Programmatically close the modal

### Usage Examples

```vue
<script setup>
const isOpen = ref(false)

const openModal = () => {
  isOpen.value = true
}
</script>

<template>
  <!-- Trigger -->
  <BaseButton @click="openModal" label="Open Modal" />

  <!-- Modal -->
  <BaseModal
    v-model="isOpen"
    title="Confirm Action"
    subtitle="Are you sure you want to continue?"
  >
    <p>This action cannot be undone.</p>

    <template #footer>
      <div class="flex justify-end gap-3">
        <BaseButton
          variant="ghost"
          label="Cancel"
          @click="isOpen = false"
        />
        <BaseButton
          variant="primary"
          label="Confirm"
          @click="handleConfirm"
        />
      </div>
    </template>
  </BaseModal>
</template>
```

### Features
- **Focus Trapping**: Tab navigation stays within modal
- **ESC to Close**: Press ESC key to close
- **Body Scroll Lock**: Prevents background scrolling
- **Smooth Animations**: Fade and scale transitions
- **Teleport**: Renders at document body level

---

## BaseToast

Lightweight toast notification with auto-dismiss and variants.

### Import
```vue
import BaseToast from '@/components/base/BaseToast.vue'
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | `false` | v-model for visibility |
| `title` | `string` | - | Toast title |
| `message` | `string` | - | Toast message |
| `variant` | `'default' \| 'success' \| 'error' \| 'warning' \| 'info'` | `'default'` | Toast style variant |
| `duration` | `number` | `4500` | Auto-dismiss duration (ms), 0 = no auto-dismiss |
| `dismissible` | `boolean` | `true` | Show close button |
| `icon` | `Component` | - | Custom icon (auto-assigned by variant) |

### Events
- `@update:modelValue` - Emitted when toast shows/hides
- `@close` - Emitted when toast is closed

### Slots
- `default` - Toast message content
- `footer` - Additional footer content

### Usage Examples

```vue
<script setup>
const showSuccessToast = ref(false)

const handleSuccess = () => {
  showSuccessToast.value = true
}
</script>

<template>
  <!-- Toast container (fixed position) -->
  <div class="fixed top-4 right-4 z-50 space-y-3">
    <BaseToast
      v-model="showSuccessToast"
      variant="success"
      title="Success!"
      message="Your order has been placed successfully."
    />
  </div>

  <!-- Multiple toasts -->
  <div class="fixed bottom-4 left-4 z-50 space-y-3">
    <BaseToast
      v-model="showError"
      variant="error"
      title="Error"
      message="Something went wrong. Please try again."
      :duration="6000"
    />

    <BaseToast
      v-model="showWarning"
      variant="warning"
      title="Warning"
      message="Your session will expire in 5 minutes."
      :duration="0"
    />
  </div>
</template>
```

### Recommended Usage
Use with a toast manager composable or service for global toast notifications.

---

## BaseLoader

Multiple loading states: spinner, skeleton, progress bar, dots, pulse.

### Import
```vue
import BaseLoader from '@/components/base/BaseLoader.vue'
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'spinner' \| 'skeleton' \| 'progress' \| 'dots' \| 'pulse'` | `'spinner'` | Loader type |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Loader size |
| `color` | `'primary' \| 'secondary' \| 'success' \| 'error' \| 'warning' \| 'info'` | `'primary'` | Color variant |
| `label` | `string` | - | Loading label text |
| `progress` | `number` | `0` | Progress percentage (0-100) |
| `indeterminate` | `boolean` | `false` | Indeterminate progress bar |
| `overlay` | `boolean` | `false` | Show as overlay |
| `fullscreen` | `boolean` | `false` | Fullscreen overlay |

### Slots
- `default` - Custom skeleton content (skeleton variant only)

### Usage Examples

```vue
<!-- Spinner -->
<BaseLoader
  variant="spinner"
  size="lg"
  label="Loading..."
/>

<!-- Skeleton loader -->
<BaseLoader variant="skeleton">
  <div class="space-y-3">
    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
    <div class="h-32 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
  </div>
</BaseLoader>

<!-- Progress bar -->
<BaseLoader
  variant="progress"
  :progress="uploadProgress"
  label="Uploading..."
  color="success"
/>

<!-- Indeterminate progress -->
<BaseLoader
  variant="progress"
  indeterminate
  label="Processing..."
/>

<!-- Dots loader -->
<BaseLoader variant="dots" size="md" />

<!-- Pulse loader -->
<BaseLoader
  variant="pulse"
  color="primary"
  label="Syncing..."
/>

<!-- Fullscreen overlay -->
<BaseLoader
  v-if="isLoading"
  variant="spinner"
  fullscreen
  label="Please wait..."
/>
```

---

## BaseBadge

Notification and status badges with variants, sizes, and animations.

### Import
```vue
import BaseBadge from '@/components/base/BaseBadge.vue'
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string \| number` | - | Badge content |
| `icon` | `Component` | - | Icon component |
| `dot` | `boolean` | `false` | Show dot indicator |
| `variant` | `'default' \| 'primary' \| 'success' \| 'error' \| 'warning' \| 'info' \| 'outline'` | `'default'` | Badge style |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Badge size |
| `rounded` | `boolean` | `false` | Fully rounded |
| `pulse` | `boolean` | `false` | Pulse animation |
| `as` | `string` | `'span'` | HTML element |

### Slots
- `default` - Badge content

### Usage Examples

```vue
<!-- Simple badge -->
<BaseBadge label="New" variant="primary" />

<!-- Notification count -->
<div class="relative">
  <button>Notifications</button>
  <BaseBadge
    label="12"
    variant="error"
    rounded
    size="xs"
    class="absolute -top-1 -right-1"
  />
</div>

<!-- Status badges -->
<BaseBadge variant="success" label="Active" />
<BaseBadge variant="warning" label="Pending" />
<BaseBadge variant="error" label="Failed" />

<!-- With icon -->
<BaseBadge variant="info">
  <template #icon>
    <InfoIcon />
  </template>
  Info
</BaseBadge>

<!-- Live indicator -->
<BaseBadge
  variant="error"
  label="LIVE"
  pulse
  rounded
/>

<!-- Dot indicator -->
<BaseBadge variant="success" dot rounded size="xs" />
```

---

## BaseChip

Interactive chips for filters, tags, and selections with removal support.

### Import
```vue
import BaseChip from '@/components/base/BaseChip.vue'
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Chip text |
| `icon` | `Component` | - | Left icon |
| `avatar` | `string` | - | Avatar image URL |
| `selected` | `boolean` | `false` | Selected state |
| `disabled` | `boolean` | `false` | Disabled state |
| `removable` | `boolean` | `false` | Show remove button |
| `variant` | `'default' \| 'primary' \| 'success' \| 'error' \| 'warning' \| 'info' \| 'outline'` | `'default'` | Chip style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Chip size |

### Events
- `@click` - Emitted when chip is clicked
- `@remove` - Emitted when remove button is clicked

### Usage Examples

```vue
<!-- Basic chip -->
<BaseChip label="Pizza" />

<!-- Selectable chips (filter example) -->
<div class="flex flex-wrap gap-2">
  <BaseChip
    v-for="category in categories"
    :key="category.id"
    :label="category.name"
    :selected="selectedCategory === category.id"
    variant="primary"
    @click="selectedCategory = category.id"
  />
</div>

<!-- Removable chips (tags example) -->
<div class="flex flex-wrap gap-2">
  <BaseChip
    v-for="tag in tags"
    :key="tag"
    :label="tag"
    removable
    variant="primary"
    @remove="removeTag(tag)"
  />
</div>

<!-- With icon -->
<BaseChip variant="success">
  <template #icon>
    <CheckIcon />
  </template>
  Verified
</BaseChip>

<!-- With avatar -->
<BaseChip
  label="John Doe"
  avatar="/avatars/john.jpg"
  removable
  @remove="removeUser"
/>

<!-- Sizes -->
<BaseChip size="sm" label="Small" />
<BaseChip size="md" label="Medium" />
<BaseChip size="lg" label="Large" />
```

---

## Design System

All base components follow these design principles:

### Colors
- **Primary**: `#FF6B00` (orange) - Main brand color
- **Success**: `#3BB273` - Positive actions
- **Error**: `#E94E3A` - Errors and destructive actions
- **Warning**: `#FFC107` - Warnings
- **Info**: `#1E88E5` - Informational

### Spacing
- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `xxl`: 48px

### Border Radius
- `sm`: 6px
- `md`: 12px
- `lg`: 16px
- `xl`: 24px
- `full`: 9999px (rounded-full)

### Typography
- **Font**: Poppins (brand), Inter (body)
- **Weights**: 400 (regular), 600 (semibold), 700 (bold)
- **Scale**: 12px → 64px

### Shadows
- Level 1: Subtle elevation
- Level 2: Cards and dropdowns
- Level 3: Modals and popovers
- Level 4: Maximum elevation

---

## Testing

### View Component Showcase
Navigate to `/showcase` to see all components in action:

```bash
npm run dev
# Open http://localhost:3002/showcase
```

### Dark Mode Testing
All components automatically support dark mode via Tailwind's `dark:` prefix. Toggle theme with the button in the showcase.

### Accessibility Testing
All components follow WCAG 2.1 AA standards:
- Keyboard navigation
- Screen reader support
- Focus indicators
- ARIA attributes
- Touch target sizes (min 48px)

### Manual Testing Checklist
- [ ] Light mode renders correctly
- [ ] Dark mode renders correctly
- [ ] All sizes work properly
- [ ] All variants display correctly
- [ ] Disabled states work
- [ ] Loading states work
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Touch interactions work on mobile
- [ ] Animations are smooth

---

## Best Practices

### 1. Use Semantic Variants
```vue
<!-- Good -->
<BaseButton variant="error" label="Delete" @click="deleteItem" />

<!-- Avoid -->
<BaseButton variant="primary" label="Delete" class="!bg-red-500" />
```

### 2. Provide Accessible Labels
```vue
<!-- Good -->
<BaseInput label="Email Address" type="email" />

<!-- Avoid -->
<BaseInput type="email" />
```

### 3. Handle Loading States
```vue
<!-- Good -->
<BaseButton
  :loading="isSubmitting"
  :disabled="!isValid"
  label="Submit"
  @click="handleSubmit"
/>
```

### 4. Use Proper Error Messaging
```vue
<!-- Good -->
<BaseInput
  v-model="email"
  label="Email"
  :error="emailError"
/>

<!-- In script -->
const emailError = computed(() => {
  if (!email.value) return 'Email is required'
  if (!isValidEmail(email.value)) return 'Please enter a valid email'
  return ''
})
```

### 5. Compose Components
```vue
<!-- Build complex UIs from base components -->
<BaseCard>
  <template #header>
    <div class="flex items-center gap-3">
      <BaseBadge variant="success" label="Active" />
      <h3>Product Name</h3>
    </div>
  </template>

  <p>Product description...</p>

  <template #footer>
    <div class="flex justify-between">
      <span class="text-2xl font-bold">$29.99</span>
      <BaseButton label="Add to Cart" />
    </div>
  </template>
</BaseCard>
```

---

## Next Steps

1. **Explore**: Visit `/showcase` to interact with all components
2. **Build**: Start using base components in your screens
3. **Extend**: Create domain-specific components using base components
4. **Test**: Ensure accessibility and dark mode support
5. **Document**: Add Storybook stories for your custom components

---

**Version**: 1.0
**Last Updated**: 2025-11-05
**Components**: 8 base components
**Status**: Production Ready ✅
