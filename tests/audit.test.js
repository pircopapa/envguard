const { auditEnv, isCleanAudit } = require('../src/audit');

describe('auditEnv', () => {
  test('flags sensitive key with empty value', () => {
    const issues = auditEnv({ API_KEY: '' });
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].key).toBe('API_KEY');
    expect(issues[0].issue).toMatch(/placeholder or empty/);
  });

  test('flags sensitive key with changeme value', () => {
    const issues = auditEnv({ DB_PASSWORD: 'changeme' });
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].issue).toMatch(/placeholder or empty/);
  });

  test('flags sensitive key with todo value', () => {
    const issues = auditEnv({ AUTH_TOKEN: 'todo' });
    expect(issues.length).toBeGreaterThan(0);
  });

  test('does not flag sensitive key with real value', () => {
    const issues = auditEnv({ API_KEY: 'abc123xyz' });
    expect(issues).toHaveLength(0);
  });

  test('flags debug flag enabled', () => {
    const issues = auditEnv({ DEBUG: 'true' });
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].issue).toMatch(/debug flag/);
  });

  test('flags verbose flag enabled with 1', () => {
    const issues = auditEnv({ VERBOSE: '1' });
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].issue).toMatch(/verbose flag/);
  });

  test('flags localhost value in any key', () => {
    const issues = auditEnv({ DATABASE_URL: 'localhost:5432' });
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].issue).toMatch(/localhost/);
  });

  test('returns empty array for clean env', () => {
    const issues = auditEnv({
      APP_NAME: 'myapp',
      PORT: '3000',
      NODE_ENV: 'production',
    });
    expect(issues).toHaveLength(0);
  });

  test('returns multiple issues for multiple problems', () => {
    const issues = auditEnv({
      SECRET_KEY: '',
      DEBUG: 'yes',
      DATABASE_URL: '127.0.0.1:5432',
    });
    expect(issues.length).toBeGreaterThanOrEqual(3);
  });
});

describe('isCleanAudit', () => {
  test('returns true for clean env', () => {
    expect(isCleanAudit({ APP_NAME: 'myapp', PORT: '3000' })).toBe(true);
  });

  test('returns false when issues exist', () => {
    expect(isCleanAudit({ API_SECRET: 'changeme' })).toBe(false);
  });
});
