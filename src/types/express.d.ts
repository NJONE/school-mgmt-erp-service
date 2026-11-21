import type { TenantContext } from '../core/tenancy/tenant-context.js';
import type { AuthenticatedIdentity } from '../core/authentication/identity.js';

declare global {
  namespace Express {
    interface Request {
      tenantContext?: TenantContext;
      identity?: AuthenticatedIdentity;
      id?: string | number;
    }
  }
}

export {};
