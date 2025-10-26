/**
 * Upload routes for handling file uploads
 * Supports image uploads with processing and optimization
 */

import { Router, Request, Response } from 'express'
import { uploadSingleImage, validateUploadedImage } from '../middleware/uploadMiddleware'
import { imageService } from '../services/imageService'
import { asyncHandler, createError } from '../middleware/errorHandler'
import { authenticateToken, requireMinimumRole, ROLES } from '../middleware/authMiddleware'

const router = Router()

/**
 * POST /api/upload/image
 * Upload and process a single image
 * Requires: Authentication (Staff+)
 */
router.post('/image',
  authenticateToken,
  requireMinimumRole(ROLES.CASHIER),
  uploadSingleImage,
  validateUploadedImage,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw createError('No file uploaded', 400)
    }

    try {
      // Process and optimize the image
      const result = await imageService.processImage(req.file.path, {
        width: 1200,
        quality: 85,
        format: 'webp',
        generateThumbnail: true,
        thumbnailWidth: 300,
        thumbnailHeight: 300
      })

      res.json({
        success: true,
        data: {
          url: result.publicUrl,
          thumbnailUrl: result.thumbnailUrl,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.optimizedSize,
          originalSize: result.originalSize,
          savedBytes: result.originalSize - result.optimizedSize,
          savedPercentage: Math.round(
            ((result.originalSize - result.optimizedSize) / result.originalSize) * 100
          )
        },
        message: 'Image uploaded and processed successfully'
      })
    } catch (error: any) {
      // Clean up uploaded file if processing fails
      if (req.file && req.file.path) {
        await imageService.deleteImage(req.file.path).catch(() => {})
      }

      throw createError(`Image processing failed: ${error.message}`, 500)
    }
  })
)

/**
 * DELETE /api/upload/image
 * Delete an uploaded image
 * Requires: Authentication (Staff+)
 */
router.delete('/image',
  authenticateToken,
  requireMinimumRole(ROLES.CASHIER),
  asyncHandler(async (req: Request, res: Response) => {
    const { url } = req.body

    if (!url) {
      throw createError('Image URL is required', 400)
    }

    try {
      await imageService.deleteImage(url)

      res.json({
        success: true,
        message: 'Image deleted successfully'
      })
    } catch (error: any) {
      throw createError(`Failed to delete image: ${error.message}`, 500)
    }
  })
)

export default router
