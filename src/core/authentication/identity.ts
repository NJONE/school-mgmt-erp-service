import type { Types } from 'mongoose';

export interface AuthenticatedIdentity {
  userId: Types.ObjectId;
  tenantId: Types.ObjectId | null;
  schoolId: Types.ObjectId | null;
  branchId: Types.ObjectId | null;
  academicSessionId: Types.ObjectId | null;
  isPlatformAdmin: boolean;
  roleKeys: string[];
  permissions: string[];
}
