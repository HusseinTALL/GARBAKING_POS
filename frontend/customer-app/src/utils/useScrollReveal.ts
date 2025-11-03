// composables/useScrollReveal.ts
import { onMounted, onUnmounted, ref, Ref } from 'vue'

interface ScrollRevealOptions {
  threshold?: number
  rootMargin?: string
  delay?: number
  once?: boolean
  disabled?: boolean
}

/**
 * Composable for revealing elements on scroll
 * Perfect for animating menu items as they come into view
 */
export const useScrollReveal = (options: ScrollRevealOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    delay = 0,
    once = true,
    disabled = false
  } = options

  const elementRef: Ref<HTMLElement | null> = ref(null)
  const isVisible = ref(false)
  let observer: IntersectionObserver | null = null

  const setupObserver = () => {
    if (disabled || typeof window === 'undefined') return

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      isVisible.value = true
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              isVisible.value = true
            }, delay)

            if (once && observer && elementRef.value) {
              observer.unobserve(elementRef.value)
            }
          } else if (!once) {
            isVisible.value = false
          }
        })
      },
      { threshold, rootMargin }
    )

    if (elementRef.value) {
      observer.observe(elementRef.value)
    }
  }

  onMounted(() => {
    setupObserver()
  })

  onUnmounted(() => {
    if (observer && elementRef.value) {
      observer.unobserve(elementRef.value)
      observer.disconnect()
    }
  })

  return {
    elementRef,
    isVisible
  }
}

/**
 * Composable for staggered list animations
 * Perfect for animating multiple menu items with delays
 */
export const useStaggeredReveal = (
  itemCount: number,
  staggerDelay: number = 50,
  options: ScrollRevealOptions = {}
) => {
  const { threshold = 0.1, rootMargin = '0px 0px -50px 0px', once = true } = options

  const containerRef: Ref<HTMLElement | null> = ref(null)
  const visibleItems = ref<Set<number>>(new Set())
  let observer: IntersectionObserver | null = null

  const isItemVisible = (index: number): boolean => {
    return visibleItems.value.has(index)
  }

  const getItemDelay = (index: number): number => {
    return index * staggerDelay
  }

  const setupObserver = () => {
    if (typeof window === 'undefined') return

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      // Show all items immediately
      for (let i = 0; i < itemCount; i++) {
        visibleItems.value.add(i)
      }
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0')
            
            setTimeout(() => {
              visibleItems.value.add(index)
            }, getItemDelay(index))

            if (once) {
              observer?.unobserve(entry.target)
            }
          } else if (!once) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0')
            visibleItems.value.delete(index)
          }
        })
      },
      { threshold, rootMargin }
    )

    if (containerRef.value) {
      const items = containerRef.value.querySelectorAll('[data-index]')
      items.forEach((item) => observer?.observe(item))
    }
  }

  onMounted(() => {
    setupObserver()
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return {
    containerRef,
    isItemVisible,
    getItemDelay
  }
}

/**
 * Usage example in Home.vue (Menu Grid):
 * 
 * <script setup>
 * import { useStaggeredReveal } from '@/composables/useScrollReveal'
 * 
 * const filteredMenuItems = ref([...]) // your menu items
 * 
 * const { containerRef, isItemVisible } = useStaggeredReveal(
 *   filteredMenuItems.value.length,
 *   50 // 50ms delay between items
 * )
 * </script>
 * 
 * <template>
 *   <div ref="containerRef" class="grid grid-cols-2 gap-4">
 *     <MenuItemCard
 *       v-for="(item, index) in filteredMenuItems"
 *       :key="item.sku"
 *       :item="item"
 *       :data-index="index"
 *       :class="[
 *         'transition-all duration-500 ease-out',
 *         isItemVisible(index)
 *           ? 'opacity-100 translate-y-0'
 *           : 'opacity-0 translate-y-8'
 *       ]"
 *       @add-to-cart="addToCart"
 *       @view-detail="showProductDetail"
 *     />
 *   </div>
 * </template>
 */

/**
 * Alternative: Simpler single-element reveal
 * 
 * <script setup>
 * import { useScrollReveal } from '@/composables/useScrollReveal'
 * 
 * const { elementRef, isVisible } = useScrollReveal({
 *   threshold: 0.2,
 *   delay: 100
 * })
 * </script>
 * 
 * <template>
 *   <div
 *     ref="elementRef"
 *     :class="[
 *       'transition-all duration-700 ease-out',
 *       isVisible
 *         ? 'opacity-100 translate-y-0'
 *         : 'opacity-0 translate-y-12'
 *     ]"
 *   >
 *     <PromoBanner />
 *   </div>
 * </template>
 */

/**
 * Pre-built animation classes for common patterns
 */
export const scrollAnimationClasses = {
  fadeIn: {
    base: 'transition-opacity duration-700 ease-out',
    hidden: 'opacity-0',
    visible: 'opacity-100'
  },
  slideUp: {
    base: 'transition-all duration-700 ease-out',
    hidden: 'opacity-0 translate-y-8',
    visible: 'opacity-100 translate-y-0'
  },
  slideRight: {
    base: 'transition-all duration-700 ease-out',
    hidden: 'opacity-0 -translate-x-8',
    visible: 'opacity-100 translate-x-0'
  },
  slideLeft: {
    base: 'transition-all duration-700 ease-out',
    hidden: 'opacity-0 translate-x-8',
    visible: 'opacity-100 translate-x-0'
  },
  scale: {
    base: 'transition-all duration-700 ease-out',
    hidden: 'opacity-0 scale-95',
    visible: 'opacity-100 scale-100'
  },
  blur: {
    base: 'transition-all duration-700 ease-out',
    hidden: 'opacity-0 blur-sm',
    visible: 'opacity-100 blur-0'
  }
}

/**
 * Helper to get animation classes
 */
export const getScrollAnimationClasses = (
  isVisible: boolean,
  animation: keyof typeof scrollAnimationClasses = 'slideUp'
) => {
  const classes = scrollAnimationClasses[animation]
  return [
    classes.base,
    isVisible ? classes.visible : classes.hidden
  ].join(' ')
}