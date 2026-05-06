const { validateEnv, validateAll } = require('../src/validator');

const reference = {
  DATABASE_URL: 'postgres://localhost/dev',
  API_KEY: 'abc123',
  PORT: '3000',
};

describe('validateEnv', () => {
  test('returns valid when env matches reference', () => {
    const env = { DATABASE_URL: 'postgres://prod/db', API_KEY: 'xyz', PORT: '8080' };
    const result = validateEnv(env, reference);
    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
    expect(result.extra).toHaveLength(0);
    expect(result.empty).toHaveLength(0);
  });

  test('detects missing keys', () => {
    const env = { DATABASE_URL: 'postgres://prod/db', PORT: '8080' };
    const result = validateEnv(env, reference);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('API_KEY');
  });

  test('detects extra keys when allowExtra is false', () => {
    const env = { DATABASE_URL: 'x', API_KEY: 'y', PORT: '3000', EXTRA_KEY: 'z' };
    const result = validateEnv(env, reference, { allowExtra: false });
    expect(result.valid).toBe(false);
    expect(result.extra).toContain('EXTRA_KEY');
  });

  test('allows extra keys when allowExtra is true', () => {
    const env = { DATABASE_URL: 'x', API_KEY: 'y', PORT: '3000', EXTRA_KEY: 'z' };
    const result = validateEnv(env, reference, { allowExtra: true });
    expect(result.extra).toHaveLength(0);
  });

  test('detects empty values', () => {
    const env = { DATABASE_URL: '', API_KEY: 'y', PORT: '3000' };
    const result = validateEnv(env, reference);
    expect(result.valid).toBe(false);
    expect(result.empty).toContain('DATABASE_URL');
  });

  test('allows empty values when allowEmpty is true', () => {
    const env = { DATABASE_URL: '', API_KEY: 'y', PORT: '3000' };
    const result = validateEnv(env, reference, { allowEmpty: true });
    expect(result.empty).toHaveLength(0);
  });
});

describe('validateAll', () => {
  test('validates multiple envs and returns a map of results', () => {
    const envMap = {
      staging: { DATABASE_URL: 'x', API_KEY: 'y', PORT: '3000' },
      production: { DATABASE_URL: 'x', PORT: '3000' },
    };
    const results = validateAll(envMap, reference);
    expect(results.staging.valid).toBe(true);
    expect(results.production.valid).toBe(false);
    expect(results.production.missing).toContain('API_KEY');
  });
});
