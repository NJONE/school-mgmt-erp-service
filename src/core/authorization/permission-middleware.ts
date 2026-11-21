import type { RequestHandler } from 'express';
import { AppError } from '../errors/app-error.js';

export function requirePermission(permission: string): RequestHandler {
  return (request, _response, next) => {
    if (!request.identity) {
      next(new AppError('Authentication required', 401));
      return;
    }
    if (
      request.identity.isPlatformAdmin ||
      request.identity.permissions.includes(permission) ||
      request.identity.permissions.includes('*')
    ) {
      next();
      return;
    }
    next(new AppError('Insufficient permissions', 403));
  };
}
