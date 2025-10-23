/**
 * Vue i18n internationalization setup
 * Configures French and English translations with localStorage persistence
 */

import { createI18n } from 'vue-i18n'

// Pre-compile messages to avoid runtime compilation
const messages = {
  en: {
    "welcome": "Welcome to Garbaking",
    "place_order": "Place Order",
    "cart": "Your Cart",
    "menu": "Menu",
    "order_history": "Order History",
    "order": "Order",
    "order_items": "Order Items",
    "total": "Total",
    "subtotal": "Subtotal",
    "add_to_cart": "Add to Cart",
    "remove_from_cart": "Remove from Cart",
    "table_number": "Table Number",
    "customer_name": "Customer Name",
    "order_submitted": "Order Submitted Successfully",
    "order_accepted": "Order Accepted",
    "order_preparing": "Order Being Prepared",
    "order_ready": "Order Ready for Pickup",
    "order_ready_pickup": "Your order is ready for pickup!",
    "estimated_time": "Estimated time",
    "minutes": "minutes",
    "loading": "Loading...",
    "no_orders": "No Orders Yet",
    "no_orders_description": "Your order history will appear here",
    "mark_collected": "Mark as Collected",
    "retry_sync": "Retry Sync",
    "syncing": "Syncing...",
    "categories": {
      "all": "All",
      "mains": "Main Dishes",
      "drinks": "Beverages",
      "desserts": "Desserts",
      "appetizers": "Appetizers"
    },
    "dietary_tags": {
      "vegetarian": "Vegetarian",
      "vegan": "Vegan",
      "gluten_free": "Gluten Free",
      "spicy": "Spicy",
      "dairy_free": "Dairy Free"
    },
    "status": {
      "queued": "Queued",
      "synced": "Synced"
    },
    "time": {
      "just_now": "Just now",
      "minutes_ago": "{count} min ago",
      "hours_ago": "{count}h ago",
      "days_ago": "{count}d ago",
      "yesterday": "Yesterday"
    },
    "notifications": {
      "item_added": "Item added to cart",
      "item_removed": "Item removed from cart",
      "order_queued": "Order queued for sync",
      "order_synced": "Order synced successfully",
      "offline_mode": "You are currently offline",
      "pending_sync": "Pending sync"
    },
    "buttons": {
      "submit": "Submit Order",
      "cancel": "Cancel",
      "clear_cart": "Clear Cart",
      "back": "Back",
      "continue": "Continue",
      "close": "Close",
      "refresh": "Refresh",
      "switch_language": "Switch Language"
    },
    "placeholders": {
      "enter_table": "Enter table number (1-20)",
      "enter_name": "Enter your name"
    },
    "errors": {
      "table_required": "Table number is required",
      "name_required": "Name is required",
      "invalid_table": "Please enter a valid table number (1-20)",
      "cart_empty": "Your cart is empty"
    },
    "no_items": "No items in this category",
    "cart_cleared": "Cart cleared",
    "submitting_order": "Submitting order...",
    "all": "All"
  },
  fr: {
    "welcome": "Bienvenue chez Garbaking",
    "place_order": "Commander",
    "cart": "Votre Panier",
    "menu": "Menu",
    "order_history": "Historique",
    "order": "Commande",
    "order_items": "Articles commandés",
    "total": "Total",
    "subtotal": "Sous-total",
    "add_to_cart": "Ajouter au panier",
    "remove_from_cart": "Retirer du panier",
    "table_number": "Numéro de table",
    "customer_name": "Nom du client",
    "order_submitted": "Commande envoyée avec succès",
    "order_accepted": "Commande acceptée",
    "order_preparing": "Commande en préparation",
    "order_ready": "Commande prête",
    "order_ready_pickup": "Votre commande est prête !",
    "estimated_time": "Temps estimé",
    "minutes": "minutes",
    "loading": "Chargement...",
    "no_orders": "Aucune commande",
    "no_orders_description": "Votre historique de commandes apparaîtra ici",
    "mark_collected": "Marquer comme récupérée",
    "retry_sync": "Réessayer",
    "syncing": "Synchronisation...",
    "categories": {
      "all": "Tout",
      "mains": "Plats principaux",
      "drinks": "Boissons",
      "desserts": "Desserts",
      "appetizers": "Entrées"
    },
    "dietary_tags": {
      "vegetarian": "Végétarien",
      "vegan": "Végétalien",
      "gluten_free": "Sans gluten",
      "spicy": "Épicé",
      "dairy_free": "Sans lactose"
    },
    "status": {
      "queued": "En attente",
      "synced": "Synchronisée"
    },
    "time": {
      "just_now": "À l'instant",
      "minutes_ago": "Il y a {count} min",
      "hours_ago": "Il y a {count}h",
      "days_ago": "Il y a {count}j",
      "yesterday": "Hier"
    },
    "notifications": {
      "item_added": "Article ajouté au panier",
      "item_removed": "Article retiré du panier",
      "order_queued": "Commande en file d'attente",
      "order_synced": "Commande synchronisée",
      "offline_mode": "Vous êtes actuellement hors ligne",
      "pending_sync": "Synchronisation en attente"
    },
    "buttons": {
      "submit": "Envoyer la commande",
      "cancel": "Annuler",
      "clear_cart": "Vider le panier",
      "back": "Retour",
      "continue": "Continuer",
      "close": "Fermer",
      "refresh": "Actualiser",
      "switch_language": "Changer de langue"
    },
    "placeholders": {
      "enter_table": "Entrez votre numéro de table (1-20)",
      "enter_name": "Entrez votre nom"
    },
    "errors": {
      "table_required": "Le numéro de table est requis",
      "name_required": "Le nom est requis",
      "invalid_table": "Veuillez entrer un numéro de table valide (1-20)",
      "cart_empty": "Votre panier est vide"
    },
    "no_items": "Aucun article dans cette catégorie",
    "cart_cleared": "Panier vidé",
    "submitting_order": "Envoi de la commande...",
    "all": "Tout"
  }
}

// Get saved locale from localStorage or default to French
const savedLocale = localStorage.getItem('locale') || 'fr'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'fr',
  globalInjection: true,
  messages,
  messageCompiler: (message: string) => () => message
})

export default i18n

// Helper function to change locale and persist to localStorage
export function setLocale(locale: 'en' | 'fr') {
  i18n.global.locale.value = locale
  localStorage.setItem('locale', locale)
}

// Helper function to get current locale
export function getCurrentLocale(): string {
  return i18n.global.locale.value
}