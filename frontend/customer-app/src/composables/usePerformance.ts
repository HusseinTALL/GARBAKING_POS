/**
 * Performance Composable
 * Provides utilities for optimizing performance: debounce, throttle, lazy loading, intersection observer
 */

import { ref, onMounted, onUnmounted, Ref } from 'vue'

/**
 * Debounce function
 * Delays execution until after a period of inactivity
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>

  return function debounced(...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Throttle function
 * Limits execution to once per specified period
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Intersection Observer for lazy loading
 * Detects when an element enters the viewport
 */
export function useIntersectionObserver(
  targetRef: Ref<HTMLElement | null>,
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) {
  let observer: IntersectionObserver | null = null

  function observe() {
    if (!targetRef.value) return

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry)
        }
      })
    }, options)

    observer.observe(targetRef.value)
  }

  function unobserve() {
    if (observer && targetRef.value) {
      observer.unobserve(targetRef.value)
      observer = null
    }
  }

  onMounted(() => {
    observe()
  })

  onUnmounted(() => {
    unobserve()
  })

  return {
    observe,
    unobserve
  }
}

/**
 * Lazy image loading
 * Loads images only when they enter the viewport
 */
export function useLazyImage(imageRef: Ref<HTMLImageElement | null>) {
  const isLoaded = ref(false)
  const hasError = ref(false)

  useIntersectionObserver(
    imageRef as Ref<HTMLElement | null>,
    () => {
      if (!imageRef.value || isLoaded.value) return

      const img = imageRef.value
      const src = img.dataset.src

      if (src) {
        img.src = src
        img.onload = () => {
          isLoaded.value = true
          img.classList.add('loaded')
        }
        img.onerror = () => {
          hasError.value = true
          img.classList.add('error')
        }
      }
    },
    {
      rootMargin: '50px'
    }
  )

  return {
    isLoaded,
    hasError
  }
}

/**
 * Infinite scroll
 * Triggers callback when scrolling near the bottom
 */
export function useInfiniteScroll(
  callback: () => void,
  options: {
    distance?: number
    throttleDelay?: number
  } = {}
) {
  const { distance = 200, throttleDelay = 200 } = options
  const isLoading = ref(false)

  const handleScroll = throttle(() => {
    if (isLoading.value) return

    const scrollHeight = document.documentElement.scrollHeight
    const scrollTop = document.documentElement.scrollTop
    const clientHeight = document.documentElement.clientHeight

    if (scrollTop + clientHeight >= scrollHeight - distance) {
      callback()
    }
  }, throttleDelay)

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return {
    isLoading
  }
}

/**
 * Network status
 * Monitors online/offline status
 */
export function useNetworkStatus() {
  const isOnline = ref(navigator.onLine)

  function updateOnlineStatus() {
    isOnline.value = navigator.onLine
  }

  onMounted(() => {
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
  })

  onUnmounted(() => {
    window.removeEventListener('online', updateOnlineStatus)
    window.removeEventListener('offline', updateOnlineStatus)
  })

  return {
    isOnline
  }
}

/**
 * Memory usage monitor (if available)
 * Monitors browser memory usage
 */
export function useMemoryMonitor() {
  const memoryInfo = ref<any>(null)

  function checkMemory() {
    // @ts-ignore - performance.memory is non-standard
    if (performance.memory) {
      // @ts-ignore
      memoryInfo.value = {
        // @ts-ignore
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        // @ts-ignore
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        // @ts-ignore
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      }
    }
  }

  onMounted(() => {
    checkMemory()
    const interval = setInterval(checkMemory, 5000)

    return () => {
      clearInterval(interval)
    }
  })

  return {
    memoryInfo
  }
}

/**
 * Page visibility
 * Detects when page is visible or hidden
 */
export function usePageVisibility() {
  const isVisible = ref(!document.hidden)

  function handleVisibilityChange() {
    isVisible.value = !document.hidden
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  return {
    isVisible
  }
}

/**
 * Idle detection
 * Detects when user is idle
 */
export function useIdleDetection(idleTime: number = 60000) {
  const isIdle = ref(false)
  let idleTimer: ReturnType<typeof setTimeout>

  function resetIdleTimer() {
    isIdle.value = false
    clearTimeout(idleTimer)
    idleTimer = setTimeout(() => {
      isIdle.value = true
    }, idleTime)
  }

  onMounted(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']

    events.forEach((event) => {
      document.addEventListener(event, resetIdleTimer, { passive: true })
    })

    resetIdleTimer()
  })

  onUnmounted(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']

    events.forEach((event) => {
      document.removeEventListener(event, resetIdleTimer)
    })

    clearTimeout(idleTimer)
  })

  return {
    isIdle
  }
}

/**
 * Request idle callback wrapper
 * Schedules work during browser idle periods
 */
export function useIdleCallback(
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
) {
  let handle: number

  onMounted(() => {
    if ('requestIdleCallback' in window) {
      handle = requestIdleCallback(callback, options)
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      handle = setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 50 } as any), 1) as any
    }
  })

  onUnmounted(() => {
    if ('cancelIdleCallback' in window) {
      cancelIdleCallback(handle)
    } else {
      clearTimeout(handle)
    }
  })
}

/**
 * Preload images
 * Preloads images in the background
 */
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map((url) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = reject
        img.src = url
      })
    })
  )
}

/**
 * Prefetch data
 * Prefetches data for a route
 */
export function prefetchRoute(routeName: string) {
  // This would integrate with your router's lazy loading
  // For now, it's a placeholder
  console.log(`Prefetching route: ${routeName}`)
}
