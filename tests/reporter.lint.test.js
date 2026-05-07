const { formatIssue, formatLintReport, formatLintSummary } = require('../src/reporter.lint');

const cleanResult = { issues: [], isClean: true };
const dirtyResult = {
  isClean: false,
  issues: [
    { rule: 'key-case', message: 'Key "bad_key" should be UPPER_SNAKE_CASE', line: 1 },
    { rule: 'empty-value', message: 'Key "bad_key" has an empty value', line: 1 },
    { rule: 'value-whitespace', message: 'Value for "SPACED" has leading or trailing whitespace', line: 3 },
  ],
};

describe('formatIssue', () => {
  test('formats a known rule with label', () => {
    const out = formatIssue({ rule: 'key-case', message: 'Key "x" should be UPPER_SNAKE_CASE', line: 2 });
    expect(out).toContain('KEY CASE');
    expect(out).toContain('line 2');
    expect(out).toContain('UPPER_SNAKE_CASE');
  });

  test('formats an unknown rule using uppercased rule name', () => {
    const out = formatIssue({ rule: 'custom-rule', message: 'Something wrong', line: 5 });
    expect(out).toContain('CUSTOM-RULE');
  });
});

describe('formatLintReport', () => {
  test('shows clean message when no issues', () => {
    const out = formatLintReport(cleanResult);
    expect(out).toContain('No issues found');
  });

  test('includes filename in header when provided', () => {
    const out = formatLintReport(cleanResult, '.env.production');
    expect(out).toContain('.env.production');
  });

  test('groups issues by rule', () => {
    const out = formatLintReport(dirtyResult);
    expect(out).toContain('KEY CASE');
    expect(out).toContain('EMPTY VALUE');
    expect(out).toContain('VALUE SPACE');
  });

  test('shows total issue count', () => {
    const out = formatLintReport(dirtyResult);
    expect(out).toContain('3 issues found');
  });

  test('shows singular for one issue', () => {
    const single = { isClean: false, issues: [dirtyResult.issues[0]] };
    const out = formatLintReport(single);
    expect(out).toContain('1 issue found');
  });
});

describe('formatLintSummary', () => {
  test('returns clean string when no issues', () => {
    expect(formatLintSummary(cleanResult)).toBe('Lint: clean');
  });

  test('includes issue count and rule breakdown', () => {
    const out = formatLintSummary(dirtyResult);
    expect(out).toContain('3 issue(s)');
    expect(out).toContain('key-case');
    expect(out).toContain('empty-value');
  });
});
