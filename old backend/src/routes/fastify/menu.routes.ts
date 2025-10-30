/**
 * Menu Routes (Fastify Plugin)
 * Customer-focused menu endpoints for browsing categories and menu items
 */

import { FastifyPluginAsync } from 'fastify'

// JSON Schemas for validation
const categoriesResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data: {
      type: 'object',
      properties: {
        categories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string', nullable: true },
              imageUrl: { type: 'string', nullable: true },
              sortOrder: { type: 'number' },
              isActive: { type: 'boolean' },
              menuItems: { type: 'array' }
            }
          }
        }
      }
    }
  }
}

const menuItemsResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data: {
      type: 'object',
      properties: {
        menuItems: { type: 'array' },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' }
          }
        }
      }
    }
  }
}

const menuRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/menu/public
   * Public menu endpoint for customer display (no auth required)
   * Returns all active categories with their available menu items
   */
  fastify.get('/public', {
    schema: {
      description: 'Get public menu with categories and items',
      tags: ['menu'],
      response: {
        200: categoriesResponseSchema
      }
    }
  }, async (request, reply) => {
    const categories = await fastify.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
      include: {
        menuItems: {
          where: {
            isActive: true,
            isAvailable: true
          },
          orderBy: { name: 'asc' },
          select: {
            id: true,
            sku: true,
            name: true,
            description: true,
            price: true,
            imageUrl: true,
            isAvailable: true,
            categoryId: true,
            prepTime: true,
            calories: true,
            isSpicy: true,
            isVegetarian: true,
            isVegan: true,
            isGlutenFree: true
          }
        }
      }
    })

    return {
      success: true,
      data: { categories }
    }
  })

  /**
   * GET /api/menu/categories
   * Get all active categories with item count
   */
  fastify.get('/categories', {
    schema: {
      description: 'Get all menu categories',
      tags: ['menu'],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
          search: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                categories: { type: 'array' },
                pagination: { type: 'object' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { page = 1, limit = 50, search } = request.query as any

    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)

    const where: any = {
      isActive: true
    }

    if (search) {
      where.name = {
        contains: String(search),
        mode: 'insensitive'
      }
    }

    const [categories, total] = await Promise.all([
      fastify.prisma.category.findMany({
        where,
        skip,
        take,
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' }
        ],
        include: {
          _count: {
            select: {
              menuItems: {
                where: { isActive: true }
              }
            }
          }
        }
      }),
      fastify.prisma.category.count({ where })
    ])

    return {
      success: true,
      data: {
        categories,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    }
  })

  /**
   * GET /api/menu/items
   * Get all menu items with filtering and pagination
   */
  fastify.get('/items', {
    schema: {
      description: 'Get menu items with filters',
      tags: ['menu'],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
          search: { type: 'string' },
          categoryId: { type: 'string' },
          available: { type: 'string', enum: ['true', 'false'] }
        }
      },
      response: {
        200: menuItemsResponseSchema
      }
    }
  }, async (request, reply) => {
    const { page = 1, limit = 50, search, categoryId, available } = request.query as any

    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)

    const where: any = {
      isActive: true
    }

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
        { sku: { contains: String(search), mode: 'insensitive' } }
      ]
    }

    if (categoryId) {
      where.categoryId = String(categoryId)
    }

    if (available !== undefined) {
      where.isAvailable = available === 'true'
    }

    const [menuItems, total] = await Promise.all([
      fastify.prisma.menuItem.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        include: {
          category: true
        }
      }),
      fastify.prisma.menuItem.count({ where })
    ])

    return {
      success: true,
      data: {
        menuItems,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    }
  })

  /**
   * GET /api/menu/items/:id
   * Get single menu item by ID
   */
  fastify.get('/items/:id', {
    schema: {
      description: 'Get menu item by ID',
      tags: ['menu'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                menuItem: { type: 'object' }
              }
            }
          }
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            code: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const menuItem = await fastify.prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: true
      }
    })

    if (!menuItem) {
      return reply.status(404).send({
        success: false,
        error: 'Menu item not found',
        code: 'ITEM_NOT_FOUND'
      })
    }

    return {
      success: true,
      data: { menuItem }
    }
  })

  /**
   * GET /api/menu/categories/:id
   * Get single category with menu items
   */
  fastify.get('/categories/:id', {
    schema: {
      description: 'Get category by ID with menu items',
      tags: ['menu'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                category: { type: 'object' }
              }
            }
          }
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            code: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const category = await fastify.prisma.category.findUnique({
      where: { id },
      include: {
        menuItems: {
          where: { isActive: true },
          orderBy: { name: 'asc' }
        }
      }
    })

    if (!category) {
      return reply.status(404).send({
        success: false,
        error: 'Category not found',
        code: 'CATEGORY_NOT_FOUND'
      })
    }

    return {
      success: true,
      data: { category }
    }
  })

  /**
   * GET /api/menu/search
   * Advanced search across menu items
   */
  fastify.get('/search', {
    schema: {
      description: 'Search menu items',
      tags: ['menu'],
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string', minLength: 1 },
          category: { type: 'string' },
          vegetarian: { type: 'boolean' },
          vegan: { type: 'boolean' },
          glutenFree: { type: 'boolean' },
          spicy: { type: 'boolean' }
        }
      }
    }
  }, async (request, reply) => {
    const { q, category, vegetarian, vegan, glutenFree, spicy } = request.query as any

    const where: any = {
      isActive: true,
      isAvailable: true
    }

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ]
    }

    if (category) {
      where.categoryId = category
    }

    if (vegetarian === true || vegetarian === 'true') {
      where.isVegetarian = true
    }

    if (vegan === true || vegan === 'true') {
      where.isVegan = true
    }

    if (glutenFree === true || glutenFree === 'true') {
      where.isGlutenFree = true
    }

    if (spicy === true || spicy === 'true') {
      where.isSpicy = true
    }

    const menuItems = await fastify.prisma.menuItem.findMany({
      where,
      include: {
        category: true
      },
      orderBy: { name: 'asc' }
    })

    return {
      success: true,
      data: {
        menuItems,
        count: menuItems.length
      }
    }
  })

  fastify.log.info('✅ Menu routes registered')
}

export default menuRoutes
