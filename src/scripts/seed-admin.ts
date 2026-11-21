import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { z } from 'zod';
import { loadEnv } from '../config/env.js';
import { RoleModel } from '../modules/roles/models/role.model.js';
import { TenantModel } from '../modules/tenants/models/tenant.model.js';
import { UserModel } from '../modules/users/models/user.model.js';

const seedConfigSchema = z.object({
  SEED_TENANT_NAME: z.string().trim().min(1).max(200),
  SEED_TENANT_CODE: z.string().trim().min(1).max(30),
  SEED_ADMIN_NAME: z.string().trim().min(1).max(160),
  SEED_ADMIN_EMAIL: z.string().trim().email().max(254),
  SEED_ADMIN_PASSWORD: z.string().min(12),
});

async function seedAdmin(): Promise<void> {
  const config = loadEnv();
  const parsedSeedConfig = seedConfigSchema.safeParse(process.env);
  if (!parsedSeedConfig.success) {
    const details = parsedSeedConfig.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid admin seed configuration: ${details}`);
  }
  const seedConfig = parsedSeedConfig.data;

  await mongoose.connect(config.MONGODB_URI);
  try {
    const tenant = await TenantModel.findOneAndUpdate(
      { code: seedConfig.SEED_TENANT_CODE },
      {
        $setOnInsert: {
          name: seedConfig.SEED_TENANT_NAME,
          code: seedConfig.SEED_TENANT_CODE,
          status: 'active',
        },
      },
      { upsert: true, new: true },
    );

    const roleKey = 'school-admin';
    await RoleModel.findOneAndUpdate(
      { tenantId: tenant._id, key: roleKey },
      {
        $set: {
          name: 'School Administrator',
          permissions: ['*'],
          system: true,
        },
        $setOnInsert: { tenantId: tenant._id, key: roleKey },
      },
      { upsert: true, new: true },
    );

    const passwordHash = await bcrypt.hash(seedConfig.SEED_ADMIN_PASSWORD, 12);
    await UserModel.findOneAndUpdate(
      {
        tenantId: tenant._id,
        email: seedConfig.SEED_ADMIN_EMAIL.toLowerCase(),
      },
      {
        $set: { roleKeys: [roleKey], permissions: ['*'] },
        $setOnInsert: {
          tenantId: tenant._id,
          email: seedConfig.SEED_ADMIN_EMAIL.toLowerCase(),
          displayName: seedConfig.SEED_ADMIN_NAME,
          passwordHash,
          status: 'active',
        },
      },
      { upsert: true, new: true },
    );

    console.info(
      `Seeded tenant ${tenant.code} and admin ${seedConfig.SEED_ADMIN_EMAIL.toLowerCase()}.`,
    );
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin().catch((error: unknown) => {
  console.error('Failed to seed school admin:', error);
  process.exitCode = 1;
});
