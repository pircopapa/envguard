const { applyDefaults, missingDefaultKeys, undocumentedKeys, isFullyPopulated } = require('../src/defaults');

describe('applyDefaults', () => {
  it('fills in keys missing from env', () => {
    const env = { A: '1' };
    const defaults = { A: 'default_a', B: 'default_b' };
    const { result, applied } = applyDefaults(env, defaults);
    expect(result).toEqual({ A: '1', B: 'default_b' });
    expect(applied).toEqual({ B: 'default_b' });
  });

  it('does not overwrite existing non-empty values', () => {
    const env = { A: 'existing' };
    const defaults = { A: 'default_a' };
    const { result, applied } = applyDefaults(env, defaults);
    expect(result.A).toBe('existing');
    expect(applied).toEqual({});
  });

  it('does not overwrite empty values by default', () => {
    const env = { A: '' };
    const defaults = { A: 'default_a' };
    const { result, applied } = applyDefaults(env, defaults);
    expect(result.A).toBe('');
    expect(applied).toEqual({});
  });

  it('overwrites empty values when overwriteEmpty is true', () => {
    const env = { A: '' };
    const defaults = { A: 'default_a' };
    const { result, applied } = applyDefaults(env, defaults, { overwriteEmpty: true });
    expect(result.A).toBe('default_a');
    expect(applied).toEqual({ A: 'default_a' });
  });

  it('returns original env untouched when defaults is empty', () => {
    const env = { A: '1', B: '2' };
    const { result, applied } = applyDefaults(env, {});
    expect(result).toEqual(env);
    expect(applied).toEqual({});
  });
});

describe('missingDefaultKeys', () => {
  it('returns keys in defaults not present in env', () => {
    const env = { A: '1' };
    const defaults = { A: 'a', B: 'b', C: 'c' };
    expect(missingDefaultKeys(env, defaults)).toEqual(['B', 'C']);
  });

  it('returns empty array when all defaults are covered', () => {
    const env = { A: '1', B: '2' };
    const defaults = { A: 'a', B: 'b' };
    expect(missingDefaultKeys(env, defaults)).toEqual([]);
  });
});

describe('undocumentedKeys', () => {
  it('returns keys in env not present in defaults', () => {
    const env = { A: '1', B: '2', C: '3' };
    const defaults = { A: 'a' };
    expect(undocumentedKeys(env, defaults).sort()).toEqual(['B', 'C']);
  });

  it('returns empty array when all env keys are in defaults', () => {
    const env = { A: '1' };
    const defaults = { A: 'a', B: 'b' };
    expect(undocumentedKeys(env, defaults)).toEqual([]);
  });
});

describe('isFullyPopulated', () => {
  it('returns true when all default keys exist in env', () => {
    const env = { A: '1', B: '2' };
    const defaults = { A: 'a', B: 'b' };
    expect(isFullyPopulated(env, defaults)).toBe(true);
  });

  it('returns false when a default key is missing from env', () => {
    const env = { A: '1' };
    const defaults = { A: 'a', B: 'b' };
    expect(isFullyPopulated(env, defaults)).toBe(false);
  });
});
