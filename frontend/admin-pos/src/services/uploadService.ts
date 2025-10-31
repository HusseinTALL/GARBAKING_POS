/**
 * Upload Service - Handles file uploads to the backend
 * Provides progress tracking and error handling
 */

import { uploadApi } from './api-spring'
import type { AxiosProgressEvent } from 'axios'

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface MenuItemImageMetadata {
  id: number
  menuItemId: number
  imageUrl: string
  thumbnailUrl?: string
  signedUrl?: string
  isPrimary?: boolean
  displayOrder?: number
  altText?: string
  createdAt?: string
}

export interface UploadedImage {
  url: string
  thumbnailUrl?: string
  width?: number
  height?: number
  format?: string
  size?: number
  originalSize?: number
  savedBytes?: number
  savedPercentage?: number
  signedUrl?: string
  image?: MenuItemImageMetadata
  images?: MenuItemImageMetadata[]
}

interface UploadImageOptions {
  menuItemId?: string | number
  uploadType?: 'menu' | 'categories' | 'users'
  primary?: boolean
  displayOrder?: number
  altText?: string
  onProgress?: (progress: UploadProgress) => void
}

class UploadService {
  /**
   * Upload an image file
   */
  async uploadImage(file: File, options: UploadImageOptions = {}): Promise<UploadedImage> {
    const {
      menuItemId,
      uploadType = 'menu',
      primary,
      displayOrder,
      altText,
      onProgress,
    } = options
    try {
      // Validate file
      const validation = this.validateImageFile(file)
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid file')
      }

      const handleProgress = (event: AxiosProgressEvent) => {
        if (onProgress && event.total) {
          const percentage = Math.round((event.loaded * 100) / event.total)
          onProgress({
            loaded: event.loaded ?? 0,
            total: event.total,
            percentage
          })
        }
      }

      if (menuItemId !== undefined && menuItemId !== null && menuItemId !== '') {
        const formData = new FormData()
        formData.append('file', file)
        if (typeof primary === 'boolean') {
          formData.append('primary', String(primary))
        }
        if (typeof displayOrder === 'number') {
          formData.append('displayOrder', String(displayOrder))
        }
        if (typeof altText === 'string' && altText.trim().length > 0) {
          formData.append('altText', altText.trim())
        }

        const uploadResponse = await uploadApi.uploadMenuItemImage(menuItemId, formData, {
          onUploadProgress: handleProgress
        })

        let images: MenuItemImageMetadata[] = []
        try {
          const fetchedImages = await uploadApi.fetchMenuItemImages(menuItemId)
          if (Array.isArray(fetchedImages)) {
            images = fetchedImages as MenuItemImageMetadata[]
          }
        } catch (metadataError) {
          console.error('Failed to refresh menu item images after upload:', metadataError)
        }

        const newImage: MenuItemImageMetadata | undefined = uploadResponse?.image
        const primaryImage = images.find(image => image.isPrimary) || newImage
        const signedUrl = uploadResponse?.signedUrl || primaryImage?.signedUrl
        const url = signedUrl || primaryImage?.imageUrl || newImage?.imageUrl

        if (!url) {
          throw new Error('Upload service returned an invalid response')
        }

        return {
          url,
          thumbnailUrl: primaryImage?.thumbnailUrl ?? newImage?.thumbnailUrl,
          format: file.type,
          size: file.size,
          originalSize: file.size,
          savedBytes: undefined,
          savedPercentage: undefined,
          signedUrl,
          image: newImage,
          images
        }
      }

      // Legacy upload flow (categories, users, etc.)
      const formData = new FormData()
      formData.append('image', file)
      if (uploadType) {
        formData.append('uploadType', uploadType)
      }

      const data = await uploadApi.uploadLegacyImage(formData, {
        onUploadProgress: handleProgress
      })

      if (!data || !data.url) {
        throw new Error('Upload service returned an invalid response')
      }

      return {
        url: data.url,
        thumbnailUrl: data.thumbnailUrl,
        width: data.width,
        height: data.height,
        format: data.format,
        size: data.size,
        originalSize: data.originalSize,
        savedBytes: data.savedBytes,
        savedPercentage: data.savedPercentage
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      throw new Error(this.getErrorMessage(error, 'Upload failed'))
    }
  }

  /**
   * Delete an uploaded image
   */
  async deleteImage(
    params: { menuItemId: string | number; imageId: string | number } | { url: string }
  ): Promise<MenuItemImageMetadata[] | void> {
    try {
      if ('menuItemId' in params && 'imageId' in params) {
        await uploadApi.deleteMenuItemImage(params.menuItemId, params.imageId)
        try {
          const images = await uploadApi.fetchMenuItemImages(params.menuItemId)
          if (Array.isArray(images)) {
            return images as MenuItemImageMetadata[]
          }
          return []
        } catch (metadataError) {
          console.error('Failed to refresh menu item images after delete:', metadataError)
          return []
        }
      }

      if ('url' in params) {
        await uploadApi.deleteLegacyImage(params.url)
      }
    } catch (error: any) {
      console.error('Delete error:', error)
      throw new Error(this.getErrorMessage(error, 'Delete failed'))
    }
  }

  async getMenuItemImages(menuItemId: string | number): Promise<MenuItemImageMetadata[]> {
    try {
      const images = await uploadApi.fetchMenuItemImages(menuItemId)
      if (Array.isArray(images)) {
        return images as MenuItemImageMetadata[]
      }
      return []
    } catch (error: any) {
      console.error('Get menu item images error:', error)
      throw new Error(this.getErrorMessage(error, 'Failed to load menu item images'))
    }
  }

  /**
   * Validate image file before upload
   */
  private validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: JPEG, PNG, WebP, GIF`
      }
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum of 5MB`
      }
    }

    // Check file name
    if (!file.name || file.name.length > 255) {
      return {
        valid: false,
        error: 'Invalid file name'
      }
    }

    return { valid: true }
  }

  /**
   * Generate a preview URL for a file
   */
  async generatePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        resolve(e.target?.result as string)
      }

      reader.onerror = (error) => {
        reject(error)
      }

      reader.readAsDataURL(file)
    })
  }

  /**
   * Get file extension from filename or URL
   */
  getFileExtension(fileNameOrUrl: string): string {
    return fileNameOrUrl.split('.').pop()?.toLowerCase() || ''
  }

  /**
   * Get file size in human-readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  private getErrorMessage(error: any, fallback: string): string {
    const response = error?.response?.data

    if (response?.message) {
      return response.message
    }

    if (response?.error) {
      return response.error
    }

    if (Array.isArray(response?.errors)) {
      const extracted = response.errors
        .map((err: any) => {
          if (typeof err === 'string') return err
          if (err?.message) return err.message
          if (err?.defaultMessage) return err.defaultMessage
          if (err?.detail) return err.detail
          return null
        })
        .filter((value): value is string => Boolean(value))
      if (extracted.length) {
        return extracted.join(', ')
      }
    }

    if (Array.isArray(response?.violations)) {
      const extracted = response.violations
        .map((violation: any) => violation?.message || violation?.detail)
        .filter((value: any): value is string => Boolean(value))
      if (extracted.length) {
        return extracted.join(', ')
      }
    }

    if (response?.details) {
      return response.details
    }

    return error?.message || fallback
  }
}

export const uploadService = new UploadService()
