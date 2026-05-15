const { resolveEnv, unresolvedKeys, isCleanResolve, resolveSummary } = require('../src/resolve');

describe('resolveEnv', () => {
  it('fills empty values from the first matching source', () => {
    const target = { A: '', B: 'keep', C: '' };
    const sources = [{ A: 'from-src1', C: 'from-src1' }];
    const { resolved } = resolveEnv(target, sources);
    expect(resolved.A).toBe('from-src1');
    expect(resolved.B).toBe('keep');
    expect(resolved.C).toBe('from-src1');
  });

  it('prefers earlier sources over later ones', () => {
    const target = { X: '' };
    const sources = [{ X: 'first' }, { X: 'second' }];
    const { resolved } = resolveEnv(target, sources);
    expect(resolved.X).toBe('first');
  });

  it('falls through to second source when first lacks the key', () => {
    const target = { X: '' };
    const sources = [{}, { X: 'fallback' }];
    const { resolved } = resolveEnv(target, sources);
    expect(resolved.X).toBe('fallback');
  });

  it('leaves key empty if no source resolves it', () => {
    const target = { MISSING: '' };
    const { resolved } = resolveEnv(target, []);
    expect(resolved.MISSING).toBe('');
  });

  it('returns a report entry for each resolved key', () => {
    const target = { A: '', B: '' };
    const sources = [{ A: 'val-a', B: 'val-b' }];
    const { report } = resolveEnv(target, sources);
    expect(report).toHaveLength(2);
    expect(report[0]).toMatchObject({ key: 'A', resolvedFrom: 0, value: 'val-a' });
  });

  it('does not touch keys that already have values', () => {
    const target = { PRESENT: 'exists' };
    const sources = [{ PRESENT: 'override' }];
    const { resolved, report } = resolveEnv(target, sources);
    expect(resolved.PRESENT).toBe('exists');
    expect(report).toHaveLength(0);
  });
});

describe('unresolvedKeys', () => {
  it('returns keys still empty after resolution', () => {
    const target = { A: '', B: 'ok', C: '' };
    const sources = [{ A: 'filled' }];
    expect(unresolvedKeys(target, sources)).toEqual(['C']);
  });

  it('returns empty array when everything is resolved', () => {
    const target = { A: 'x' };
    expect(unresolvedKeys(target, [])).toEqual([]);
  });
});

describe('isCleanResolve', () => {
  it('returns true when no keys remain empty', () => {
    const target = { A: 'val' };
    expect(isCleanResolve(target, [])).toBe(true);
  });

  it('returns false when some keys are still missing', () => {
    const target = { A: '' };
    expect(isCleanResolve(target, [])).toBe(false);
  });
});

describe('resolveSummary', () => {
  it('builds a summary object correctly', () => {
    const report = [{ key: 'A', resolvedFrom: 0, value: 'v' }];
    const summary = resolveSummary(report, ['B']);
    expect(summary.resolvedCount).toBe(1);
    expect(summary.unresolvedCount).toBe(1);
    expect(summary.resolved).toContain('A');
    expect(summary.unresolved).toContain('B');
  });
});
