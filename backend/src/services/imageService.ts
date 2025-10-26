/**
 * Image Service - Handles image processing, optimization, and storage
 * Uses sharp for image manipulation and optimization
 */

import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'

export interface ImageProcessingOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  generateThumbnail?: boolean
  thumbnailWidth?: number
  thumbnailHeight?: number
}

export interface ProcessedImageResult {
  originalPath: string
  optimizedPath: string
  thumbnailPath?: string
  originalSize: number
  optimizedSize: number
  width: number
  height: number
  format: string
  publicUrl: string
  thumbnailUrl?: string
}

class ImageService {
  private uploadsDir = path.join(process.cwd(), 'public', 'uploads')

  /**
   * Process and optimize uploaded image
   */
  async processImage(
    filePath: string,
    options: ImageProcessingOptions = {}
  ): Promise<ProcessedImageResult> {
    const {
      width = 1200,
      height,
      quality = 85,
      format = 'webp',
      fit = 'inside',
      generateThumbnail = true,
      thumbnailWidth = 300,
      thumbnailHeight = 300
    } = options

    try {
      // Get file stats
      const stats = await fs.stat(filePath)
      const originalSize = stats.size

      // Read image metadata
      const metadata = await sharp(filePath).metadata()

      // Generate optimized version
      const optimizedPath = this.getOptimizedPath(filePath, format)
      const image = sharp(filePath)

      // Resize and optimize
      await image
        .resize(width, height, { fit, withoutEnlargement: true })
        [format]({ quality })
        .toFile(optimizedPath)

      // Get optimized file size
      const optimizedStats = await fs.stat(optimizedPath)
      const optimizedSize = optimizedStats.size

      // Get optimized image metadata
      const optimizedMetadata = await sharp(optimizedPath).metadata()

      // Generate thumbnail if requested
      let thumbnailPath: string | undefined
      let thumbnailUrl: string | undefined

      if (generateThumbnail) {
        thumbnailPath = this.getThumbnailPath(filePath, format)
        await sharp(filePath)
          .resize(thumbnailWidth, thumbnailHeight, { fit: 'cover' })
          [format]({ quality: 80 })
          .toFile(thumbnailPath)

        thumbnailUrl = this.getPublicUrl(thumbnailPath)
      }

      // Delete original file if different from optimized
      if (filePath !== optimizedPath) {
        await fs.unlink(filePath)
      }

      return {
        originalPath: filePath,
        optimizedPath,
        thumbnailPath,
        originalSize,
        optimizedSize,
        width: optimizedMetadata.width || width,
        height: optimizedMetadata.height || height || 0,
        format: optimizedMetadata.format || format,
        publicUrl: this.getPublicUrl(optimizedPath),
        thumbnailUrl
      }
    } catch (error: any) {
      console.error('Error processing image:', error)
      throw new Error(`Image processing failed: ${error.message}`)
    }
  }

  /**
   * Delete image and its variants
   */
  async deleteImage(imagePath: string): Promise<void> {
    try {
      const absolutePath = imagePath.startsWith('/')
        ? path.join(process.cwd(), 'public', imagePath)
        : imagePath

      // Delete main image
      await fs.unlink(absolutePath).catch(() => {})

      // Delete thumbnail if exists
      const thumbnailPath = this.getThumbnailPath(absolutePath)
      await fs.unlink(thumbnailPath).catch(() => {})

    } catch (error: any) {
      console.error('Error deleting image:', error)
      // Don't throw error if file doesn't exist
    }
  }

  /**
   * Get public URL for an image path
   */
  private getPublicUrl(filePath: string): string {
    const relativePath = path.relative(
      path.join(process.cwd(), 'public'),
      filePath
    )
    return `/${relativePath.replace(/\\/g, '/')}`
  }

  /**
   * Get optimized file path
   */
  private getOptimizedPath(originalPath: string, format: string): string {
    const dir = path.dirname(originalPath)
    const ext = path.extname(originalPath)
    const baseName = path.basename(originalPath, ext)

    return path.join(dir, `${baseName}-optimized.${format}`)
  }

  /**
   * Get thumbnail file path
   */
  private getThumbnailPath(originalPath: string, format?: string): string {
    const dir = path.dirname(originalPath)
    const ext = path.extname(originalPath)
    const baseName = path.basename(originalPath, ext)
    const thumbFormat = format || ext.slice(1)

    return path.join(dir, `${baseName}-thumb.${thumbFormat}`)
  }

  /**
   * Validate image dimensions
   */
  async validateImageDimensions(
    filePath: string,
    minWidth?: number,
    minHeight?: number,
    maxWidth?: number,
    maxHeight?: number
  ): Promise<{ valid: boolean; message?: string; metadata?: sharp.Metadata }> {
    try {
      const metadata = await sharp(filePath).metadata()

      if (!metadata.width || !metadata.height) {
        return { valid: false, message: 'Unable to read image dimensions' }
      }

      if (minWidth && metadata.width < minWidth) {
        return {
          valid: false,
          message: `Image width ${metadata.width}px is less than minimum ${minWidth}px`
        }
      }

      if (minHeight && metadata.height < minHeight) {
        return {
          valid: false,
          message: `Image height ${metadata.height}px is less than minimum ${minHeight}px`
        }
      }

      if (maxWidth && metadata.width > maxWidth) {
        return {
          valid: false,
          message: `Image width ${metadata.width}px exceeds maximum ${maxWidth}px`
        }
      }

      if (maxHeight && metadata.height > maxHeight) {
        return {
          valid: false,
          message: `Image height ${metadata.height}px exceeds maximum ${maxHeight}px`
        }
      }

      return { valid: true, metadata }
    } catch (error: any) {
      return { valid: false, message: `Image validation failed: ${error.message}` }
    }
  }

  /**
   * Generate multiple sizes of an image
   */
  async generateImageSizes(
    filePath: string,
    sizes: Array<{ name: string; width: number; height?: number }>
  ): Promise<Record<string, string>> {
    const results: Record<string, string> = {}

    for (const size of sizes) {
      try {
        const dir = path.dirname(filePath)
        const ext = path.extname(filePath)
        const baseName = path.basename(filePath, ext)
        const sizePath = path.join(dir, `${baseName}-${size.name}.webp`)

        await sharp(filePath)
          .resize(size.width, size.height, { fit: 'cover' })
          .webp({ quality: 85 })
          .toFile(sizePath)

        results[size.name] = this.getPublicUrl(sizePath)
      } catch (error: any) {
        console.error(`Error generating ${size.name} size:`, error)
      }
    }

    return results
  }
}

export const imageService = new ImageService()
