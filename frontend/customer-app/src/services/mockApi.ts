/**
 * Mock API service for offline-first customer ordering system
 * Simulates backend responses with realistic delays and local storage
 */

import { v4 as uuidv4 } from 'uuid'
import localForage from 'localforage'

export interface MenuItem {
  sku: string
  category: 'Mains' | 'Drinks' | 'Desserts' | 'Appetizers'
  name: string
  price: number
  description: string
  image: string
  tags: string[]
}

export interface OrderItem {
  sku: string
  name: string
  qty: number
  price: number
}

export interface Order {
  clientOrderId: string
  localOrderId?: string
  storeId: string
  createdAt: string
  customer: {
    name: string
    type: 'onsite'
  }
  items: OrderItem[]
  total: number
  idempotencyKey: string
  payment: {
    method: 'cash'
    status: 'pending' | 'paid'
  }
  status: 'queued' | 'accepted' | 'preparing' | 'ready' | 'synced'
  synced: boolean
}

// Mock menu data
const MOCK_MENU: MenuItem[] = [
  {
    sku: "ATT001",
    category: "Mains",
    name: "Attiéké + Thon",
    price: 3500,
    description: "Grilled tuna with traditional attiéké cassava couscous",
    image: "https://placehold.co/300x200/f97316/white?text=Attieke+Thon",
    tags: ["gluten-free"]
  },
  {
    sku: "ATT002",
    category: "Mains",
    name: "Attiéké + Poulet",
    price: 3000,
    description: "Spicy grilled chicken with attiéké and vegetables",
    image: "https://placehold.co/300x200/f97316/white?text=Attieke+Poulet",
    tags: ["spicy", "gluten-free"]
  },
  {
    sku: "ATT003",
    category: "Mains",
    name: "Attiéké + Poisson",
    price: 3200,
    description: "Fresh fish with attiéké and spicy tomato sauce",
    image: "https://placehold.co/300x200/f97316/white?text=Attieke+Poisson",
    tags: ["gluten-free"]
  },
  {
    sku: "RIZ001",
    category: "Mains",
    name: "Riz au Gras",
    price: 2800,
    description: "Traditional rice cooked in palm oil with meat",
    image: "https://placehold.co/300x200/f97316/white?text=Riz+au+Gras",
    tags: []
  },
  {
    sku: "ALL001",
    category: "Mains",
    name: "Alloco + Grillades",
    price: 2500,
    description: "Fried plantains with grilled meat and sauce",
    image: "https://placehold.co/300x200/f97316/white?text=Alloco+Grillades",
    tags: ["vegetarian"]
  },
  {
    sku: "DRK001",
    category: "Drinks",
    name: "Jus de Bissap",
    price: 1000,
    description: "Refreshing hibiscus juice with natural flavors",
    image: "https://placehold.co/300x200/e11d48/white?text=Bissap+Juice",
    tags: ["vegan"]
  },
  {
    sku: "DRK002",
    category: "Drinks",
    name: "Jus de Gingembre",
    price: 1200,
    description: "Spicy ginger juice with lemon and mint",
    image: "https://placehold.co/300x200/e11d48/white?text=Ginger+Juice",
    tags: ["spicy", "vegan"]
  },
  {
    sku: "DRK003",
    category: "Drinks",
    name: "Eau Minérale",
    price: 500,
    description: "Fresh mineral water bottle 50cl",
    image: "https://placehold.co/300x200/e11d48/white?text=Water",
    tags: ["vegan"]
  },
  {
    sku: "DRK004",
    category: "Drinks",
    name: "Coca-Cola",
    price: 800,
    description: "Classic Coca-Cola 33cl bottle",
    image: "https://placehold.co/300x200/e11d48/white?text=Coca+Cola",
    tags: ["vegan"]
  },
  {
    sku: "DES001",
    category: "Desserts",
    name: "Banane Plantain Sucrée",
    price: 1500,
    description: "Sweet fried plantains with cinnamon",
    image: "https://placehold.co/300x200/8b5cf6/white?text=Sweet+Plantain",
    tags: ["vegetarian", "vegan"]
  },
  {
    sku: "DES002",
    category: "Desserts",
    name: "Gâteau Local",
    price: 2000,
    description: "Traditional local cake with coconut",
    image: "https://placehold.co/300x200/8b5cf6/white?text=Local+Cake",
    tags: ["vegetarian"]
  }
]

// Configure localForage for orders storage
const ordersDB = localForage.createInstance({
  name: 'GarbakingOrders',
  storeName: 'orders'
})

const queueDB = localForage.createInstance({
  name: 'GarbakingOrders',
  storeName: 'sync_queue'
})

class MockApiService {
  // Simulate network delay
  private delay(ms: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // GET /local/menu
  async getMenu(): Promise<MenuItem[]> {
    await this.delay(500)
    return MOCK_MENU
  }

  // POST /local/orders
  async submitOrder(order: Omit<Order, 'localOrderId' | 'status' | 'synced'>): Promise<{
    localOrderId: string
    clientOrderId: string
    synced: boolean
    status: string
  }> {
    await this.delay(1000)

    const localOrderId = `LOCAL${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`
    const orderWithId: Order = {
      ...order,
      localOrderId,
      status: 'accepted',
      synced: false
    }

    // Store in local database
    await ordersDB.setItem(localOrderId, orderWithId)

    // Add to sync queue for background sync
    await queueDB.setItem(localOrderId, {
      orderId: localOrderId,
      timestamp: Date.now(),
      retries: 0
    })

    // Simulate status updates
    setTimeout(() => this.updateOrderStatus(localOrderId, 'preparing'), 5000)
    setTimeout(() => this.updateOrderStatus(localOrderId, 'ready'), 10000)

    return {
      localOrderId,
      clientOrderId: order.clientOrderId,
      synced: false,
      status: 'accepted'
    }
  }

  // GET /local/orders/:id
  async getOrderStatus(localOrderId: string): Promise<Order | null> {
    await this.delay(300)
    return await ordersDB.getItem(localOrderId)
  }

  // Get all orders for history
  async getAllOrders(): Promise<Order[]> {
    const orders: Order[] = []
    await ordersDB.iterate((value: Order) => {
      orders.push(value)
    })
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  // Simulate background sync
  async syncOrder(localOrderId: string): Promise<boolean> {
    await this.delay(2000) // Simulate network request

    const order = await ordersDB.getItem<Order>(localOrderId)
    if (!order) return false

    // Mark as synced
    order.synced = true
    order.status = 'synced'
    await ordersDB.setItem(localOrderId, order)

    // Remove from sync queue
    await queueDB.removeItem(localOrderId)

    return true
  }

  // Get pending sync orders
  async getPendingSyncOrders(): Promise<string[]> {
    const pendingOrders: string[] = []
    await queueDB.iterate((_value, key) => {
      pendingOrders.push(key as string)
    })
    return pendingOrders
  }

  // Update order status (internal method)
  private async updateOrderStatus(localOrderId: string, status: Order['status']): Promise<void> {
    const order = await ordersDB.getItem<Order>(localOrderId)
    if (order) {
      order.status = status
      await ordersDB.setItem(localOrderId, order)

      // Emit custom event for real-time updates
      window.dispatchEvent(new CustomEvent('orderStatusUpdate', {
        detail: { localOrderId, status }
      }))
    }
  }

  // Clear all data (for testing)
  async clearAllData(): Promise<void> {
    await ordersDB.clear()
    await queueDB.clear()
  }
}

export const mockApi = new MockApiService()
export { ordersDB, queueDB }