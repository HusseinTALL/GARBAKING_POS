/**
 * Authentication Middleware
 * Handles JWT token validation and user authorization for protected routes
 */

import { Request, Response, NextFunction } from 'express';
import { authService, TokenPayload } from '../services/authService';
import {
  Role,
  hasPermission,
  hasMinimumRole,
  canAccessResource,
  ROLE_HIERARCHY
} from '../config/permissions';

// Extend Express Request type to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        userId: string;
        email: string;
        name: string;
        role: string;
        storeId: string;
        sessionId: string;
      };
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'TOKEN_REQUIRED'
      });
      return;
    }

    // Validate token
    const tokenPayload = await authService.validateToken(token);

    if (!tokenPayload) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        code: 'TOKEN_INVALID'
      });
      return;
    }

    // Add user info to request
    req.user = {
      id: tokenPayload.userId,
      userId: tokenPayload.userId,
      email: tokenPayload.email,
      name: '', // Will be populated from getUserById if needed
      role: tokenPayload.role,
      storeId: tokenPayload.storeId,
      sessionId: tokenPayload.sessionId
    };

    next();
    return;
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
    return;
  }
};

/**
 * Middleware to check if user has required role
 */
export const requireRole = (allowedRoles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'PERMISSION_DENIED'
      });
      return;
    }

    next();
    return;
  };
};

/**
 * Middleware to check if user belongs to specific store (optional check)
 */
export const requireStore = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
    return;
  }

  // Extract storeId from request params, query, or body
  const requestedStoreId = req.params.storeId || req.query.storeId || req.body.storeId;

  if (requestedStoreId && requestedStoreId !== req.user.storeId) {
    // Allow ADMIN and SUPER_ADMIN to access any store
    if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied for this store',
        code: 'STORE_ACCESS_DENIED'
      });
      return;
    }
  }

  next();
  return;
};

/**
 * Optional authentication middleware (doesn't fail if no token provided)
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const tokenPayload = await authService.validateToken(token);

      if (tokenPayload) {
        req.user = {
          id: tokenPayload.userId,
          userId: tokenPayload.userId,
          email: tokenPayload.email,
          name: '', // Will be populated from getUserById if needed
          role: tokenPayload.role,
          storeId: tokenPayload.storeId,
          sessionId: tokenPayload.sessionId
        };
      }
    }

    next();
    return;
  } catch (error) {
    // Continue without authentication if token validation fails
    next();
    return;
  }
};

/**
 * Role-based permission constants
 */
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  CASHIER: 'CASHIER',
  KITCHEN: 'KITCHEN'
} as const;

/**
 * Permission level constants (higher numbers = more permissions)
 * Now imported from permissions config
 */
export const PERMISSION_LEVELS = ROLE_HIERARCHY;

/**
 * Check if user has minimum permission level
 */
export const requirePermissionLevel = (minLevel: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    const userLevel = PERMISSION_LEVELS[req.user.role as keyof typeof PERMISSION_LEVELS] || 0;

    if (userLevel < minLevel) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permission level',
        code: 'PERMISSION_LEVEL_DENIED'
      });
      return;
    }

    next();
    return;
  };
};

/**
 * Validate request rate limiting (basic implementation)
 */
export const rateLimitAuth = (maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const identifier = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    const userAttempts = attempts.get(identifier);

    if (!userAttempts || now > userAttempts.resetTime) {
      // Reset or initialize counter
      attempts.set(identifier, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userAttempts.count >= maxAttempts) {
      res.status(429).json({
        success: false,
        message: 'Too many authentication attempts. Please try again later.',
        code: 'RATE_LIMITED',
        retryAfter: Math.ceil((userAttempts.resetTime - now) / 1000)
      });
      return;
    }

    userAttempts.count++;
    next();
    return;
  };
};

/**
 * Check if user has specific permission
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    const userRole = req.user.role as Role;
    if (!hasPermission(userRole, permission)) {
      res.status(403).json({
        success: false,
        message: `Permission denied: ${permission}`,
        code: 'PERMISSION_DENIED',
        requiredPermission: permission
      });
      return;
    }

    next();
    return;
  };
};

/**
 * Check if user can access specific resource with action
 */
export const requireResourceAccess = (resource: string, action: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    const userRole = req.user.role as Role;
    if (!canAccessResource(userRole, resource, action)) {
      res.status(403).json({
        success: false,
        message: `Access denied: Cannot ${action} ${resource}`,
        code: 'RESOURCE_ACCESS_DENIED',
        resource,
        action
      });
      return;
    }

    next();
    return;
  };
};

/**
 * Check if user has minimum role level
 */
export const requireMinimumRole = (minimumRole: Role) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    const userRole = req.user.role as Role;
    if (!hasMinimumRole(userRole, minimumRole)) {
      res.status(403).json({
        success: false,
        message: `Minimum role required: ${minimumRole}`,
        code: 'ROLE_INSUFFICIENT',
        currentRole: userRole,
        minimumRole
      });
      return;
    }

    next();
    return;
  };
};

/**
 * Multiple permission middleware - user needs ALL permissions
 */
export const requireAllPermissions = (permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    const userRole = req.user.role as Role;
    const missingPermissions = permissions.filter(permission => !hasPermission(userRole, permission));

    if (missingPermissions.length > 0) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'MULTIPLE_PERMISSIONS_DENIED',
        missingPermissions
      });
      return;
    }

    next();
    return;
  };
};

/**
 * Alternative permission middleware - user needs ANY of the permissions
 */
export const requireAnyPermission = (permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    const userRole = req.user.role as Role;
    const hasAnyPermission = permissions.some(permission => hasPermission(userRole, permission));

    if (!hasAnyPermission) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'ALTERNATIVE_PERMISSIONS_DENIED',
        requiredPermissions: permissions
      });
      return;
    }

    next();
    return;
  };
};

/**
 * Owner or Admin access - allows user to access their own resources or admin access
 */
export const requireOwnershipOrAdmin = (userIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    const userRole = req.user.role as Role;
    const requestedUserId = req.params[userIdField] || req.body[userIdField];

    // Admin and above can access any resource
    if (hasMinimumRole(userRole, 'ADMIN' as Role)) {
      next();
      return;
    }

    // User can only access their own resources
    if (req.user.userId === requestedUserId) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      message: 'Access denied: Can only access own resources',
      code: 'OWNERSHIP_REQUIRED'
    });
    return;
  };
};