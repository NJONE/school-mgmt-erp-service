import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app.js';
import { TenantModel } from '../../src/modules/tenants/models/tenant.model.js';
import { UserModel } from '../../src/modules/users/models/user.model.js';

let mongo: MongoMemoryServer;
let tenantId: mongoose.Types.ObjectId;
let secondTenantId: mongoose.Types.ObjectId;
let accessToken: string;
let refreshToken: string;

const app = createApp({
  API_PREFIX: '/api/v1',
  CORS_ORIGINS: 'http://localhost:4200',
  NODE_ENV: 'test',
  LOG_LEVEL: 'silent',
  JWT_ACCESS_SECRET: 'test-access-secret-at-least-32-characters',
  JWT_REFRESH_SECRET: 'test-refresh-secret-at-least-32-characters',
  JWT_ACCESS_EXPIRY: '15m',
  JWT_REFRESH_EXPIRY: '7d',
});

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

beforeEach(async () => {
  await mongoose.connection.db?.dropDatabase();
  tenantId = (
    await TenantModel.create({
      name: 'Test Academy',
      code: 'TEST',
      status: 'active',
    })
  )._id;
  secondTenantId = (
    await TenantModel.create({
      name: 'Other Academy',
      code: 'OTHER',
      status: 'active',
    })
  )._id;

  await UserModel.create({
    tenantId,
    email: 'admin@test.edu',
    passwordHash: await bcrypt.hash('StrongPassword123!', 4),
    displayName: 'Test Administrator',
    status: 'active',
    permissions: [
      'students.create',
      'students.read',
      'students.update',
      'students.delete',
      'users.create',
    ],
    roleKeys: ['TenantAdmin'],
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

async function login(): Promise<void> {
  const response = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@test.edu', password: 'StrongPassword123!' });
  expect(response.status).toBe(200);
  accessToken = response.body.data.accessToken;
  refreshToken = response.body.data.refreshToken;
}

describe('authentication and tenant-scoped CRUD', () => {
  it('logs in and refreshes tokens with rotation', async () => {
    await login();

    const refreshed = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });
    expect(refreshed.status, JSON.stringify(refreshed.body)).toBe(200);
    expect(refreshed.body.data.accessToken).toBeTruthy();

    const reused = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });
    expect(reused.status).toBe(401);

    const me = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${refetchedAccess(refreshed)}`);
    expect(me.status).toBe(200);
  });

  it('creates, lists, updates, soft-deletes, and isolates students', async () => {
    await login();
    const academicSessionId = new mongoose.Types.ObjectId();
    const classId = new mongoose.Types.ObjectId();
    const created = await request(app)
      .post('/api/v1/entities/students')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        tenantId: secondTenantId.toString(),
        admissionNumber: 'ADM-1001',
        firstName: 'Amina',
        lastName: 'Khan',
        fullName: 'Amina Khan',
        dateOfBirth: '2012-04-10',
        gender: 'female',
        admissionDate: '2026-01-10',
        academicSessionId: academicSessionId.toString(),
        classId: classId.toString(),
        mobileNumber: '+15550000001',
        studentStatus: 'active',
      });
    expect(created.status, JSON.stringify(created.body)).toBe(201);
    expect(created.body.data.fullName).toBeUndefined();

    const list = await request(app)
      .get(
        '/api/v1/entities/students?page=1&pageSize=20&filters=' +
          encodeURIComponent(JSON.stringify({ studentStatus: 'active' })),
      )
      .set('Authorization', `Bearer ${accessToken}`);
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);

    const recordId = created.body.data.id;
    const updated = await request(app)
      .patch(`/api/v1/entities/students/${recordId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ remarks: 'Updated by tenant admin' });
    expect(updated.status, JSON.stringify(updated.body)).toBe(200);

    await UserModel.create({
      tenantId: secondTenantId,
      email: 'other@test.edu',
      passwordHash: await bcrypt.hash('StrongPassword123!', 4),
      displayName: 'Other Administrator',
      status: 'active',
      permissions: ['students.read', 'students.delete'],
    });
    const otherLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'other@test.edu', password: 'StrongPassword123!' });
    const crossTenant = await request(app)
      .get(`/api/v1/entities/students/${recordId}`)
      .set('Authorization', `Bearer ${otherLogin.body.data.accessToken}`);
    expect(crossTenant.status).toBe(404);

    const injection = await request(app)
      .get(
        '/api/v1/entities/students?filters=' +
          encodeURIComponent(
            JSON.stringify({ studentStatus: { $ne: 'inactive' } }),
          ),
      )
      .set('Authorization', `Bearer ${accessToken}`);
    expect(injection.status).toBe(400);

    const deleted = await request(app)
      .delete(`/api/v1/entities/students/${recordId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(deleted.status).toBe(200);

    const deletedLookup = await request(app)
      .get(`/api/v1/entities/students/${recordId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(deletedLookup.status).toBe(404);
  });
});

function refetchedAccess(response: request.Response): string {
  return response.body.data.accessToken;
}
