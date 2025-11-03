/**
 * Payment API endpoint tests
 * Tests payment processing, methods validation, and cash payment workflows
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
})

describe('Payment API', () => {
  describe('GET /api/payment/methods', () => {
    it('should get available payment methods', async () => {
      const response = await request(app)
        .get('/api/payment/methods')
        .set(authHeaders)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.methods).toBeDefined()
      expect(Array.isArray(response.body.data.methods)).toBe(true)

      // Should include basic payment methods
      const methodNames = response.body.data.methods.map((m: any) => m.name)
      expect(methodNames).toContain('CASH')
      expect(methodNames).toContain('CARD')
    })

    it('should include method details', async () => {
      const response = await request(app)
        .get('/api/payment/methods')
        .set(authHeaders)
        .expect(200)

      const cashMethod = response.body.data.methods.find((m: any) => m.name === 'CASH')
      expect(cashMethod).toBeDefined()
      expect(cashMethod.displayName).toBeDefined()
      expect(cashMethod.isEnabled).toBeDefined()
      expect(cashMethod.acceptedCurrencies).toBeDefined()
    })

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/payment/methods')
        .expect(401)

      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/payment/process', () => {
    const validPaymentData = {
      amount: 25.99,
      method: 'CASH',
      currency: 'USD',
      reference: 'CASH-001',
      metadata: {
        orderId: 'order-123',
        customerName: 'John Doe'
      }
    }

    it('should process cash payment successfully', async () => {
      const response = await request(app)
        .post('/api/payment/process')
        .set(authHeaders)
        .send(validPaymentData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.payment).toBeDefined()
      expect(response.body.data.payment.status).toBe('COMPLETED')
      expect(response.body.data.payment.method).toBe('CASH')
      expect(response.body.data.payment.amount).toBe(25.99)
      expect(response.body.data.payment.transactionId).toBeDefined()
    })

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/payment/process')
        .set(authHeaders)
        .send({
          method: 'CASH'
          // Missing amount
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('amount')
    })

    it('should validate payment amount is positive', async () => {
      const response = await request(app)
        .post('/api/payment/process')
        .set(authHeaders)
        .send({
          ...validPaymentData,
          amount: -10.00
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('amount')
    })

    it('should validate supported payment methods', async () => {
      const response = await request(app)
        .post('/api/payment/process')
        .set(authHeaders)
        .send({
          ...validPaymentData,
          method: 'CRYPTO' // Unsupported method
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('payment method')
    })

    it('should handle card payment processing', async () => {
      const cardPaymentData = {
        ...validPaymentData,
        method: 'CARD',
        cardDetails: {
          last4: '1234',
          brand: 'VISA',
          authCode: 'AUTH123'
        }
      }

      const response = await request(app)
        .post('/api/payment/process')
        .set(authHeaders)
        .send(cardPaymentData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.payment.method).toBe('CARD')
      expect(response.body.data.payment.cardDetails).toBeDefined()
    })

    it('should generate unique transaction IDs', async () => {
      const response1 = await request(app)
        .post('/api/payment/process')
        .set(authHeaders)
        .send(validPaymentData)
        .expect(200)

      const response2 = await request(app)
        .post('/api/payment/process')
        .set(authHeaders)
        .send(validPaymentData)
        .expect(200)

      expect(response1.body.data.payment.transactionId)
        .not.toBe(response2.body.data.payment.transactionId)
    })

    it('should store payment metadata', async () => {
      const response = await request(app)
        .post('/api/payment/process')
        .set(authHeaders)
        .send(validPaymentData)
        .expect(200)

      expect(response.body.data.payment.metadata).toBeDefined()
      expect(response.body.data.payment.metadata.orderId).toBe('order-123')
      expect(response.body.data.payment.metadata.customerName).toBe('John Doe')
    })

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/payment/process')
        .send(validPaymentData)
        .expect(401)

      expect(response.body.success).toBe(false)
    })

    it('should handle payment processing errors gracefully', async () => {
      // Simulate a payment failure scenario
      const failurePaymentData = {
        ...validPaymentData,
        method: 'CARD',
        cardDetails: {
          last4: '0000', // Simulate declined card
          brand: 'VISA'
        },
        simulateFailure: true
      }

      const response = await request(app)
        .post('/api/payment/process')
        .set(authHeaders)
        .send(failurePaymentData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('payment')
    })
  })

  describe('GET /api/payment/transaction/:id', () => {
    let transactionId: string

    beforeEach(async () => {
      const paymentResponse = await request(app)
        .post('/api/payment/process')
        .set(authHeaders)
        .send({
          amount: 15.99,
          method: 'CASH',
          currency: 'USD',
          reference: 'CASH-002'
        })

      transactionId = paymentResponse.body.data.payment.transactionId
    })

    it('should get payment transaction details', async () => {
      const response = await request(app)
        .get(`/api/payment/transaction/${transactionId}`)
        .set(authHeaders)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.payment).toBeDefined()
      expect(response.body.data.payment.transactionId).toBe(transactionId)
      expect(response.body.data.payment.amount).toBe(15.99)
    })

    it('should return 404 for non-existent transaction', async () => {
      const response = await request(app)
        .get('/api/payment/transaction/non-existent-id')
        .set(authHeaders)
        .expect(404)

      expect(response.body.success).toBe(false)
    })

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/payment/transaction/${transactionId}`)
        .expect(401)

      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/payment/refund', () => {
    let transactionId: string
    let paymentAmount: number

    beforeEach(async () => {
      paymentAmount = 29.99

      const paymentResponse = await request(app)
        .post('/api/payment/process')
        .set(authHeaders)
        .send({
          amount: paymentAmount,
          method: 'CASH',
          currency: 'USD',
          reference: 'CASH-003'
        })

      transactionId = paymentResponse.body.data.payment.transactionId
    })

    it('should process full refund successfully', async () => {
      const response = await request(app)
        .post('/api/payment/refund')
        .set(authHeaders)
        .send({
          transactionId,
          amount: paymentAmount,
          reason: 'Customer request'
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.refund).toBeDefined()
      expect(response.body.data.refund.amount).toBe(paymentAmount)
      expect(response.body.data.refund.status).toBe('COMPLETED')
    })

    it('should process partial refund successfully', async () => {
      const partialAmount = 10.00

      const response = await request(app)
        .post('/api/payment/refund')
        .set(authHeaders)
        .send({
          transactionId,
          amount: partialAmount,
          reason: 'Partial refund'
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.refund.amount).toBe(partialAmount)
    })

    it('should not allow refund more than original amount', async () => {
      const response = await request(app)
        .post('/api/payment/refund')
        .set(authHeaders)
        .send({
          transactionId,
          amount: paymentAmount + 10.00, // More than paid
          reason: 'Invalid refund'
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('amount')
    })

    it('should require refund reason', async () => {
      const response = await request(app)
        .post('/api/payment/refund')
        .set(authHeaders)
        .send({
          transactionId,
          amount: 10.00
          // Missing reason
        })
        .expect(400)

      expect(response.body.success).toBe(false)
    })

    it('should not refund non-existent transaction', async () => {
      const response = await request(app)
        .post('/api/payment/refund')
        .set(authHeaders)
        .send({
          transactionId: 'non-existent-id',
          amount: 10.00,
          reason: 'Test refund'
        })
        .expect(404)

      expect(response.body.success).toBe(false)
    })
  })

  describe('Payment Security', () => {
    it('should validate payment amount precision', async () => {
      const response = await request(app)
        .post('/api/payment/process')
        .set(authHeaders)
        .send({
          amount: 10.999, // More than 2 decimal places
          method: 'CASH',
          currency: 'USD'
        })
        .expect(400)

      expect(response.body.success).toBe(false)
    })

    it('should sanitize payment metadata', async () => {
      const response = await request(app)
        .post('/api/payment/process')
        .set(authHeaders)
        .send({
          amount: 10.00,
          method: 'CASH',
          currency: 'USD',
          metadata: {
            maliciousScript: '<script>alert("xss")</script>',
            normalData: 'safe data'
          }
        })
        .expect(200)

      // Metadata should be sanitized or rejected
      expect(response.body.data.payment.metadata.maliciousScript)
        .not.toContain('<script>')
    })

    it('should not expose sensitive card details in response', async () => {
      const response = await request(app)
        .post('/api/payment/process')
        .set(authHeaders)
        .send({
          amount: 25.00,
          method: 'CARD',
          currency: 'USD',
          cardDetails: {
            number: '4111111111111111', // Full card number (should not be stored)
            expiry: '12/25',
            cvv: '123',
            last4: '1111',
            brand: 'VISA'
          }
        })
        .expect(200)

      // Should only return last4 and brand, not full number or CVV
      expect(response.body.data.payment.cardDetails.number).toBeUndefined()
      expect(response.body.data.payment.cardDetails.cvv).toBeUndefined()
      expect(response.body.data.payment.cardDetails.last4).toBe('1111')
      expect(response.body.data.payment.cardDetails.brand).toBe('VISA')
    })
  })

  describe('Payment Analytics', () => {
    beforeEach(async () => {
      // Create multiple test payments
      const payments = [
        { amount: 15.99, method: 'CASH' },
        { amount: 23.50, method: 'CARD' },
        { amount: 31.75, method: 'CASH' },
        { amount: 12.25, method: 'CARD' }
      ]

      for (const payment of payments) {
        await request(app)
          .post('/api/payment/process')
          .set(authHeaders)
          .send({
            ...payment,
            currency: 'USD',
            reference: `TEST-${Date.now()}`
          })
      }
    })

    it('should get payment summary statistics', async () => {
      const response = await request(app)
        .get('/api/payment/stats')
        .set(authHeaders)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.totalAmount).toBeGreaterThan(0)
      expect(response.body.data.totalTransactions).toBeGreaterThan(0)
      expect(response.body.data.methodBreakdown).toBeDefined()
      expect(response.body.data.methodBreakdown.CASH).toBeDefined()
      expect(response.body.data.methodBreakdown.CARD).toBeDefined()
    })
  })
})