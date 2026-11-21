import type { Types } from 'mongoose';

export interface TenantContext {
  tenantId: Types.ObjectId | null;
  schoolId: Types.ObjectId | null;
  branchId: Types.ObjectId | null;
  academicSessionId: Types.ObjectId | null;
  isPlatformAdmin: boolean;
}
