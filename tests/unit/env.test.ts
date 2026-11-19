import { describe, expect, it } from 'vitest';
import { loadEnv } from '../../src/config/env.js';

describe('loadEnv', () => {
  it('applies safe defaults to a valid minimal configuration', () => {
    expect(
      loadEnv({ MONGODB_URI: 'mongodb://localhost:27017/erp' }),
    ).toMatchObject({
      NODE_ENV: 'development',
      PORT: 3000,
      API_PREFIX: '/api/v1',
    });
  });

  it('reports invalid or missing required values', () => {
    expect(() =>
      loadEnv({ MONGODB_URI: 'mongodb://localhost:27017/erp', PORT: '0' }),
    ).toThrow('PORT');
    expect(() => loadEnv({ PORT: '3000' })).toThrow('MONGODB_URI');
  });
});
