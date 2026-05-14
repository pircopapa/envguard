const {
  checkFrozenKey,
  checkFrozen,
  isCleanFreeze,
  buildFreezeMap,
  freezeSummary,
} = require('../src/freeze');

describe('checkFrozenKey', () => {
  const frozenMap = { APP_NAME: 'myapp', API_VERSION: 'v1' };

  it('returns null when key is not in frozen map', () => {
    expect(checkFrozenKey('SOME_KEY', 'anything', frozenMap)).toBeNull();
  });

  it('returns null when frozen key matches expected value', () => {
    expect(checkFrozenKey('APP_NAME', 'myapp', frozenMap)).toBeNull();
  });

  it('returns violation when frozen key has wrong value', () => {
    const result = checkFrozenKey('APP_NAME', 'otherapp', frozenMap);
    expect(result).toEqual({ key: 'APP_NAME', expected: 'myapp', actual: 'otherapp' });
  });
});

describe('checkFrozen', () => {
  const frozenMap = { APP_NAME: 'myapp', API_VERSION: 'v1' };

  it('returns empty array when all frozen keys match', () => {
    const env = { APP_NAME: 'myapp', API_VERSION: 'v1', DB_HOST: 'localhost' };
    expect(checkFrozen(env, frozenMap)).toEqual([]);
  });

  it('returns violations for mismatched frozen keys', () => {
    const env = { APP_NAME: 'wrong', API_VERSION: 'v2', DB_HOST: 'localhost' };
    const violations = checkFrozen(env, frozenMap);
    expect(violations).toHaveLength(2);
    expect(violations[0]).toMatchObject({ key: 'APP_NAME', expected: 'myapp', actual: 'wrong' });
    expect(violations[1]).toMatchObject({ key: 'API_VERSION', expected: 'v1', actual: 'v2' });
  });

  it('ignores env keys not in frozen map', () => {
    const env = { EXTRA_KEY: 'anything' };
    expect(checkFrozen(env, frozenMap)).toEqual([]);
  });
});

describe('isCleanFreeze', () => {
  it('returns true when no violations', () => {
    const env = { APP_NAME: 'myapp' };
    expect(isCleanFreeze(env, { APP_NAME: 'myapp' })).toBe(true);
  });

  it('returns false when there are violations', () => {
    const env = { APP_NAME: 'changed' };
    expect(isCleanFreeze(env, { APP_NAME: 'myapp' })).toBe(false);
  });
});

describe('buildFreezeMap', () => {
  it('builds a map of only the specified keys', () => {
    const env = { APP_NAME: 'myapp', DB_HOST: 'localhost', PORT: '3000' };
    const map = buildFreezeMap(env, ['APP_NAME', 'PORT']);
    expect(map).toEqual({ APP_NAME: 'myapp', PORT: '3000' });
  });

  it('skips keys not present in env', () => {
    const env = { APP_NAME: 'myapp' };
    const map = buildFreezeMap(env, ['APP_NAME', 'MISSING_KEY']);
    expect(map).toEqual({ APP_NAME: 'myapp' });
  });
});

describe('freezeSummary', () => {
  it('returns clean summary when no violations', () => {
    expect(freezeSummary([])).toEqual({ total: 0, violations: 0, clean: true });
  });

  it('returns summary with violation count', () => {
    const violations = [
      { key: 'APP_NAME', expected: 'myapp', actual: 'other' },
    ];
    expect(freezeSummary(violations)).toEqual({ total: 1, violations: 1, clean: false });
  });
});
