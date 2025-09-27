/**
 * Authentication Controller
 * Handles HTTP requests for user authentication, registration, and session management
 */

import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authService, LoginCredentials, RegisterData } from '../services/authService';

class AuthController {
  /**
   * Register a new user
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { email, password, name, role, storeId }: RegisterData = req.body;

      // Register user
      const result = await authService.register({
        email,
        password,
        name,
        role,
        storeId
      });

      if (!result.success) {
        res.status(400).json(result) as any;
        return;
      }

      // Set HTTP-only cookies for tokens
      res.cookie('accessToken', result.tokens?.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refreshToken', result.tokens?.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({
        success: true,
        message: result.message,
        user: result.user,
        tokens: result.tokens // Also return tokens in response for client-side storage if needed
      });

    } catch (error) {
      console.error('Register controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { email, password }: LoginCredentials = req.body;

      // Authenticate user
      const result = await authService.login({ email, password });

      if (!result.success) {
        res.status(401).json(result) as any;
        return;
      }

      // Set HTTP-only cookies for tokens
      res.cookie('accessToken', result.tokens?.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refreshToken', result.tokens?.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(200).json({
        success: true,
        message: result.message,
        user: result.user,
        tokens: result.tokens // Also return tokens in response for client-side storage if needed
      });

    } catch (error) {
      console.error('Login controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      // Get refresh token from cookie or body
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token required'
        });
        return;
      }

      const result = await authService.refreshToken(refreshToken);

      if (!result.success) {
        // Clear cookies if refresh failed
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(401).json(result) as any;
        return;
      }

      // Set new access token cookie
      res.cookie('accessToken', result.tokens?.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.status(200).json({
        success: true,
        message: result.message,
        user: result.user,
        tokens: result.tokens
      });

    } catch (error) {
      console.error('Refresh token controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = req.user?.sessionId;

      if (sessionId) {
        await authService.logout(sessionId);
      }

      // Clear cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.error('Logout controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const user = await authService.getUserById(req.user.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        user
      });

    } catch (error) {
      console.error('Get profile controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Change user password
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      const result = await authService.changePassword(
        req.user.userId,
        currentPassword,
        newPassword
      );

      if (!result.success) {
        res.status(400).json(result) as any;
        return;
      }

      // Clear cookies to force re-login
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res.status(200).json(result);

    } catch (error) {
      console.error('Change password controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Verify token (health check for authentication)
   */
  async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Token is valid',
        user: {
          userId: req.user.userId,
          email: req.user.email,
          role: req.user.role,
          storeId: req.user.storeId
        }
      });

    } catch (error) {
      console.error('Verify token controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

// Validation rules
export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('role')
    .optional()
    .isIn(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER', 'KITCHEN'])
    .withMessage('Invalid role'),

  body('storeId')
    .isLength({ min: 1 })
    .withMessage('Store ID is required')
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required')
];

export const changePasswordValidation = [
  body('currentPassword')
    .isLength({ min: 1 })
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

export const authController = new AuthController();