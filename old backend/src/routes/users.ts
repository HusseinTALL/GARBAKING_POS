/**
 * User management routes for admin operations
 * Handles CRUD operations for user accounts with comprehensive role-based access control
 */

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  authenticateToken,
  requirePermission,
  requireMinimumRole,
  requireOwnershipOrAdmin,
  ROLES
} from '../middleware/authMiddleware';
import { ROLES as ROLE_CONSTANTS, Role, getRolePermissions, getUIRestrictions } from '../config/permissions';

const router = Router();
const prisma = new PrismaClient();

// Validation rules for user operations
const createUserValidation = [
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
    .withMessage('Name must be between 2 and 50 characters'),
  body('role')
    .isIn(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER', 'KITCHEN'])
    .withMessage('Invalid role'),
  body('storeId')
    .isLength({ min: 1 })
    .withMessage('Store ID is required')
];

const updateUserValidation = [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('role')
    .optional()
    .isIn(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER', 'KITCHEN'])
    .withMessage('Invalid role'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

/**
 * GET /api/users
 * Get all users with filtering and pagination
 * Requires: users:view_all permission (Manager+ only)
 */
router.get('/',
  authenticateToken,
  requirePermission('users:view_all'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 20,
        role,
        search,
        storeId,
        isActive
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where: any = {};

      // Non-super-admin users can only see users from their store
      if (req.user && req.user.role !== ROLES.SUPER_ADMIN) {
        where.storeId = req.user.storeId;
      }

      if (role) {
        where.role = String(role);
      }

      if (search) {
        where.OR = [
          { name: { contains: String(search), mode: 'insensitive' } },
          { email: { contains: String(search), mode: 'insensitive' } }
        ];
      }

      if (storeId) {
        where.storeId = String(storeId);
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            storeId: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          }
        }),
        prisma.user.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          users: users.map(user => ({
            ...user,
            permissions: getRolePermissions(user.role as Role),
            restrictions: getUIRestrictions(user.role as Role)
          })),
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

/**
 * GET /api/users/:id
 * Get single user by ID
 * Requires: users:read permission or ownership
 */
router.get('/:id',
  authenticateToken,
  requireOwnershipOrAdmin('id'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          storeId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Non-super-admin users can only see users from their store
      if (req.user && req.user.role !== ROLES.SUPER_ADMIN && user.storeId !== req.user.storeId) {
        res.status(403).json({
          success: false,
          message: 'Access denied for this user'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          user: {
            ...user,
            permissions: getRolePermissions(user.role as Role),
            restrictions: getUIRestrictions(user.role as Role)
          }
        }
      });

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

/**
 * POST /api/users
 * Create new user
 * Requires: users:create permission (Admin+ only)
 */
router.post('/',
  authenticateToken,
  requireMinimumRole(ROLES.ADMIN),
  requirePermission('users:create'),
  createUserValidation,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { email, password, name, role, storeId } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
        return;
      }

      // Only super-admin can create admin users
      if ([ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(role) && req.user?.role !== ROLES.SUPER_ADMIN) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions to create admin users'
        });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role,
          storeId,
          isActive: true
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          storeId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });

      res.status(201).json({
        success: true,
        data: {
          user: {
            ...user,
            permissions: getRolePermissions(user.role as Role),
            restrictions: getUIRestrictions(user.role as Role)
          }
        },
        message: 'User created successfully'
      });

    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

/**
 * PUT /api/users/:id
 * Update user
 * Requires: users:update permission or ownership
 */
router.put('/:id',
  authenticateToken,
  requireOwnershipOrAdmin('id'),
  updateUserValidation,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { id } = req.params;
      const { email, name, role, isActive } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Role changes require admin permissions
      if (role && role !== existingUser.role) {
        if (req.user?.role !== ROLES.SUPER_ADMIN && req.user?.role !== ROLES.ADMIN) {
          res.status(403).json({
            success: false,
            message: 'Insufficient permissions to change user roles'
          });
        return;
        }

        // Only super-admin can create/modify admin users
        if ([ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(role) && req.user?.role !== ROLES.SUPER_ADMIN) {
          res.status(403).json({
            success: false,
            message: 'Insufficient permissions to assign admin roles'
          });
        return;
        }
      }

      // Check for email conflicts
      if (email && email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email }
        });

        if (emailExists) {
          res.status(400).json({
            success: false,
            message: 'Email is already in use'
          });
        return;
        }
      }

      const updateData: any = {};
      if (email) updateData.email = email;
      if (name) updateData.name = name;
      if (role) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          storeId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });

      res.json({
        success: true,
        data: {
          user: {
            ...user,
            permissions: getRolePermissions(user.role as Role),
            restrictions: getUIRestrictions(user.role as Role)
          }
        },
        message: 'User updated successfully'
      });

    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

/**
 * DELETE /api/users/:id
 * Deactivate user (soft delete)
 * Requires: users:delete permission (Admin+ only)
 */
router.delete('/:id',
  authenticateToken,
  requireMinimumRole(ROLES.ADMIN),
  requirePermission('users:delete'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (req.user?.userId === id) {
        res.status(400).json({
          success: false,
          message: 'Cannot deactivate your own account'
        });
        return;
      }

      const existingUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Only super-admin can deactivate admin users
      if ([ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(existingUser.role as any) && req.user?.role !== ROLES.SUPER_ADMIN) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions to deactivate admin users'
        });
        return;
      }

      await prisma.user.update({
        where: { id },
        data: { isActive: false }
      });

      // Revoke all user sessions
      await prisma.userSession.deleteMany({
        where: { userId: id }
      });

      res.json({
        success: true,
        message: 'User deactivated successfully'
      });

    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

/**
 * POST /api/users/:id/reset-password
 * Reset user password (Admin only)
 * Requires: users:reset_password permission
 */
router.post('/:id/reset-password',
  authenticateToken,
  requireMinimumRole(ROLES.ADMIN),
  requirePermission('users:reset_password'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { id } = req.params;
      const { newPassword } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await prisma.user.update({
        where: { id },
        data: { password: hashedPassword }
      });

      // Revoke all user sessions (force re-login)
      await prisma.userSession.deleteMany({
        where: { userId: id }
      });

      res.json({
        success: true,
        message: 'Password reset successfully'
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

export default router;