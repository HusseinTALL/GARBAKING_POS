/**
 * Accessibility Composable
 * Provides utilities for managing focus, keyboard navigation, and screen reader announcements
 */

import { ref, onMounted, onUnmounted, Ref } from 'vue'

/**
 * Focus trap - keeps focus within a specific element
 * Useful for modals and dropdowns
 */
export function useFocusTrap(containerRef: Ref<HTMLElement | null>) {
  const firstFocusableElement = ref<HTMLElement | null>(null)
  const lastFocusableElement = ref<HTMLElement | null>(null)

  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ')

  function updateFocusableElements() {
    if (!containerRef.value) return

    const focusableElements = Array.from(
      containerRef.value.querySelectorAll(focusableSelectors)
    ) as HTMLElement[]

    if (focusableElements.length > 0) {
      firstFocusableElement.value = focusableElements[0]
      lastFocusableElement.value = focusableElements[focusableElements.length - 1]
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab') return

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusableElement.value) {
        event.preventDefault()
        lastFocusableElement.value?.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusableElement.value) {
        event.preventDefault()
        firstFocusableElement.value?.focus()
      }
    }
  }

  function activate() {
    updateFocusableElements()
    firstFocusableElement.value?.focus()
    document.addEventListener('keydown', handleKeydown)
  }

  function deactivate() {
    document.removeEventListener('keydown', handleKeydown)
  }

  return {
    activate,
    deactivate,
    updateFocusableElements
  }
}

/**
 * Escape key handler
 * Commonly used to close modals and overlays
 */
export function useEscapeKey(callback: () => void) {
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      callback()
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })

  return {
    handleKeydown
  }
}

/**
 * Screen reader announcements
 * Announces dynamic content changes to screen readers
 */
export function useScreenReader() {
  const ariaLiveRegion = ref<HTMLElement | null>(null)

  function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (!ariaLiveRegion.value) {
      // Create aria-live region if it doesn't exist
      ariaLiveRegion.value = document.createElement('div')
      ariaLiveRegion.value.setAttribute('role', 'status')
      ariaLiveRegion.value.setAttribute('aria-live', priority)
      ariaLiveRegion.value.setAttribute('aria-atomic', 'true')
      ariaLiveRegion.value.className = 'sr-only'
      document.body.appendChild(ariaLiveRegion.value)
    }

    // Update aria-live priority
    ariaLiveRegion.value.setAttribute('aria-live', priority)

    // Clear previous message
    ariaLiveRegion.value.textContent = ''

    // Announce new message after a brief delay to ensure screen readers detect the change
    setTimeout(() => {
      if (ariaLiveRegion.value) {
        ariaLiveRegion.value.textContent = message
      }
    }, 100)
  }

  onUnmounted(() => {
    if (ariaLiveRegion.value && ariaLiveRegion.value.parentNode) {
      ariaLiveRegion.value.parentNode.removeChild(ariaLiveRegion.value)
    }
  })

  return {
    announce
  }
}

/**
 * Skip to main content
 * Helps keyboard users skip repetitive navigation
 */
export function useSkipToContent() {
  function skipToMain() {
    const main = document.querySelector('main')
    if (main) {
      main.setAttribute('tabindex', '-1')
      main.focus()
      main.addEventListener('blur', () => {
        main.removeAttribute('tabindex')
      }, { once: true })
    }
  }

  return {
    skipToMain
  }
}

/**
 * Keyboard navigation for lists
 * Implements arrow key navigation for list items
 */
export function useListKeyboard(
  containerRef: Ref<HTMLElement | null>,
  itemSelector: string,
  onSelect?: (index: number) => void
) {
  const currentIndex = ref(0)

  function handleKeydown(event: KeyboardEvent) {
    if (!containerRef.value) return

    const items = Array.from(
      containerRef.value.querySelectorAll(itemSelector)
    ) as HTMLElement[]

    if (items.length === 0) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        currentIndex.value = (currentIndex.value + 1) % items.length
        items[currentIndex.value]?.focus()
        break

      case 'ArrowUp':
        event.preventDefault()
        currentIndex.value = currentIndex.value === 0 ? items.length - 1 : currentIndex.value - 1
        items[currentIndex.value]?.focus()
        break

      case 'Home':
        event.preventDefault()
        currentIndex.value = 0
        items[0]?.focus()
        break

      case 'End':
        event.preventDefault()
        currentIndex.value = items.length - 1
        items[items.length - 1]?.focus()
        break

      case 'Enter':
      case ' ':
        event.preventDefault()
        if (onSelect) {
          onSelect(currentIndex.value)
        }
        break
    }
  }

  onMounted(() => {
    if (containerRef.value) {
      containerRef.value.addEventListener('keydown', handleKeydown)
    }
  })

  onUnmounted(() => {
    if (containerRef.value) {
      containerRef.value.removeEventListener('keydown', handleKeydown)
    }
  })

  return {
    currentIndex,
    handleKeydown
  }
}

/**
 * Reduced motion detection
 * Respects user's preference for reduced motion
 */
export function useReducedMotion() {
  const prefersReducedMotion = ref(false)

  function checkReducedMotion() {
    prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  onMounted(() => {
    checkReducedMotion()

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.addEventListener('change', checkReducedMotion)

    return () => {
      mediaQuery.removeEventListener('change', checkReducedMotion)
    }
  })

  return {
    prefersReducedMotion
  }
}

/**
 * Focus visible utility
 * Shows focus indicators only when using keyboard
 */
export function useFocusVisible() {
  const isUsingKeyboard = ref(false)

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      isUsingKeyboard.value = true
    }
  }

  function handleMouseDown() {
    isUsingKeyboard.value = false
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('mousedown', handleMouseDown)
  })

  return {
    isUsingKeyboard
  }
}
