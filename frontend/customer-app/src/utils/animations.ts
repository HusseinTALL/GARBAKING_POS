// utils/animations.ts
// Reusable animation utilities for consistent micro-interactions

/**
 * Standard easing functions for smooth animations
 */
export const easings = {
  // Material Design easings
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
  sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
  
  // Custom easings
  smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
}

/**
 * Standard duration values (in ms)
 */
export const durations = {
  fastest: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  slowest: 800
}

/**
 * Animation delay utilities
 */
export const delays = {
  none: 0,
  short: 50,
  medium: 100,
  long: 200
}

/**
 * Stagger animation delays for lists
 * @param index - Item index in list
 * @param delay - Base delay in ms
 */
export const staggerDelay = (index: number, delay: number = 50): string => {
  return `${index * delay}ms`
}

/**
 * Generate CSS transition string
 * @param property - CSS property to transition
 * @param duration - Duration key or custom ms value
 * @param easing - Easing function key or custom bezier
 */
export const transition = (
  property: string = 'all',
  duration: keyof typeof durations | number = 'normal',
  easing: keyof typeof easings | string = 'standard'
): string => {
  const durationValue = typeof duration === 'number' 
    ? `${duration}ms` 
    : `${durations[duration]}ms`
  
  const easingValue = typeof easing === 'string' && easing in easings
    ? easings[easing as keyof typeof easings]
    : easing

  return `${property} ${durationValue} ${easingValue}`
}

/**
 * Create a spring animation (for Vue transitions)
 */
export const springTransition = {
  duration: 300,
  easing: easings.elastic
}

/**
 * Fade animation classes (for Vue <Transition>)
 */
export const fadeAnimation = {
  enterActiveClass: 'transition-opacity duration-300',
  leaveActiveClass: 'transition-opacity duration-200',
  enterFromClass: 'opacity-0',
  leaveToClass: 'opacity-0'
}

/**
 * Slide up animation classes
 */
export const slideUpAnimation = {
  enterActiveClass: 'transition-all duration-300 ease-out',
  leaveActiveClass: 'transition-all duration-200 ease-in',
  enterFromClass: 'opacity-0 translate-y-4',
  leaveToClass: 'opacity-0 translate-y-4'
}

/**
 * Scale animation classes
 */
export const scaleAnimation = {
  enterActiveClass: 'transition-all duration-300 ease-out',
  leaveActiveClass: 'transition-all duration-200 ease-in',
  enterFromClass: 'opacity-0 scale-95',
  leaveToClass: 'opacity-0 scale-95'
}

/**
 * Slide right animation classes
 */
export const slideRightAnimation = {
  enterActiveClass: 'transition-all duration-300 ease-out',
  leaveActiveClass: 'transition-all duration-200 ease-in',
  enterFromClass: 'opacity-0 -translate-x-4',
  leaveToClass: 'opacity-0 translate-x-4'
}

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Conditionally apply animation based on user preference
 * @param animation - Animation to apply
 * @param fallback - Fallback for reduced motion (defaults to instant)
 */
export const respectMotionPreference = <T>(
  animation: T,
  fallback: T | null = null
): T | null => {
  return prefersReducedMotion() ? fallback : animation
}

/**
 * Composable for Vue components
 */
export const useAnimation = () => {
  const shouldAnimate = !prefersReducedMotion()

  return {
    shouldAnimate,
    easings,
    durations,
    delays,
    transition,
    staggerDelay,
    animations: {
      fade: fadeAnimation,
      slideUp: slideUpAnimation,
      scale: scaleAnimation,
      slideRight: slideRightAnimation,
      spring: springTransition
    }
  }
}

/**
 * Intersection Observer hook for scroll animations
 */
export const useScrollAnimation = (
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
) => {
  const defaultOptions: IntersectionObserverInit = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px',
    ...options
  }

  if (typeof window === 'undefined' || prefersReducedMotion()) {
    return { observe: () => {}, unobserve: () => {} }
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(callback)
  }, defaultOptions)

  return {
    observe: (element: Element) => observer.observe(element),
    unobserve: (element: Element) => observer.unobserve(element),
    disconnect: () => observer.disconnect()
  }
}

/**
 * CSS keyframe animations
 */
export const keyframes = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  slideIn: `
    @keyframes slideIn {
      from { 
        opacity: 0;
        transform: translateY(20px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  bounce: `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `,
  pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `,
  shimmer: `
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `,
  float: `
    @keyframes float {
      0%, 100% { transform: translateY(0) translateX(0); }
      50% { transform: translateY(-20px) translateX(10px); }
    }
  `
}

/**
 * Example usage in Vue component:
 * 
 * <script setup>
 * import { useAnimation } from '@/utils/animations'
 * 
 * const { shouldAnimate, animations, durations } = useAnimation()
 * </script>
 * 
 * <template>
 *   <Transition v-bind="animations.fade">
 *     <div v-if="show">Content</div>
 *   </Transition>
 * </template>
 */

export default {
  easings,
  durations,
  delays,
  transition,
  staggerDelay,
  fadeAnimation,
  slideUpAnimation,
  scaleAnimation,
  slideRightAnimation,
  springTransition,
  useAnimation,
  useScrollAnimation,
  prefersReducedMotion,
  respectMotionPreference,
  keyframes
}