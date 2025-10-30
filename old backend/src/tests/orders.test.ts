/**
 * Orders API endpoint tests
 * Tests order creation, retrieval, status updates, and payment processing
 */

import request from 'supertest'
import { Express } from 'express'
import { createTestUser, generateTestToken, createAuthHeaders } from './setup'

let app: Express
let user: any
let token: string
let authHeaders: any

beforeAll(async () => {
  // Import isolated test app
  const { createTestApp } = await import('./testApp')
  app = createTestApp()
})

beforeEach(async () => {
  user = await createTestUser()
  token = generateTestToken(user.id)
  authHeaders = createAuthHeaders(token)

  // Create test categories and menu items
  await global.testDb.category.create({
    data: {
      id: 'cat-1',
      name: 'Main Dishes',
      storeId: user.storeId,
      isActive: true,
      isVisible: true,
      sortOrder: 1
    }
  })

  await global.testDb.menuItem.create({
    data: {
      id: 'item-1',
      sku: 'BURGER-001',
      name: 'Classic Burger',
      description: 'Delicious beef burger',
      price: 12.99,
      categoryId: 'cat-1',
      storeId: user.storeId,
      isActive: true,
      isAvailable: true,
      isVisible: true
    }
  })

  await global.testDb.menuItem.create({
    data: {
      id: 'item-2',
      sku: 'FRIES-001',
      name: 'French Fries',
      description: 'Crispy golden fries',
      price: 4.99,
      categoryId: 'cat-1',
      storeId: user.storeId,
      isActive: true,
      isAvailable: true,
      isVisible: true
    }
  })
})

describe('Orders API', () => {
  describe('POST /api/orders', () => {
    const validOrderData = {
      customerName: 'John Doe',
      customerPhone: '+1234567890',
      tableNumber: '5',
      orderType: 'DINE_IN',
      notes: 'Extra crispy fries',
      orderItems: [
        {
          menuItemId: 'item-1',
          quantity: 1,
          notes: 'Medium rare'
        },
        {
          menuItemId: 'item-2',
          quantity: 2
        }
      ]
    }

    it('should create order successfully', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set(authHeaders)
        .send(validOrderData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.order).toBeDefined()
      expect(response.body.data.order.orderNumber).toBeDefined()
      expect(response.body.data.order.customerName).toBe(validOrderData.customerName)
      expect(response.body.data.order.total).toBe(22.97) // 12.99 + (4.99 * 2) + 10% tax
      expect(response.body.data.order.orderItems).toHaveLength(2)
    })

    it('should generate unique order numbers', async () => {
      const response1 = await request(app)
        .post('/api/orders')
        .set(authHeaders)
        .send(validOrderData)
        .expect(201)

      const response2 = await request(app)
        .post('/api/orders')
        .set(authHeaders)
        .send(validOrderData)
        .expect(201)

      expect(response1.body.data.order.orderNumber).not.toBe(response2.body.data.order.orderNumber)
    })

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send(validOrderData)
        .expect(401)

      expect(response.body.success).toBe(false)
    })

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set(authHeaders)
        .send({
          orderItems: [] // Empty order items
        })
        .expect(400)

      expect(response.body.success).toBe(false)
    })

    it('should validate menu item availability', async () => {
      // Mark item as unavailable
      await global.testDb.menuItem.update({
        where: { id: 'item-1' },
        data: { isAvailable: false }
      })

      const response = await request(app)
        .post('/api/orders')
        .set(authHeaders)
        .send(validOrderData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('not available')
    })

    it('should calculate totals correctly', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set(authHeaders)
        .send(validOrderData)
        .expect(201)

      const order = response.body.data.order
      const expectedSubtotal = 12.99 + (4.99 * 2) // 22.97
      const expectedTax = expectedSubtotal * 0.1 // 2.297
      const expectedTotal = expectedSubtotal + expectedTax // 25.267

      expect(order.subtotal).toBeCloseTo(expectedSubtotal, 2)
      expect(order.tax).toBeCloseTo(expectedTax, 2)
      expect(order.total).toBeCloseTo(expectedTotal, 2)
    })

    it('should set default status to PENDING', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set(authHeaders)
        .send(validOrderData)
        .expect(201)

      expect(response.body.data.order.status).toBe('PENDING')
      expect(response.body.data.order.paymentStatus).toBe('PENDING')
    })
  })

  describe('GET /api/orders', () => {
    beforeEach(async () => {
      // Create test orders
      await request(app)
        .post('/api/orders')
        .set(authHeaders)
        .send({
          customerName: 'Alice Smith',
          orderType: 'TAKEOUT',
          orderItems: [{ menuItemId: 'item-1', quantity: 1 }]
        })

      await request(app)
        .post('/api/orders')
        .set(authHeaders)
        .send({
          customerName: 'Bob Johnson',
          orderType: 'DINE_IN',
          orderItems: [{ menuItemId: 'item-2', quantity: 1 }]
        })
    })

    it('should get orders list', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set(authHeaders)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.orders).toBeDefined()
      expect(response.body.data.orders.length).toBeGreaterThan(0)
      expect(response.body.data.pagination).toBeDefined()
    })

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/orders?page=1&limit=1')
        .set(authHeaders)
        .expect(200)

      expect(response.body.data.orders).toHaveLength(1)
      expect(response.body.data.pagination.page).toBe(1)
      expect(response.body.data.pagination.limit).toBe(1)
    })

    it('should support filtering by status', async () => {
      const response = await request(app)
        .get('/api/orders?status=PENDING')
        .set(authHeaders)
        .expect(200)

      expect(response.body.success).toBe(true)
      response.body.data.orders.forEach((order: any) => {
        expect(order.status).toBe('PENDING')
      })
    })

    it('should support search functionality', async () => {
      const response = await request(app)
        .get('/api/orders?search=Alice')
        .set(authHeaders)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.orders.length).toBeGreaterThan(0)
      expect(response.body.data.orders[0].customerName).toContain('Alice')
    })

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/orders')
        .expect(401)

      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /api/orders/:id', () => {
    let orderId: string

    beforeEach(async () => {
      const orderResponse = await request(app)
        .post('/api/orders')
        .set(authHeaders)
        .send({
          customerName: 'Test Customer',
          orderItems: [{ menuItemId: 'item-1', quantity: 1 }]
        })

      orderId = orderResponse.body.data.order.id
    })

    it('should get single order', async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set(authHeaders)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.order.id).toBe(orderId)
      expect(response.body.data.order.orderItems).toBeDefined()
    })

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/orders/non-existent-id')
        .set(authHeaders)
        .expect(404)

      expect(response.body.success).toBe(false)
    })

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .expect(401)

      expect(response.body.success).toBe(false)
    })
  })

  describe('PUT /api/orders/:id/status', () => {
    let orderId: string

    beforeEach(async () => {
      const orderResponse = await request(app)
        .post('/api/orders')
        .set(authHeaders)
        .send({
          customerName: 'Test Customer',
          orderItems: [{ menuItemId: 'item-1', quantity: 1 }]
        })

      orderId = orderResponse.body.data.order.id
    })

    it('should update order status', async () => {
      const response = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set(authHeaders)
        .send({
          status: 'CONFIRMED',
          kitchenNotes: 'Priority order',
          estimatedTime: 15
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.order.status).toBe('CONFIRMED')
      expect(response.body.data.order.kitchenNotes).toBe('Priority order')
      expect(response.body.data.order.estimatedTime).toBe(15)
    })

    it('should validate status transitions', async () => {
      // Try to go directly from PENDING to READY (invalid transition)
      const response = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set(authHeaders)
        .send({ status: 'READY' })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Cannot change order status')
    })

    it('should calculate actual time when served', async () => {
      // First confirm the order
      await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set(authHeaders)
        .send({ status: 'CONFIRMED' })

      // Then prepare it
      await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set(authHeaders)
        .send({ status: 'PREPARING' })

      // Mark as ready
      await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set(authHeaders)
        .send({ status: 'READY' })

      // Finally serve it
      const response = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set(authHeaders)
        .send({ status: 'SERVED' })
        .expect(200)

      expect(response.body.data.order.actualTime).toBeDefined()
      expect(response.body.data.order.actualTime).toBeGreaterThan(0)
    })

    it('should require authentication', async () => {
      const response = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .send({ status: 'CONFIRMED' })
        .expect(401)

      expect(response.body.success).toBe(false)
    })
  })

  describe('PUT /api/orders/:id/payment', () => {
    let orderId: string

    beforeEach(async () => {
      const orderResponse = await request(app)
        .post('/api/orders')
        .set(authHeaders)
        .send({
          customerName: 'Test Customer',
          orderItems: [{ menuItemId: 'item-1', quantity: 1 }]
        })

      orderId = orderResponse.body.data.order.id
    })

    it('should process payment successfully', async () => {
      // Get the order to know the total
      const orderResponse = await request(app)
        .get(`/api/orders/${orderId}`)
        .set(authHeaders)

      const orderTotal = orderResponse.body.data.order.total

      const response = await request(app)
        .put(`/api/orders/${orderId}/payment`)
        .set(authHeaders)
        .send({
          paymentMethod: 'CASH',
          amount: orderTotal,
          paymentReference: 'CASH-001'
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.order.paymentStatus).toBe('PAID')
    })

    it('should validate payment amount matches order total', async () => {
      const response = await request(app)
        .put(`/api/orders/${orderId}/payment`)
        .set(authHeaders)
        .send({
          paymentMethod: 'CASH',
          amount: 5.00, // Wrong amount
          paymentReference: 'CASH-001'
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('amount does not match')
    })

    it('should not allow payment on already paid order', async () => {
      // Get the order total and pay first time
      const orderResponse = await request(app)
        .get(`/api/orders/${orderId}`)
        .set(authHeaders)

      const orderTotal = orderResponse.body.data.order.total

      await request(app)
        .put(`/api/orders/${orderId}/payment`)
        .set(authHeaders)
        .send({
          paymentMethod: 'CASH',
          amount: orderTotal
        })

      // Try to pay again
      const response = await request(app)
        .put(`/api/orders/${orderId}/payment`)
        .set(authHeaders)
        .send({
          paymentMethod: 'CARD',
          amount: orderTotal
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('already paid')
    })
  })

  describe('DELETE /api/orders/:id', () => {
    let orderId: string

    beforeEach(async () => {
      const orderResponse = await request(app)
        .post('/api/orders')
        .set(authHeaders)
        .send({
          customerName: 'Test Customer',
          orderItems: [{ menuItemId: 'item-1', quantity: 1 }]
        })

      orderId = orderResponse.body.data.order.id
    })

    it('should cancel order successfully (admin only)', async () => {
      const response = await request(app)
        .delete(`/api/orders/${orderId}`)
        .set(authHeaders)
        .expect(200)

      expect(response.body.success).toBe(true)

      // Verify order is cancelled
      const orderCheck = await request(app)
        .get(`/api/orders/${orderId}`)
        .set(authHeaders)

      expect(orderCheck.body.data.order.status).toBe('CANCELLED')
    })

    it('should not cancel served orders', async () => {
      // Mark order as served first
      await request(app).put(`/api/orders/${orderId}/status`).set(authHeaders).send({ status: 'CONFIRMED' })
      await request(app).put(`/api/orders/${orderId}/status`).set(authHeaders).send({ status: 'PREPARING' })
      await request(app).put(`/api/orders/${orderId}/status`).set(authHeaders).send({ status: 'READY' })
      await request(app).put(`/api/orders/${orderId}/status`).set(authHeaders).send({ status: 'SERVED' })

      const response = await request(app)
        .delete(`/api/orders/${orderId}`)
        .set(authHeaders)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Cannot cancel')
    })
  })

  describe('GET /api/orders/stats/today', () => {
    beforeEach(async () => {
      // Create some test orders for today
      await request(app)
        .post('/api/orders')
        .set(authHeaders)
        .send({
          customerName: 'Customer 1',
          orderItems: [{ menuItemId: 'item-1', quantity: 1 }]
        })

      await request(app)
        .post('/api/orders')
        .set(authHeaders)
        .send({
          customerName: 'Customer 2',
          orderItems: [{ menuItemId: 'item-2', quantity: 2 }]
        })
    })

    it('should get today\'s order statistics', async () => {
      const response = await request(app)
        .get('/api/orders/stats/today')
        .set(authHeaders)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.totalOrders).toBeGreaterThan(0)
      expect(response.body.data.totalRevenue).toBeGreaterThan(0)
      expect(response.body.data.statusBreakdown).toBeDefined()
    })

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/orders/stats/today')
        .expect(401)

      expect(response.body.success).toBe(false)
    })
  })
})