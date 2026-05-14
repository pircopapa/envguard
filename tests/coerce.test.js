'use strict';

const { coerceValue, coerceEnv, isCleanCoerce, coerceSummary, SUPPORTED_TYPES } = require('../src/coerce');

describe('coerceValue', () => {
  test('coerces to string', () => {
    const r = coerceValue('hello', 'string');
    expect(r.ok).toBe(true);
    expect(r.value).toBe('hello');
  });

  test('coerces to number', () => {
    const r = coerceValue('3.14', 'number');
    expect(r.ok).toBe(true);
    expect(r.value).toBeCloseTo(3.14);
  });

  test('fails to coerce non-numeric to number', () => {
    const r = coerceValue('abc', 'number');
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/number/);
  });

  test('coerces to integer', () => {
    const r = coerceValue('42', 'integer');
    expect(r.ok).toBe(true);
    expect(r.value).toBe(42);
  });

  test('coerces truthy strings to boolean true', () => {
    for (const v of ['true', '1', 'yes', 'on']) {
      const r = coerceValue(v, 'boolean');
      expect(r.ok).toBe(true);
      expect(r.value).toBe(true);
    }
  });

  test('coerces falsy strings to boolean false', () => {
    for (const v of ['false', '0', 'no', 'off']) {
      const r = coerceValue(v, 'boolean');
      expect(r.ok).toBe(true);
      expect(r.value).toBe(false);
    }
  });

  test('fails to coerce invalid boolean', () => {
    const r = coerceValue('maybe', 'boolean');
    expect(r.ok).toBe(false);
  });

  test('coerces valid JSON', () => {
    const r = coerceValue('{"a":1}', 'json');
    expect(r.ok).toBe(true);
    expect(r.value).toEqual({ a: 1 });
  });

  test('fails on invalid JSON', () => {
    const r = coerceValue('{bad}', 'json');
    expect(r.ok).toBe(false);
  });

  test('fails on unsupported type', () => {
    const r = coerceValue('x', 'date');
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/Unsupported/);
  });
});

describe('coerceEnv', () => {
  const env = { PORT: '8080', DEBUG: 'true', NAME: 'app', RATIO: 'bad' };
  const typeMap = { PORT: 'integer', DEBUG: 'boolean', RATIO: 'number' };

  test('coerces matching keys and leaves others as strings', () => {
    const { coerced } = coerceEnv(env, typeMap);
    expect(coerced.PORT).toBe(8080);
    expect(coerced.DEBUG).toBe(true);
    expect(coerced.NAME).toBe('app');
  });

  test('reports errors for failed coercions', () => {
    const { errors } = coerceEnv(env, typeMap);
    expect(errors).toHaveLength(1);
    expect(errors[0].key).toBe('RATIO');
  });

  test('preserves original value on failure', () => {
    const { coerced } = coerceEnv(env, typeMap);
    expect(coerced.RATIO).toBe('bad');
  });
});

describe('isCleanCoerce', () => {
  test('returns true when no errors', () => {
    expect(isCleanCoerce([])).toBe(true);
  });

  test('returns false when there are errors', () => {
    expect(isCleanCoerce([{ key: 'X' }])).toBe(false);
  });
});

describe('coerceSummary', () => {
  test('returns correct counts', () => {
    const env = { A: '1', B: '2', C: '3' };
    const typeMap = { A: 'integer', B: 'boolean' };
    const errors = [{ key: 'B' }];
    const s = coerceSummary(env, typeMap, errors);
    expect(s.total).toBe(3);
    expect(s.attempted).toBe(2);
    expect(s.succeeded).toBe(1);
    expect(s.failed).toBe(1);
  });
});

describe('SUPPORTED_TYPES', () => {
  test('includes expected types', () => {
    expect(SUPPORTED_TYPES).toContain('string');
    expect(SUPPORTED_TYPES).toContain('boolean');
    expect(SUPPORTED_TYPES).toContain('json');
  });
});
