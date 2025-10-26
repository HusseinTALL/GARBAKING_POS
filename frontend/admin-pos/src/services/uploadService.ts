/**
 * Upload Service - Handles file uploads to the backend
 * Provides progress tracking and error handling
 */

import { apiService } from './api'

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface UploadResult {
  success: boolean
  data?: {
    url: string
    thumbnailUrl?: string
    width: number
    height: number
    format: string
    size: number
    originalSize: number
    savedBytes: number
    savedPercentage: number
  }
  error?: string
  message?: string
}

class UploadService {
  /**
   * Upload an image file
   */
  async uploadImage(
    file: File,
    uploadType: 'menu' | 'categories' | 'users' = 'menu',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateImageFile(file)
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        }
      }

      // Create FormData
      const formData = new FormData()
      formData.append('image', file)
      formData.append('uploadType', uploadType)

      // Upload with progress tracking
      const response = await apiService.uploadWithProgress(
        '/api/upload/image',
        formData,
        (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage
            })
          }
        }
      )

      return response as UploadResult
    } catch (error: any) {
      console.error('Upload error:', error)
      return {
        success: false,
        error: error.message || 'Upload failed'
      }
    }
  }

  /**
   * Delete an uploaded image
   */
  async deleteImage(url: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiService.delete('/api/upload/image', { url })
      return response as { success: boolean }
    } catch (error: any) {
      console.error('Delete error:', error)
      return {
        success: false,
        error: error.message || 'Delete failed'
      }
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
}

export const uploadService = new UploadService()
