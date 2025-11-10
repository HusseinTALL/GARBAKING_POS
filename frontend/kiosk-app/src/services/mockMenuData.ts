/**
 * Mock menu data for development and offline mode
 * Provides realistic menu categories and items when backend is unavailable
 */
import type { MenuItem, MenuCategory } from '@/types'

export const mockCategories: MenuCategory[] = [
  {
    id: '1',
    name: 'Pizzas',
    displayOrder: 0,
    color: '#F59E0B'
  },
  {
    id: '2',
    name: 'Burgers',
    displayOrder: 1,
    color: '#EF4444'
  },
  {
    id: '3',
    name: 'Desserts',
    displayOrder: 2,
    color: '#EC4899'
  },
  {
    id: '4',
    name: 'Boissons',
    displayOrder: 3,
    color: '#3B82F6'
  }
]

export const mockMenuItems: MenuItem[] = [
  // Pizzas
  {
    id: '1',
    name: 'Pizza Margherita',
    description: 'Sauce tomate, mozzarella, basilic frais',
    price: 12.99,
    categoryId: '1',
    categoryName: 'Pizzas',
    imageUrl: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800',
    available: true,
    popular: true
  },
  {
    id: '2',
    name: 'Pizza Pepperoni',
    description: 'Sauce tomate, mozzarella, pepperoni épicé',
    price: 14.99,
    categoryId: '1',
    categoryName: 'Pizzas',
    imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800',
    available: true,
    popular: true
  },
  {
    id: '3',
    name: 'Pizza Quatre Fromages',
    description: 'Mozzarella, gorgonzola, parmesan, chèvre',
    price: 15.99,
    categoryId: '1',
    categoryName: 'Pizzas',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    available: true
  },
  {
    id: '4',
    name: 'Pizza Végétarienne',
    description: 'Légumes grillés, champignons, olives, poivrons',
    price: 13.99,
    categoryId: '1',
    categoryName: 'Pizzas',
    imageUrl: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96c47?w=800',
    available: true
  },

  // Burgers
  {
    id: '5',
    name: 'Burger Classique',
    description: 'Bœuf 180g, laitue, tomate, oignon, cornichons',
    price: 11.99,
    categoryId: '2',
    categoryName: 'Burgers',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    available: true,
    popular: true
  },
  {
    id: '6',
    name: 'Burger Bacon',
    description: 'Bœuf 180g, bacon croustillant, cheddar, sauce BBQ',
    price: 13.99,
    categoryId: '2',
    categoryName: 'Burgers',
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800',
    available: true
  },
  {
    id: '7',
    name: 'Burger Poulet',
    description: 'Filet de poulet pané, salade, tomate, mayo',
    price: 10.99,
    categoryId: '2',
    categoryName: 'Burgers',
    imageUrl: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800',
    available: true
  },

  // Desserts
  {
    id: '8',
    name: 'Brownie Chocolat',
    description: 'Brownie fondant au chocolat noir, glace vanille',
    price: 6.99,
    categoryId: '3',
    categoryName: 'Desserts',
    imageUrl: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=800',
    available: true
  },
  {
    id: '9',
    name: 'Tiramisu',
    description: 'Tiramisu maison, café, mascarpone, cacao',
    price: 7.99,
    categoryId: '3',
    categoryName: 'Desserts',
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800',
    available: true,
    popular: true
  },
  {
    id: '10',
    name: 'Cheesecake',
    description: 'Cheesecake new-yorkais, coulis de fruits rouges',
    price: 7.49,
    categoryId: '3',
    categoryName: 'Desserts',
    imageUrl: 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=800',
    available: true
  },

  // Boissons
  {
    id: '11',
    name: 'Coca-Cola',
    description: 'Coca-Cola 33cl',
    price: 3.50,
    categoryId: '4',
    categoryName: 'Boissons',
    imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800',
    available: true
  },
  {
    id: '12',
    name: 'Jus d\'Orange',
    description: 'Jus d\'orange pressé 25cl',
    price: 4.50,
    categoryId: '4',
    categoryName: 'Boissons',
    imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800',
    available: true
  },
  {
    id: '13',
    name: 'Eau Minérale',
    description: 'Eau minérale 50cl',
    price: 2.50,
    categoryId: '4',
    categoryName: 'Boissons',
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800',
    available: true
  }
]
