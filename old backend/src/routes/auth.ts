/**
 * Authentication Routes
 * Defines all authentication-related API endpoints with comprehensive JWT and session management
 */

import { Router } from 'express';
import {
  authController,
  registerValidation,
  loginValidation,
  changePasswordValidation
} from '../controllers/authController';
import {
  authenticateToken,
  rateLimitAuth,
  requireRole,
  ROLES
} from '../middleware/authMiddleware';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public (but can be restricted in production)
 */
router.post(
  '/register',
  rateLimitAuth(3, 15 * 60 * 1000), // 3 attempts per 15 minutes
  registerValidation,
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  rateLimitAuth(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  loginValidation,
  authController.login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public (requires valid refresh token)
 */
router.post(
  '/refresh',
  rateLimitAuth(10, 15 * 60 * 1000), // 10 attempts per 15 minutes
  authController.refreshToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (revoke session)
 * @access  Private
 */
router.post(
  '/logout',
  authenticateToken,
  authController.logout
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/profile',
  authenticateToken,
  authController.getProfile
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put(
  '/change-password',
  authenticateToken,
  changePasswordValidation,
  authController.changePassword
);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify token validity
 * @access  Private
 */
router.get(
  '/verify',
  authenticateToken,
  authController.verifyToken
);

/**
 * @route   POST /api/auth/admin/register
 * @desc    Register a new user (admin only)
 * @access  Private (Admin+)
 */
router.post(
  '/admin/register',
  authenticateToken,
  requireRole([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  registerValidation,
  authController.register
);

// Legacy routes for backward compatibility
/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile (legacy)
 * @access  Private
 */
router.get('/me', authenticateToken, authController.getProfile);

export default router;