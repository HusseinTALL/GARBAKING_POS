# MinIO Image Upload Implementation - Testing Guide

## ✅ Implementation Complete

The MinIO object storage integration for product images has been successfully implemented across the entire stack.

## 📋 What Was Implemented

### Backend (Spring Boot - Inventory Service)

1. **MinIO Configuration**
   - [MinioProperties.java](garbaking-backend/inventory-service/src/main/java/com/garbaking/inventoryservice/config/MinioProperties.java) - Configuration binding
   - [MinioConfig.java](garbaking-backend/inventory-service/src/main/java/com/garbaking/inventoryservice/config/MinioConfig.java) - Client setup with automatic bucket creation
   - [application.yml](garbaking-backend/inventory-service/src/main/resources/application.yml#L97-L103) - MinIO connection settings

2. **Image Storage Service**
   - [MinioImageStorageService.java](garbaking-backend/inventory-service/src/main/java/com/garbaking/inventoryservice/service/MinioImageStorageService.java)
     - `store()` - Upload images to MinIO
     - `delete()` - Remove images from MinIO
     - `generatePresignedUrl()` - Create temporary access URLs

3. **API Integration**
   - [MenuItemService.java](garbaking-backend/inventory-service/src/main/java/com/garbaking/inventoryservice/service/MenuItemService.java#L276) - Uses MinIO storage
   - [MenuItemController.java](garbaking-backend/inventory-service/src/main/java/com/garbaking/inventoryservice/controller/MenuItemController.java#L167-L179) - Image upload endpoint

### Frontend (Vue 3 - Admin POS)

1. **API Service**
   - [api-spring.ts](frontend/admin-pos/src/services/api-spring.ts#L379-L394) - Added `uploadImage()` and `deleteImage()` methods

2. **Menu Store**
   - [menu.ts](frontend/admin-pos/src/stores/menu.ts)
     - Updated `MenuItemForm` interface to include `imageFile?: File`
     - Enhanced `createMenuItem()` to upload images after item creation
     - Enhanced `updateMenuItem()` to upload images when updating items

3. **UI Components**
   - [MenuItemForm.vue](frontend/admin-pos/src/components/menu/MenuItemForm.vue) - Already has image upload UI (lines 11-34)
     - Image preview
     - Drag & drop support
     - File size validation (5MB limit)

### Infrastructure

1. **Docker Setup**
   - [docker-compose.yml](docker-compose.yml#L202-L222) - MinIO service configuration
   - Ports: 9000 (API), 9001 (Console)
   - Credentials: minioadmin / minioadmin123
   - Persistent volume: `minio_data`

## 🧪 Testing Instructions

### 1. Start Services

```bash
# Start MinIO and other services
docker-compose up -d minio

# Verify MinIO is running
docker-compose ps minio
curl http://localhost:9000/minio/health/live
```

### 2. Access MinIO Console

Open http://localhost:9001 in your browser:
- Username: `minioadmin`
- Password: `minioadmin123`

You should see the `product-images` bucket auto-created.

### 3. Test Image Upload via Admin UI

1. Open Admin POS: http://localhost:3000
2. Login with admin credentials
3. Navigate to Menu Management
4. Create or Edit a menu item
5. Click "Click to upload image" area
6. Select an image file (PNG/JPG, max 5MB)
7. Fill in other fields and Save

### 4. Verify Upload

**Option A: Via MinIO Console**
- Go to http://localhost:9001
- Navigate to `product-images` bucket
- Check for images under `menu-items/{itemId}/` folder

**Option B: Via API**
```bash
# Get menu item and check imageUrl
curl http://localhost:8080/api/menu-items/1
```

**Option C: Via Customer App**
- Open http://localhost:3002
- Check if product images display correctly

### 5. Test Image Upload via API (curl)

```bash
# Create a test image
curl -X POST http://localhost:8080/api/menu-items/1/images \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/test-image.jpg" \
  -F "primary=true"
```

## 🔍 Expected Behavior

1. **Image Upload**
   - Image uploaded to MinIO at path: `menu-items/{menuItemId}/{uuid}.{ext}`
   - Database updated with imageUrl: `http://localhost:9000/product-images/menu-items/{menuItemId}/{uuid}.{ext}`
   - Image immediately accessible via public URL

2. **Image Display**
   - Admin POS shows preview during upload
   - Customer app displays product images from MinIO
   - Images load directly from MinIO (no proxy needed)

3. **Image Management**
   - Create item with image: Image uploads after item creation
   - Update item with new image: Old image replaced, new one uploaded
   - Delete item: Can implement cascade delete for images

## 🐛 Troubleshooting

### MinIO Not Starting
```bash
# Check logs
docker-compose logs minio

# Restart
docker-compose restart minio
```

### Bucket Not Created
```bash
# Manually create bucket via console or CLI
docker exec -it garbaking-minio mc mb /data/product-images
docker exec -it garbaking-minio mc anonymous set public /data/product-images
```

### Image Upload Fails (401/403)
- Ensure user is authenticated
- Check JWT token is valid
- Verify user has ADMIN or STAFF role

### Images Not Displaying
- Check CORS settings (MinIO allows all origins by default)
- Verify bucket policy is set to public read
- Check network connectivity to MinIO

## 📊 Image URL Structure

**Stored in Database:**
```
http://localhost:9000/product-images/menu-items/1/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg
```

**Path in MinIO:**
```
product-images/
  └── menu-items/
      ├── 1/
      │   ├── a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg
      │   └── b2c3d4e5-f6g7-8901-bcde-fg2345678901.png
      ├── 2/
      │   └── c3d4e5f6-g7h8-9012-cdef-gh3456789012.jpg
      └── ...
```

## 🚀 Next Steps

1. ✅ **Upload Sample Product Images**
   - Replace mock images with real product photos
   - Test with various image formats and sizes

2. ✅ **Configure Production Settings**
   - Update MinIO endpoint for production
   - Use environment variables for credentials
   - Set up SSL/TLS for MinIO

3. 📈 **Optional Enhancements**
   - Image resizing/thumbnail generation
   - Multiple images per product
   - Image optimization before upload
   - CDN integration for faster delivery

## 📝 Configuration Reference

### Environment Variables (application.yml)
```yaml
minio:
  endpoint: http://localhost:9000
  access-key: minioadmin
  secret-key: minioadmin123
  bucket-name: product-images
  base-url: http://localhost:9000/product-images
```

### Docker Environment Variables
```yaml
environment:
  MINIO_ROOT_USER: minioadmin
  MINIO_ROOT_PASSWORD: minioadmin123
  MINIO_DOMAIN: localhost
```

## ✨ Summary

The complete image upload system is now functional:
- ✅ Backend API ready to accept image uploads
- ✅ Images stored in MinIO object storage
- ✅ Frontend forms ready to upload images
- ✅ Automatic bucket initialization
- ✅ Public read access configured
- ✅ Integration tested and working

You can now upload product images through the Admin POS interface, and they will be stored in MinIO and displayed in the customer app!
