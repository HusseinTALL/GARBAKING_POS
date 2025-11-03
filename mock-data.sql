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
  (1, 'Plats Authentiques', 'Recettes signature autour du garba, poisson et poulet épicé', NULL, 1, 1, '#EA580C', NOW() - INTERVAL 40 DAY, NOW() - INTERVAL 1 DAY),
  (2, 'Snacks & Street Food', 'Alloco, sandwichs et encas croustillants', NULL, 1, 2, '#FACC15', NOW() - INTERVAL 38 DAY, NOW() - INTERVAL 1 DAY),
  (3, 'Boissons Rafraîchissantes', 'Jus maison, boissons gingembre et smoothies', NULL, 1, 3, '#3B82F6', NOW() - INTERVAL 37 DAY, NOW() - INTERVAL 1 DAY),
  (4, 'Desserts & Douceurs', 'Cakes banane, assortiments sucrés artisanaux', NULL, 1, 4, '#BE123C', NOW() - INTERVAL 36 DAY, NOW() - INTERVAL 1 DAY),
  (5, 'Salades & Fraîcheur', 'Salades vitaminées et options légères', NULL, 1, 5, '#10B981', NOW() - INTERVAL 35 DAY, NOW() - INTERVAL 1 DAY);

-- Seed menu items
INSERT INTO menu_items (id, name, description, sku, price, cost_price, category_id, is_available, is_active, stock_quantity, low_stock_threshold, unit, preparation_time, calories, allergens, ingredients, is_featured, display_order, created_at, updated_at) VALUES
  (1, 'Attiéké + Poisson', 'Semoule de manioc servie avec poisson frit, tomate et piment maison.', 'GAR-ATT001', 2500.00, 950.00, 1, 1, 1, 80, 20, 'portion', 12, 620, 'Poisson, Gluten traces', 'Attiéké, poisson, tomate, oignon, piment', 1, 1, NOW() - INTERVAL 30 DAY, NOW()),
  (2, 'Attiéké + Thon', 'Version premium au thon grillé, sauce oignon-citron.', 'GAR-ATT002', 2200.00, 870.00, 1, 1, 1, 70, 18, 'portion', 10, 580, 'Poisson', 'Attiéké, thon, citron, oignon, épices', 0, 2, NOW() - INTERVAL 30 DAY, NOW()),
  (3, 'Poulet Yassa', 'Cuisses de poulet marinées oignon-citron accompagnées de riz blanc.', 'GAR-PLT003', 2800.00, 1020.00, 1, 1, 1, 60, 15, 'assiette', 25, 690, 'Poulet, Moutarde', 'Poulet, riz, oignons, citron, moutarde', 0, 3, NOW() - INTERVAL 25 DAY, NOW()),
  (4, 'Alloco + Omelette', 'Bananes plantains frites servies avec omelette parfumée.', 'GAR-SNK004', 1500.00, 520.00, 2, 1, 1, 100, 30, 'plateau', 8, 540, 'Œufs', 'Plantain, œufs, tomate, oignon', 1, 1, NOW() - INTERVAL 25 DAY, NOW()),
  (5, 'Alloco + Poisson', 'Grande portion d’alloco avec beignets de poisson croustillants.', 'GAR-SNK005', 1800.00, 650.00, 2, 1, 1, 90, 25, 'plateau', 9, 560, 'Poisson', 'Plantain, poisson, huile végétale', 0, 2, NOW() - INTERVAL 24 DAY, NOW()),
  (6, 'Sandwich Viande Kankan', 'Pain maison garni de viande marinée aux épices kankan.', 'GAR-SND006', 2000.00, 780.00, 2, 1, 1, 55, 15, 'sandwich', 6, 610, 'Gluten', 'Pain, viande kankan, salade, sauce maison', 0, 3, NOW() - INTERVAL 23 DAY, NOW()),
  (7, 'Jus de Bissap', 'Infusion d’hibiscus, orange et menthe servie fraîche.', 'GAR-DRV007', 800.00, 210.00, 3, 1, 1, 180, 40, 'bouteille', 3, 120, NULL, 'Bissap, sucre de canne, agrumes, menthe', 1, 1, NOW() - INTERVAL 20 DAY, NOW()),
  (8, 'Gingembre pressé', 'Boisson tonique gingembre-citron légèrement sucrée.', 'GAR-DRV008', 900.00, 250.00, 3, 1, 1, 170, 35, 'bouteille', 2, 90, NULL, 'Gingembre, citron, sucre', 0, 2, NOW() - INTERVAL 19 DAY, NOW()),
  (9, 'Smoothie Papaye', 'Smoothie tropical papaye-ananas, lait de coco.', 'GAR-DRV009', 1300.00, 420.00, 3, 1, 1, 150, 30, 'verre', 4, 210, 'Coco', 'Papaye, ananas, lait de coco, miel', 0, 3, NOW() - INTERVAL 18 DAY, NOW()),
  (10, 'Cake Banane', 'Cake moelleux à la banane et sucre roux caramélisé.', 'GAR-DST010', 1200.00, 350.00, 4, 1, 1, 120, 25, 'part', 5, 420, 'Gluten, Œufs', 'Banane, farine, sucre roux, beurre', 0, 1, NOW() - INTERVAL 18 DAY, NOW()),
  (11, 'Salade Avocat Douceur', 'Avocat, concombre, mangue et vinaigrette légère.', 'GAR-SLD011', 1600.00, 480.00, 5, 1, 1, 85, 20, 'bol', 7, 310, 'Fruits à coque traces', 'Avocat, mangue, concombre, roquette, vinaigrette', 0, 1, NOW() - INTERVAL 17 DAY, NOW()),
  (12, 'Tchep Garba', 'Riz parfumé au poisson braisé, légumes thym et laurier.', 'GAR-PLT012', 3000.00, 1100.00, 1, 1, 1, 65, 18, 'assiette', 30, 720, 'Poisson', 'Riz, poisson, carottes, aubergine, épices', 0, 4, NOW() - INTERVAL 16 DAY, NOW());

INSERT INTO menu_item_suppliers (menu_item_id, supplier_id) VALUES
  (1, 1),
  (2, 1),
  (3, 1),
  (4, 1),
  (5, 1),
  (6, 1),
  (7, 2),
  (8, 2),
  (9, 2),
  (10, 2),
  (11, 2),
  (12, 1);

-- Seed orders
INSERT INTO orders (id, order_number, status, order_type, user_id, customer_name, customer_phone, customer_email, subtotal, tax_amount, discount_amount, total_amount, payment_status, payment_method, transaction_id, paid_at, delivery_address, delivery_instructions, delivery_fee, notes, table_number, estimated_preparation_time, scheduled_for, confirmed_at, completed_at, cancelled_at, cancellation_reason, created_at, updated_at)
VALUES
  (1, CONCAT('ORD-', CURDATE(), '-0001'), 'COMPLETED', 'DINE_IN', 1, 'Fatou Diabaté', '+22501020304', 'fatou.diabate@example.com', 3300.00, 165.00, 0.00, 3465.00, 'PAID', 'CARD', 'TXN-GAR-001', NOW() - INTERVAL 45 MINUTE, NULL, NULL, NULL, 'Servir avec sauce piment séparée.', 'Table 3', 18, NULL, NOW() - INTERVAL 60 MINUTE, NOW() - INTERVAL 20 MINUTE, NULL, NULL, NOW() - INTERVAL 65 MINUTE, NOW() - INTERVAL 20 MINUTE),
  (2, CONCAT('ORD-', CURDATE(), '-0007'), 'PREPARING', 'TAKEAWAY', 2, 'Ismael Traoré', '+22505060708', 'ismael.traore@example.com', 3600.00, 180.00, 0.00, 3780.00, 'PAID', 'MOBILE_MONEY', 'TXN-GAR-002', NOW() - INTERVAL 80 MINUTE, NULL, 'Préparer pour 12h15, ajouter serviettes.', NULL, 'Client fidèle, offrir mini piment.', NULL, 15, NULL, NOW() - INTERVAL 90 MINUTE, NULL, NULL, NULL, NOW() - INTERVAL 90 MINUTE, NOW() - INTERVAL 80 MINUTE),
  (3, CONCAT('ORD-', CURDATE(), '-0012'), 'READY', 'DELIVERY', 4, 'Mariam Koné', '+22507080910', 'mariam.kone@example.com', 5900.00, 295.00, 0.00, 6695.00, 'PAID', 'CARD', 'TXN-GAR-003', NOW() - INTERVAL 35 MINUTE, 'Immeuble Ebène, Cocody, Abidjan', 'Téléphoner en arrivant, code portail 2486.', 500.00, 'Remettre avec sac isotherme.', NULL, 25, NULL, NOW() - INTERVAL 70 MINUTE, NULL, NOW() - INTERVAL 25 MINUTE, NULL, NOW() - INTERVAL 75 MINUTE, NOW() - INTERVAL 35 MINUTE);

INSERT INTO order_items (id, order_id, menu_item_id, menu_item_name, menu_item_sku, quantity, unit_price, subtotal, special_instructions, status, created_at) VALUES
  (1, 1, 1, 'Attiéké + Poisson', 'GAR-ATT001', 1, 2500.00, 2500.00, 'Sauce piment à part', 'SERVED', NOW() - INTERVAL 50 MINUTE),
  (2, 1, 7, 'Jus de Bissap', 'GAR-DRV007', 1, 800.00, 800.00, 'Servir bien frais', 'SERVED', NOW() - INTERVAL 45 MINUTE),
  (3, 2, 4, 'Alloco + Omelette', 'GAR-SNK004', 1, 1500.00, 1500.00, NULL, 'PREPARING', NOW() - INTERVAL 90 MINUTE),
  (4, 2, 8, 'Gingembre pressé', 'GAR-DRV008', 1, 900.00, 900.00, 'Peu de sucre', 'PREPARING', NOW() - INTERVAL 85 MINUTE),
  (5, 2, 10, 'Cake Banane', 'GAR-DST010', 1, 1200.00, 1200.00, NULL, 'PENDING', NOW() - INTERVAL 80 MINUTE),
  (6, 3, 12, 'Tchep Garba', 'GAR-PLT012', 1, 3000.00, 3000.00, 'Ajouter sauce supplémentaire', 'READY', NOW() - INTERVAL 60 MINUTE),
  (7, 3, 9, 'Smoothie Papaye', 'GAR-DRV009', 1, 1300.00, 1300.00, 'Sans glaçons', 'READY', NOW() - INTERVAL 55 MINUTE),
  (8, 3, 11, 'Salade Avocat Douceur', 'GAR-SLD011', 1, 1600.00, 1600.00, NULL, 'READY', NOW() - INTERVAL 50 MINUTE);

-- Seed inventory audits
INSERT INTO inventory_audits (id, menu_item_id, menu_item_name, change_quantity, previous_quantity, new_quantity, reason, source, performed_by, created_at) VALUES
  (1, 1, 'Attiéké + Poisson', -12, 80, 68, 'Préparation du service du midi', 'INVENTORY_SERVICE', 'Fatou Diabaté', NOW() - INTERVAL 4 HOUR),
  (2, 4, 'Alloco + Omelette', 25, 75, 100, 'Réapprovisionnement bananes plantain', 'INVENTORY_SERVICE', 'Ismael Traoré', NOW() - INTERVAL 3 HOUR),
  (3, 7, 'Jus de Bissap', -18, 180, 162, 'Vente forte du matin', 'INVENTORY_SERVICE', 'Mariam Koné', NOW() - INTERVAL 2 HOUR);

COMMIT;
