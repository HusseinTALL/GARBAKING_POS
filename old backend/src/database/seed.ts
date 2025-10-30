/**
 * Database seeding script for Garbaking POS
 * Creates sample data for development and testing
 */

import bcrypt from 'bcryptjs'
import { getDB } from './init'

async function seedDatabase() {
  const db = getDB()

  console.log('🌱 Starting database seeding...')

  try {
    // Clean existing data (for development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Cleaning existing data...')
      await db.orderItem.deleteMany()
      await db.order.deleteMany()
      await db.menuItem.deleteMany()
      await db.category.deleteMany()
      await db.userSession.deleteMany()
      await db.user.deleteMany()
      await db.dailySales.deleteMany()
      await db.settings.deleteMany()
    }

    // 1. Create default admin user
    console.log('Creating users...')
    const hashedPassword = await bcrypt.hash('admin123', 12)

    const adminUser = await db.user.create({
      data: {
        email: 'admin@garbaking.com',
        password: hashedPassword,
        name: 'Admin Daboy',
        role: 'ADMIN',
        storeId: process.env.STORE_ID || 'store_001'
      }
    })

    const cashierUser = await db.user.create({
      data: {
        email: 'cashier@garbaking.com',
        password: await bcrypt.hash('cashier123', 12),
        name: 'Marie Kouassi',
        role: 'CASHIER',
        storeId: process.env.STORE_ID || 'store_001'
      }
    })

    const kitchenUser = await db.user.create({
      data: {
        email: 'kitchen@garbaking.com',
        password: await bcrypt.hash('kitchen123', 12),
        name: 'Jean Baptiste',
        role: 'KITCHEN_STAFF',
        storeId: process.env.STORE_ID || 'store_001'
      }
    })

    console.log('✅ Users created')

    // 2. Create categories
    console.log('Creating categories...')
    const mainDishCategory = await db.category.create({
      data: {
        name: 'Plats Principaux',
        description: 'Nos délicieux plats traditionnels ivoiriens',
        sortOrder: 1,
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        storeId: process.env.STORE_ID || 'store_001'
      }
    })

    const appetizersCategory = await db.category.create({
      data: {
        name: 'Entrées',
        description: 'Entrées et accompagnements savoureux',
        sortOrder: 2,
        imageUrl: 'https://images.unsplash.com/photo-1597643303045-ba3a2bd075b5?w=400&h=300&fit=crop',
        storeId: process.env.STORE_ID || 'store_001'
      }
    })

    const beveragesCategory = await db.category.create({
      data: {
        name: 'Boissons',
        description: 'Boissons fraîches et chaudes',
        sortOrder: 3,
        imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop',
        storeId: process.env.STORE_ID || 'store_001'
      }
    })

    const dessertsCategory = await db.category.create({
      data: {
        name: 'Desserts',
        description: 'Douceurs et desserts traditionnels',
        sortOrder: 4,
        imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop',
        storeId: process.env.STORE_ID || 'store_001'
      }
    })

    console.log('✅ Categories created')

    // 3. Create menu items
    console.log('Creating menu items...')

    // Main dishes
    const menuItems = [
      // Main Dishes
      {
        sku: 'ATT001',
        name: 'Attiéké + Thon',
        description: 'Couscous de manioc traditionnel servi avec du thon grillé, légumes et sauce pimentée',
        price: 3500,
        cost: 2000,
        categoryId: mainDishCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        isAvailable: true
      },
      {
        sku: 'ATT002',
        name: 'Attiéké + Poulet',
        description: 'Couscous de manioc avec poulet braisé et légumes frais',
        price: 3000,
        cost: 1800,
        categoryId: mainDishCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop',
        isAvailable: true
      },
      {
        sku: 'RIZ001',
        name: 'Riz Gras',
        description: 'Riz parfumé cuit avec de la viande, des légumes et des épices aromatiques',
        price: 2500,
        cost: 1500,
        categoryId: mainDishCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=300&fit=crop',
        isAvailable: true
      },
      {
        sku: 'FOU001',
        name: 'Foutou + Sauce Arachide',
        description: 'Foutou traditionnel accompagné de sauce arachide et viande',
        price: 2800,
        cost: 1600,
        categoryId: mainDishCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
        isAvailable: true
      },
      {
        sku: 'POI001',
        name: 'Poisson Braisé',
        description: 'Poisson frais braisé aux épices avec accompagnement au choix',
        price: 4000,
        cost: 2500,
        categoryId: mainDishCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
        isAvailable: true
      },

      // Appetizers
      {
        sku: 'ALL001',
        name: 'Alloco',
        description: 'Bananes plantains frites servies avec sauce tomate épicée et oignons',
        price: 1500,
        cost: 800,
        categoryId: appetizersCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1597643303045-ba3a2bd075b5?w=400&h=300&fit=crop',
        isAvailable: false // Out of stock for demo
      },
      {
        sku: 'SAL001',
        name: 'Salade Verte',
        description: 'Salade fraîche avec vinaigrette maison',
        price: 1200,
        cost: 600,
        categoryId: appetizersCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
        isAvailable: true
      },
      {
        sku: 'ACC001',
        name: 'Accra de Morue',
        description: 'Beignets de morue épicés, spécialité locale',
        price: 1800,
        cost: 1000,
        categoryId: appetizersCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc6d2c525?w=400&h=300&fit=crop',
        isAvailable: true
      },

      // Beverages
      {
        sku: 'BOI001',
        name: 'Bissap',
        description: 'Boisson fraîche à base d\'hibiscus, rafraîchissante',
        price: 500,
        cost: 200,
        categoryId: beveragesCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop',
        isAvailable: true
      },
      {
        sku: 'CAF001',
        name: 'Café Ivoirien',
        description: 'Café traditionnel ivoirien, riche et aromatique',
        price: 800,
        cost: 300,
        categoryId: beveragesCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop',
        isAvailable: true
      },
      {
        sku: 'THÉ001',
        name: 'Thé à la Menthe',
        description: 'Thé vert parfumé à la menthe fraîche',
        price: 600,
        cost: 250,
        categoryId: beveragesCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop',
        isAvailable: true
      },
      {
        sku: 'EAU001',
        name: 'Eau Minérale',
        description: 'Eau minérale fraîche 50cl',
        price: 300,
        cost: 150,
        categoryId: beveragesCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
        isAvailable: true
      },

      // Desserts
      {
        sku: 'DOU001',
        name: 'Dégué',
        description: 'Dessert traditionnel au mil et lait caillé',
        price: 1000,
        cost: 500,
        categoryId: dessertsCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop',
        isAvailable: true
      },
      {
        sku: 'FRU001',
        name: 'Salade de Fruits',
        description: 'Mélange de fruits tropicaux frais de saison',
        price: 1200,
        cost: 700,
        categoryId: dessertsCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
        isAvailable: true
      }
    ]

    const createdMenuItems = await Promise.all(
      menuItems.map(item => db.menuItem.create({
        data: {
          ...item,
          storeId: process.env.STORE_ID || 'store_001'
        }
      }))
    )

    console.log('✅ Menu items created')

    // 4. Create sample orders
    console.log('Creating sample orders...')

    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Create orders for today
    const todayOrders = [
      {
        orderNumber: '001',
        storeId: process.env.STORE_ID || 'store_001',
        customerName: 'Koffi Adjoumani',
        customerPhone: '+225 07 12 34 56 78',
        tableNumber: 'T01',
        orderType: 'DINE_IN',
        status: 'SERVED',
        paymentStatus: 'PAID',
        userId: cashierUser.id,
        items: [
          { menuItemId: createdMenuItems[0].id, quantity: 1 },
          { menuItemId: createdMenuItems[8].id, quantity: 1 }
        ]
      },
      {
        orderNumber: '002',
        storeId: process.env.STORE_ID || 'store_001',
        customerName: 'Aya Traoré',
        customerPhone: '+225 05 98 76 54 32',
        orderType: 'TAKEAWAY',
        status: 'READY',
        paymentStatus: 'PAID',
        userId: cashierUser.id,
        items: [
          { menuItemId: createdMenuItems[1].id, quantity: 2 },
          { menuItemId: createdMenuItems[9].id, quantity: 2 }
        ]
      },
      {
        orderNumber: '003',
        storeId: process.env.STORE_ID || 'store_001',
        customerName: 'Ibrahim Sanogo',
        tableNumber: 'T05',
        orderType: 'DINE_IN',
        status: 'PREPARING',
        paymentStatus: 'PENDING',
        userId: cashierUser.id,
        items: [
          { menuItemId: createdMenuItems[2].id, quantity: 1 },
          { menuItemId: createdMenuItems[7].id, quantity: 1 },
          { menuItemId: createdMenuItems[13].id, quantity: 1 }
        ]
      }
    ]

    for (const orderData of todayOrders) {
      const { items, ...orderInfo } = orderData

      // Calculate totals
      let subtotal = 0
      const orderItems = []

      for (const item of items) {
        const menuItem = createdMenuItems.find(mi => mi.id === item.menuItemId)!
        const itemTotal = menuItem.price * item.quantity
        subtotal += itemTotal

        orderItems.push({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: menuItem.price,
          totalPrice: itemTotal
        })
      }

      const tax = subtotal * 0.1
      const total = subtotal + tax

      await db.order.create({
        data: {
          ...orderInfo,
          subtotal,
          tax,
          total,
          idempotencyKey: `seed-${orderInfo.orderNumber}`,
          syncStatus: 'SYNCED',
          orderItems: {
            create: orderItems
          }
        }
      })
    }

    // Create yesterday's orders for analytics
    const yesterdayOrders = [
      {
        orderNumber: 'Y001',
        storeId: process.env.STORE_ID || 'store_001',
        customerName: 'Fatou Diallo',
        orderType: 'DINE_IN',
        status: 'SERVED',
        paymentStatus: 'PAID',
        userId: cashierUser.id,
        createdAt: yesterday,
        items: [
          { menuItemId: createdMenuItems[0].id, quantity: 1 },
          { menuItemId: createdMenuItems[8].id, quantity: 1 }
        ]
      }
    ]

    for (const orderData of yesterdayOrders) {
      const { items, ...orderInfo } = orderData

      let subtotal = 0
      const orderItems = []

      for (const item of items) {
        const menuItem = createdMenuItems.find(mi => mi.id === item.menuItemId)!
        const itemTotal = menuItem.price * item.quantity
        subtotal += itemTotal

        orderItems.push({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: menuItem.price,
          totalPrice: itemTotal
        })
      }

      const tax = subtotal * 0.1
      const total = subtotal + tax

      await db.order.create({
        data: {
          ...orderInfo,
          subtotal,
          tax,
          total,
          idempotencyKey: `seed-${orderInfo.orderNumber}`,
          syncStatus: 'SYNCED',
          orderItems: {
            create: orderItems
          }
        }
      })
    }

    console.log('✅ Sample orders created')

    // 5. Create daily sales summary
    console.log('Creating daily sales summary...')

    const todayStart = new Date(today)
    todayStart.setHours(0, 0, 0, 0)
    const tomorrowStart = new Date(todayStart)
    tomorrowStart.setDate(tomorrowStart.getDate() + 1)

    const todayStats = await db.order.aggregate({
      where: {
        storeId: process.env.STORE_ID || 'store_001',
        createdAt: {
          gte: todayStart,
          lt: tomorrowStart
        },
        status: { not: 'CANCELLED' }
      },
      _count: true,
      _sum: {
        total: true,
        tax: true
      },
      _avg: {
        total: true
      }
    })

    const cashSales = await db.order.aggregate({
      where: {
        storeId: process.env.STORE_ID || 'store_001',
        createdAt: {
          gte: todayStart,
          lt: tomorrowStart
        },
        paymentStatus: 'PAID'
      },
      _sum: {
        total: true
      }
    })

    const cardSales = await db.order.aggregate({
      where: {
        storeId: process.env.STORE_ID || 'store_001',
        createdAt: {
          gte: todayStart,
          lt: tomorrowStart
        },
        paymentStatus: 'PAID'
      },
      _sum: {
        total: true
      }
    })

    await db.dailySales.create({
      data: {
        date: todayStart,
        storeId: process.env.STORE_ID || 'store_001',
        totalOrders: todayStats._count,
        totalRevenue: todayStats._sum.total || 0,
        totalTax: todayStats._sum.tax || 0,
        averageOrder: todayStats._avg.total || 0,
        cashSales: cashSales._sum?.total || 0,
        cardSales: cardSales._sum?.total || 0
      }
    })

    console.log('✅ Daily sales summary created')

    console.log('\n🎉 Database seeding completed successfully!')
    console.log('\n📋 Sample Accounts Created:')
    console.log('Admin: admin@garbaking.com / admin123')
    console.log('Cashier: cashier@garbaking.com / cashier123')
    console.log('Kitchen: kitchen@garbaking.com / kitchen123')
    console.log('\n📊 Sample Data:')
    console.log(`- ${menuItems.length} menu items across 4 categories`)
    console.log('- 4 sample orders (3 today, 1 yesterday)')
    console.log('- Daily sales summary')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
}

export default seedDatabase