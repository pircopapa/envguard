const { formatMerge } = require('../src/reporter.merge');

describe('formatMerge', () => {
  test('shows no conflicts message when clean', () => {
    const result = formatMerge({
      merged: { FOO: 'bar', BAZ: 'qux' },
      conflicts: {},
      files: ['.env', '.env.local']
    });
    expect(result).toContain('No conflicts detected');
    expect(result).toContain('FOO=bar');
    expect(result).toContain('BAZ=qux');
    expect(result).toContain('.env + .env.local');
  });

  test('shows conflict count and values when conflicts exist', () => {
    const result = formatMerge({
      merged: { FOO: 'override' },
      conflicts: { FOO: ['original', 'override'] },
      files: []
    });
    expect(result).toContain('1 conflict(s) detected');
    expect(result).toContain('[1] original');
    expect(result).toContain('[2] override');
  });

  test('flags conflicting keys in merged result', () => {
    const result = formatMerge({
      merged: { FOO: 'b', BAR: 'clean' },
      conflicts: { FOO: ['a', 'b'] },
      files: []
    });
    expect(result).toMatch(/FOO=b.*⚠/);
    expect(result).not.toMatch(/BAR=clean.*⚠/);
  });

  test('works without files array', () => {
    const result = formatMerge({
      merged: { KEY: 'val' },
      conflicts: {}
    });
    expect(result).toContain('KEY=val');
  });
});
