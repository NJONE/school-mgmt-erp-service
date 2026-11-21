import { Router } from 'express';
import type { AppConfig } from '../config/env.js';
import { authenticationMiddleware } from '../core/authentication/authentication-middleware.js';
import { requirePermission } from '../core/authorization/permission-middleware.js';
import { GenericCrudService } from '../core/crud/generic-crud.service.js';
import { AppError } from '../core/errors/app-error.js';
import { metadataRegistry } from '../core/metadata/registry/index.js';
import { tenantScopeMiddleware } from '../core/tenancy/tenant-scope-middleware.js';

export function createEntityRouter(
  config: Pick<
    AppConfig,
    | 'JWT_ACCESS_SECRET'
    | 'JWT_REFRESH_SECRET'
    | 'JWT_ACCESS_EXPIRY'
    | 'JWT_REFRESH_EXPIRY'
  >,
) {
  const router = Router();
  const authenticate = authenticationMiddleware(config);
  const crud = new GenericCrudService();

  router.use(authenticate, tenantScopeMiddleware);

  router.get('/:entity', (request, response, next) => {
    void (async () => {
      const metadata = resolveEntity(request.params.entity);
      const permission = requirePermission(`${metadata.entityCode}.read`);
      permission(request, response, (permissionError) => {
        void (async () => {
          if (permissionError) {
            next(permissionError);
            return;
          }
          const result = await crud.list(
            metadata,
            request.query as Record<string, unknown>,
            request.tenantContext!,
          );
          response.json({
            success: true,
            data: result.data,
            meta: result.meta,
          });
        })().catch(next);
      });
    })().catch(next);
  });

  router.get('/:entity/:id', (request, response, next) => {
    void (async () => {
      const metadata = resolveEntity(request.params.entity);
      const permission = requirePermission(`${metadata.entityCode}.read`);
      permission(request, response, (permissionError) => {
        void (async () => {
          if (permissionError) {
            next(permissionError);
            return;
          }
          const data = await crud.getById(
            metadata,
            request.params.id,
            request.tenantContext!,
          );
          if (!data) throw new AppError('Entity record not found', 404);
          response.json({ success: true, data, message: 'Record retrieved' });
        })().catch(next);
      });
    })().catch(next);
  });

  router.post('/:entity', (request, response, next) => {
    void (async () => {
      const metadata = resolveEntity(request.params.entity);
      const permission = requirePermission(`${metadata.entityCode}.create`);
      permission(request, response, (permissionError) => {
        void (async () => {
          if (permissionError) {
            next(permissionError);
            return;
          }
          const data = await crud.create(
            metadata,
            request.body as Record<string, unknown>,
            request.tenantContext!,
          );
          response.status(201).json({
            success: true,
            data,
            message: 'Record created',
          });
        })().catch(next);
      });
    })().catch(next);
  });

  router.patch('/:entity/:id', (request, response, next) => {
    void (async () => {
      const metadata = resolveEntity(request.params.entity);
      const permission = requirePermission(`${metadata.entityCode}.update`);
      permission(request, response, (permissionError) => {
        void (async () => {
          if (permissionError) {
            next(permissionError);
            return;
          }
          const data = await crud.update(
            metadata,
            request.params.id,
            request.body as Record<string, unknown>,
            request.tenantContext!,
          );
          if (!data) throw new AppError('Entity record not found', 404);
          response.json({ success: true, data, message: 'Record updated' });
        })().catch(next);
      });
    })().catch(next);
  });

  router.delete('/:entity/:id', (request, response, next) => {
    void (async () => {
      const metadata = resolveEntity(request.params.entity);
      const permission = requirePermission(`${metadata.entityCode}.delete`);
      permission(request, response, (permissionError) => {
        void (async () => {
          if (permissionError) {
            next(permissionError);
            return;
          }
          const deleted = await crud.softDelete(
            metadata,
            request.params.id,
            request.tenantContext!,
          );
          if (!deleted) throw new AppError('Entity record not found', 404);
          response.json({
            success: true,
            data: null,
            message: 'Record deleted',
          });
        })().catch(next);
      });
    })().catch(next);
  });

  return router;

  function resolveEntity(entityCode: string) {
    const metadata = metadataRegistry.getByEntityCode(entityCode);
    if (!metadata) throw new AppError('Entity is not registered', 404);
    return metadata;
  }
}
