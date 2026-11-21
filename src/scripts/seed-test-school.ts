import { readFile } from 'node:fs/promises';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { z } from 'zod';
import { loadEnv } from '../config/env.js';
import { metadataModelRegistry } from '../core/crud/metadata-model-registry.js';
import { RoleModel } from '../modules/roles/models/role.model.js';
import { TenantModel } from '../modules/tenants/models/tenant.model.js';
import { UserModel } from '../modules/users/models/user.model.js';

const seedSchema = z.object({
  tenant: z.object({
    name: z.string().trim().min(1).max(200),
    code: z.string().trim().min(1).max(30),
    status: z.enum(['active', 'suspended', 'inactive']),
  }),
  school: z.object({
    code: z.string().trim().min(1).max(30),
    name: z.string().trim().min(1).max(160),
    legalName: z.string().trim().max(200),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().min(1).max(30),
    website: z.string().trim().max(255),
    address: z.string().trim().min(1).max(500),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().max(100),
    country: z.string().trim().min(1).max(100),
    postalCode: z.string().trim().max(20),
    timezone: z.string().trim().min(1).max(80),
    currency: z.string().trim().length(3),
    status: z.enum(['active', 'inactive', 'suspended']),
  }),
  branch: z.object({
    code: z.string().trim().min(1).max(30),
    name: z.string().trim().min(1).max(160),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().min(1).max(30),
    address: z.string().trim().min(1).max(500),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().max(100),
    country: z.string().trim().min(1).max(100),
    isMainBranch: z.boolean(),
    status: z.enum(['active', 'inactive']),
  }),
  academicSession: z.object({
    name: z.string().trim().min(1),
    code: z.string().trim().min(1).max(50),
    startDate: z.string().date(),
    endDate: z.string().date(),
    status: z.enum(['active', 'inactive', 'closed']),
  }),
  administrator: z.object({
    name: z.string().trim().min(1).max(160),
    email: z.string().trim().email().max(254),
    password: z.string().min(12),
    roleKey: z.string().trim().min(1).max(80),
    roleName: z.string().trim().min(1).max(120),
    permissions: z.array(z.string().trim().min(1)).min(1),
  }),
});

async function seedTestSchool(): Promise<void> {
  const fixturePath = new URL('../../scripts/seed/test-school.json', import.meta.url);
  const raw = await readFile(fixturePath, 'utf8');
  const seed = seedSchema.parse(JSON.parse(raw));
  const config = loadEnv();

  await mongoose.connect(config.MONGODB_URI);
  try {
    const tenant = await TenantModel.findOneAndUpdate(
      { code: seed.tenant.code.toUpperCase() },
      { $setOnInsert: seed.tenant },
      { upsert: true, new: true, runValidators: true },
    );

    const schoolModel = metadataModelRegistry.get('schools');
    const branchModel = metadataModelRegistry.get('branches');
    const sessionModel = metadataModelRegistry.get('academicSessions');
    if (!schoolModel || !branchModel || !sessionModel) {
      throw new Error('Required school metadata models are unavailable');
    }

    const school = await schoolModel.findOneAndUpdate(
      { tenantId: tenant._id, code: seed.school.code },
      { $set: { ...seed.school, tenantId: tenant._id, deletedAt: null } },
      { upsert: true, new: true, runValidators: true },
    ).lean();

    const branch = await branchModel.findOneAndUpdate(
      { tenantId: tenant._id, schoolId: school._id, code: seed.branch.code },
      {
        $set: {
          ...seed.branch,
          tenantId: tenant._id,
          schoolId: school._id,
          deletedAt: null,
        },
      },
      { upsert: true, new: true, runValidators: true },
    ).lean();

    const academicSession = await sessionModel.findOneAndUpdate(
      { tenantId: tenant._id, schoolId: school._id, code: seed.academicSession.code },
      {
        $set: {
          ...seed.academicSession,
          tenantId: tenant._id,
          schoolId: school._id,
          branchId: branch._id,
          deletedAt: null,
        },
      },
      { upsert: true, new: true, runValidators: true },
    ).lean();

    const role = await RoleModel.findOneAndUpdate(
      { tenantId: tenant._id, key: seed.administrator.roleKey },
      {
        $set: {
          name: seed.administrator.roleName,
          permissions: seed.administrator.permissions,
          system: true,
        },
        $setOnInsert: { tenantId: tenant._id, key: seed.administrator.roleKey },
      },
      { upsert: true, new: true, runValidators: true },
    );

    const passwordHash = await bcrypt.hash(seed.administrator.password, 12);
    await UserModel.findOneAndUpdate(
      { tenantId: tenant._id, email: seed.administrator.email.toLowerCase() },
      {
        $set: {
          schoolId: school._id,
          branchId: branch._id,
          academicSessionId: academicSession._id,
          isPlatformAdmin: false,
          displayName: seed.administrator.name,
          passwordHash,
          status: 'active',
          failedLoginAttempts: 0,
          lockedUntil: null,
          roleKeys: [role.key],
          permissions: seed.administrator.permissions,
          deletedAt: null,
        },
        $setOnInsert: {
          tenantId: tenant._id,
          email: seed.administrator.email.toLowerCase(),
        },
      },
      { upsert: true, new: true, runValidators: true },
    );

    console.info(`Seeded test school "${seed.school.name}"`);
    console.info(`Administrator: ${seed.administrator.email}`);
  } finally {
    await mongoose.disconnect();
  }
}

seedTestSchool().catch((error: unknown) => {
  console.error('Failed to seed test school:', error);
  process.exitCode = 1;
});
