import { describe, beforeEach, it, expect, vi } from 'vitest'

const requestMock = vi.fn()
const responseInterceptorMock = vi.fn()

vi.mock('axios', () => {
  const instance: any = (config: any) => requestMock(config)
  instance.interceptors = {
    response: {
      use: responseInterceptorMock
    }
  }

  const factory = vi.fn(() => instance)

  return {
    default: {
      create: factory,
      get: vi.fn()
    },
    create: factory,
    get: vi.fn()
  }
})

describe('ordersApi', () => {
  beforeEach(() => {
    requestMock.mockReset()
    responseInterceptorMock.mockReset()
  })

  it('trackOrder hits the track endpoint and normalizes the response', async () => {
    const { ordersApi } = await import('@/services/api')

    const orderPayload = { orderNumber: 'ORD-123', status: 'CONFIRMED' }
    requestMock.mockResolvedValueOnce({ data: orderPayload })

    const result = await ordersApi.trackOrder('ORD-123')

    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('/api/orders/track/ORD-123'),
        method: 'GET'
      })
    )
    expect(result).toEqual({
      success: true,
      data: {
        order: orderPayload
      }
    })
  })

  it('cancelOrder posts to the number-based cancel endpoint and returns message', async () => {
    const { ordersApi } = await import('@/services/api')

    const orderPayload = { orderNumber: 'ORD-456', status: 'CANCELLED' }
    requestMock.mockResolvedValueOnce({ data: orderPayload })

    const result = await ordersApi.cancelOrder('ORD-456', 'Customer change')

    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('/api/orders/number/ORD-456/cancel'),
        method: 'POST',
        params: { reason: 'Customer change' }
      })
    )
    expect(result).toEqual({
      success: true,
      data: {
        order: orderPayload,
        message: 'Order cancelled successfully'
      }
    })
  })
})
