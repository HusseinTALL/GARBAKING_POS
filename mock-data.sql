-- Garbaking POS demo dataset
-- Execute this script against the MySQL instance used by the Spring Boot services.
-- Recommended schema: garbaking_db

CREATE DATABASE IF NOT EXISTS garbaking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

SET NAMES utf8mb4;
USE garbaking_db;

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(50) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  store_id VARCHAR(100),
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS suppliers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  contact_name VARCHAR(150),
  contact_email VARCHAR(150),
  contact_phone VARCHAR(50),
  website VARCHAR(255),
  lead_time_days INT,
  preferred TINYINT(1) NOT NULL DEFAULT 0,
  notes VARCHAR(1000),
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500),
  image_url VARCHAR(255),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  display_order INT NOT NULL DEFAULT 0,
  color VARCHAR(50),
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS menu_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  category_id BIGINT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(1000),
  sku VARCHAR(50) UNIQUE,
  price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2),
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  stock_quantity INT NOT NULL DEFAULT 0,
  low_stock_threshold INT,
  unit VARCHAR(50),
  preparation_time INT,
  calories INT,
  allergens VARCHAR(500),
  ingredients VARCHAR(500),
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  display_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  CONSTRAINT fk_menu_items_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS menu_item_images (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  menu_item_id BIGINT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  storage_path VARCHAR(500),
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  display_order INT NOT NULL DEFAULT 0,
  alt_text VARCHAR(100),
  created_at DATETIME NOT NULL,
  CONSTRAINT fk_menu_item_images_menu_item FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS menu_item_suppliers (
  menu_item_id BIGINT NOT NULL,
  supplier_id BIGINT NOT NULL,
  PRIMARY KEY (menu_item_id, supplier_id),
  CONSTRAINT fk_menu_supplier_menu_item FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
  CONSTRAINT fk_menu_supplier_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inventory_audits (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  menu_item_id BIGINT NOT NULL,
  menu_item_name VARCHAR(150) NOT NULL,
  change_quantity INT NOT NULL,
  previous_quantity INT NOT NULL,
  new_quantity INT NOT NULL,
  reason VARCHAR(500),
  source VARCHAR(40) NOT NULL,
  performed_by VARCHAR(100),
  created_at DATETIME NOT NULL,
  CONSTRAINT fk_inventory_audit_menu_item FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL,
  order_type VARCHAR(20) NOT NULL,
  user_id BIGINT NOT NULL,
  customer_name VARCHAR(150),
  customer_phone VARCHAR(50),
  customer_email VARCHAR(255),
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(20) NOT NULL,
  payment_method VARCHAR(20),
  transaction_id VARCHAR(100),
  paid_at DATETIME,
  delivery_address VARCHAR(500),
  delivery_instructions VARCHAR(1000),
  delivery_fee DECIMAL(10,2),
  notes VARCHAR(1000),
  table_number VARCHAR(50),
  estimated_preparation_time INT,
  scheduled_for DATETIME,
  confirmed_at DATETIME,
  completed_at DATETIME,
  cancelled_at DATETIME,
  cancellation_reason VARCHAR(500),
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT NOT NULL,
  menu_item_id BIGINT NOT NULL,
  menu_item_name VARCHAR(150) NOT NULL,
  menu_item_sku VARCHAR(50),
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  special_instructions VARCHAR(1000),
  status VARCHAR(20) NOT NULL,
  created_at DATETIME NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_menu_item FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Clean existing data
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM menu_item_suppliers;
DELETE FROM menu_item_images;
DELETE FROM menu_items;
DELETE FROM inventory_audits;
DELETE FROM suppliers;
DELETE FROM categories;
DELETE FROM users;

SET FOREIGN_KEY_CHECKS = 1;

-- Seed users
INSERT INTO users (id, name, email, password, phone, role, is_active, store_id, created_at, updated_at) VALUES
  (1, 'Amelia Baker', 'amelia.baker@garbaking.com', '$2a$10$2gnI2w1VJUKbzEuKXXSb.uSqSK3Vdv4U.eoeB.Xyl8GMMrhEv0tQ2', '+22670012345', 'ADMIN', 1, 'GARBAKING_MAIN', NOW() - INTERVAL 45 DAY, NOW() - INTERVAL 1 DAY),
  (2, 'Noah Clerk', 'noah.clerk@garbaking.com', '$2a$10$2gnI2w1VJUKbzEuKXXSb.uSqSK3Vdv4U.eoeB.Xyl8GMMrhEv0tQ2', '+22670987654', 'CASHIER', 1, 'GARBAKING_MAIN', NOW() - INTERVAL 30 DAY, NOW() - INTERVAL 2 DAY),
  (3, 'Lina Chef', 'lina.chef@garbaking.com', '$2a$10$2gnI2w1VJUKbzEuKXXSb.uSqSK3Vdv4U.eoeB.Xyl8GMMrhEv0tQ2', '+22670112233', 'KITCHEN', 1, 'GARBAKING_MAIN', NOW() - INTERVAL 28 DAY, NOW()),
  (4, 'Oumar Customer', 'oumar.customer@garbaking.com', '$2a$10$2gnI2w1VJUKbzEuKXXSb.uSqSK3Vdv4U.eoeB.Xyl8GMMrhEv0tQ2', '+22670554433', 'CUSTOMER', 1, 'GARBAKING_MAIN', NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 1 DAY);

-- Seed suppliers
INSERT INTO suppliers (id, name, contact_name, contact_email, contact_phone, website, lead_time_days, preferred, notes, created_at, updated_at) VALUES
  (1, 'La Ferme Beurre', 'Marie Dubois', 'marie@lafermebeurre.com', '+22670204010', 'https://lafermebeurre.example', 2, 1, 'Premium butter and cream deliveries twice a week.', NOW() - INTERVAL 35 DAY, NOW() - INTERVAL 2 DAY),
  (2, 'Café Doux Afrique', 'Adama Koffi', 'adama@cafedoux.africa', '+22670332255', 'https://cafedoux.africa', 5, 1, 'Single-origin beans roasted weekly.', NOW() - INTERVAL 30 DAY, NOW() - INTERVAL 2 DAY);

-- Seed categories
INSERT INTO categories (id, name, description, image_url, is_active, display_order, color, created_at, updated_at) VALUES
  (1, 'Artisan Pastries', 'Freshly baked croissants, brioches and viennoiseries', NULL, 1, 1, '#F59E0B', NOW() - INTERVAL 40 DAY, NOW() - INTERVAL 1 DAY),
  (2, 'Signature Sandwiches', 'Garbaking favourites prepared with homemade breads', NULL, 1, 2, '#10B981', NOW() - INTERVAL 38 DAY, NOW() - INTERVAL 1 DAY),
  (3, 'Hot & Cold Beverages', 'Specialty coffees, juices and drinks', NULL, 1, 3, '#3B82F6', NOW() - INTERVAL 37 DAY, NOW() - INTERVAL 1 DAY);

-- Seed menu items
INSERT INTO menu_items (id, name, description, sku, price, cost_price, category_id, is_available, is_active, stock_quantity, low_stock_threshold, unit, preparation_time, calories, allergens, ingredients, is_featured, display_order, created_at, updated_at) VALUES
  (1, 'Classic Butter Croissant', 'Layers of laminated dough baked with AOP butter.', 'CRS-001', 3.50, 1.20, 1, 1, 1, 120, 30, 'piece', 12, 320, 'Gluten, Dairy', 'Flour, butter, milk, yeast, sugar, salt', 1, 1, NOW() - INTERVAL 30 DAY, NOW()),
  (2, 'Pain au Chocolat', 'Flaky pastry with premium dark chocolate sticks.', 'CRS-002', 3.80, 1.40, 1, 1, 1, 90, 25, 'piece', 14, 360, 'Gluten, Dairy, Soy', 'Flour, butter, chocolate, eggs, sugar, yeast', 0, 2, NOW() - INTERVAL 30 DAY, NOW()),
  (3, 'Roasted Turkey Baguette', 'Sourdough baguette with roasted turkey and herb mayo.', 'SND-101', 8.90, 3.60, 2, 1, 1, 45, 10, 'sandwich', 6, 540, 'Gluten, Eggs', 'Sourdough bread, turkey, onions, arugula, herb mayo', 0, 1, NOW() - INTERVAL 25 DAY, NOW()),
  (4, 'Mediterranean Veggie Panini', 'Grilled ciabatta with marinated vegetables and feta.', 'SND-105', 7.80, 3.10, 2, 1, 1, 38, 8, 'sandwich', 5, 480, 'Gluten, Dairy', 'Ciabatta, zucchini, bell peppers, eggplant, feta, pesto', 0, 2, NOW() - INTERVAL 25 DAY, NOW()),
  (5, 'Vanilla Bean Latte', 'Double espresso with steamed milk and vanilla.', 'BEV-210', 4.60, 1.05, 3, 1, 1, 200, 40, 'cup', 3, 190, 'Dairy', 'Espresso, milk, vanilla syrup', 1, 1, NOW() - INTERVAL 25 DAY, NOW()),
  (6, 'Hibiscus Iced Tea', 'Hibiscus infusion with orange zest and mint.', 'BEV-305', 3.90, 0.90, 3, 1, 1, 150, 35, 'cup', 2, 80, NULL, 'Hibiscus petals, orange zest, mint, cane sugar', 0, 2, NOW() - INTERVAL 20 DAY, NOW());

INSERT INTO menu_item_suppliers (menu_item_id, supplier_id) VALUES
  (1, 1),
  (2, 1),
  (5, 2);

-- Seed orders
INSERT INTO orders (id, order_number, status, order_type, user_id, customer_name, customer_phone, customer_email, subtotal, tax_amount, discount_amount, total_amount, payment_status, payment_method, transaction_id, paid_at, delivery_address, delivery_instructions, delivery_fee, notes, table_number, estimated_preparation_time, scheduled_for, confirmed_at, completed_at, cancelled_at, cancellation_reason, created_at, updated_at)
VALUES
  (1, CONCAT('ORD-', CURDATE(), '-0001'), 'COMPLETED', 'DINE_IN', 1, 'Amelia Baker', '+22670012345', 'amelia.baker@garbaking.com', 11.60, 1.52, 0.00, 13.12, 'PAID', 'CARD', 'TXN-001', NOW() - INTERVAL 28 MINUTE, NULL, NULL, NULL, 'Customer asked for extra warm milk on the side.', 'Table 4', 20, NULL, NOW() - INTERVAL 40 MINUTE, NOW() - INTERVAL 10 MINUTE, NULL, NULL, NOW() - INTERVAL 45 MINUTE, NOW() - INTERVAL 10 MINUTE),
  (2, CONCAT('ORD-', CURDATE(), '-0008'), 'PREPARING', 'TAKEAWAY', 2, 'Noah Clerk', '+22670987654', 'noah.clerk@garbaking.com', 20.60, 2.08, 1.50, 21.18, 'PAID', 'CARD', 'TXN-002', NOW() - INTERVAL 90 MINUTE, NULL, NULL, NULL, 'Pack with compostable utensils. Customer arriving at noon.', NULL, 15, NULL, NOW() - INTERVAL 2 HOUR, NULL, NULL, NULL, NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 90 MINUTE),
  (3, CONCAT('ORD-', CURDATE(), '-0015'), 'READY', 'DELIVERY', 4, 'Oumar Customer', '+22670554433', 'oumar.customer@garbaking.com', 43.40, 4.90, 0.00, 51.80, 'PAID', 'MOBILE_MONEY', 'TXN-003', NOW() - INTERVAL 45 MINUTE, 'Villa 17, Rue des Marronniers, Riviera 3', 'Call when arriving, guard has instructions.', 3.50, 'Deliver with insulated bag.', NULL, 25, NULL, NOW() - INTERVAL 75 MINUTE, NULL, NULL, NULL, NOW() - INTERVAL 80 MINUTE, NOW() - INTERVAL 45 MINUTE),
  (4, CONCAT('ORD-', CURDATE(), '-0020'), 'PENDING', 'DINE_IN', 3, 'Lina Chef', '+22670112233', 'lina.chef@garbaking.com', 8.10, 0.82, 0.00, 8.92, 'PENDING', 'CASH', NULL, NULL, NULL, NULL, NULL, NULL, 'Table 7', 10, NULL, NOW() - INTERVAL 25 MINUTE, NULL, NULL, NULL, NOW() - INTERVAL 25 MINUTE, NOW() - INTERVAL 25 MINUTE),
  (5, CONCAT('ORD-', CURDATE(), '-0025'), 'CANCELLED', 'TAKEAWAY', 4, 'Oumar Customer', '+22670554433', 'oumar.customer@garbaking.com', 25.40, 2.45, 0.00, 27.85, 'REFUNDED', 'CARD', 'TXN-004', NULL, NULL, NULL, NULL, 'Customer called to cancel due to change of plans', NULL, 20, NULL, NOW() - INTERVAL 1 DAY, NULL, NOW() - INTERVAL 1 DAY + INTERVAL 10 MINUTE, 'Customer change of plans', NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY + INTERVAL 10 MINUTE);

-- Seed order items
INSERT INTO order_items (id, order_id, menu_item_id, menu_item_name, menu_item_sku, quantity, unit_price, subtotal, special_instructions, status, created_at) VALUES
  (1, 1, 1, 'Classic Butter Croissant', 'CRS-001', 2, 3.50, 7.00, 'Serve warm', 'SERVED', NOW() - INTERVAL 40 MINUTE),
  (2, 1, 5, 'Vanilla Bean Latte', 'BEV-210', 1, 4.60, 4.60, 'Extra warm milk on the side', 'SERVED', NOW() - INTERVAL 38 MINUTE),
  (3, 2, 3, 'Roasted Turkey Baguette', 'SND-101', 1, 8.90, 8.90, NULL, 'PREPARING', NOW() - INTERVAL 2 HOUR),
  (4, 2, 4, 'Mediterranean Veggie Panini', 'SND-105', 1, 7.80, 7.80, NULL, 'PREPARING', NOW() - INTERVAL 2 HOUR),
  (5, 2, 6, 'Hibiscus Iced Tea', 'BEV-305', 2, 3.90, 7.80, 'Less ice', 'PENDING', NOW() - INTERVAL 105 MINUTE),
  (6, 3, 1, 'Classic Butter Croissant', 'CRS-001', 6, 3.50, 21.00, 'Deliver warm', 'READY', NOW() - INTERVAL 75 MINUTE),
  (7, 3, 2, 'Pain au Chocolat', 'CRS-002', 4, 3.80, 15.20, NULL, 'READY', NOW() - INTERVAL 74 MINUTE),
  (8, 3, 6, 'Hibiscus Iced Tea', 'BEV-305', 4, 3.90, 15.60, 'Add reusable cups', 'READY', NOW() - INTERVAL 70 MINUTE),
  (9, 4, 5, 'Vanilla Bean Latte', 'BEV-210', 1, 4.60, 4.60, NULL, 'PENDING', NOW() - INTERVAL 25 MINUTE),
  (10, 4, 1, 'Classic Butter Croissant', 'CRS-001', 1, 3.50, 3.50, NULL, 'PENDING', NOW() - INTERVAL 24 MINUTE),
  (11, 5, 3, 'Roasted Turkey Baguette', 'SND-101', 2, 8.90, 17.80, NULL, 'PENDING', NOW() - INTERVAL 1 DAY),
  (12, 5, 6, 'Hibiscus Iced Tea', 'BEV-305', 2, 3.90, 7.80, NULL, 'PENDING', NOW() - INTERVAL 1 DAY);

-- Seed inventory audits
INSERT INTO inventory_audits (id, menu_item_id, menu_item_name, change_quantity, previous_quantity, new_quantity, reason, source, performed_by, created_at) VALUES
  (1, 1, 'Classic Butter Croissant', -10, 120, 110, 'Morning prep usage', 'INVENTORY_SERVICE', 'Amelia Baker', NOW() - INTERVAL 4 HOUR),
  (2, 6, 'Hibiscus Iced Tea', 20, 130, 150, 'Batch preparation', 'INVENTORY_SERVICE', 'Noah Clerk', NOW() - INTERVAL 3 HOUR),
  (3, 5, 'Vanilla Bean Latte', -15, 200, 185, 'High demand', 'INVENTORY_SERVICE', 'Lina Chef', NOW() - INTERVAL 2 HOUR);

COMMIT;
