/**
 * Service Worker for Garbaking Customer App
 * Provides offline capabilities, caching, and background sync for orders
 */
/* eslint-env serviceworker */

const CACHE_NAME = 'garbaking-customer-v1.0.0'
const DYNAMIC_CACHE = 'garbaking-dynamic-v1.0.0'

// Files to cache for offline use
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add your main assets here - in a real app these would be the built files
  '/assets/index.css',
  '/assets/index.js',
  // Fallback pages
  '/offline.html'
]

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/menu\//,
  /\/local\/menu/,
  /\/api\/categories/
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('[SW] Service worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - handle all network requests
self.addEventListener('fetch', (event) => {
  const { request } = event
  const { url, method } = request

  // Skip non-GET requests for caching
  if (method !== 'GET') {
    // Handle POST requests for offline queue
    if (method === 'POST' && url.includes('/api/orders')) {
      event.respondWith(handleOrderCreation(request))
    }
    return
  }

  // Handle different types of requests
  if (url.includes('/api/') || url.includes('/local/')) {
    // API requests - cache with network first strategy
    event.respondWith(handleApiRequest(request))
  } else if (url.includes('/assets/') || url.includes('.js') || url.includes('.css')) {
    // Static assets - cache first strategy
    event.respondWith(handleStaticAssets(request))
  } else {
    // HTML pages - network first with fallback
    event.respondWith(handlePageRequest(request))
  }
})

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = request.url

  try {
    // Try network first
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      // Cache successful responses for menu/category data
      if (API_CACHE_PATTERNS.some(pattern => pattern.test(url))) {
        const cache = await caches.open(DYNAMIC_CACHE)
        cache.put(request, networkResponse.clone())
      }
      return networkResponse
    }

    throw new Error('Network response not ok')
  } catch (error) {
    console.log('[SW] Network failed for API request, trying cache:', url)

    // Fallback to cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline response for specific endpoints
    if (url.includes('/api/menu') || url.includes('/local/menu')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Menu unavailable offline',
        offline: true
      }), {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      })
    }

    throw error
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAssets(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.error('[SW] Failed to fetch static asset:', request.url)
    throw error
  }
}

// Handle page requests with network-first strategy
async function handlePageRequest(request) {
  try {
    return await fetch(request)
  } catch (error) {
    console.log('[SW] Network failed for page request, trying cache')

    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline page as fallback
    const offlinePage = await caches.match('/offline.html')
    if (offlinePage) {
      return offlinePage
    }

    // Last resort: return index.html for SPA routing
    return await caches.match('/')
  }
}

// Handle order creation for offline queue
async function handleOrderCreation(request) {
  try {
    // Try to submit order immediately
    const response = await fetch(request.clone())
    if (response.ok) {
      return response
    }
    throw new Error('Network request failed')
  } catch (error) {
    console.log('[SW] Order submission failed, queuing for later')

    // Queue order for background sync
    const orderData = await request.json()
    await queueOrderForSync(orderData)

    // Return success response to prevent app error
    return new Response(JSON.stringify({
      success: true,
      offline: true,
      message: 'Order queued for submission when online',
      data: {
        order: {
          orderNumber: `OFFLINE-${Date.now()}`,
          status: 'PENDING',
          ...orderData
        }
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Queue order for background sync
async function queueOrderForSync(orderData) {
  try {
    // Store in IndexedDB for persistence
    const dbRequest = indexedDB.open('garbaking-offline', 1)

    dbRequest.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('orders')) {
        const store = db.createObjectStore('orders', { keyPath: 'id', autoIncrement: true })
        store.createIndex('timestamp', 'timestamp', { unique: false })
        store.createIndex('synced', 'synced', { unique: false })
      }
    }

    dbRequest.onsuccess = (event) => {
      const db = event.target.result
      const transaction = db.transaction(['orders'], 'readwrite')
      const store = transaction.objectStore('orders')

      store.add({
        ...orderData,
        timestamp: Date.now(),
        synced: false,
        retryCount: 0
      })

      transaction.oncomplete = () => {
        console.log('[SW] Order queued successfully')

        // Register background sync if supported
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
          self.registration.sync.register('background-sync-orders')
        }
      }
    }
  } catch (error) {
    console.error('[SW] Failed to queue order:', error)
  }
}

// Background sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-orders') {
    console.log('[SW] Background sync triggered for orders')
    event.waitUntil(syncPendingOrders())
  }
})

// Sync pending orders when back online
async function syncPendingOrders() {
  try {
    const dbRequest = indexedDB.open('garbaking-offline', 1)

    dbRequest.onsuccess = async (event) => {
      const db = event.target.result
      const transaction = db.transaction(['orders'], 'readwrite')
      const store = transaction.objectStore('orders')
      const index = store.index('synced')
      const request = index.getAll(false) // Get unsynced orders

      request.onsuccess = async () => {
        const pendingOrders = request.result
        console.log(`[SW] Found ${pendingOrders.length} pending orders to sync`)

        for (const orderRecord of pendingOrders) {
          try {
            const response = await fetch('/api/orders', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(orderRecord)
            })

            if (response.ok) {
              // Mark as synced
              orderRecord.synced = true
              orderRecord.syncedAt = Date.now()
              store.put(orderRecord)

              console.log('[SW] Order synced successfully:', orderRecord.id)

              // Notify the app about successful sync
              self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                  client.postMessage({
                    type: 'ORDER_SYNCED',
                    orderId: orderRecord.id,
                    serverResponse: response
                  })
                })
              })
            } else {
              // Increment retry count
              orderRecord.retryCount = (orderRecord.retryCount || 0) + 1

              if (orderRecord.retryCount >= 3) {
                console.error('[SW] Order sync failed after 3 retries:', orderRecord.id)
                orderRecord.syncFailed = true
              }

              store.put(orderRecord)
            }
          } catch (error) {
            console.error('[SW] Error syncing order:', error)
            orderRecord.retryCount = (orderRecord.retryCount || 0) + 1
            store.put(orderRecord)
          }
        }
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error)
  }
}

// Handle messages from the main app
self.addEventListener('message', (event) => {
  const { type, data } = event.data

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break

    case 'CLAIM_CLIENTS':
      self.clients.claim()
      break

    case 'CACHE_MENU_DATA':
      cacheMenuData(data)
      break

    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage(status)
      })
      break

    default:
      console.log('[SW] Unknown message type:', type)
  }
})

// Cache menu data manually
async function cacheMenuData(menuData) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE)

    // Cache menu endpoint response
    await cache.put('/local/menu', new Response(JSON.stringify({
      success: true,
      data: menuData
    }), {
      headers: { 'Content-Type': 'application/json' }
    }))

    console.log('[SW] Menu data cached manually')
  } catch (error) {
    console.error('[SW] Failed to cache menu data:', error)
  }
}

// Get cache status
async function getCacheStatus() {
  try {
    const cacheNames = await caches.keys()
    const status = {
      caches: cacheNames,
      staticCacheExists: cacheNames.includes(CACHE_NAME),
      dynamicCacheExists: cacheNames.includes(DYNAMIC_CACHE)
    }

    // Check specific cached items
    if (status.dynamicCacheExists) {
      const cache = await caches.open(DYNAMIC_CACHE)
      const cachedRequests = await cache.keys()
      status.cachedItems = cachedRequests.map(req => req.url)
    }

    return status
  } catch (error) {
    console.error('[SW] Failed to get cache status:', error)
    return { error: error.message }
  }
}

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const { action, data } = event.notification

  switch (action) {
    case 'view_order':
      // Open order status page
      clients.openWindow(`/order-status/${data.orderNumber}`)
      break

    case 'view_menu':
      // Open menu page
      clients.openWindow('/menu')
      break

    default:
      // Default action - open app
      clients.openWindow('/')
  }
})

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return

  try {
    const data = event.data.json()
    const { title, body, icon, badge, actions, data: notificationData } = data

    const options = {
      body,
      icon: icon || '/icons/icon-192x192.png',
      badge: badge || '/icons/badge-72x72.png',
      actions: actions || [
        {
          action: 'view_order',
          title: 'Voir la commande'
        }
      ],
      data: notificationData,
      requireInteraction: true,
      vibrate: [200, 100, 200]
    }

    event.waitUntil(
      self.registration.showNotification(title, options)
    )
  } catch (error) {
    console.error('[SW] Failed to show notification:', error)
  }
})

console.log('[SW] Service worker script loaded')
