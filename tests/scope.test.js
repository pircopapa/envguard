const { pickByScope, partitionByScope, findOverlappingKeys, matchesPattern, scopeSummary } = require('../src/scope');

const sampleEnv = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  AUTH_SECRET: 'abc',
  AUTH_EXPIRY: '3600',
  APP_NAME: 'myapp',
  REDIS_URL: 'redis://localhost',
};

describe('matchesPattern', () => {
  test('exact match', () => expect(matchesPattern('DB_HOST', 'DB_HOST')).toBe(true));
  test('prefix wildcard match', () => expect(matchesPattern('DB_HOST', 'DB_*')).toBe(true));
  test('prefix wildcard no match', () => expect(matchesPattern('AUTH_SECRET', 'DB_*')).toBe(false));
  test('exact no match', () => expect(matchesPattern('DB_HOST', 'DB_PORT')).toBe(false));
});

describe('pickByScope', () => {
  test('picks keys matching prefix wildcard', () => {
    const result = pickByScope(sampleEnv, ['DB_*']);
    expect(Object.keys(result)).toEqual(['DB_HOST', 'DB_PORT']);
  });

  test('picks exact keys', () => {
    const result = pickByScope(sampleEnv, ['APP_NAME', 'REDIS_URL']);
    expect(Object.keys(result)).toEqual(['APP_NAME', 'REDIS_URL']);
  });

  test('returns empty when no match', () => {
    expect(pickByScope(sampleEnv, ['NOPE_*'])).toEqual({});
  });
});

describe('partitionByScope', () => {
  const scopeMap = { database: ['DB_*'], auth: ['AUTH_*'] };

  test('correctly partitions into named scopes', () => {
    const { scopes } = partitionByScope(sampleEnv, scopeMap);
    expect(Object.keys(scopes.database)).toEqual(['DB_HOST', 'DB_PORT']);
    expect(Object.keys(scopes.auth)).toEqual(['AUTH_SECRET', 'AUTH_EXPIRY']);
  });

  test('other bucket contains unclaimed keys', () => {
    const { other } = partitionByScope(sampleEnv, scopeMap);
    expect(Object.keys(other)).toEqual(['APP_NAME', 'REDIS_URL']);
  });

  test('empty scope map puts everything in other', () => {
    const { other } = partitionByScope(sampleEnv, {});
    expect(Object.keys(other)).toHaveLength(6);
  });
});

describe('findOverlappingKeys', () => {
  test('returns empty when no overlap', () => {
    const { scopes } = partitionByScope(sampleEnv, { database: ['DB_*'], auth: ['AUTH_*'] });
    expect(findOverlappingKeys(scopes)).toEqual([]);
  });

  test('detects overlap when scopes share patterns', () => {
    const scopes = {
      a: { DB_HOST: 'x', SHARED: 'y' },
      b: { SHARED: 'y', AUTH_SECRET: 'z' },
    };
    expect(findOverlappingKeys(scopes)).toEqual(['SHARED']);
  });
});

describe('scopeSummary', () => {
  test('returns count per scope plus other', () => {
    const partition = partitionByScope(sampleEnv, { database: ['DB_*'], auth: ['AUTH_*'] });
    const summary = scopeSummary(partition);
    const dbEntry = summary.find((s) => s.name === 'database');
    const otherEntry = summary.find((s) => s.name === 'other');
    expect(dbEntry.count).toBe(2);
    expect(otherEntry.count).toBe(2);
  });
});
