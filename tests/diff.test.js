const { diffEnvs, isClean } = require('../src/diff');

describe('diffEnvs', () => {
  const base = { FOO: '1', BAR: 'hello', SHARED: 'same' };
  const other = { BAR: 'world', SHARED: 'same', EXTRA: 'new' };

  let result;
  beforeAll(() => {
    result = diffEnvs(base, other);
  });

  test('detects keys missing in B', () => {
    expect(result.missingInB).toContain('FOO');
    expect(result.missingInB).not.toContain('BAR');
  });

  test('detects keys missing in A', () => {
    expect(result.missingInA).toContain('EXTRA');
    expect(result.missingInA).not.toContain('FOO');
  });

  test('detects changed values', () => {
    expect(result.changed).toEqual(
      expect.arrayContaining([{ key: 'BAR', valueA: 'hello', valueB: 'world' }])
    );
  });

  test('does not flag unchanged keys as changed', () => {
    const changedKeys = result.changed.map((c) => c.key);
    expect(changedKeys).not.toContain('SHARED');
  });
});

describe('isClean', () => {
  test('returns true when envs are identical', () => {
    const env = { A: '1', B: '2' };
    expect(isClean(diffEnvs(env, { ...env }))).toBe(true);
  });

  test('returns false when there are differences', () => {
    const a = { A: '1' };
    const b = { B: '2' };
    expect(isClean(diffEnvs(a, b))).toBe(false);
  });
});
