const { normalizeKey, normalizeValue, normalizeKeys, normalizeValues, normalizeEnv, isCleanNormalize } = require('../src/normalize');

describe('normalizeKey', () => {
  it('uppercases a lowercase key', () => {
    expect(normalizeKey('app_name')).toBe('APP_NAME');
  });

  it('trims surrounding whitespace', () => {
    expect(normalizeKey('  MY_KEY  ')).toBe('MY_KEY');
  });

  it('replaces dashes with underscores', () => {
    expect(normalizeKey('my-key')).toBe('MY_KEY');
  });

  it('replaces spaces with underscores', () => {
    expect(normalizeKey('my key')).toBe('MY_KEY');
  });

  it('returns non-string values as-is', () => {
    expect(normalizeKey(42)).toBe(42);
  });
});

describe('normalizeValue', () => {
  it('trims surrounding whitespace', () => {
    expect(normalizeValue('  hello  ')).toBe('hello');
  });

  it('collapses internal whitespace', () => {
    expect(normalizeValue('hello   world')).toBe('hello world');
  });

  it('returns non-string values as-is', () => {
    expect(normalizeValue(null)).toBe(null);
  });
});

describe('normalizeKeys', () => {
  it('normalizes all keys and reports changes', () => {
    const env = { 'my-key': 'val1', ALREADY_NORMAL: 'val2' };
    const { normalized, changes } = normalizeKeys(env);
    expect(normalized).toHaveProperty('MY_KEY', 'val1');
    expect(normalized).toHaveProperty('ALREADY_NORMAL', 'val2');
    expect(changes).toHaveLength(1);
    expect(changes[0]).toEqual({ from: 'my-key', to: 'MY_KEY' });
  });

  it('returns empty changes when all keys are already normalized', () => {
    const { changes } = normalizeKeys({ FOO: 'bar', BAZ: 'qux' });
    expect(changes).toHaveLength(0);
  });
});

describe('normalizeValues', () => {
  it('trims and collapses values and reports changes', () => {
    const env = { KEY: '  spaced  value  ' };
    const { normalized, changes } = normalizeValues(env);
    expect(normalized.KEY).toBe('spaced value');
    expect(changes).toHaveLength(1);
    expect(changes[0].key).toBe('KEY');
  });

  it('returns empty changes when all values are already clean', () => {
    const { changes } = normalizeValues({ KEY: 'clean' });
    expect(changes).toHaveLength(0);
  });
});

describe('normalizeEnv', () => {
  it('normalizes both keys and values', () => {
    const env = { 'my-key': '  hello   world  ' };
    const { normalized, keyChanges, valueChanges } = normalizeEnv(env);
    expect(normalized).toHaveProperty('MY_KEY', 'hello world');
    expect(keyChanges).toHaveLength(1);
    expect(valueChanges).toHaveLength(1);
  });
});

describe('isCleanNormalize', () => {
  it('returns true for a fully normalized env', () => {
    expect(isCleanNormalize({ FOO: 'bar', BAZ: 'qux' })).toBe(true);
  });

  it('returns false when keys need normalization', () => {
    expect(isCleanNormalize({ 'my-key': 'val' })).toBe(false);
  });

  it('returns false when values need normalization', () => {
    expect(isCleanNormalize({ FOO: '  spaced  ' })).toBe(false);
  });
});
