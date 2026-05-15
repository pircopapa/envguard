const { inheritEnv, findInheritConflicts, inheritedKeys, overriddenKeys, inheritSummary } = require('../src/inherit');

describe('inheritEnv', () => {
  const base = { HOST: 'localhost', PORT: '5432', DB: 'mydb' };
  const child = { PORT: '3000', APP: 'web' };

  test('child keys override base keys', () => {
    const result = inheritEnv(base, child);
    expect(result.PORT).toBe('3000');
  });

  test('base keys not in child are inherited', () => {
    const result = inheritEnv(base, child);
    expect(result.HOST).toBe('localhost');
    expect(result.DB).toBe('mydb');
  });

  test('child-only keys are present', () => {
    const result = inheritEnv(base, child);
    expect(result.APP).toBe('web');
  });

  test('throws on conflict when allowOverride is false', () => {
    expect(() => inheritEnv(base, child, { allowOverride: false })).toThrow(/PORT/);
  });

  test('no conflict when child has no overlapping keys', () => {
    const safeChild = { APP: 'web' };
    expect(() => inheritEnv(base, safeChild, { allowOverride: false })).not.toThrow();
  });
});

describe('findInheritConflicts', () => {
  test('returns overlapping keys', () => {
    const conflicts = findInheritConflicts({ A: '1', B: '2' }, { B: '3', C: '4' });
    expect(conflicts).toEqual(['B']);
  });

  test('returns empty array when no overlap', () => {
    expect(findInheritConflicts({ A: '1' }, { B: '2' })).toEqual([]);
  });
});

describe('inheritedKeys', () => {
  test('returns keys in base not in child', () => {
    const keys = inheritedKeys({ A: '1', B: '2', C: '3' }, { B: 'x' });
    expect(keys).toEqual(expect.arrayContaining(['A', 'C']));
    expect(keys).not.toContain('B');
  });
});

describe('overriddenKeys', () => {
  test('returns keys with different values in child', () => {
    const keys = overriddenKeys({ A: '1', B: '2' }, { A: '1', B: '99' });
    expect(keys).toEqual(['B']);
  });

  test('does not include keys with same value', () => {
    const keys = overriddenKeys({ A: '1' }, { A: '1' });
    expect(keys).toEqual([]);
  });
});

describe('inheritSummary', () => {
  test('returns correct counts and flags', () => {
    const base = { HOST: 'localhost', PORT: '5432' };
    const child = { PORT: '3000', APP: 'web' };
    const summary = inheritSummary(base, child);
    expect(summary.baseKeys).toBe(2);
    expect(summary.childKeys).toBe(2);
    expect(summary.inherited).toContain('HOST');
    expect(summary.overridden).toContain('PORT');
    expect(summary.conflicts).toContain('PORT');
    expect(summary.isClean).toBe(false);
  });

  test('isClean is true when no conflicts', () => {
    const summary = inheritSummary({ A: '1' }, { B: '2' });
    expect(summary.isClean).toBe(true);
  });
});
