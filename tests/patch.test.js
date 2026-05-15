const { applyPatch, isCleanPatch, patchSummary } = require('../src/patch');

describe('applyPatch', () => {
  const base = { APP_NAME: 'envguard', PORT: '3000', DEBUG: 'false' };

  test('adds a new key', () => {
    const { result, applied } = applyPatch(base, { LOG_LEVEL: 'info' });
    expect(result.LOG_LEVEL).toBe('info');
    expect(applied).toContain('LOG_LEVEL');
  });

  test('updates an existing key', () => {
    const { result, applied } = applyPatch(base, { PORT: '8080' });
    expect(result.PORT).toBe('8080');
    expect(applied).toContain('PORT');
  });

  test('deletes a key when value is null', () => {
    const { result, deleted } = applyPatch(base, { DEBUG: null });
    expect(result).not.toHaveProperty('DEBUG');
    expect(deleted).toContain('DEBUG');
  });

  test('skips deletion of non-existent key', () => {
    const { skipped } = applyPatch(base, { MISSING: null });
    expect(skipped).toContain('MISSING');
  });

  test('does not mutate the original env', () => {
    applyPatch(base, { PORT: '9999', DEBUG: null });
    expect(base.PORT).toBe('3000');
    expect(base.DEBUG).toBe('false');
  });

  test('handles mixed add/update/delete in one patch', () => {
    const { result, applied, deleted } = applyPatch(base, {
      PORT: '4000',
      DEBUG: null,
      NEW_KEY: 'hello',
    });
    expect(result.PORT).toBe('4000');
    expect(result).not.toHaveProperty('DEBUG');
    expect(result.NEW_KEY).toBe('hello');
    expect(applied).toHaveLength(2);
    expect(deleted).toHaveLength(1);
  });
});

describe('isCleanPatch', () => {
  const env = { A: '1', B: '2' };

  test('returns true when patch makes no changes', () => {
    expect(isCleanPatch(env, { A: '1' })).toBe(true);
  });

  test('returns false when a value differs', () => {
    expect(isCleanPatch(env, { A: '99' })).toBe(false);
  });

  test('returns false when a null targets an existing key', () => {
    expect(isCleanPatch(env, { B: null })).toBe(false);
  });

  test('returns true when null targets a missing key', () => {
    expect(isCleanPatch(env, { Z: null })).toBe(true);
  });
});

describe('patchSummary', () => {
  test('counts applied, deleted, skipped and total', () => {
    const summary = patchSummary({ applied: ['A', 'B'], deleted: ['C'], skipped: ['D', 'E'] });
    expect(summary).toEqual({ total: 5, applied: 2, deleted: 1, skipped: 2 });
  });

  test('handles all-zero case', () => {
    const summary = patchSummary({ applied: [], deleted: [], skipped: [] });
    expect(summary.total).toBe(0);
  });
});
