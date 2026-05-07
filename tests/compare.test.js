const { compareEnvs, isCleanComparison, compareSummary } = require('../src/compare');
const { formatComparison, formatComparisonSummary } = require('../src/reporter.compare');

const base = { API_URL: 'http://localhost', DB_HOST: 'localhost', SECRET: 'base' };
const dev =  { API_URL: 'http://localhost', DB_HOST: 'localhost', SECRET: 'dev-secret' };
const prod = { API_URL: 'https://prod.example.com', DB_HOST: 'prod-db', EXTRA_KEY: 'only-in-prod' };

describe('compareEnvs', () => {
  test('marks matching keys as match', () => {
    const result = compareEnvs(base, { dev });
    expect(result['API_URL'].status.dev).toBe('match');
    expect(result['DB_HOST'].status.dev).toBe('match');
  });

  test('marks differing values as differs', () => {
    const result = compareEnvs(base, { dev });
    expect(result['SECRET'].status.dev).toBe('differs');
  });

  test('marks missing keys as missing', () => {
    const result = compareEnvs(base, { prod });
    expect(result['SECRET'].status.prod).toBe('missing');
  });

  test('marks extra keys as extra', () => {
    const result = compareEnvs(base, { prod });
    expect(result['EXTRA_KEY'].status.prod).toBe('extra');
  });

  test('includes base value in result rows', () => {
    const result = compareEnvs(base, { dev });
    expect(result['API_URL'].base).toBe('http://localhost');
  });

  test('handles multiple targets', () => {
    const result = compareEnvs(base, { dev, prod });
    expect(result['API_URL'].status.dev).toBe('match');
    expect(result['API_URL'].status.prod).toBe('differs');
  });
});

describe('isCleanComparison', () => {
  test('returns true when all keys match', () => {
    const result = compareEnvs(base, { copy: { ...base } });
    expect(isCleanComparison(result)).toBe(true);
  });

  test('returns false when any key differs', () => {
    const result = compareEnvs(base, { dev });
    expect(isCleanComparison(result)).toBe(false);
  });
});

describe('compareSummary', () => {
  test('returns correct counts per target', () => {
    const result = compareEnvs(base, { dev });
    const summary = compareSummary(result);
    expect(summary.dev.match).toBe(2);
    expect(summary.dev.differs).toBe(1);
  });
});

describe('formatComparison', () => {
  test('returns a string with key names', () => {
    const result = compareEnvs(base, { dev });
    const output = formatComparison(result);
    expect(output).toContain('API_URL');
    expect(output).toContain('match');
  });
});

describe('formatComparisonSummary', () => {
  test('returns summary string with target name', () => {
    const result = compareEnvs(base, { prod });
    const output = formatComparisonSummary(result);
    expect(output).toContain('prod');
    expect(output).toContain('missing');
    expect(output).toContain('extra');
  });
});
