import type { RequestHandler } from 'express';

export const tenantScopeMiddleware: RequestHandler = (
  request,
  _response,
  next,
) => {
  if (!request.identity) {
    next();
    return;
  }

  request.tenantContext = {
    tenantId: request.identity.tenantId,
    schoolId: request.identity.schoolId,
    branchId: request.identity.branchId,
    academicSessionId: request.identity.academicSessionId,
    isPlatformAdmin: request.identity.isPlatformAdmin,
  };
  next();
};
