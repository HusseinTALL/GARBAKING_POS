/**
 * Menu management routes for categories and menu items
 * Comprehensive API with enhanced features, validation, and role-based access control
 */

import { Router, Request, Response } from 'express'
import { getDB } from '../database/init'
import {
  validateMenuItem,
  validateCategory,
  validatePagination,
  validateUUID
} from '../middleware/validation'
import {
  validateCreateMenuItem,
  validateUpdateMenuItem,
  validateCreateCategory,
  validateUpdateCategory,
  validateBulkUpdate,
  validateStockUpdate,
  validateMenuFilters,
  validateUUIDParam,
  validateSearch
} from '../middleware/menuValidation'
import { asyncHandler, createError } from '../middleware/errorHandler'
import {
  authenticateToken,
  requirePermission,
  requireResourceAccess,
  requireMinimumRole,
  requireAnyPermission,
  requireRole,
  optionalAuth,
  ROLES
} from '../middleware/authMiddleware'
import { menuController } from '../controllers/menuController'

const router = Router()

// ============================================================================
// CATEGORIES ROUTES
// ============================================================================

/**
 * GET /api/menu/categories
 * Get all categories with optional pagination and search
 * Requires: menu:read permission (public for customers)
 */
router.get('/categories',
  optionalAuth,
  validatePagination,
  asyncHandler(async (req: Request, res: Response) => {
  const db = getDB()
  const { page = 1, limit = 50, search } = req.query

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
    db.category.findMany({
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
    db.category.count({ where })
  ])

  res.json({
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
  })
}))

/**
 * GET /api/menu/categories/:id
 * Get single category with menu items
 * Requires: menu:read permission (public for customers)
 */
router.get('/categories/:id',
  optionalAuth,
  validateUUID('id'),
  asyncHandler(async (req: Request, res: Response) => {
  const db = getDB()
  const { id } = req.params

  const category = await db.category.findUnique({
    where: { id },
    include: {
      menuItems: {
        where: { isActive: true },
        orderBy: { name: 'asc' }
      }
    }
  })

  if (!category) {
    throw createError('Category not found', 404)
  }

  res.json({
    success: true,
    data: { category }
  })
}))

/**
 * POST /api/menu/categories
 * Create new category (Manager/Admin only)
 * Requires: menu:manage_categories permission
 */
router.post('/categories',
  authenticateToken,
  requirePermission('menu:manage_categories'),
  validateCategory,
  asyncHandler(async (req: Request, res: Response) => {
    const db = getDB()
    const { name, description, sortOrder } = req.body

    const category = await db.category.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        sortOrder: sortOrder || 0,
        storeId: req.user!.storeId
      }
    })

    res.status(201).json({
      success: true,
      data: { category },
      message: 'Category created successfully'
    })
  })
)

/**
 * PUT /api/menu/categories/:id
 * Update category (Manager/Admin only)
 * Requires: menu:manage_categories permission
 */
router.put('/categories/:id',
  authenticateToken,
  requirePermission('menu:manage_categories'),
  validateUUID('id'),
  validateCategory,
  asyncHandler(async (req: Request, res: Response) => {
    const db = getDB()
    const { id } = req.params
    const { name, description, sortOrder, isActive } = req.body

    const category = await db.category.update({
      where: { id },
      data: {
        name: name?.trim(),
        description: description?.trim(),
        sortOrder,
        isActive
      }
    })

    res.json({
      success: true,
      data: { category },
      message: 'Category updated successfully'
    })
  })
)

/**
 * DELETE /api/menu/categories/:id
 * Soft delete category (Admin only)
 * Requires: menu:delete permission (Admin+ only)
 */
router.delete('/categories/:id',
  authenticateToken,
  requireMinimumRole(ROLES.ADMIN),
  requirePermission('menu:delete'),
  validateUUID('id'),
  asyncHandler(async (req: Request, res: Response) => {
    const db = getDB()
    const { id } = req.params

    // Check if category has active menu items
    const menuItemCount = await db.menuItem.count({
      where: {
        categoryId: id,
        isActive: true
      }
    })

    if (menuItemCount > 0) {
      throw createError('Cannot delete category with active menu items', 400)
    }

    await db.category.update({
      where: { id },
      data: { isActive: false }
    })

    res.json({
      success: true,
      message: 'Category deleted successfully'
    })
  })
)

// ============================================================================
// MENU ITEMS ROUTES
// ============================================================================

/**
 * GET /api/menu/items
 * Get all menu items with filtering and pagination
 */
router.get('/items', validatePagination, asyncHandler(async (req: Request, res: Response) => {
  const db = getDB()
  const { page = 1, limit = 50, search, categoryId, available } = req.query

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
    db.menuItem.findMany({
      where,
      skip,
      take,
      orderBy: { name: 'asc' },
      include: {
        category: true
      }
    }),
    db.menuItem.count({ where })
  ])

  res.json({
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
  })
}))

/**
 * GET /api/menu/items/:id
 * Get single menu item
 */
router.get('/items/:id', validateUUID('id'), asyncHandler(async (req: Request, res: Response) => {
  const db = getDB()
  const { id } = req.params

  const menuItem = await db.menuItem.findUnique({
    where: { id },
    include: {
      category: true
    }
  })

  if (!menuItem) {
    throw createError('Menu item not found', 404)
  }

  res.json({
    success: true,
    data: { menuItem }
  })
}))

/**
 * POST /api/menu/items
 * Create new menu item (Manager/Admin only)
 */
router.post('/items',
  requireRole(['ADMIN', 'MANAGER']),
  validateMenuItem,
  asyncHandler(async (req: Request, res: Response) => {
    const db = getDB()
    const {
      name,
      sku,
      description,
      price,
      cost,
      categoryId,
      imageUrl,
      isAvailable = true
    } = req.body

    // Check if SKU is unique
    const existingSku = await db.menuItem.findUnique({
      where: { sku: sku.toUpperCase() }
    })

    if (existingSku) {
      throw createError('SKU already exists', 409)
    }

    // Verify category exists
    const category = await db.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      throw createError('Category not found', 404)
    }

    const menuItem = await db.menuItem.create({
      data: {
        name: name.trim(),
        sku: sku.toUpperCase(),
        description: description?.trim(),
        price: Number(price),
        cost: cost ? Number(cost) : null,
        categoryId,
        imageUrl: imageUrl?.trim(),
        isAvailable,
        storeId: req.user!.storeId
      },
      include: {
        category: true
      }
    })

    res.status(201).json({
      success: true,
      data: { menuItem },
      message: 'Menu item created successfully'
    })
  })
)

/**
 * PUT /api/menu/items/:id
 * Update menu item (Manager/Admin only)
 */
router.put('/items/:id',
  requireRole(['ADMIN', 'MANAGER']),
  validateUUID('id'),
  validateMenuItem,
  asyncHandler(async (req: Request, res: Response) => {
    const db = getDB()
    const { id } = req.params
    const {
      name,
      sku,
      description,
      price,
      cost,
      categoryId,
      imageUrl,
      isAvailable,
      isActive
    } = req.body

    // Check if SKU is unique (excluding current item)
    if (sku) {
      const existingSku = await db.menuItem.findFirst({
        where: {
          sku: sku.toUpperCase(),
          id: { not: id }
        }
      })

      if (existingSku) {
        throw createError('SKU already exists', 409)
      }
    }

    // Verify category exists if categoryId is provided
    if (categoryId) {
      const category = await db.category.findUnique({
        where: { id: categoryId }
      })

      if (!category) {
        throw createError('Category not found', 404)
      }
    }

    const menuItem = await db.menuItem.update({
      where: { id },
      data: {
        name: name?.trim(),
        sku: sku?.toUpperCase(),
        description: description?.trim(),
        price: price ? Number(price) : undefined,
        cost: cost ? Number(cost) : undefined,
        categoryId,
        imageUrl: imageUrl?.trim(),
        isAvailable,
        isActive
      },
      include: {
        category: true
      }
    })

    res.json({
      success: true,
      data: { menuItem },
      message: 'Menu item updated successfully'
    })
  })
)

/**
 * DELETE /api/menu/items/:id
 * Soft delete menu item (Admin only)
 */
router.delete('/items/:id',
  requireRole(['ADMIN']),
  validateUUID('id'),
  asyncHandler(async (req: Request, res: Response) => {
    const db = getDB()
    const { id } = req.params

    await db.menuItem.update({
      where: { id },
      data: { isActive: false }
    })

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    })
  })
)

/**
 * PATCH /api/menu/items/:id/availability
 * Toggle menu item availability (Staff can use this)
 */
router.patch('/items/:id/availability',
  validateUUID('id'),
  asyncHandler(async (req: Request, res: Response) => {
    const db = getDB()
    const { id } = req.params
    const { isAvailable } = req.body

    if (typeof isAvailable !== 'boolean') {
      throw createError('isAvailable must be a boolean value', 400)
    }

    const menuItem = await db.menuItem.update({
      where: { id },
      data: { isAvailable },
      include: {
        category: true
      }
    })

    res.json({
      success: true,
      data: { menuItem },
      message: `Menu item ${isAvailable ? 'enabled' : 'disabled'} successfully`
    })
  })
)

/**
 * GET /api/menu/public
 * Public menu endpoint for customer display (no auth required)
 */
router.get('/public', asyncHandler(async (req: Request, res: Response) => {
  const db = getDB()

  const categories = await db.category.findMany({
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
          isAvailable: true
        }
      }
    }
  })

  res.json({
    success: true,
    data: { categories }
  })
}))

// ============================================================================
// ENHANCED ENDPOINTS - USING NEW MENU SERVICE
// ============================================================================

// Enhanced menu items endpoint with comprehensive filtering
router.get('/enhanced/items',
  authenticateToken,
  requireAnyPermission(['menu:read', 'orders:create']),
  validateMenuFilters,
  menuController.getMenuItems.bind(menuController)
)

// Enhanced category management endpoints
router.get('/enhanced/categories',
  optionalAuth,
  menuController.getCategories.bind(menuController)
)

router.post('/enhanced/categories',
  authenticateToken,
  requirePermission('menu:create'),
  validateCreateCategory,
  menuController.createCategory.bind(menuController)
)

router.put('/enhanced/categories/:id',
  authenticateToken,
  requirePermission('menu:update'),
  validateUpdateCategory,
  menuController.updateCategory.bind(menuController)
)

// Bulk operations
router.put('/items/bulk',
  authenticateToken,
  requirePermission('menu:bulk_operations'),
  validateBulkUpdate,
  menuController.bulkUpdateMenuItems.bind(menuController)
)

// Stock management
router.put('/items/:id/stock',
  authenticateToken,
  requireAnyPermission(['menu:update', 'inventory:update']),
  validateStockUpdate,
  menuController.updateStockCount.bind(menuController)
)

// Menu summary and analytics
router.get('/summary',
  authenticateToken,
  requireAnyPermission(['menu:read', 'analytics:view_basic']),
  menuController.getMenuSummary.bind(menuController)
)

// Advanced search
router.get('/search',
  optionalAuth,
  validateSearch,
  menuController.searchMenu.bind(menuController)
)

// Enhanced menu item creation with full features
router.post('/enhanced/items',
  authenticateToken,
  requirePermission('menu:create'),
  validateCreateMenuItem,
  menuController.createMenuItem.bind(menuController)
)

// Enhanced menu item updates
router.put('/enhanced/items/:id',
  authenticateToken,
  requirePermission('menu:update'),
  validateUpdateMenuItem,
  menuController.updateMenuItem.bind(menuController)
)

// Get single enhanced menu item
router.get('/enhanced/items/:id',
  optionalAuth,
  validateUUIDParam('id'),
  menuController.getMenuItemById.bind(menuController)
)

// Get single enhanced category
router.get('/enhanced/categories/:id',
  optionalAuth,
  validateUUIDParam('id'),
  menuController.getCategoryById.bind(menuController)
)

// ============================================================================
// PUBLIC CUSTOMER ENDPOINTS (No Authentication Required)
// ============================================================================

// Enhanced public menu for customers
router.get('/public/enhanced', asyncHandler(async (req: Request, res: Response) => {
  const storeId = req.query.storeId as string || process.env.STORE_ID || 'store_001'

  // Use the menu service for consistent data handling
  const { menuService } = await import('../services/menuService')

  const [categoriesResult, itemsResult] = await Promise.all([
    menuService.getCategories(storeId),
    menuService.getMenuItems({
      storeId,
      isActive: true,
      isVisible: true,
      isAvailable: true,
      limit: 1000,
      sortBy: 'sortOrder'
    })
  ])

  if (!categoriesResult.success || !itemsResult.success) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu'
    })
    return
  }

  // Filter categories to only show those with visible items
  const visibleCategories = categoriesResult.data!.categories.filter(cat =>
    cat.isVisible && itemsResult.data!.menuItems.some(item =>
      item.categoryId === cat.id && item.isVisible && item.isAvailable
    )
  )

  // Group items by category
  const menuByCategory = visibleCategories.map(category => ({
    ...category,
    items: itemsResult.data!.menuItems.filter(item =>
      item.categoryId === category.id && item.isVisible && item.isAvailable
    )
  }))

  res.json({
    success: true,
    data: {
      categories: menuByCategory,
      featuredItems: itemsResult.data!.menuItems.filter(item =>
        item.isFeatured && item.isVisible && item.isAvailable
      ).slice(0, 6),
      stats: {
        totalCategories: menuByCategory.length,
        totalItems: itemsResult.data!.menuItems.filter(item =>
          item.isVisible && item.isAvailable
        ).length,
        featuredCount: itemsResult.data!.menuItems.filter(item =>
          item.isFeatured && item.isVisible && item.isAvailable
        ).length
      }
    }
  })
}))

// Public category with enhanced filtering
router.get('/public/enhanced/categories/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const storeId = req.query.storeId as string || process.env.STORE_ID || 'store_001'

  const { menuService } = await import('../services/menuService')

  const result = await menuService.getCategoryById(id, storeId)

  if (!result.success) {
    res.status(404).json(result)
    return
  }

  // Filter to only show visible and available items
  const category = result.data!.category
  const publicCategory = {
    ...category,
    menuItems: category.menuItems?.filter((item: any) =>
      item.isVisible && item.isAvailable && item.isActive
    ) || []
  }

  res.json({
    success: true,
    data: { category: publicCategory }
  })
}))

export default router