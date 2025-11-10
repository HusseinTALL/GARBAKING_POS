#!/bin/bash

echo "🔧 Fixing Garbaking Backend Services..."

# Stop any existing inventory service processes
echo "Stopping existing inventory service..."
pkill -f "inventory-service" || true

# Check if MySQL is accessible
echo "Checking MySQL..."
if ! mysql -h 127.0.0.1 -P 3306 -u root -prootpassword -e "SELECT 1" >/dev/null 2>&1; then
  echo "⚠️  MySQL is not accessible. Attempting to fix..."
  
  # Stop and remove existing container
  docker stop garbaking-mysql 2>/dev/null || true
  docker rm garbaking-mysql 2>/dev/null || true
  
  # Start fresh MySQL container
  docker run -d \
    --name garbaking-mysql \
    -e MYSQL_ROOT_PASSWORD=rootpassword \
    -e MYSQL_DATABASE=garbaking_db \
    -p 3306:3306 \
    mysql:8.0
  
  echo "Waiting for MySQL to be ready..."
  sleep 15
fi

# Test MySQL again
if mysql -h 127.0.0.1 -P 3306 -u root -prootpassword -e "SELECT 1" >/dev/null 2>&1; then
  echo "✅ MySQL is running"
else
  echo "❌ MySQL failed to start"
  exit 1
fi

# Start inventory service
echo "Starting inventory service..."
cd "garbaking-backend"
nohup ./gradlew :inventory-service:bootRun > /tmp/inventory-service.log 2>&1 &

echo "Waiting for inventory service to start..."
sleep 20

# Check if service registered with Eureka
echo "Checking Eureka registration..."
curl -s http://localhost:8080/actuator/health | jq .

echo "✅ Setup complete!"
echo "📝 Check logs: tail -f /tmp/inventory-service.log"
