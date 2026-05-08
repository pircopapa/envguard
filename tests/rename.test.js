const { applyRenameMap, renameByPattern, isCleanRename } = require('../src/rename');
const { formatRenameSummary, formatRenamePreview } = require('../src/reporter.rename');

describe('applyRenameMap', () => {
  const env = { FOO: 'foo', BAR: 'bar', BAZ: 'baz' };

  it('renames keys according to the map', () => {
    const { result, renamed, skipped } = applyRenameMap(env, { FOO: 'NEW_FOO' });
    expect(result.NEW_FOO).toBe('foo');
    expect(result.FOO).toBeUndefined();
    expect(renamed).toEqual([{ from: 'FOO', to: 'NEW_FOO' }]);
    expect(skipped).toEqual([]);
  });

  it('skips keys not present in env', () => {
    const { renamed, skipped } = applyRenameMap(env, { MISSING: 'X' });
    expect(renamed).toHaveLength(0);
    expect(skipped).toContain('MISSING');
  });

  it('skips rename that would overwrite an existing key', () => {
    const { renamed, skipped } = applyRenameMap(env, { FOO: 'BAR' });
    expect(renamed).toHaveLength(0);
    expect(skipped).toContain('FOO');
  });

  it('handles no-op rename (same key)', () => {
    const { renamed } = applyRenameMap(env, { FOO: 'FOO' });
    expect(renamed).toEqual([{ from: 'FOO', to: 'FOO' }]);
  });
});

describe('renameByPattern', () => {
  const env = { REACT_APP_FOO: '1', REACT_APP_BAR: '2', OTHER: '3' };

  it('renames keys matching the pattern', () => {
    const { result, renamed } = renameByPattern(
      env,
      /^REACT_APP_/,
      (k) => k.replace(/^REACT_APP_/, 'VITE_')
    );
    expect(result.VITE_FOO).toBe('1');
    expect(result.VITE_BAR).toBe('2');
    expect(result.OTHER).toBe('3');
    expect(renamed).toHaveLength(2);
  });

  it('leaves non-matching keys unchanged', () => {
    const { renamed } = renameByPattern(env, /^NONEXISTENT_/, (k) => k);
    expect(renamed).toHaveLength(0);
  });
});

describe('isCleanRename', () => {
  it('returns true when nothing was renamed', () => {
    expect(isCleanRename([])).toBe(true);
  });

  it('returns false when keys were renamed', () => {
    expect(isCleanRename([{ from: 'A', to: 'B' }])).toBe(false);
  });
});

describe('formatRenameSummary', () => {
  it('shows renamed and skipped keys', () => {
    const out = formatRenameSummary([{ from: 'FOO', to: 'BAR' }], ['MISSING']);
    expect(out).toContain('FOO → BAR');
    expect(out).toContain('MISSING');
  });

  it('returns clean message when nothing changed', () => {
    expect(formatRenameSummary([], [])).toBe('No keys renamed.');
  });
});

describe('formatRenamePreview', () => {
  it('shows before/after lines', () => {
    const original = { FOO: 'hello' };
    const result = { BAR: 'hello' };
    const renamed = [{ from: 'FOO', to: 'BAR' }];
    const out = formatRenamePreview(original, result, renamed);
    expect(out).toContain('- FOO=hello');
    expect(out).toContain('+ BAR=hello');
  });

  it('returns no-changes message for empty rename list', () => {
    expect(formatRenamePreview({}, {}, [])).toBe('No changes to preview.');
  });
});
