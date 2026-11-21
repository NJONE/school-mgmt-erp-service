import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import type { AppConfig } from '../config/env.js';
import { AuthenticationService } from '../core/authentication/auth-service.js';
import { authenticationMiddleware } from '../core/authentication/authentication-middleware.js';
import { tenantScopeMiddleware } from '../core/tenancy/tenant-scope-middleware.js';
import { AppError } from '../core/errors/app-error.js';
import { UserModel } from '../modules/users/models/user.model.js';
import { requirePermission } from '../core/authorization/permission-middleware.js';

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(20),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(128),
  newPassword: z.string().min(12).max(128),
});

const createUserSchema = z.object({
  email: z.string().trim().email(),
  displayName: z.string().trim().min(1).max(160),
  password: z.string().min(12).max(128),
  schoolId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  branchId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  academicSessionId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  roleKeys: z.array(z.string().trim().min(1)).optional(),
  permissions: z.array(z.string().trim().min(1)).optional(),
  isPlatformAdmin: z.boolean().optional(),
  tenantId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
});

export function createAuthRouter(
  config: Pick<
    AppConfig,
    | 'JWT_ACCESS_SECRET'
    | 'JWT_REFRESH_SECRET'
    | 'JWT_ACCESS_EXPIRY'
    | 'JWT_REFRESH_EXPIRY'
  >,
) {
  const router = Router();
  const auth = new AuthenticationService(config);
  const authenticate = authenticationMiddleware(config);

  router.post('/login', async (request, response, next) => {
    try {
      const input = loginSchema.parse(request.body);
      const result = await auth.login(input.email, input.password);
      response.json({
        success: true,
        data: {
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
          expiresIn: result.tokens.expiresIn,
          identity: result.identity,
        },
        message: 'Login successful',
      });
    } catch (error) {
      next(error);
    }
  });

  router.post('/refresh', async (request, response, next) => {
    try {
      const input = refreshSchema.parse(request.body);
      const result = await auth.rotateRefreshToken(input.refreshToken);
      response.json({
        success: true,
        data: {
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
          expiresIn: result.tokens.expiresIn,
          identity: result.identity,
        },
        message: 'Token refreshed',
      });
    } catch (error) {
      next(error);
    }
  });

  router.post(
    '/logout',
    authenticate,
    tenantScopeMiddleware,
    async (request, response, next) => {
      try {
        const input = refreshSchema.partial().parse(request.body);
        if (input.refreshToken)
          await auth.revokeRefreshToken(input.refreshToken);
        response.json({
          success: true,
          data: null,
          message: 'Logout successful',
        });
      } catch (error) {
        next(error);
      }
    },
  );

  router.get(
    '/me',
    authenticate,
    tenantScopeMiddleware,
    (request, response) => {
      response.json({ success: true, data: request.identity });
    },
  );

  router.post(
    '/users',
    authenticate,
    tenantScopeMiddleware,
    requirePermission('users.create'),
    async (request, response, next) => {
      try {
        const input = createUserSchema.parse(request.body);
        if (!request.identity?.isPlatformAdmin && input.isPlatformAdmin) {
          throw new AppError(
            'Only platform administrators may create platform users',
            403,
          );
        }
        const tenantId = request.identity?.isPlatformAdmin
          ? input.tenantId
          : request.identity?.tenantId?.toString();
        if (!tenantId && !input.isPlatformAdmin) {
          throw new AppError('Tenant context is required', 403);
        }
        const duplicate = await UserModel.exists({
          tenantId: tenantId ?? null,
          email: input.email.trim().toLowerCase(),
          deletedAt: null,
        });
        if (duplicate)
          throw new AppError('A user with this email already exists', 409);

        const user = await UserModel.create({
          tenantId: tenantId ?? null,
          schoolId: request.identity?.schoolId ?? input.schoolId,
          branchId: request.identity?.branchId ?? input.branchId,
          academicSessionId:
            request.identity?.academicSessionId ?? input.academicSessionId,
          isPlatformAdmin: request.identity?.isPlatformAdmin
            ? (input.isPlatformAdmin ?? false)
            : false,
          email: input.email,
          displayName: input.displayName,
          passwordHash: await bcrypt.hash(input.password, 12),
          roleKeys: input.roleKeys ?? [],
          permissions: input.permissions ?? [],
          status: 'active',
        });
        response.status(201).json({
          success: true,
          data: {
            id: user._id.toString(),
            email: user.email,
            displayName: user.displayName,
            status: user.status,
          },
          message: 'User created',
        });
      } catch (error) {
        next(error);
      }
    },
  );

  router.post(
    '/change-password',
    authenticate,
    async (request, response, next) => {
      try {
        const input = changePasswordSchema.parse(request.body);
        const user = await UserModel.findById(request.identity!.userId).select(
          '+passwordHash',
        );
        if (!user) throw new AppError('Account not found', 404);
        if (!(await bcrypt.compare(input.currentPassword, user.passwordHash))) {
          throw new AppError('Current password is incorrect', 400);
        }
        user.passwordHash = await bcrypt.hash(input.newPassword, 12);
        await user.save();
        response.json({
          success: true,
          data: null,
          message: 'Password changed',
        });
      } catch (error) {
        next(error);
      }
    },
  );

  return router;
}
