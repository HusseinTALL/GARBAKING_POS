/**
 * Menu Controller - API endpoints for menu management
 * Handles HTTP requests for menu items, categories, and related operations
 */

import { Request, Response } from 'express'
import { menuService, type MenuItemFilter } from '../services/menuService'

export class MenuController {

  // === CATEGORY ENDPOINTS ===

  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const storeId = req.user?.storeId || req.body.storeId || process.env.STORE_ID || 'store_001'

      const result = await menuService.createCategory({
        ...req.body,
        storeId
      })

      if (result.success) {
        res.status(201).json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      })
    }
  }

  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const storeId = req.user?.storeId || req.query.storeId as string || process.env.STORE_ID || 'store_001'
      const includeInactive = req.query.includeInactive === 'true'

      const result = await menuService.getCategories(storeId, includeInactive)

      if (result.success) {
        res.json(result)
      } else {
        res.status(404).json(result)
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      })
    }
  }

  async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const storeId = req.user?.storeId || req.query.storeId as string || process.env.STORE_ID || 'store_001'

      const result = await menuService.getCategoryById(id, storeId)

      if (result.success) {
        res.json(result)
      } else {
        res.status(404).json(result)
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      })
    }
  }

  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const storeId = req.user?.storeId || req.body.storeId || process.env.STORE_ID || 'store_001'

      const result = await menuService.updateCategory({
        id,
        ...req.body,
        storeId
      })

      if (result.success) {
        res.json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      })
    }
  }

  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const storeId = req.user?.storeId || req.query.storeId as string || process.env.STORE_ID || 'store_001'

      const result = await menuService.deleteCategory(id, storeId)

      if (result.success) {
        res.json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      })
    }
  }

  // === MENU ITEM ENDPOINTS ===

  async createMenuItem(req: Request, res: Response): Promise<void> {
    try {
      const storeId = req.user?.storeId || req.body.storeId || process.env.STORE_ID || 'store_001'

      const result = await menuService.createMenuItem({
        ...req.body,
        storeId
      })

      if (result.success) {
        res.status(201).json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      })
    }
  }

  async getMenuItems(req: Request, res: Response): Promise<void> {
    try {
      const storeId = req.user?.storeId || req.query.storeId as string || process.env.STORE_ID || 'store_001'

      const filter: MenuItemFilter = {
        storeId,
        categoryId: req.query.categoryId as string,
        isAvailable: req.query.isAvailable ? req.query.isAvailable === 'true' : undefined,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
        isVisible: req.query.isVisible ? req.query.isVisible === 'true' : undefined,
        isFeatured: req.query.isFeatured ? req.query.isFeatured === 'true' : undefined,
        isVegetarian: req.query.isVegetarian ? req.query.isVegetarian === 'true' : undefined,
        isVegan: req.query.isVegan ? req.query.isVegan === 'true' : undefined,
        isGlutenFree: req.query.isGlutenFree ? req.query.isGlutenFree === 'true' : undefined,
        isSpicy: req.query.isSpicy ? req.query.isSpicy === 'true' : undefined,
        priceMin: req.query.priceMin ? parseFloat(req.query.priceMin as string) : undefined,
        priceMax: req.query.priceMax ? parseFloat(req.query.priceMax as string) : undefined,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        sortBy: req.query.sortBy as any || 'sortOrder',
        sortOrder: req.query.sortOrder as any || 'asc'
      }

      const result = await menuService.getMenuItems(filter)

      if (result.success) {
        res.json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      })
    }
  }

  async getMenuItemById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const storeId = req.user?.storeId || req.query.storeId as string || process.env.STORE_ID || 'store_001'

      const result = await menuService.getMenuItemById(id, storeId)

      if (result.success) {
        res.json(result)
      } else {
        res.status(404).json(result)
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      })
    }
  }

  async updateMenuItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const storeId = req.user?.storeId || req.body.storeId || process.env.STORE_ID || 'store_001'

      const result = await menuService.updateMenuItem({
        id,
        ...req.body,
        storeId
      })

      if (result.success) {
        res.json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      })
    }
  }

  async deleteMenuItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const storeId = req.user?.storeId || req.query.storeId as string || process.env.STORE_ID || 'store_001'

      const result = await menuService.deleteMenuItem(id, storeId)

      if (result.success) {
        res.json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      })
    }
  }

  // === BULK OPERATIONS ===

  async bulkUpdateMenuItems(req: Request, res: Response): Promise<void> {
    try {
      const { ids, updateData } = req.body
      const storeId = req.user?.storeId || req.body.storeId || process.env.STORE_ID || 'store_001'

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid or empty IDs array'
        })
        return
      }

      const result = await menuService.bulkUpdateMenuItems(ids, updateData, storeId)

      if (result.success) {
        res.json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      })
    }
  }

  async updateStockCount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { stockCount } = req.body
      const storeId = req.user?.storeId || req.body.storeId || process.env.STORE_ID || 'store_001'

      if (stockCount !== null && (typeof stockCount !== 'number' || stockCount < 0)) {
        res.status(400).json({
          success: false,
          error: 'Stock count must be a non-negative number or null'
        })
        return
      }

      const result = await menuService.updateStockCount(id, stockCount, storeId)

      if (result.success) {
        res.json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      })
    }
  }

  // === UTILITY ENDPOINTS ===

  async getMenuSummary(req: Request, res: Response): Promise<void> {
    try {
      const storeId = req.user?.storeId || req.query.storeId as string || process.env.STORE_ID || 'store_001'

      const [categoriesResult, itemsResult] = await Promise.all([
        menuService.getCategories(storeId),
        menuService.getMenuItems({
          storeId,
          limit: 1000,
          isActive: true
        })
      ])

      if (!categoriesResult.success || !itemsResult.success) {
        res.status(400).json({
          success: false,
          error: 'Failed to fetch menu summary'
        })
        return
      }

      const categories = categoriesResult.data!.categories
      const menuItems = itemsResult.data!.menuItems

      // Calculate statistics
      const stats = {
        totalCategories: categories.length,
        totalMenuItems: menuItems.length,
        activeItems: menuItems.filter(item => item.isActive).length,
        availableItems: menuItems.filter(item => item.isAvailable).length,
        featuredItems: menuItems.filter(item => item.isFeatured).length,
        vegetarianItems: menuItems.filter(item => item.isVegetarian).length,
        veganItems: menuItems.filter(item => item.isVegan).length,
        glutenFreeItems: menuItems.filter(item => item.isGlutenFree).length,
        lowStockItems: menuItems.filter(item => item.isLowStock).length,
        averagePrice: menuItems.length > 0
          ? menuItems.reduce((sum, item) => sum + item.effectivePrice, 0) / menuItems.length
          : 0,
        priceRange: menuItems.length > 0
          ? {
              min: Math.min(...menuItems.map(item => item.effectivePrice)),
              max: Math.max(...menuItems.map(item => item.effectivePrice))
            }
          : { min: 0, max: 0 }
      }

      res.json({
        success: true,
        data: {
          stats,
          categories,
          recentItems: menuItems
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10)
        }
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      })
    }
  }

  async searchMenu(req: Request, res: Response): Promise<void> {
    try {
      const { q: query } = req.query
      const storeId = req.user?.storeId || req.query.storeId as string || process.env.STORE_ID || 'store_001'

      if (!query || typeof query !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Search query is required'
        })
        return
      }

      const result = await menuService.getMenuItems({
        storeId,
        search: query,
        isActive: true,
        limit: 20
      })

      if (result.success) {
        res.json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      })
    }
  }
}

export const menuController = new MenuController()