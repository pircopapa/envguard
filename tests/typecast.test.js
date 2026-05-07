const { castValue, typecastEnv, typecastSummary } = require('../src/typecast');

describe('castValue', () => {
  it('casts true/false strings to booleans', () => {
    expect(castValue('true')).toBe(true);
    expect(castValue('false')).toBe(false);
  });

  it('casts integer strings to numbers', () => {
    expect(castValue('42')).toBe(42);
    expect(castValue('-7')).toBe(-7);
  });

  it('casts float strings to numbers', () => {
    expect(castValue('3.14')).toBeCloseTo(3.14);
    expect(castValue('-0.5')).toBeCloseTo(-0.5);
  });

  it('casts null string to null', () => {
    expect(castValue('null')).toBeNull();
  });

  it('casts undefined string to undefined', () => {
    expect(castValue('undefined')).toBeUndefined();
  });

  it('casts JSON arrays', () => {
    expect(castValue('[1,2,3]')).toEqual([1, 2, 3]);
  });

  it('casts JSON objects', () => {
    expect(castValue('{"a":1}')).toEqual({ a: 1 });
  });

  it('returns plain strings unchanged', () => {
    expect(castValue('hello')).toBe('hello');
    expect(castValue('123abc')).toBe('123abc');
  });

  it('returns empty string unchanged', () => {
    expect(castValue('')).toBe('');
  });

  it('returns malformed JSON as string', () => {
    expect(castValue('[not json')).toBe('[not json');
  });
});

describe('typecastEnv', () => {
  it('casts all values in an env object', () => {
    const env = { PORT: '3000', DEBUG: 'true', NAME: 'app' };
    const result = typecastEnv(env);
    expect(result.PORT).toBe(3000);
    expect(result.DEBUG).toBe(true);
    expect(result.NAME).toBe('app');
  });
});

describe('typecastSummary', () => {
  it('returns only keys with non-string cast values', () => {
    const env = { PORT: '8080', DEBUG: 'true', LABEL: 'prod' };
    const summary = typecastSummary(env);
    expect(summary).toHaveLength(2);
    const keys = summary.map(e => e.key);
    expect(keys).toContain('PORT');
    expect(keys).toContain('DEBUG');
    expect(keys).not.toContain('LABEL');
  });

  it('includes type info in each entry', () => {
    const env = { COUNT: '5' };
    const [entry] = typecastSummary(env);
    expect(entry.type).toBe('number');
    expect(entry.original).toBe('5');
    expect(entry.cast).toBe(5);
  });

  it('returns empty array when all values are strings', () => {
    const env = { A: 'hello', B: 'world' };
    expect(typecastSummary(env)).toHaveLength(0);
  });
});
