const { parseWithDuplicates, findDuplicates, dedupeEnv, isCleanDedupe, dedupeSummary } = require('../src/dedupe');

const cleanEnv = `
FOO=bar
BAZ=qux
PORT=3000
`.trim();

const dupeEnv = `
FOO=first
BAR=hello
FOO=second
BAZ=world
BAR=goodbye
FOO=third
`.trim();

describe('parseWithDuplicates', () => {
  it('returns all entries including duplicates', () => {
    const entries = parseWithDuplicates(dupeEnv);
    expect(entries.filter(e => e.key === 'FOO')).toHaveLength(3);
    expect(entries.filter(e => e.key === 'BAR')).toHaveLength(2);
  });

  it('skips comments and blank lines', () => {
    const raw = `# comment\nFOO=bar\n\nBAZ=qux`;
    const entries = parseWithDuplicates(raw);
    expect(entries).toHaveLength(2);
  });

  it('records correct line numbers', () => {
    const entries = parseWithDuplicates(dupeEnv);
    const fooLines = entries.filter(e => e.key === 'FOO').map(e => e.line);
    expect(fooLines).toEqual([1, 3, 6]);
  });
});

describe('findDuplicates', () => {
  it('returns keys with more than one occurrence', () => {
    const entries = parseWithDuplicates(dupeEnv);
    const dupes = findDuplicates(entries);
    expect(dupes).toHaveProperty('FOO');
    expect(dupes).toHaveProperty('BAR');
    expect(dupes).not.toHaveProperty('BAZ');
  });

  it('returns empty object for clean env', () => {
    const entries = parseWithDuplicates(cleanEnv);
    expect(findDuplicates(entries)).toEqual({});
  });
});

describe('dedupeEnv', () => {
  it('keeps last value for duplicate keys', () => {
    const { env } = dedupeEnv(dupeEnv);
    expect(env.FOO).toBe('third');
    expect(env.BAR).toBe('goodbye');
  });

  it('reports removed (earlier) duplicate lines', () => {
    const { removed } = dedupeEnv(dupeEnv);
    expect(removed.FOO).toEqual([1, 3]);
    expect(removed.BAR).toEqual([2]);
  });

  it('returns empty removed for clean env', () => {
    const { removed } = dedupeEnv(cleanEnv);
    expect(removed).toEqual({});
  });
});

describe('isCleanDedupe', () => {
  it('returns true when no duplicates', () => {
    expect(isCleanDedupe(cleanEnv)).toBe(true);
  });

  it('returns false when duplicates exist', () => {
    expect(isCleanDedupe(dupeEnv)).toBe(false);
  });
});

describe('dedupeSummary', () => {
  it('returns correct totals', () => {
    const { removed } = dedupeEnv(dupeEnv);
    const summary = dedupeSummary(removed);
    expect(summary.totalDuplicates).toBe(3); // 2 extra FOO + 1 extra BAR
    expect(summary.affectedKeys).toContain('FOO');
    expect(summary.affectedKeys).toContain('BAR');
  });

  it('returns zeros for clean env', () => {
    const summary = dedupeSummary({});
    expect(summary.totalDuplicates).toBe(0);
    expect(summary.affectedKeys).toHaveLength(0);
  });
});
