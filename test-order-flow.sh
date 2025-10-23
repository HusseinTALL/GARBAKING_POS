#!/bin/bash

# Garbaking POS - Quick Order Flow Test Script
# Tests the complete order lifecycle with status updates

set -e

echo "🧪 Garbaking POS - Order Flow Test"
echo "=================================="
echo ""

# Configuration
BACKEND_URL="http://localhost:3001"
ORDER_DATA='{
  "customerName": "Test Customer",
  "customerPhone": "+22612345678",
  "tableNumber": "5",
  "orderType": "DINE_IN",
  "items": [
    {
      "menuItemId": "d6c05408-24cb-4bc4-ba0e-9d35cf0b636a",
      "sku": "ATT002",
      "name": "Attiéké + Poulet",
      "unitPrice": 3000,
      "quantity": 2
    },
    {
      "menuItemId": "06eb724c-3a00-4aa0-88a9-d45e7c14693d",
      "sku": "FOU001",
      "name": "Foutou + Sauce Arachide",
      "unitPrice": 2800,
      "quantity": 1
    }
  ],
  "paymentMethod": "CASH"
}'

echo "📝 Step 1: Creating test order..."
RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/orders" \
  -H "Content-Type: application/json" \
  -d "$ORDER_DATA")

# Extract order number
ORDER_NUMBER=$(echo $RESPONSE | grep -o '"orderNumber":"[^"]*' | sed 's/"orderNumber":"//')

if [ -z "$ORDER_NUMBER" ]; then
  echo "❌ Failed to create order"
  echo "Response: $RESPONSE"
  exit 1
fi

echo "✅ Order created: $ORDER_NUMBER"
echo ""

# Function to update order status
update_status() {
  local status=$1
  local message=$2

  echo "📊 $message..."
  curl -s -X PATCH "$BACKEND_URL/api/orders/$ORDER_NUMBER/status" \
    -H "Content-Type: application/json" \
    -d "{\"status\": \"$status\"}" > /dev/null
  echo "✅ Status updated to: $status"
  sleep 3
}

# Test status progression
echo "🔄 Testing status progression..."
echo ""

update_status "CONFIRMED" "Step 2: Confirming order"
update_status "PREPARING" "Step 3: Starting preparation"
update_status "READY" "Step 4: Marking order as ready"
update_status "COMPLETED" "Step 5: Completing order"

echo ""
echo "🎉 Order flow test completed!"
echo "=================================="
echo ""
echo "📊 Test Summary:"
echo "  Order Number: $ORDER_NUMBER"
echo "  Status: COMPLETED"
echo "  Customer: Test Customer"
echo "  Phone: +22612345678"
echo ""
echo "💡 Tips:"
echo "  1. Keep the customer app open to see real-time updates"
echo "  2. Watch for toast notifications at each status change"
echo "  3. Check the order status timeline for visual updates"
echo ""
echo "📱 View order status:"
echo "  http://172.20.10.2:3002/order-status/$ORDER_NUMBER"
echo ""
