const { flattenObject, expandToNested, findFlattenCollisions, isCleanFlatten } = require('../src/flatten');

describe('flattenObject', () => {
  it('flattens a shallow nested object', () => {
    const input = { DB: { HOST: 'localhost', PORT: '5432' } };
    expect(flattenObject(input)).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
  });

  it('flattens deeply nested objects', () => {
    const input = { A: { B: { C: 'deep' } } };
    expect(flattenObject(input)).toEqual({ A_B_C: 'deep' });
  });

  it('leaves already flat entries unchanged', () => {
    const input = { FOO: 'bar', BAZ: '42' };
    expect(flattenObject(input)).toEqual({ FOO: 'bar', BAZ: '42' });
  });

  it('converts non-string values to strings', () => {
    const input = { APP: { DEBUG: true, PORT: 3000 } };
    expect(flattenObject(input)).toEqual({ APP_DEBUG: 'true', APP_PORT: '3000' });
  });

  it('handles null values as empty string', () => {
    const input = { KEY: null };
    expect(flattenObject(input)).toEqual({ KEY: '' });
  });

  it('returns empty object for empty input', () => {
    expect(flattenObject({})).toEqual({});
  });
});

describe('expandToNested', () => {
  it('expands underscore keys into nested objects', () => {
    const input = { DB_HOST: 'localhost', DB_PORT: '5432' };
    expect(expandToNested(input)).toEqual({ DB: { HOST: 'localhost', PORT: '5432' } });
  });

  it('handles keys with no underscore', () => {
    const input = { FOO: 'bar' };
    expect(expandToNested(input)).toEqual({ FOO: 'bar' });
  });

  it('handles deeply nested keys', () => {
    const input = { A_B_C: 'deep' };
    expect(expandToNested(input)).toEqual({ A: { B: { C: 'deep' } } });
  });

  it('merges sibling keys under the same prefix', () => {
    const input = { APP_HOST: 'x', APP_PORT: 'y', APP_DEBUG: 'true' };
    const result = expandToNested(input);
    expect(result.APP).toEqual({ HOST: 'x', PORT: 'y', DEBUG: 'true' });
  });
});

describe('findFlattenCollisions', () => {
  it('detects collision when a key is also a prefix of another key', () => {
    const env = { DB: 'value', DB_HOST: 'localhost' };
    expect(findFlattenCollisions(env)).toContain('DB_HOST');
  });

  it('returns empty array when no collisions exist', () => {
    const env = { DB_HOST: 'localhost', APP_PORT: '3000' };
    expect(findFlattenCollisions(env)).toEqual([]);
  });

  it('deduplicates collision entries', () => {
    const env = { X: '1', X_A: '2', X_B: '3' };
    const collisions = findFlattenCollisions(env);
    expect(collisions).toContain('X_A');
    expect(collisions).toContain('X_B');
    expect(new Set(collisions).size).toBe(collisions.length);
  });
});

describe('isCleanFlatten', () => {
  it('returns true when there are no collisions', () => {
    expect(isCleanFlatten({ FOO_BAR: '1', BAZ: '2' })).toBe(true);
  });

  it('returns false when collisions exist', () => {
    expect(isCleanFlatten({ FOO: 'x', FOO_BAR: '1' })).toBe(false);
  });
});
