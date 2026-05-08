const {
  formatFilterSummary,
  formatEmptyKeys,
  formatExcludeSummary,
} = require('../src/reporter.filter');

const original = { DB_HOST: 'localhost', DB_PORT: '5432', APP_NAME: 'envguard' };
const filtered = { DB_HOST: 'localhost', DB_PORT: '5432' };

describe('formatFilterSummary', () => {
  it('shows matched count and entries', () => {
    const out = formatFilterSummary(original, filtered, 'prefix:DB_');
    expect(out).toContain('2/3 keys matched');
    expect(out).toContain('DB_HOST=localhost');
    expect(out).toContain('DB_PORT=5432');
    expect(out).toContain('prefix:DB_');
  });

  it('shows no-match message when empty', () => {
    const out = formatFilterSummary(original, {}, 'prefix:XYZ_');
    expect(out).toContain('0/3 keys matched');
    expect(out).toContain('no keys matched');
  });

  it('uses default label when not provided', () => {
    const out = formatFilterSummary(original, filtered);
    expect(out).toContain('[filter]');
  });
});

describe('formatEmptyKeys', () => {
  it('lists empty keys', () => {
    const out = formatEmptyKeys(['EMPTY_VAL', 'BLANK_VAL']);
    expect(out).toContain('Empty keys (2)');
    expect(out).toContain('- EMPTY_VAL');
    expect(out).toContain('- BLANK_VAL');
  });

  it('returns clean message when none', () => {
    expect(formatEmptyKeys([])).toBe('No empty keys found.');
  });
});

describe('formatExcludeSummary', () => {
  it('reports excluded keys and remaining count', () => {
    const result = { APP_NAME: 'envguard' };
    const out = formatExcludeSummary(['DB_HOST', 'DB_PORT'], result);
    expect(out).toContain('Excluded 2 key(s)');
    expect(out).toContain('Remaining: 1');
    expect(out).toContain('- DB_HOST');
    expect(out).toContain('- DB_PORT');
  });

  it('handles empty exclude list', () => {
    const out = formatExcludeSummary([], original);
    expect(out).toContain('Excluded 0 key(s)');
    expect(out).toContain('Remaining: 3');
  });
});
