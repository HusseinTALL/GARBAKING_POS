/**
 * Upload routes for Fastify - handles file uploads
 * Supports image uploads with processing and optimization
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { imageService } from '../../services/imageService'
import fs from 'fs/promises'
import path from 'path'
import { pipeline } from 'stream/promises'
import util from 'util'
import { createWriteStream } from 'fs'

// Allowed image MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
]

// Max file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

export default async function uploadRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/upload/image
   * Upload and process a single image
   * Requires: Authentication (Staff+)
   */
  fastify.post('/image', {
    preHandler: fastify.auth([fastify.verifyJWT]),
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const data = await request.file()

        if (!data) {
          return reply.code(400).send({
            success: false,
            error: 'No file uploaded'
          })
        }

        // Validate MIME type
        if (!ALLOWED_MIME_TYPES.includes(data.mimetype)) {
          return reply.code(400).send({
            success: false,
            error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
          })
        }

        // Validate file extension
        const ext = path.extname(data.filename).toLowerCase()
        const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
        if (!allowedExts.includes(ext)) {
          return reply.code(400).send({
            success: false,
            error: `Invalid file extension. Allowed extensions: ${allowedExts.join(', ')}`
          })
        }

        // Get upload type from body or default to 'menu'
        const uploadType = data.fields?.uploadType?.value || 'menu'

        // Generate unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
        const baseName = path.basename(data.filename, ext)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .slice(0, 30)
        const filename = `${baseName}-${uniqueSuffix}${ext}`

        // Determine upload directory
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', uploadType as string)
        const filePath = path.join(uploadDir, filename)

        // Ensure directory exists
        await fs.mkdir(uploadDir, { recursive: true })

        // Save file to disk
        await pipeline(data.file, createWriteStream(filePath))

        // Get file stats to check size
        const stats = await fs.stat(filePath)
        if (stats.size > MAX_FILE_SIZE) {
          // Delete the file
          await fs.unlink(filePath)
          return reply.code(400).send({
            success: false,
            error: `File size ${(stats.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`
          })
        }

        // Process and optimize the image
        const result = await imageService.processImage(filePath, {
          width: 1200,
          quality: 85,
          format: 'webp',
          generateThumbnail: true,
          thumbnailWidth: 300,
          thumbnailHeight: 300
        })

        return reply.send({
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
        fastify.log.error('Upload error:', error)
        return reply.code(500).send({
          success: false,
          error: `Image upload failed: ${error.message}`
        })
      }
    }
  })

  /**
   * DELETE /api/upload/image
   * Delete an uploaded image
   * Requires: Authentication (Staff+)
   */
  fastify.delete('/image', {
    preHandler: fastify.auth([fastify.verifyJWT]),
    handler: async (request: FastifyRequest<{
      Body: { url: string }
    }>, reply: FastifyReply) => {
      try {
        const { url } = request.body

        if (!url) {
          return reply.code(400).send({
            success: false,
            error: 'Image URL is required'
          })
        }

        await imageService.deleteImage(url)

        return reply.send({
          success: true,
          message: 'Image deleted successfully'
        })
      } catch (error: any) {
        fastify.log.error('Delete error:', error)
        return reply.code(500).send({
          success: false,
          error: `Failed to delete image: ${error.message}`
        })
      }
    }
  })
}
