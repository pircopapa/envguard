const { lintEntry, lintEnv } = require('../src/lint');

describe('lintEntry', () => {
  test('passes a valid UPPER_SNAKE_CASE key with a value', () => {
    const issues = lintEntry('API_KEY', 'abc123', 1);
    expect(issues).toHaveLength(0);
  });

  test('flags lowercase key', () => {
    const issues = lintEntry('api_key', 'value', 1);
    expect(issues.some(i => i.rule === 'key-case')).toBe(true);
  });

  test('flags mixed case key', () => {
    const issues = lintEntry('ApiKey', 'value', 2);
    expect(issues.some(i => i.rule === 'key-case')).toBe(true);
  });

  test('flags key with leading whitespace', () => {
    const issues = lintEntry(' API_KEY', 'value', 3);
    expect(issues.some(i => i.rule === 'key-whitespace')).toBe(true);
  });

  test('flags value with trailing whitespace', () => {
    const issues = lintEntry('API_KEY', 'value  ', 4);
    expect(issues.some(i => i.rule === 'value-whitespace')).toBe(true);
  });

  test('flags empty value', () => {
    const issues = lintEntry('API_KEY', '', 5);
    expect(issues.some(i => i.rule === 'empty-value')).toBe(true);
  });

  test('reports correct line number', () => {
    const issues = lintEntry('bad_key', '', 7);
    expect(issues.every(i => i.line === 7)).toBe(true);
  });
});

describe('lintEnv', () => {
  test('returns isClean true for valid env', () => {
    const env = { API_KEY: 'abc', DB_HOST: 'localhost', PORT: '3000' };
    const result = lintEnv(env);
    expect(result.isClean).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  test('collects issues from multiple keys', () => {
    const env = { bad_key: '', GOOD_KEY: 'ok', another_bad: 'value ' };
    const result = lintEnv(env);
    expect(result.isClean).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  test('returns all issue rules present', () => {
    const env = { bad_key: '' };
    const result = lintEnv(env);
    const rules = result.issues.map(i => i.rule);
    expect(rules).toContain('key-case');
    expect(rules).toContain('empty-value');
  });

  test('empty env has no issues', () => {
    const result = lintEnv({});
    expect(result.isClean).toBe(true);
  });
});
