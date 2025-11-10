# Kiosk App Backend Integration Guide

This guide explains how to integrate the kiosk app with your existing Spring Boot microservices backend.

## Overview

The kiosk app is designed to work with your existing Garbaking backend microservices architecture. It communicates with the backend via REST API endpoints.

## Required Backend Endpoints

### 1. Menu Service Endpoints

#### Get All Categories
```http
GET /api/menu/categories
```

**Response:**
```json
[
  {
    "id": "cat-001",
    "name": "Burgers",
    "displayOrder": 1,
    "icon": "burger",
    "imageUrl": "https://example.com/images/burgers.jpg"
  },
  {
    "id": "cat-002",
    "name": "Drinks",
    "displayOrder": 2,
    "icon": "drink",
    "imageUrl": "https://example.com/images/drinks.jpg"
  }
]
```

#### Get Menu Items (All or by Category)
```http
GET /api/menu/items
GET /api/menu/items?categoryId=cat-001
```

**Response:**
```json
[
  {
    "id": "item-001",
    "name": "Classic Burger",
    "description": "Juicy beef patty with fresh vegetables",
    "price": 12.99,
    "categoryId": "cat-001",
    "imageUrl": "https://example.com/images/classic-burger.jpg",
    "available": true,
    "preparationTime": 15,
    "allergens": ["gluten", "dairy"],
    "customizations": [
      {
        "id": "cust-001",
        "name": "Size",
        "type": "single",
        "required": true,
        "options": [
          {
            "id": "opt-001",
            "name": "Regular",
            "priceModifier": 0.00,
            "default": true
          },
          {
            "id": "opt-002",
            "name": "Large",
            "priceModifier": 2.00,
            "default": false
          }
        ]
      },
      {
        "id": "cust-002",
        "name": "Add-ons",
        "type": "multiple",
        "required": false,
        "options": [
          {
            "id": "opt-003",
            "name": "Extra Cheese",
            "priceModifier": 1.50,
            "default": false
          },
          {
            "id": "opt-004",
            "name": "Bacon",
            "priceModifier": 2.00,
            "default": false
          }
        ]
      }
    ]
  }
]
```

#### Get Single Menu Item
```http
GET /api/menu/items/{itemId}
```

**Response:** Same structure as individual item above

---

### 2. Order Service Endpoints

#### Create Order
```http
POST /api/orders
Content-Type: application/json
```

**Request Body:**
```json
{
  "mode": "dine-in",
  "items": [
    {
      "menuItemId": "item-001",
      "quantity": 2,
      "customizations": [
        {
          "customizationId": "cust-001",
          "optionId": "opt-002"
        },
        {
          "customizationId": "cust-002",
          "optionId": "opt-003"
        }
      ],
      "notes": "No onions please"
    }
  ],
  "paymentMethod": "card"
}
```

**Response:**
```json
{
  "id": "order-12345",
  "orderNumber": "104",
  "mode": "dine-in",
  "items": [...],
  "subtotal": 29.98,
  "tax": 2.99,
  "total": 32.97,
  "paymentMethod": "card",
  "status": "pending",
  "createdAt": "2025-11-04T10:30:00Z",
  "estimatedReadyTime": "2025-11-04T10:45:00Z"
}
```

#### Get Order
```http
GET /api/orders/{orderId}
```

**Response:** Same as create order response

#### Get Order Status
```http
GET /api/orders/{orderId}/status
```

**Response:**
```json
{
  "status": "preparing",
  "estimatedReadyTime": "2025-11-04T10:45:00Z"
}
```

**Status values:**
- `pending` - Order created, payment processing
- `confirmed` - Payment confirmed
- `preparing` - Kitchen is preparing
- `ready` - Order ready for pickup
- `completed` - Order delivered/picked up

---

### 3. Payment Service Endpoints

#### Process Payment
```http
POST /api/payments/process
Content-Type: application/json
```

**Request Body:**
```json
{
  "orderId": "order-12345",
  "method": "card",
  "amount": 32.97
}
```

**Payment Methods:**
- `card` - Credit/Debit card
- `mobile-money` - Mobile money transfer
- `qr-code` - QR code payment
- `cash` - Pay at counter

**Response:**
```json
{
  "success": true,
  "transactionId": "txn-67890",
  "error": null
}
```

**Error Response:**
```json
{
  "success": false,
  "transactionId": null,
  "error": "Insufficient funds"
}
```

---

## Backend Implementation Examples

### Spring Boot Controller Examples

#### MenuController.java
```java
@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = "*")
public class MenuController {

    @Autowired
    private MenuService menuService;

    @GetMapping("/categories")
    public ResponseEntity<List<MenuCategory>> getCategories() {
        return ResponseEntity.ok(menuService.getAllCategories());
    }

    @GetMapping("/items")
    public ResponseEntity<List<MenuItem>> getItems(
        @RequestParam(required = false) String categoryId
    ) {
        if (categoryId != null) {
            return ResponseEntity.ok(menuService.getItemsByCategory(categoryId));
        }
        return ResponseEntity.ok(menuService.getAllItems());
    }

    @GetMapping("/items/{id}")
    public ResponseEntity<MenuItem> getItem(@PathVariable String id) {
        return ResponseEntity.ok(menuService.getItemById(id));
    }
}
```

#### OrderController.java
```java
@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody CreateOrderRequest request) {
        Order order = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable String id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<OrderStatus> getOrderStatus(@PathVariable String id) {
        return ResponseEntity.ok(orderService.getOrderStatus(id));
    }
}
```

#### PaymentController.java
```java
@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/process")
    public ResponseEntity<PaymentResult> processPayment(
        @RequestBody ProcessPaymentRequest request
    ) {
        PaymentResult result = paymentService.processPayment(request);
        return ResponseEntity.ok(result);
    }
}
```

---

## CORS Configuration

Make sure your Spring Boot backend allows CORS requests from the kiosk app:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:3003",
                    "http://localhost:3005",
                    "http://192.168.11.111:3005"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

---

## Database Schema Recommendations

### Menu Tables

```sql
-- Categories
CREATE TABLE menu_categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_order INT NOT NULL,
    icon VARCHAR(50),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu Items
CREATE TABLE menu_items (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id VARCHAR(36) NOT NULL,
    image_url VARCHAR(500),
    available BOOLEAN DEFAULT true,
    preparation_time INT, -- minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES menu_categories(id)
);

-- Customizations
CREATE TABLE menu_customizations (
    id VARCHAR(36) PRIMARY KEY,
    menu_item_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'single' or 'multiple'
    required BOOLEAN DEFAULT false,
    display_order INT,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- Customization Options
CREATE TABLE customization_options (
    id VARCHAR(36) PRIMARY KEY,
    customization_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    price_modifier DECIMAL(10,2) DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    display_order INT,
    FOREIGN KEY (customization_id) REFERENCES menu_customizations(id)
);
```

### Order Tables

```sql
-- Orders
CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    mode VARCHAR(20) NOT NULL, -- 'dine-in' or 'takeaway'
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estimated_ready_time TIMESTAMP
);

-- Order Items
CREATE TABLE order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    menu_item_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    notes TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- Order Item Customizations
CREATE TABLE order_item_customizations (
    id VARCHAR(36) PRIMARY KEY,
    order_item_id VARCHAR(36) NOT NULL,
    customization_id VARCHAR(36) NOT NULL,
    option_id VARCHAR(36) NOT NULL,
    price_modifier DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id)
);
```

---

## Testing the Integration

### 1. Test Menu Endpoints

```bash
# Get categories
curl http://localhost:8080/api/menu/categories

# Get all items
curl http://localhost:8080/api/menu/items

# Get items by category
curl http://localhost:8080/api/menu/items?categoryId=cat-001

# Get single item
curl http://localhost:8080/api/menu/items/item-001
```

### 2. Test Order Creation

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "dine-in",
    "items": [{
      "menuItemId": "item-001",
      "quantity": 1,
      "customizations": [],
      "notes": ""
    }],
    "paymentMethod": "cash"
  }'
```

### 3. Test Payment Processing

```bash
curl -X POST http://localhost:8080/api/payments/process \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order-12345",
    "method": "cash",
    "amount": 12.99
  }'
```

---

## Environment Configuration

Update the kiosk app's `.env` file with your backend URL:

```env
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws
VITE_DEFAULT_LANGUAGE=en
VITE_IDLE_TIMEOUT=60
```

For production:
```env
VITE_API_URL=https://api.garbaking.com/api
VITE_WS_URL=wss://api.garbaking.com/ws
VITE_DEFAULT_LANGUAGE=en
VITE_IDLE_TIMEOUT=60
```

---

## Error Handling

The kiosk app handles common error scenarios:

### Network Errors
- Displays user-friendly error messages
- Stores error in store for debugging
- Allows retry

### API Errors
```json
{
  "error": "Item not found",
  "code": "ITEM_NOT_FOUND",
  "status": 404
}
```

### Payment Failures
- Shows error message to user
- Allows retry or change payment method
- Does not clear cart

---

## Sample Data for Testing

Use this sample data to populate your database for testing:

```sql
-- Sample Categories
INSERT INTO menu_categories VALUES
('cat-001', 'Burgers', 1, 'burger', NULL, NOW()),
('cat-002', 'Drinks', 2, 'drink', NULL, NOW()),
('cat-003', 'Desserts', 3, 'dessert', NULL, NOW());

-- Sample Menu Items
INSERT INTO menu_items VALUES
('item-001', 'Classic Burger', 'Juicy beef patty', 12.99, 'cat-001', NULL, true, 15, NOW()),
('item-002', 'Cheese Burger', 'With extra cheese', 14.99, 'cat-001', NULL, true, 15, NOW()),
('item-003', 'Cola', 'Refreshing drink', 2.99, 'cat-002', NULL, true, 2, NOW());

-- Sample Customizations
INSERT INTO menu_customizations VALUES
('cust-001', 'item-001', 'Size', 'single', true, 1),
('cust-002', 'item-001', 'Add-ons', 'multiple', false, 2);

-- Sample Options
INSERT INTO customization_options VALUES
('opt-001', 'cust-001', 'Regular', 0.00, true, 1),
('opt-002', 'cust-001', 'Large', 2.00, false, 2),
('opt-003', 'cust-002', 'Extra Cheese', 1.50, false, 1),
('opt-004', 'cust-002', 'Bacon', 2.00, false, 2);
```

---

## WebSocket Integration (Optional)

For real-time order status updates:

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }
}

@Controller
public class OrderStatusController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void notifyOrderStatus(String orderId, String status) {
        messagingTemplate.convertAndSend(
            "/topic/orders/" + orderId,
            Map.of("status", status, "timestamp", Instant.now())
        );
    }
}
```

---

## Next Steps

1. ✅ Ensure backend endpoints are implemented
2. ✅ Configure CORS settings
3. ✅ Test all endpoints with sample data
4. ✅ Update kiosk `.env` with correct API URL
5. ✅ Test full order flow end-to-end
6. ✅ Deploy backend and kiosk app
7. ✅ Monitor logs for any integration issues

## Support

For integration issues, check:
1. Backend logs for API errors
2. Browser console for network errors
3. Network tab in DevTools for request/response details
4. Verify CORS configuration
5. Check API URL in `.env` file
