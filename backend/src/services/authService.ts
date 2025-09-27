/**
 * Authentication Service
 * Handles user authentication, JWT token generation/validation, and session management
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ROLES, Role, getRolePermissions, getUIRestrictions } from '../config/permissions';

const prisma = new PrismaClient();

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: string;
  storeId: string;
}

export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    storeId: string;
    isActive: boolean;
    permissions?: string[];
    restrictions?: any;
  };
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  storeId: string;
  sessionId: string;
  type: 'access' | 'refresh';
}

class AuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_REFRESH_SECRET: string;
  private readonly ACCESS_TOKEN_EXPIRES_IN = '15m';
  private readonly REFRESH_TOKEN_EXPIRES_IN = '7d';
  private readonly SALT_ROUNDS = 12;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
    this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';

    if (process.env.NODE_ENV === 'production' && (this.JWT_SECRET === 'your-super-secret-key-change-in-production')) {
      throw new Error('JWT_SECRET must be set in production environment');
    }
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        return {
          success: false,
          message: 'User with this email already exists'
        };
      }

      // Validate role
      const role = userData.role || 'CASHIER';
      if (!Object.values(ROLES).includes(role as Role)) {
        return {
          success: false,
          message: 'Invalid role provided'
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, this.SALT_ROUNDS);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: role,
          storeId: userData.storeId,
          isActive: true
        }
      });

      // Generate tokens
      const tokens = await this.generateTokenPair(user);

      const userRole = user.role as Role;
      const permissions = getRolePermissions(userRole);
      const restrictions = getUIRestrictions(userRole);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          storeId: user.storeId,
          isActive: user.isActive,
          permissions,
          restrictions
        },
        tokens,
        message: 'User registered successfully'
      };

    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.'
      };
    }
  }

  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: credentials.email }
      });

      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Check if user is active
      if (!user.isActive) {
        return {
          success: false,
          message: 'Account is deactivated. Contact administrator.'
        };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, user.password);

      if (!isValidPassword) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Generate tokens
      const tokens = await this.generateTokenPair(user);

      const userRole = user.role as Role;
      const permissions = getRolePermissions(userRole);
      const restrictions = getUIRestrictions(userRole);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          storeId: user.storeId,
          isActive: user.isActive,
          permissions,
          restrictions
        },
        tokens,
        message: 'Login successful'
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as TokenPayload;

      if (decoded.type !== 'refresh') {
        return {
          success: false,
          message: 'Invalid token type'
        };
      }

      // Find user session
      const session = await prisma.userSession.findFirst({
        where: {
          id: decoded.sessionId,
          userId: decoded.userId,
          expiresAt: {
            gt: new Date()
          }
        },
        include: {
          user: true
        }
      });

      if (!session) {
        return {
          success: false,
          message: 'Invalid or expired session'
        };
      }

      // Check if user is still active
      if (!session.user.isActive) {
        await this.revokeSession(decoded.sessionId);
        return {
          success: false,
          message: 'Account is deactivated'
        };
      }

      // Generate new access token (keep same session)
      const newAccessToken = this.generateAccessToken(session.user, decoded.sessionId);

      return {
        success: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
          storeId: session.user.storeId,
          isActive: session.user.isActive
        },
        tokens: {
          accessToken: newAccessToken,
          refreshToken: refreshToken // Return the same refresh token
        },
        message: 'Token refreshed successfully'
      };

    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        message: 'Token refresh failed'
      };
    }
  }

  /**
   * Logout user by revoking session
   */
  async logout(sessionId: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.revokeSession(sessionId);
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: 'Logout failed'
      };
    }
  }

  /**
   * Validate access token
   */
  async validateToken(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as TokenPayload;

      if (decoded.type !== 'access') {
        return null;
      }

      // Check if session is still valid
      const session = await prisma.userSession.findFirst({
        where: {
          id: decoded.sessionId,
          userId: decoded.userId,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      if (!session) {
        return null;
      }

      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate access and refresh token pair
   */
  private async generateTokenPair(user: any): Promise<{ accessToken: string; refreshToken: string }> {
    // Create session
    const sessionId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.userSession.create({
      data: {
        id: sessionId,
        userId: user.id,
        token: sessionId, // Using sessionId as token identifier
        expiresAt
      }
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(user, sessionId);
    const refreshToken = this.generateRefreshToken(user, sessionId);

    return { accessToken, refreshToken };
  }

  /**
   * Generate access token
   */
  private generateAccessToken(user: any, sessionId: string): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      storeId: user.storeId,
      sessionId,
      type: 'access'
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
      issuer: 'garbaking-pos',
      audience: 'garbaking-pos-client'
    });
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken(user: any, sessionId: string): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      storeId: user.storeId,
      sessionId,
      type: 'refresh'
    };

    return jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'garbaking-pos',
      audience: 'garbaking-pos-client'
    });
  }

  /**
   * Revoke user session
   */
  private async revokeSession(sessionId: string): Promise<void> {
    await prisma.userSession.deleteMany({
      where: { id: sessionId }
    });
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    await prisma.userSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
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
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return { success: false, message: 'Current password is incorrect' };
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
      });

      // Revoke all user sessions (force re-login)
      await prisma.userSession.deleteMany({
        where: { userId }
      });

      return { success: true, message: 'Password changed successfully' };

    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, message: 'Password change failed' };
    }
  }
}

export const authService = new AuthService();