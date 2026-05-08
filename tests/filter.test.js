const {
  filterByPrefix,
  filterByPattern,
  filterByValue,
  excludeKeys,
  pickKeys,
  emptyKeys,
} = require('../src/filter');

const sample = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  APP_NAME: 'envguard',
  APP_ENV: 'test',
  SECRET_KEY: 'abc123',
  EMPTY_VAL: '',
  BLANK_VAL: '   ',
};

describe('filterByPrefix', () => {
  it('returns keys matching the prefix', () => {
    const result = filterByPrefix(sample, 'DB_');
    expect(Object.keys(result)).toEqual(['DB_HOST', 'DB_PORT']);
  });

  it('returns empty object when no match', () => {
    expect(filterByPrefix(sample, 'XYZ_')).toEqual({});
  });
});

describe('filterByPattern', () => {
  it('filters by regex pattern', () => {
    const result = filterByPattern(sample, /^APP_/);
    expect(Object.keys(result)).toEqual(['APP_NAME', 'APP_ENV']);
  });

  it('accepts string pattern', () => {
    const result = filterByPattern(sample, 'SECRET');
    expect(Object.keys(result)).toEqual(['SECRET_KEY']);
  });
});

describe('filterByValue', () => {
  it('filters by value predicate', () => {
    const result = filterByValue(sample, v => v === 'localhost');
    expect(result).toEqual({ DB_HOST: 'localhost' });
  });

  it('passes key to predicate', () => {
    const result = filterByValue(sample, (v, k) => k.startsWith('APP_'));
    expect(Object.keys(result)).toEqual(['APP_NAME', 'APP_ENV']);
  });
});

describe('excludeKeys', () => {
  it('removes specified keys', () => {
    const result = excludeKeys(sample, ['DB_HOST', 'SECRET_KEY']);
    expect(result).not.toHaveProperty('DB_HOST');
    expect(result).not.toHaveProperty('SECRET_KEY');
    expect(result).toHaveProperty('DB_PORT');
  });

  it('returns full env when exclude list is empty', () => {
    expect(excludeKeys(sample, [])).toEqual(sample);
  });
});

describe('pickKeys', () => {
  it('picks only specified keys', () => {
    const result = pickKeys(sample, ['APP_NAME', 'DB_HOST']);
    expect(result).toEqual({ APP_NAME: 'envguard', DB_HOST: 'localhost' });
  });

  it('ignores missing keys silently', () => {
    const result = pickKeys(sample, ['NONEXISTENT']);
    expect(result).toEqual({});
  });
});

describe('emptyKeys', () => {
  it('returns keys with empty or whitespace values', () => {
    const keys = emptyKeys(sample);
    expect(keys).toContain('EMPTY_VAL');
    expect(keys).toContain('BLANK_VAL');
    expect(keys).not.toContain('DB_HOST');
  });

  it('returns empty array when no empty values', () => {
    expect(emptyKeys({ A: '1', B: '2' })).toEqual([]);
  });
});
