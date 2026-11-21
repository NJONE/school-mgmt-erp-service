import type { RequestHandler } from 'express';
import type { AppConfig } from '../../config/env.js';
import { AppError } from '../errors/app-error.js';
import { AuthenticationService } from './auth-service.js';

export function authenticationMiddleware(
  config: Pick<
    AppConfig,
    | 'JWT_ACCESS_SECRET'
    | 'JWT_REFRESH_SECRET'
    | 'JWT_ACCESS_EXPIRY'
    | 'JWT_REFRESH_EXPIRY'
  >,
): RequestHandler {
  const auth = new AuthenticationService(config);
  return async (request, _response, next) => {
    try {
      const header = request.headers.authorization;
      if (!header?.startsWith('Bearer ')) {
        throw new AppError('Authentication required', 401);
      }
      request.identity = await auth.authenticateAccessToken(header.slice(7));
      next();
    } catch (error) {
      next(error);
    }
  };
}
