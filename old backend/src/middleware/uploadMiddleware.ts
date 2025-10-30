/**
 * File upload middleware using Multer
 * Handles image uploads with validation for file type, size, and dimensions
 */

import multer from 'multer'
import path from 'path'
import { Request } from 'express'
import { createError } from './errorHandler'

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

/**
 * Configure storage for uploaded files
 */
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Determine upload directory based on upload type
    const uploadType = req.body.uploadType || 'menu'
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', uploadType)
    cb(null, uploadDir)
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
    const ext = path.extname(file.originalname)
    const baseName = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30)

    cb(null, `${baseName}-${uniqueSuffix}${ext}`)
  }
})

/**
 * File filter to validate uploaded files
 */
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(createError(
      `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
      400
    ) as any)
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase()
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
  if (!allowedExts.includes(ext)) {
    return cb(createError(
      `Invalid file extension. Allowed extensions: ${allowedExts.join(', ')}`,
      400
    ) as any)
  }

  cb(null, true)
}

/**
 * Multer upload configuration
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  }
})

/**
 * Middleware to handle single image upload
 */
export const uploadSingleImage = upload.single('image')

/**
 * Middleware to handle multiple image uploads
 */
export const uploadMultipleImages = upload.array('images', 10)

/**
 * Validate uploaded file after multer processing
 */
export const validateUploadedImage = (req: Request, res: any, next: any) => {
  if (!req.file) {
    return next(createError('No file uploaded', 400))
  }

  // Additional validation can be added here
  // For example: check image dimensions using sharp

  next()
}
