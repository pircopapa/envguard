const {
  checkDeprecatedKey,
  findDeprecatedKeys,
  isCleanDeprecation,
  deprecateSummary
} = require('../src/deprecate');

const {
  formatDeprecatedEntry,
  formatDeprecationReport,
  formatDeprecationSummary
} = require('../src/reporter.deprecate');

const deprecationMap = {
  OLD_API_KEY: 'NEW_API_KEY',
  LEGACY_HOST: 'APP_HOST',
  REMOVED_FLAG: null
};

describe('checkDeprecatedKey', () => {
  it('flags a deprecated key with a replacement', () => {
    const result = checkDeprecatedKey('OLD_API_KEY', deprecationMap);
    expect(result).toEqual({ deprecated: true, replacement: 'NEW_API_KEY' });
  });

  it('flags a deprecated key with no replacement', () => {
    const result = checkDeprecatedKey('REMOVED_FLAG', deprecationMap);
    expect(result).toEqual({ deprecated: true, replacement: null });
  });

  it('returns not deprecated for a current key', () => {
    const result = checkDeprecatedKey('APP_HOST', deprecationMap);
    expect(result).toEqual({ deprecated: false, replacement: null });
  });
});

describe('findDeprecatedKeys', () => {
  it('returns matching deprecated entries', () => {
    const env = { OLD_API_KEY: 'abc', APP_HOST: 'localhost', REMOVED_FLAG: '1' };
    const found = findDeprecatedKeys(env, deprecationMap);
    expect(found).toHaveLength(2);
    expect(found.map(e => e.key)).toContain('OLD_API_KEY');
    expect(found.map(e => e.key)).toContain('REMOVED_FLAG');
  });

  it('returns empty array when no deprecated keys present', () => {
    const env = { APP_HOST: 'localhost', NEW_API_KEY: 'xyz' };
    expect(findDeprecatedKeys(env, deprecationMap)).toEqual([]);
  });
});

describe('isCleanDeprecation', () => {
  it('returns true when env has no deprecated keys', () => {
    expect(isCleanDeprecation({ NEW_API_KEY: 'x' }, deprecationMap)).toBe(true);
  });

  it('returns false when deprecated keys exist', () => {
    expect(isCleanDeprecation({ OLD_API_KEY: 'x' }, deprecationMap)).toBe(false);
  });
});

describe('deprecateSummary', () => {
  it('builds a correct summary object', () => {
    const env = { OLD_API_KEY: 'a', NEW_API_KEY: 'b' };
    const summary = deprecateSummary(env, deprecationMap);
    expect(summary.total).toBe(2);
    expect(summary.deprecated).toBe(1);
    expect(summary.clean).toBe(false);
    expect(summary.entries[0].key).toBe('OLD_API_KEY');
  });
});

describe('formatDeprecationReport', () => {
  it('shows OK message when clean', () => {
    const summary = { total: 3, deprecated: 0, clean: true, entries: [] };
    expect(formatDeprecationReport(summary)).toMatch(/No deprecated keys found/);
  });

  it('lists deprecated keys when not clean', () => {
    const summary = deprecateSummary({ OLD_API_KEY: 'x', APP_PORT: '3000' }, deprecationMap);
    const report = formatDeprecationReport(summary);
    expect(report).toMatch(/OLD_API_KEY/);
    expect(report).toMatch(/NEW_API_KEY/);
  });
});

describe('formatDeprecationSummary', () => {
  it('returns pass message when clean', () => {
    expect(formatDeprecationSummary({ deprecated: 0, total: 5, clean: true })).toMatch(/passed/);
  });

  it('returns fail message when not clean', () => {
    expect(formatDeprecationSummary({ deprecated: 2, total: 5, clean: false })).toMatch(/failed/);
  });
});
