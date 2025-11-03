/**
 * Menu Service - Business logic for menu management
 * Handles CRUD operations, validation, and menu-related business rules
 */

import { getDB } from '../database/init'
import type { Prisma } from '@prisma/client'

export interface MenuItemCreateData {
  sku: string
  name: string
  description?: string
  shortDesc?: string
  price: number
  cost?: number
  salePrice?: number
  imageUrl?: string
  categoryId: string
  tags?: string[]
  allergens?: string[]
  nutritionInfo?: any
  prepTime?: number
  calories?: number
  isAvailable?: boolean
  isActive?: boolean
  isVisible?: boolean
  isFeatured?: boolean
  isSpicy?: boolean
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
  stockCount?: number
  minStock?: number
  maxPerOrder?: number
  sortOrder?: number
  storeId: string
}

export interface MenuItemUpdateData extends Partial<MenuItemCreateData> {
  id: string
}

export interface CategoryCreateData {
  name: string
  description?: string
  imageUrl?: string
  color?: string
  sortOrder?: number
  isActive?: boolean
  isVisible?: boolean
  storeId: string
}

export interface CategoryUpdateData extends Partial<CategoryCreateData> {
  id: string
}

export interface MenuItemFilter {
  categoryId?: string
  isAvailable?: boolean
  isActive?: boolean
  isVisible?: boolean
  isFeatured?: boolean
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
  isSpicy?: boolean
  priceMin?: number
  priceMax?: number
  tags?: string[]
  search?: string
  storeId: string
  page?: number
  limit?: number
  sortBy?: 'name' | 'price' | 'createdAt' | 'sortOrder' | 'category'
  sortOrder?: 'asc' | 'desc'
}

export class MenuService {
  private db = getDB()

  // === CATEGORY MANAGEMENT ===

  async createCategory(data: CategoryCreateData) {
    try {
      // Check if category name already exists in store
      const existing = await this.db.category.findFirst({
        where: {
          name: data.name,
          storeId: data.storeId
        }
      })

      if (existing) {
        throw new Error(`Category '${data.name}' already exists in this store`)
      }

      const category = await this.db.category.create({
        data: {
          ...data
        },
        include: {
          menuItems: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
          }
        }
      })

      return {
        success: true,
        data: { category: this.formatCategoryResponse(category) }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create category'
      }
    }
  }

  async getCategories(storeId: string, includeInactive = false) {
    try {
      const whereClause: any = { storeId }
      if (!includeInactive) {
        whereClause.isActive = true
      }

      const categories = await this.db.category.findMany({
        where: whereClause,
        include: {
          menuItems: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
          }
        },
        orderBy: { sortOrder: 'asc' }
      })

      return {
        success: true,
        data: {
          categories: categories.map(cat => this.formatCategoryResponse(cat))
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch categories'
      }
    }
  }

  async getCategoryById(id: string, storeId: string) {
    try {
      const category = await this.db.category.findFirst({
        where: { id, storeId },
        include: {
          menuItems: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: {
              variants: { where: { isActive: true } },
              modifierGroups: {
                where: { isActive: true },
                include: { modifiers: { where: { isActive: true } } }
              }
            }
          }
        }
      })

      if (!category) {
        throw new Error('Category not found')
      }

      return {
        success: true,
        data: { category: this.formatCategoryResponse(category) }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch category'
      }
    }
  }

  async updateCategory(data: CategoryUpdateData) {
    try {
      const { id, ...updateData } = data

      // Check if category exists and belongs to store
      const existing = await this.db.category.findFirst({
        where: { id, storeId: updateData.storeId }
      })

      if (!existing) {
        throw new Error('Category not found')
      }

      // Check name uniqueness if name is being updated
      if (updateData.name && updateData.name !== existing.name) {
        const nameExists = await this.db.category.findFirst({
          where: {
            name: updateData.name,
            storeId: updateData.storeId,
            id: { not: id }
          }
        })

        if (nameExists) {
          throw new Error(`Category '${updateData.name}' already exists`)
        }
      }

      const category = await this.db.category.update({
        where: { id },
        data: updateData,
        include: {
          menuItems: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
          }
        }
      })

      return {
        success: true,
        data: { category: this.formatCategoryResponse(category) }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update category'
      }
    }
  }

  async deleteCategory(id: string, storeId: string) {
    try {
      const category = await this.db.category.findFirst({
        where: { id, storeId },
        include: { menuItems: true }
      })

      if (!category) {
        throw new Error('Category not found')
      }

      if (category.menuItems.length > 0) {
        throw new Error('Cannot delete category with menu items. Move or delete items first.')
      }

      await this.db.category.delete({ where: { id } })

      return {
        success: true,
        data: { message: 'Category deleted successfully' }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete category'
      }
    }
  }

  // === MENU ITEM MANAGEMENT ===

  async createMenuItem(data: MenuItemCreateData) {
    try {
      // Validate category exists
      const category = await this.db.category.findFirst({
        where: { id: data.categoryId, storeId: data.storeId }
      })

      if (!category) {
        throw new Error('Category not found')
      }

      // Check SKU uniqueness
      if (data.sku) {
        const skuExists = await this.db.menuItem.findUnique({
          where: { sku: data.sku }
        })

        if (skuExists) {
          throw new Error(`SKU '${data.sku}' already exists`)
        }
      }

      // Validate pricing
      if (data.price <= 0) {
        throw new Error('Price must be greater than 0')
      }

      if (data.salePrice && data.salePrice >= data.price) {
        throw new Error('Sale price must be less than regular price')
      }

      const menuItem = await this.db.menuItem.create({
        data: {
          ...data,
          tags: data.tags ? JSON.stringify(data.tags) : null,
          allergens: data.allergens ? JSON.stringify(data.allergens) : null,
          nutritionInfo: data.nutritionInfo ? JSON.stringify(data.nutritionInfo) : null
        },
        include: {
          category: true,
          variants: { where: { isActive: true } },
          modifierGroups: {
            where: { isActive: true },
            include: { modifiers: { where: { isActive: true } } }
          }
        }
      })

      return {
        success: true,
        data: { menuItem: this.formatMenuItemResponse(menuItem) }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create menu item'
      }
    }
  }

  async getMenuItems(filter: MenuItemFilter) {
    try {
      const {
        page = 1,
        limit = 50,
        sortBy = 'sortOrder',
        sortOrder = 'asc',
        search,
        ...filters
      } = filter

      // Build where clause
      const whereClause: any = {
        storeId: filters.storeId
      }

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && key !== 'storeId' && key !== 'priceMin' && key !== 'priceMax') {
          if (key === 'tags' && Array.isArray(value)) {
            // Handle tags search - check if any of the provided tags exist
            whereClause.tags = {
              contains: value.join('|') // Simple contains for now
            }
          } else {
            whereClause[key] = value
          }
        }
      })

      // Price range filter
      if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
        whereClause.price = {}
        if (filters.priceMin !== undefined) whereClause.price.gte = filters.priceMin
        if (filters.priceMax !== undefined) whereClause.price.lte = filters.priceMax
      }

      // Search filter
      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } }
        ]
      }

      // Build order clause
      const orderClause: any = {}
      if (sortBy === 'category') {
        orderClause.category = { name: sortOrder }
      } else {
        orderClause[sortBy] = sortOrder
      }

      const [menuItems, total] = await Promise.all([
        this.db.menuItem.findMany({
          where: whereClause,
          include: {
            category: true,
            variants: { where: { isActive: true } },
            modifierGroups: {
              where: { isActive: true },
              include: { modifiers: { where: { isActive: true } } }
            }
          },
          orderBy: orderClause,
          skip: (page - 1) * limit,
          take: limit
        }),
        this.db.menuItem.count({ where: whereClause })
      ])

      return {
        success: true,
        data: {
          menuItems: menuItems.map(item => this.formatMenuItemResponse(item)),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch menu items'
      }
    }
  }

  async getMenuItemById(id: string, storeId: string) {
    try {
      const menuItem = await this.db.menuItem.findFirst({
        where: { id, storeId },
        include: {
          category: true,
          variants: { where: { isActive: true } },
          modifierGroups: {
            where: { isActive: true },
            include: { modifiers: { where: { isActive: true } } }
          }
        }
      })

      if (!menuItem) {
        throw new Error('Menu item not found')
      }

      return {
        success: true,
        data: { menuItem: this.formatMenuItemResponse(menuItem) }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch menu item'
      }
    }
  }

  async updateMenuItem(data: MenuItemUpdateData) {
    try {
      const { id, ...updateData } = data

      // Check if item exists and belongs to store
      const existing = await this.db.menuItem.findFirst({
        where: { id, storeId: updateData.storeId }
      })

      if (!existing) {
        throw new Error('Menu item not found')
      }

      // Validate category if being updated
      if (updateData.categoryId) {
        const category = await this.db.category.findFirst({
          where: { id: updateData.categoryId, storeId: updateData.storeId }
        })

        if (!category) {
          throw new Error('Category not found')
        }
      }

      // Check SKU uniqueness if being updated
      if (updateData.sku && updateData.sku !== existing.sku) {
        const skuExists = await this.db.menuItem.findFirst({
          where: { sku: updateData.sku, id: { not: id } }
        })

        if (skuExists) {
          throw new Error(`SKU '${updateData.sku}' already exists`)
        }
      }

      // Validate pricing
      if (updateData.price !== undefined && updateData.price <= 0) {
        throw new Error('Price must be greater than 0')
      }

      const currentPrice = updateData.price || existing.price
      if (updateData.salePrice && updateData.salePrice >= currentPrice) {
        throw new Error('Sale price must be less than regular price')
      }

      const menuItem = await this.db.menuItem.update({
        where: { id },
        data: {
          ...updateData,
          tags: updateData.tags ? JSON.stringify(updateData.tags) : updateData.tags,
          allergens: updateData.allergens ? JSON.stringify(updateData.allergens) : updateData.allergens,
          nutritionInfo: updateData.nutritionInfo ? JSON.stringify(updateData.nutritionInfo) : updateData.nutritionInfo
        },
        include: {
          category: true,
          variants: { where: { isActive: true } },
          modifierGroups: {
            where: { isActive: true },
            include: { modifiers: { where: { isActive: true } } }
          }
        }
      })

      return {
        success: true,
        data: { menuItem: this.formatMenuItemResponse(menuItem) }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update menu item'
      }
    }
  }

  async deleteMenuItem(id: string, storeId: string) {
    try {
      const menuItem = await this.db.menuItem.findFirst({
        where: { id, storeId }
      })

      if (!menuItem) {
        throw new Error('Menu item not found')
      }

      // Soft delete by setting isActive to false
      await this.db.menuItem.update({
        where: { id },
        data: { isActive: false }
      })

      return {
        success: true,
        data: { message: 'Menu item deleted successfully' }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete menu item'
      }
    }
  }

  // === BULK OPERATIONS ===

  async bulkUpdateMenuItems(ids: string[], updateData: Partial<MenuItemCreateData>, storeId: string) {
    try {
      // Verify all items belong to the store
      const items = await this.db.menuItem.findMany({
        where: { id: { in: ids }, storeId }
      })

      if (items.length !== ids.length) {
        throw new Error('Some menu items not found or do not belong to this store')
      }

      await this.db.menuItem.updateMany({
        where: { id: { in: ids } },
        data: {
          ...updateData,
          tags: updateData.tags ? JSON.stringify(updateData.tags) : updateData.tags,
          allergens: updateData.allergens ? JSON.stringify(updateData.allergens) : updateData.allergens,
          nutritionInfo: updateData.nutritionInfo ? JSON.stringify(updateData.nutritionInfo) : updateData.nutritionInfo
        }
      })

      return {
        success: true,
        data: { message: `${ids.length} menu items updated successfully` }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to bulk update menu items'
      }
    }
  }

  async updateStockCount(id: string, stockCount: number, storeId: string) {
    try {
      const menuItem = await this.db.menuItem.findFirst({
        where: { id, storeId }
      })

      if (!menuItem) {
        throw new Error('Menu item not found')
      }

      await this.db.menuItem.update({
        where: { id },
        data: {
          stockCount,
          isAvailable: stockCount > 0 || stockCount === null // Auto-update availability
        }
      })

      return {
        success: true,
        data: { message: 'Stock count updated successfully' }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update stock count'
      }
    }
  }

  // === UTILITY METHODS ===

  private formatCategoryResponse(category: any) {
    return {
      ...category,
      menuItemCount: category.menuItems?.length || 0
    }
  }

  private formatMenuItemResponse(menuItem: any) {
    return {
      ...menuItem,
      tags: menuItem.tags ? JSON.parse(menuItem.tags) : [],
      allergens: menuItem.allergens ? JSON.parse(menuItem.allergens) : [],
      nutritionInfo: menuItem.nutritionInfo ? JSON.parse(menuItem.nutritionInfo) : null,
      effectivePrice: menuItem.salePrice || menuItem.price,
      profitMargin: menuItem.cost ? ((menuItem.price - menuItem.cost) / menuItem.price * 100) : null,
      isLowStock: menuItem.stockCount !== null && menuItem.minStock && menuItem.stockCount <= menuItem.minStock
    }
  }
}

export const menuService = new MenuService()