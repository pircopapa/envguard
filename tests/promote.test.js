const { promoteEnv, forcePromote, missingInTarget, promoteSummary } = require('../src/promote');

describe('promoteEnv', () => {
  const source = { API_URL: 'https://staging.api.com', DB_PASS: 'secret', DEBUG: 'true' };
  const target = { API_URL: 'https://prod.api.com', DB_PASS: '', TIMEOUT: '30' };

  test('promotes missing and empty keys from source to target', () => {
    const { result, promoted, skipped } = promoteEnv(source, target);
    expect(result.DB_PASS).toBe('secret');
    expect(result.DEBUG).toBe('true');
    expect(promoted).toContain('DB_PASS');
    expect(promoted).toContain('DEBUG');
  });

  test('does not overwrite existing non-empty target values', () => {
    const { result, skipped } = promoteEnv(source, target);
    expect(result.API_URL).toBe('https://prod.api.com');
    expect(skipped).toContain('API_URL');
  });

  test('preserves target-only keys', () => {
    const { result } = promoteEnv(source, target);
    expect(result.TIMEOUT).toBe('30');
  });

  test('promotes only specified keys when keys array is provided', () => {
    const { result, promoted, skipped } = promoteEnv(source, target, ['DB_PASS']);
    expect(promoted).toEqual(['DB_PASS']);
    expect(skipped).toEqual([]);
    expect(result.DEBUG).toBeUndefined();
  });

  test('skips keys not present in source', () => {
    const { skipped } = promoteEnv(source, target, ['NONEXISTENT']);
    expect(skipped).toContain('NONEXISTENT');
  });
});

describe('forcePromote', () => {
  const source = { API_URL: 'https://staging.api.com', NEW_KEY: 'value' };
  const target = { API_URL: 'https://prod.api.com', EXISTING: 'keep' };

  test('overwrites existing target values', () => {
    const { result, overwritten } = forcePromote(source, target);
    expect(result.API_URL).toBe('https://staging.api.com');
    expect(overwritten).toContain('API_URL');
  });

  test('tracks newly promoted keys separately from overwritten', () => {
    const { promoted, overwritten } = forcePromote(source, target);
    expect(promoted).toContain('NEW_KEY');
    expect(overwritten).toContain('API_URL');
  });

  test('preserves target keys not in source', () => {
    const { result } = forcePromote(source, target);
    expect(result.EXISTING).toBe('keep');
  });
});

describe('missingInTarget', () => {
  test('returns keys in source not present in target', () => {
    const source = { A: '1', B: '2', C: '3' };
    const target = { A: '1', C: '3' };
    expect(missingInTarget(source, target)).toEqual(['B']);
  });

  test('returns empty array when target has all source keys', () => {
    const source = { A: '1' };
    const target = { A: '2', B: '3' };
    expect(missingInTarget(source, target)).toEqual([]);
  });
});

describe('promoteSummary', () => {
  test('returns correct counts', () => {
    const summary = promoteSummary(['A', 'B'], ['C'], ['D']);
    expect(summary.promoted).toBe(2);
    expect(summary.skipped).toBe(1);
    expect(summary.overwritten).toBe(1);
    expect(summary.total).toBe(4);
  });

  test('clean is true when nothing was promoted or overwritten', () => {
    const summary = promoteSummary([], ['A', 'B']);
    expect(summary.clean).toBe(true);
  });

  test('clean is false when keys were promoted', () => {
    const summary = promoteSummary(['A'], []);
    expect(summary.clean).toBe(false);
  });
});
