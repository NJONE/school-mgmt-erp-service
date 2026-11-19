import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app.js';

const app = createApp({
  API_PREFIX: '/api/v1',
  CORS_ORIGINS: '*',
  NODE_ENV: 'test',
  LOG_LEVEL: 'silent',
});

describe('metadata API', () => {
  it('serves health and readiness endpoints', async () => {
    const health = await request(app).get('/health');
    const readiness = await request(app).get('/ready');

    expect(health.status).toBe(200);
    expect(health.body.data.status).toBe('ok');
    expect(readiness.status).toBe(200);
    expect(readiness.body.data.status).toBe('ready');
  });

  it('returns registered metadata and its UI layouts', async () => {
    const metadata = await request(app).get('/api/v1/metadata/students');
    const form = await request(app).get('/api/v1/metadata/students/form');
    const table = await request(app).get('/api/v1/metadata/students/table');
    const filters = await request(app).get('/api/v1/metadata/students/filters');

    expect(metadata.status).toBe(200);
    expect(
      metadata.body.data.fields.map(({ key }: { key: string }) => key),
    ).toContain('admissionNumber');
    expect(
      form.body.data.tabs.map(({ title }: { title: string }) => title),
    ).toEqual([
      'Personal Information',
      'Admission Details',
      'Parent Information',
      'Address',
      'Medical Information',
      'Academic Information',
      'Transport',
      'Documents',
    ]);
    expect(
      table.body.data.columns.map(({ field }: { field: string }) => field),
    ).toEqual([
      'admissionNumber',
      'photo',
      'fullName',
      'classId',
      'sectionId',
      'gender',
      'dateOfBirth',
      'mobileNumber',
      'studentStatus',
    ]);
    expect(
      filters.body.data.fields.map(({ field }: { field: string }) => field),
    ).toEqual([
      'academicSessionId',
      'classId',
      'sectionId',
      'gender',
      'studentStatus',
      'admissionDate',
      'search',
    ]);
  });

  it('returns the registered modules and a clear 404 for unknown entities', async () => {
    const modules = await request(app).get('/api/v1/metadata/modules');
    const missing = await request(app).get('/api/v1/metadata/notRegistered');

    expect(modules.body.data).toContain('academics');
    expect(missing.status).toBe(404);
    expect(missing.body.success).toBe(false);
    expect(missing.body.requestId).toBeTruthy();
  });
});
