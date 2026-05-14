const {
  isPlaceholder,
  findPlaceholders,
  isCleanPlaceholder,
  placeholderSummary,
} = require('../src/placeholder');

const { formatPlaceholderReport, formatPlaceholderSummary } = require('../src/reporter.placeholder');

describe('isPlaceholder', () => {
  it('detects CHANGE_ME', () => expect(isPlaceholder('CHANGE_ME')).toBe(true));
  it('detects <YOUR_SECRET>', () => expect(isPlaceholder('<YOUR_SECRET>')).toBe(true));
  it('detects [FILL_IN]', () => expect(isPlaceholder('[FILL_IN]')).toBe(true));
  it('detects TODO case-insensitive', () => expect(isPlaceholder('todo')).toBe(true));
  it('detects FIXME', () => expect(isPlaceholder('FIXME')).toBe(true));
  it('detects PLACEHOLDER', () => expect(isPlaceholder('PLACEHOLDER')).toBe(true));
  it('detects xxx', () => expect(isPlaceholder('xxx')).toBe(true));
  it('detects ****', () => expect(isPlaceholder('****')).toBe(true));
  it('returns false for real values', () => expect(isPlaceholder('my-real-secret')).toBe(false));
  it('returns false for empty string', () => expect(isPlaceholder('')).toBe(false));
  it('returns false for numeric value', () => expect(isPlaceholder('3000')).toBe(false));
  it('accepts custom patterns', () => {
    expect(isPlaceholder('NOOP', [/^NOOP$/])).toBe(true);
    expect(isPlaceholder('NOOP')).toBe(false);
  });
});

describe('findPlaceholders', () => {
  const env = {
    DB_URL: 'postgres://localhost/mydb',
    API_KEY: 'CHANGE_ME',
    SECRET: '<YOUR_SECRET>',
    PORT: '3000',
  };

  it('finds all placeholder entries', () => {
    const hits = findPlaceholders(env);
    expect(hits).toHaveLength(2);
    expect(hits.map((h) => h.key)).toEqual(expect.arrayContaining(['API_KEY', 'SECRET']));
  });

  it('returns empty array when no placeholders', () => {
    expect(findPlaceholders({ A: 'real', B: '123' })).toHaveLength(0);
  });
});

describe('isCleanPlaceholder', () => {
  it('returns true when no placeholders', () => {
    expect(isCleanPlaceholder({ A: 'real' })).toBe(true);
  });
  it('returns false when placeholders exist', () => {
    expect(isCleanPlaceholder({ A: 'CHANGE_ME' })).toBe(false);
  });
});

describe('placeholderSummary', () => {
  it('returns correct counts', () => {
    const env = { A: 'CHANGE_ME', B: 'real', C: 'TODO' };
    const s = placeholderSummary(env);
    expect(s.total).toBe(3);
    expect(s.placeholderCount).toBe(2);
    expect(s.keys).toEqual(expect.arrayContaining(['A', 'C']));
  });
});

describe('formatPlaceholderReport', () => {
  it('shows clean message when no placeholders', () => {
    const out = formatPlaceholderReport({ A: 'real' }, '.env.test');
    expect(out).toContain('No placeholder values found');
  });

  it('lists placeholder keys', () => {
    const out = formatPlaceholderReport({ A: 'CHANGE_ME', B: 'real' }, '.env');
    expect(out).toContain('A');
    expect(out).toContain('CHANGE_ME');
  });
});

describe('formatPlaceholderSummary', () => {
  it('returns success line when clean', () => {
    expect(formatPlaceholderSummary({ A: 'ok' })).toMatch(/All 1 keys look filled in/);
  });
  it('returns failure line when dirty', () => {
    expect(formatPlaceholderSummary({ A: 'CHANGE_ME' })).toMatch(/1\/1 key\(s\) still have placeholder/);
  });
});
