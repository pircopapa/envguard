const {
  buildProtectMap,
  checkProtectedKey,
  checkProtected,
  isCleanProtect,
  protectSummary,
} = require('../src/protect');

describe('buildProtectMap', () => {
  it('builds a map of only keys present in env', () => {
    const env = { DB_HOST: 'localhost', DB_PORT: '5432', APP_NAME: 'myapp' };
    const map = buildProtectMap(['DB_HOST', 'APP_NAME', 'MISSING_KEY'], env);
    expect(map).toEqual({ DB_HOST: 'localhost', APP_NAME: 'myapp' });
    expect(map).not.toHaveProperty('MISSING_KEY');
  });

  it('returns empty map when no keys match', () => {
    const map = buildProtectMap(['NOPE'], { A: '1' });
    expect(map).toEqual({});
  });
});

describe('checkProtectedKey', () => {
  it('returns ok when value matches', () => {
    const result = checkProtectedKey('DB_HOST', 'localhost', 'localhost');
    expect(result.status).toBe('ok');
  });

  it('returns modified when value changed', () => {
    const result = checkProtectedKey('DB_HOST', 'remotehost', 'localhost');
    expect(result.status).toBe('modified');
    expect(result.currentValue).toBe('remotehost');
    expect(result.lockedValue).toBe('localhost');
  });

  it('returns missing when key is absent', () => {
    const result = checkProtectedKey('DB_HOST', undefined, 'localhost');
    expect(result.status).toBe('missing');
    expect(result.currentValue).toBeUndefined();
  });
});

describe('checkProtected', () => {
  const protectMap = { DB_HOST: 'localhost', SECRET: 'abc123' };

  it('returns ok for all unchanged keys', () => {
    const env = { DB_HOST: 'localhost', SECRET: 'abc123' };
    const results = checkProtected(env, protectMap);
    expect(results).toHaveLength(2);
    expect(results.every((r) => r.status === 'ok')).toBe(true);
  });

  it('detects modified and missing keys', () => {
    const env = { DB_HOST: 'changed' };
    const results = checkProtected(env, protectMap);
    const statuses = Object.fromEntries(results.map((r) => [r.key, r.status]));
    expect(statuses.DB_HOST).toBe('modified');
    expect(statuses.SECRET).toBe('missing');
  });
});

describe('isCleanProtect', () => {
  it('returns true when all results are ok', () => {
    const results = [{ status: 'ok' }, { status: 'ok' }];
    expect(isCleanProtect(results)).toBe(true);
  });

  it('returns false when any result is not ok', () => {
    const results = [{ status: 'ok' }, { status: 'modified' }];
    expect(isCleanProtect(results)).toBe(false);
  });
});

describe('protectSummary', () => {
  it('returns correct counts', () => {
    const results = [
      { status: 'ok' },
      { status: 'modified' },
      { status: 'missing' },
      { status: 'ok' },
    ];
    const summary = protectSummary(results);
    expect(summary.total).toBe(4);
    expect(summary.ok).toBe(2);
    expect(summary.modified).toBe(1);
    expect(summary.missing).toBe(1);
  });
});
