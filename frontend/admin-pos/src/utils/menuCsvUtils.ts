/**
 * Utility functions for CSV import/export of menu items
 * Provides comprehensive menu data management via CSV files
 */

import type { MenuItem } from '@/stores/menu'

export interface MenuItemCsvRow {
  name: string
  sku: string
  description: string
  price: number
  cost?: number
  categoryId: string
  categoryName?: string
  imageUrl?: string
  isAvailable: boolean
  isFeatured?: boolean
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
  isSpicy?: boolean
  prepTime?: number
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  allergens?: string
  stockCount?: number
  minStock?: number
}

/**
 * Export menu items to CSV format
 */
export function exportMenuItemsToCSV(items: MenuItem[], categories: any[]): string {
  // Define CSV headers
  const headers = [
    'Name',
    'SKU',
    'Description',
    'Price',
    'Cost',
    'Category',
    'Image URL',
    'Available',
    'Featured',
    'Vegetarian',
    'Vegan',
    'Gluten Free',
    'Spicy',
    'Prep Time (min)',
    'Calories',
    'Protein (g)',
    'Carbs (g)',
    'Fat (g)',
    'Allergens',
    'Stock Count',
    'Min Stock'
  ]

  // Build CSV rows
  const rows = items.map(item => {
    const category = categories.find(c => c.id === item.categoryId)
    const nutritionInfo = item.nutritionInfo ?
      (typeof item.nutritionInfo === 'string' ? JSON.parse(item.nutritionInfo) : item.nutritionInfo) :
      {}

    return [
      escapeCSV(item.name),
      escapeCSV(item.sku),
      escapeCSV(item.description || ''),
      item.price,
      item.cost || '',
      escapeCSV(category?.name || item.categoryId),
      escapeCSV(item.imageUrl || ''),
      item.isAvailable ? 'Yes' : 'No',
      (item as any).isFeatured ? 'Yes' : 'No',
      (item as any).isVegetarian ? 'Yes' : 'No',
      (item as any).isVegan ? 'Yes' : 'No',
      (item as any).isGlutenFree ? 'Yes' : 'No',
      (item as any).isSpicy ? 'Yes' : 'No',
      (item as any).prepTime || '',
      nutritionInfo.calories || '',
      nutritionInfo.protein || '',
      nutritionInfo.carbs || '',
      nutritionInfo.fat || '',
      escapeCSV((item as any).allergens || ''),
      (item as any).stockCount !== undefined && (item as any).stockCount !== null ? (item as any).stockCount : '',
      (item as any).minStock || ''
    ].join(',')
  })

  // Combine headers and rows
  return [headers.join(','), ...rows].join('\n')
}

/**
 * Parse CSV content to menu items array
 */
export function parseCSVToMenuItems(csvContent: string, categories: any[]): {
  items: Partial<MenuItemCsvRow>[]
  errors: string[]
} {
  const lines = csvContent.split('\n').filter(line => line.trim())
  const errors: string[] = []
  const items: Partial<MenuItemCsvRow>[] = []

  if (lines.length < 2) {
    errors.push('CSV file is empty or has no data rows')
    return { items, errors }
  }

  // Skip header row
  const dataLines = lines.slice(1)

  dataLines.forEach((line, index) => {
    const rowNumber = index + 2 // +2 because we skipped header and arrays are 0-indexed

    try {
      const values = parseCSVLine(line)

      if (values.length < 7) {
        errors.push(`Row ${rowNumber}: Insufficient columns (expected at least 7, got ${values.length})`)
        return
      }

      // Find category by name
      const categoryName = values[5].trim()
      const category = categories.find(c =>
        c.name.toLowerCase() === categoryName.toLowerCase()
      )

      if (!category) {
        errors.push(`Row ${rowNumber}: Category "${categoryName}" not found`)
      }

      // Parse booleans
      const isAvailable = parseBoolean(values[7])
      const isFeatured = parseBoolean(values[8])
      const isVegetarian = parseBoolean(values[9])
      const isVegan = parseBoolean(values[10])
      const isGlutenFree = parseBoolean(values[11])
      const isSpicy = parseBoolean(values[12])

      // Validate required fields
      if (!values[0].trim()) {
        errors.push(`Row ${rowNumber}: Name is required`)
        return
      }

      if (!values[1].trim()) {
        errors.push(`Row ${rowNumber}: SKU is required`)
        return
      }

      const price = parseFloat(values[3])
      if (isNaN(price) || price <= 0) {
        errors.push(`Row ${rowNumber}: Invalid price "${values[3]}"`)
        return
      }

      // Build item object
      const item: Partial<MenuItemCsvRow> = {
        name: values[0].trim(),
        sku: values[1].trim().toUpperCase(),
        description: values[2].trim(),
        price: price,
        cost: values[4] ? parseFloat(values[4]) : undefined,
        categoryId: category?.id || '',
        categoryName: categoryName,
        imageUrl: values[6].trim() || undefined,
        isAvailable,
        isFeatured,
        isVegetarian,
        isVegan,
        isGlutenFree,
        isSpicy,
        prepTime: values[13] ? parseInt(values[13]) : undefined,
        calories: values[14] ? parseInt(values[14]) : undefined,
        protein: values[15] ? parseFloat(values[15]) : undefined,
        carbs: values[16] ? parseFloat(values[16]) : undefined,
        fat: values[17] ? parseFloat(values[17]) : undefined,
        allergens: values[18]?.trim() || undefined,
        stockCount: values[19] ? parseInt(values[19]) : undefined,
        minStock: values[20] ? parseInt(values[20]) : undefined
      }

      items.push(item)
    } catch (error: any) {
      errors.push(`Row ${rowNumber}: ${error.message}`)
    }
  })

  return { items, errors }
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

/**
 * Generate CSV template with sample data
 */
export function generateCSVTemplate(categories: any[]): string {
  const headers = [
    'Name',
    'SKU',
    'Description',
    'Price',
    'Cost',
    'Category',
    'Image URL',
    'Available',
    'Featured',
    'Vegetarian',
    'Vegan',
    'Gluten Free',
    'Spicy',
    'Prep Time (min)',
    'Calories',
    'Protein (g)',
    'Carbs (g)',
    'Fat (g)',
    'Allergens',
    'Stock Count',
    'Min Stock'
  ]

  const sampleCategory = categories.length > 0 ? categories[0].name : 'Burgers'

  const sampleRows = [
    [
      'Classic Burger',
      'BRG001',
      'Juicy beef patty with lettuce, tomato, and special sauce',
      '12.99',
      '5.50',
      sampleCategory,
      'https://example.com/burger.jpg',
      'Yes',
      'No',
      'No',
      'No',
      'No',
      'No',
      '15',
      '650',
      '28',
      '45',
      '32',
      'Gluten, Dairy',
      '50',
      '10'
    ],
    [
      'Vegan Salad',
      'SLD001',
      'Fresh mixed greens with organic vegetables',
      '9.99',
      '4.00',
      sampleCategory,
      '',
      'Yes',
      'Yes',
      'Yes',
      'Yes',
      'Yes',
      'No',
      '5',
      '180',
      '5',
      '12',
      '8',
      'None',
      '',
      ''
    ]
  ]

  const rows = sampleRows.map(row => row.map(escapeCSV).join(','))

  return [headers.join(','), ...rows].join('\n')
}

/**
 * Helper: Escape CSV field
 */
function escapeCSV(field: any): string {
  if (field === null || field === undefined) {
    return ''
  }

  const str = String(field)

  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }

  return str
}

/**
 * Helper: Parse CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let currentValue = ''
  let insideQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        currentValue += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote mode
        insideQuotes = !insideQuotes
      }
    } else if (char === ',' && !insideQuotes) {
      // Field separator
      values.push(currentValue)
      currentValue = ''
    } else {
      currentValue += char
    }
  }

  // Push last value
  values.push(currentValue)

  return values
}

/**
 * Helper: Parse boolean from string
 */
function parseBoolean(value: string): boolean {
  const normalized = value.trim().toLowerCase()
  return normalized === 'yes' || normalized === 'true' || normalized === '1'
}

/**
 * Validate menu item data
 */
export function validateMenuItem(item: Partial<MenuItemCsvRow>): string[] {
  const errors: string[] = []

  if (!item.name || item.name.trim().length === 0) {
    errors.push('Name is required')
  }

  if (!item.sku || item.sku.trim().length === 0) {
    errors.push('SKU is required')
  }

  if (!item.price || item.price <= 0) {
    errors.push('Price must be greater than 0')
  }

  if (!item.categoryId || item.categoryId.trim().length === 0) {
    errors.push('Category is required')
  }

  if (item.cost && item.cost >= (item.price || 0)) {
    errors.push('Cost should be less than price')
  }

  return errors
}
