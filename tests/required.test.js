const { checkKey, checkRequired, checkRequiredGroups, failingKeys } = require('../src/required');

describe('checkKey', () => {
  it('marks a present, non-empty key correctly', () => {
    expect(checkKey({ FOO: 'bar' }, 'FOO')).toEqual({ key: 'FOO', present: true, empty: false });
  });

  it('marks a missing key', () => {
    expect(checkKey({}, 'FOO')).toEqual({ key: 'FOO', present: false, empty: false });
  });

  it('marks an empty string value', () => {
    expect(checkKey({ FOO: '' }, 'FOO')).toEqual({ key: 'FOO', present: true, empty: true });
  });

  it('marks a null value as empty', () => {
    expect(checkKey({ FOO: null }, 'FOO')).toEqual({ key: 'FOO', present: true, empty: true });
  });
});

describe('checkRequired', () => {
  const env = { DB_HOST: 'localhost', DB_PORT: '5432', API_KEY: '' };

  it('returns valid when all keys are present and non-empty', () => {
    const result = checkRequired(env, ['DB_HOST', 'DB_PORT']);
    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
    expect(result.empty).toHaveLength(0);
  });

  it('detects missing keys', () => {
    const result = checkRequired(env, ['DB_HOST', 'SECRET']);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('SECRET');
  });

  it('detects empty keys', () => {
    const result = checkRequired(env, ['DB_HOST', 'API_KEY']);
    expect(result.valid).toBe(false);
    expect(result.empty).toContain('API_KEY');
  });

  it('returns invalid when both missing and empty exist', () => {
    const result = checkRequired(env, ['API_KEY', 'MISSING']);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('MISSING');
    expect(result.empty).toContain('API_KEY');
  });
});

describe('checkRequiredGroups', () => {
  const env = { DB_HOST: 'localhost', DB_PORT: '5432', SMTP_HOST: '' };
  const groups = [
    { name: 'database', keys: ['DB_HOST', 'DB_PORT'] },
    { name: 'email', keys: ['SMTP_HOST', 'SMTP_PORT'] },
  ];

  it('returns results for each group', () => {
    const results = checkRequiredGroups(env, groups);
    expect(results).toHaveLength(2);
    expect(results[0].name).toBe('database');
    expect(results[0].valid).toBe(true);
    expect(results[1].name).toBe('email');
    expect(results[1].valid).toBe(false);
  });
});

describe('failingKeys', () => {
  it('returns combined missing and empty keys', () => {
    const env = { A: 'ok', B: '', C: 'set' };
    const result = failingKeys(env, ['A', 'B', 'D']);
    expect(result).toContain('B');
    expect(result).toContain('D');
    expect(result).not.toContain('A');
  });

  it('returns empty array when all keys pass', () => {
    const env = { X: '1', Y: '2' };
    expect(failingKeys(env, ['X', 'Y'])).toHaveLength(0);
  });
});
