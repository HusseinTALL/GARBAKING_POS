/**
 * Cash Payment Workflow Integration Tests
 * Tests the complete end-to-end cash payment workflow from order creation to completion
 */

import request from 'supertest'
import { Express } from 'express'
import { createTestUser, generateTestToken, createAuthHeaders } from '../setup'

let app: Express
let user: any
let token: string
let authHeaders: any

beforeAll(async () => {
  // Import isolated test app
  const { createTestApp } = await import('../testApp')
  app = createTestApp()
})

beforeEach(async () => {
  user = await createTestUser()
  token = generateTestToken(user.id)
  authHeaders = createAuthHeaders(token)

  // Create test menu data
  await global.testDb.category.create({
    data: {
      id: 'cat-main',
      name: 'Main Dishes',
      storeId: user.storeId,
      isActive: true,
      isVisible: true,
      sortOrder: 1
    }
  })

  await global.testDb.menuItem.createMany({
    data: [
      {
        id: 'burger-classic',
        sku: 'BURGER-001',
        name: 'Classic Burger',
        description: 'Delicious beef burger with lettuce and tomato',
        price: 12.99,
        categoryId: 'cat-main',
        storeId: user.storeId,
        isActive: true,
        isAvailable: true,
        isVisible: true
      },
      {
        id: 'fries-regular',
        sku: 'FRIES-001',
        name: 'French Fries',
        description: 'Crispy golden fries',
        price: 4.99,
        categoryId: 'cat-main',
        storeId: user.storeId,
        isActive: true,
        isAvailable: true,
        isVisible: true
      },
      {
        id: 'drink-cola',
        sku: 'DRINK-001',
        name: 'Cola',
        description: 'Refreshing cola drink',
        price: 2.50,
        categoryId: 'cat-main',
        storeId: user.storeId,
        isActive: true,
        isAvailable: true,
        isVisible: true
      }
    ]
  })
})

describe('Complete Cash Payment Workflow Integration', () => {
  it('should complete full order-to-payment workflow successfully', async () => {
    // Step 1: Create a new order
    console.log('🔄 Step 1: Creating order...')
    const orderData = {
      customerName: 'Alice Johnson',
      customerPhone: '+1234567890',
      tableNumber: '12',
      orderType: 'DINE_IN',
      notes: 'Extra crispy fries, no pickles on burger',
      orderItems: [
        {
          menuItemId: 'burger-classic',
          quantity: 1,
          notes: 'No pickles'
        },
        {
          menuItemId: 'fries-regular',
          quantity: 2,
          notes: 'Extra crispy'
        },
        {
          menuItemId: 'drink-cola',
          quantity: 1
        }
      ]
    }

    const orderResponse = await request(app)
      .post('/api/orders')
      .set(authHeaders)
      .send(orderData)
      .expect(201)

    expect(orderResponse.body.success).toBe(true)
    const order = orderResponse.body.data.order
    console.log(`✅ Order created: ${order.orderNumber} - Total: $${order.total}`)

    // Verify order details
    expect(order.customerName).toBe(orderData.customerName)
    expect(order.orderItems).toHaveLength(3)
    expect(order.status).toBe('PENDING')
    expect(order.paymentStatus).toBe('PENDING')

    // Calculate expected totals
    const expectedSubtotal = 12.99 + (4.99 * 2) + 2.50 // 25.47
    const expectedTax = expectedSubtotal * 0.1 // 2.547
    const expectedTotal = expectedSubtotal + expectedTax // 28.017

    expect(order.subtotal).toBeCloseTo(expectedSubtotal, 2)
    expect(order.total).toBeCloseTo(expectedTotal, 2)

    // Step 2: Confirm the order (kitchen starts preparation)
    console.log('🔄 Step 2: Confirming order...')
    const confirmResponse = await request(app)
      .put(`/api/orders/${order.id}/status`)
      .set(authHeaders)
      .send({
        status: 'CONFIRMED',
        kitchenNotes: 'Rush order - table waiting',
        estimatedTime: 15
      })
      .expect(200)

    expect(confirmResponse.body.data.order.status).toBe('CONFIRMED')
    expect(confirmResponse.body.data.order.estimatedTime).toBe(15)
    console.log('✅ Order confirmed - Kitchen notified')

    // Step 3: Process payment while order is being prepared
    console.log('🔄 Step 3: Processing cash payment...')
    const paymentData = {
      amount: order.total,
      method: 'CASH',
      currency: 'USD',
      reference: `CASH-${order.orderNumber}`,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        tableNumber: order.tableNumber
      }
    }

    const paymentResponse = await request(app)
      .post('/api/payment/process')
      .set(authHeaders)
      .send(paymentData)
      .expect(200)

    expect(paymentResponse.body.success).toBe(true)
    const payment = paymentResponse.body.data.payment
    console.log(`✅ Payment processed: ${payment.transactionId} - $${payment.amount}`)

    // Verify payment details
    expect(payment.status).toBe('COMPLETED')
    expect(payment.method).toBe('CASH')
    expect(payment.amount).toBe(order.total)
    expect(payment.transactionId).toBeDefined()

    // Step 4: Update order payment status
    console.log('🔄 Step 4: Updating order payment status...')
    const paymentUpdateResponse = await request(app)
      .put(`/api/orders/${order.id}/payment`)
      .set(authHeaders)
      .send({
        paymentMethod: 'CASH',
        paymentReference: payment.transactionId,
        amount: order.total
      })
      .expect(200)

    expect(paymentUpdateResponse.body.data.order.paymentStatus).toBe('PAID')
    console.log('✅ Order marked as paid')

    // Step 5: Kitchen preparation workflow
    console.log('🔄 Step 5: Kitchen preparation workflow...')

    // Mark as preparing
    const preparingResponse = await request(app)
      .put(`/api/orders/${order.id}/status`)
      .set(authHeaders)
      .send({
        status: 'PREPARING',
        kitchenNotes: 'Started cooking burger'
      })
      .expect(200)

    expect(preparingResponse.body.data.order.status).toBe('PREPARING')
    console.log('✅ Order is being prepared')

    // Mark as ready
    const readyResponse = await request(app)
      .put(`/api/orders/${order.id}/status`)
      .set(authHeaders)
      .send({
        status: 'READY',
        kitchenNotes: 'Order complete - ready for pickup'
      })
      .expect(200)

    expect(readyResponse.body.data.order.status).toBe('READY')
    console.log('✅ Order ready for serving')

    // Step 6: Serve the order
    console.log('🔄 Step 6: Serving order...')
    const servedResponse = await request(app)
      .put(`/api/orders/${order.id}/status`)
      .set(authHeaders)
      .send({
        status: 'SERVED'
      })
      .expect(200)

    expect(servedResponse.body.data.order.status).toBe('SERVED')
    expect(servedResponse.body.data.order.actualTime).toBeDefined()
    expect(servedResponse.body.data.order.actualTime).toBeGreaterThan(0)
    console.log(`✅ Order served - Actual time: ${servedResponse.body.data.order.actualTime} minutes`)

    // Step 7: Verify final order state
    console.log('🔄 Step 7: Verifying final order state...')
    const finalOrderResponse = await request(app)
      .get(`/api/orders/${order.id}`)
      .set(authHeaders)
      .expect(200)

    const finalOrder = finalOrderResponse.body.data.order
    expect(finalOrder.status).toBe('SERVED')
    expect(finalOrder.paymentStatus).toBe('PAID')
    expect(finalOrder.actualTime).toBeGreaterThan(0)
    console.log('✅ Order workflow completed successfully')

    // Step 8: Verify payment transaction is recorded
    console.log('🔄 Step 8: Verifying payment transaction...')
    const transactionResponse = await request(app)
      .get(`/api/payment/transaction/${payment.transactionId}`)
      .set(authHeaders)
      .expect(200)

    expect(transactionResponse.body.data.payment.status).toBe('COMPLETED')
    expect(transactionResponse.body.data.payment.metadata.orderId).toBe(order.id)
    console.log('✅ Payment transaction verified')

    // Step 9: Check analytics reflect the completed order
    console.log('🔄 Step 9: Checking analytics...')
    const statsResponse = await request(app)
      .get('/api/orders/stats/today')
      .set(authHeaders)
      .expect(200)

    expect(statsResponse.body.data.totalOrders).toBeGreaterThan(0)
    expect(statsResponse.body.data.totalRevenue).toBeGreaterThan(0)
    expect(statsResponse.body.data.statusBreakdown.SERVED).toBeGreaterThan(0)
    console.log(`✅ Analytics updated - Today's revenue: $${statsResponse.body.data.totalRevenue}`)

    console.log('🎉 Complete cash payment workflow test passed!')
  })

  it('should handle order cancellation with refund workflow', async () => {
    // Step 1: Create and pay for order
    console.log('🔄 Cancellation workflow: Creating paid order...')
    const orderResponse = await request(app)
      .post('/api/orders')
      .set(authHeaders)
      .send({
        customerName: 'Bob Smith',
        orderItems: [{ menuItemId: 'burger-classic', quantity: 1 }]
      })
      .expect(201)

    const order = orderResponse.body.data.order

    // Process payment
    const paymentResponse = await request(app)
      .post('/api/payment/process')
      .set(authHeaders)
      .send({
        amount: order.total,
        method: 'CASH',
        currency: 'USD',
        reference: `CASH-${order.orderNumber}`
      })
      .expect(200)

    const payment = paymentResponse.body.data.payment

    // Update order payment status
    await request(app)
      .put(`/api/orders/${order.id}/payment`)
      .set(authHeaders)
      .send({
        paymentMethod: 'CASH',
        paymentReference: payment.transactionId,
        amount: order.total
      })
      .expect(200)

    console.log('✅ Order created and paid')

    // Step 2: Process refund
    console.log('🔄 Processing refund...')
    const refundResponse = await request(app)
      .post('/api/payment/refund')
      .set(authHeaders)
      .send({
        transactionId: payment.transactionId,
        amount: order.total,
        reason: 'Customer cancelled order before preparation'
      })
      .expect(200)

    expect(refundResponse.body.success).toBe(true)
    expect(refundResponse.body.data.refund.amount).toBe(order.total)
    console.log(`✅ Refund processed: $${refundResponse.body.data.refund.amount}`)

    // Step 3: Cancel the order
    console.log('🔄 Cancelling order...')
    const cancelResponse = await request(app)
      .delete(`/api/orders/${order.id}`)
      .set(authHeaders)
      .expect(200)

    expect(cancelResponse.body.success).toBe(true)
    console.log('✅ Order cancelled successfully')

    // Verify order status
    const finalOrderResponse = await request(app)
      .get(`/api/orders/${order.id}`)
      .set(authHeaders)
      .expect(200)

    expect(finalOrderResponse.body.data.order.status).toBe('CANCELLED')
    console.log('🎉 Cancellation with refund workflow completed!')
  })

  it('should handle multiple orders concurrently', async () => {
    console.log('🔄 Testing concurrent orders...')

    // Create multiple orders simultaneously
    const orderPromises = Array(3).fill(null).map((_, index) =>
      request(app)
        .post('/api/orders')
        .set(authHeaders)
        .send({
          customerName: `Customer ${index + 1}`,
          orderItems: [
            { menuItemId: 'burger-classic', quantity: 1 },
            { menuItemId: 'fries-regular', quantity: 1 }
          ]
        })
    )

    const orderResponses = await Promise.all(orderPromises)

    // Verify all orders were created successfully with unique order numbers
    const orderNumbers = orderResponses.map(res => res.body.data.order.orderNumber)
    const uniqueOrderNumbers = new Set(orderNumbers)

    expect(orderResponses).toHaveLength(3)
    expect(uniqueOrderNumbers.size).toBe(3) // All order numbers should be unique
    expect(orderResponses.every(res => res.status === 201)).toBe(true)

    console.log(`✅ Created ${orderResponses.length} concurrent orders with unique order numbers`)

    // Process payments for all orders concurrently
    const paymentPromises = orderResponses.map(orderRes =>
      request(app)
        .post('/api/payment/process')
        .set(authHeaders)
        .send({
          amount: orderRes.body.data.order.total,
          method: 'CASH',
          currency: 'USD',
          reference: `CASH-${orderRes.body.data.order.orderNumber}`
        })
    )

    const paymentResponses = await Promise.all(paymentPromises)

    expect(paymentResponses.every(res => res.status === 200)).toBe(true)
    expect(paymentResponses.every(res => res.body.success === true)).toBe(true)

    console.log(`✅ Processed ${paymentResponses.length} concurrent payments`)
    console.log('🎉 Concurrent orders test passed!')
  })

  it('should maintain data consistency under load', async () => {
    console.log('🔄 Testing data consistency under load...')

    // Create order
    const orderResponse = await request(app)
      .post('/api/orders')
      .set(authHeaders)
      .send({
        customerName: 'Load Test Customer',
        orderItems: [{ menuItemId: 'burger-classic', quantity: 2 }]
      })
      .expect(201)

    const order = orderResponse.body.data.order
    const initialTotal = order.total

    // Try to update order status multiple times concurrently
    // Only the first valid transition should succeed
    const statusUpdatePromises = [
      request(app).put(`/api/orders/${order.id}/status`).set(authHeaders).send({ status: 'CONFIRMED' }),
      request(app).put(`/api/orders/${order.id}/status`).set(authHeaders).send({ status: 'CONFIRMED' }),
      request(app).put(`/api/orders/${order.id}/status`).set(authHeaders).send({ status: 'CONFIRMED' })
    ]

    const statusResponses = await Promise.all(statusUpdatePromises)

    // All should get a response, but database should maintain consistency
    const successfulUpdates = statusResponses.filter(res => res.status === 200)
    expect(successfulUpdates.length).toBeGreaterThan(0)

    // Verify final order state is consistent
    const finalOrderResponse = await request(app)
      .get(`/api/orders/${order.id}`)
      .set(authHeaders)
      .expect(200)

    expect(finalOrderResponse.body.data.order.status).toBe('CONFIRMED')
    expect(finalOrderResponse.body.data.order.total).toBe(initialTotal)

    console.log('✅ Data consistency maintained under concurrent updates')
    console.log('🎉 Load consistency test passed!')
  })
})