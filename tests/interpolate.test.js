const { expandValue, interpolateEnv, unresolvedKeys } = require('../src/interpolate');
const {
  formatInterpolationSummary,
  formatExpandedEnv,
} = require('../src/reporter.interpolate');

describe('expandValue', () => {
  test('returns plain value unchanged', () => {
    expect(expandValue('hello', {})).toBe('hello');
  });

  test('resolves a simple reference', () => {
    expect(expandValue('${HOST}', { HOST: 'localhost' })).toBe('localhost');
  });

  test('resolves nested references', () => {
    const env = { BASE: 'localhost', URL: 'http://${BASE}:3000' };
    expect(expandValue('${URL}', env)).toBe('http://localhost:3000');
  });

  test('leaves unresolved references intact', () => {
    expect(expandValue('${MISSING}', {})).toBe('${MISSING}');
  });

  test('handles circular references without infinite loop', () => {
    const env = { A: '${B}', B: '${A}' };
    const result = expandValue('${A}', env);
    // Should not throw and should contain the raw placeholder
    expect(typeof result).toBe('string');
  });
});

describe('interpolateEnv', () => {
  test('expands all values in the map', () => {
    const env = {
      HOST: 'localhost',
      PORT: '5432',
      DB_URL: 'postgres://${HOST}:${PORT}/mydb',
    };
    const result = interpolateEnv(env);
    expect(result.DB_URL).toBe('postgres://localhost:5432/mydb');
    expect(result.HOST).toBe('localhost');
  });

  test('does not mutate the original env', () => {
    const env = { A: '${B}', B: 'val' };
    const result = interpolateEnv(env);
    expect(env.A).toBe('${B}');
    expect(result.A).toBe('val');
  });
});

describe('unresolvedKeys', () => {
  test('returns keys with remaining placeholders', () => {
    const expanded = { A: 'ok', B: '${MISSING}', C: 'also ${GONE}' };
    expect(unresolvedKeys(expanded)).toEqual(['B', 'C']);
  });

  test('returns empty array when all resolved', () => {
    expect(unresolvedKeys({ A: 'hello', B: 'world' })).toEqual([]);
  });
});

describe('formatInterpolationSummary', () => {
  test('reports resolved and unresolved counts', () => {
    const original = { A: '${B}', B: 'val', C: '${NOPE}' };
    const expanded = { A: 'val', B: 'val', C: '${NOPE}' };
    const out = formatInterpolationSummary(original, expanded);
    expect(out).toContain('References found   : 2');
    expect(out).toContain('Resolved           : 1');
    expect(out).toContain('Unresolved         : 1');
    expect(out).toContain('- C');
  });
});

describe('formatExpandedEnv', () => {
  test('formats as key=value lines', () => {
    const out = formatExpandedEnv({ FOO: 'bar', BAZ: 'qux' });
    expect(out).toContain('FOO=bar');
    expect(out).toContain('BAZ=qux');
  });
});
