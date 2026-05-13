const { sortAlpha, sortByPrefix, sortByValueLength, isSorted, unsortedKeys } = require('../src/sort');

const sampleEnv = {
  ZEBRA: 'z',
  APP_NAME: 'myapp',
  DB_HOST: 'localhost',
  API_KEY: 'abc123',
  DB_PORT: '5432',
  APP_ENV: 'production',
};

describe('sortAlpha', () => {
  it('sorts keys alphabetically case-insensitive', () => {
    const result = sortAlpha(sampleEnv);
    const keys = Object.keys(result);
    expect(keys).toEqual([...keys].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())));
  });

  it('returns empty object for empty input', () => {
    expect(sortAlpha({})).toEqual({});
  });

  it('preserves values after sorting', () => {
    const result = sortAlpha(sampleEnv);
    expect(result.ZEBRA).toBe('z');
    expect(result.API_KEY).toBe('abc123');
  });
});

describe('sortByPrefix', () => {
  it('groups keys by prefix', () => {
    const result = sortByPrefix(sampleEnv);
    const keys = Object.keys(result);
    const appIdx = keys.findIndex(k => k.startsWith('APP_'));
    const dbIdx = keys.findIndex(k => k.startsWith('DB_'));
    expect(appIdx).toBeLessThan(dbIdx);
  });

  it('sorts within each prefix group alphabetically', () => {
    const result = sortByPrefix(sampleEnv);
    const keys = Object.keys(result);
    const appKeys = keys.filter(k => k.startsWith('APP_'));
    expect(appKeys).toEqual(['APP_ENV', 'APP_NAME']);
  });
});

describe('sortByValueLength', () => {
  it('sorts by value length ascending', () => {
    const result = sortByValueLength(sampleEnv);
    const values = Object.values(result);
    for (let i = 1; i < values.length; i++) {
      expect(values[i].length).toBeGreaterThanOrEqual(values[i - 1].length);
    }
  });
});

describe('isSorted', () => {
  it('returns true for already-sorted env', () => {
    const sorted = sortAlpha(sampleEnv);
    expect(isSorted(sorted)).toBe(true);
  });

  it('returns false for unsorted env', () => {
    expect(isSorted(sampleEnv)).toBe(false);
  });

  it('returns true for single-key env', () => {
    expect(isSorted({ ONLY: 'one' })).toBe(true);
  });
});

describe('unsortedKeys', () => {
  it('returns keys that are out of order', () => {
    const bad = unsortedKeys(sampleEnv);
    expect(bad.length).toBeGreaterThan(0);
  });

  it('returns empty array for sorted env', () => {
    const sorted = sortAlpha(sampleEnv);
    expect(unsortedKeys(sorted)).toEqual([]);
  });
});
