const { mergeEnvs, isCleanMerge, mergeStrict } = require('../src/merge');

describe('mergeEnvs', () => {
  test('merges two non-overlapping envs', () => {
    const a = { FOO: 'foo', BAR: 'bar' };
    const b = { BAZ: 'baz' };
    const { merged, conflicts } = mergeEnvs(a, b);
    expect(merged).toEqual({ FOO: 'foo', BAR: 'bar', BAZ: 'baz' });
    expect(conflicts).toEqual({});
  });

  test('later source wins on overlap', () => {
    const a = { FOO: 'original' };
    const b = { FOO: 'override' };
    const { merged } = mergeEnvs(a, b);
    expect(merged.FOO).toBe('override');
  });

  test('detects conflicts when values differ', () => {
    const a = { FOO: 'one' };
    const b = { FOO: 'two' };
    const { conflicts } = mergeEnvs(a, b);
    expect(conflicts.FOO).toEqual(['one', 'two']);
  });

  test('no conflict when same key has same value', () => {
    const a = { FOO: 'same' };
    const b = { FOO: 'same' };
    const { conflicts } = mergeEnvs(a, b);
    expect(conflicts).toEqual({});
  });

  test('merges three sources tracking all conflict values', () => {
    const a = { X: '1' };
    const b = { X: '2' };
    const c = { X: '3' };
    const { conflicts } = mergeEnvs(a, b, c);
    expect(conflicts.X).toEqual(['1', '2', '3']);
  });
});

describe('isCleanMerge', () => {
  test('returns true when no conflicts', () => {
    expect(isCleanMerge({ conflicts: {} })).toBe(true);
  });

  test('returns false when conflicts exist', () => {
    expect(isCleanMerge({ conflicts: { FOO: ['a', 'b'] } })).toBe(false);
  });
});

describe('mergeStrict', () => {
  test('returns merged object when clean', () => {
    const result = mergeStrict({ A: '1' }, { B: '2' });
    expect(result).toEqual({ A: '1', B: '2' });
  });

  test('throws on conflict', () => {
    expect(() => mergeStrict({ A: 'x' }, { A: 'y' })).toThrow(/Merge conflicts/);
  });
});
