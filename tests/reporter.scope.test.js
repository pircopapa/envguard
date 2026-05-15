const { formatScopeSummary, formatScopeBreakdown, formatOverlapWarning } = require('../src/reporter.scope');

describe('formatScopeSummary', () => {
  test('renders header and each scope row', () => {
    const summary = [
      { name: 'database', count: 2 },
      { name: 'auth', count: 3 },
      { name: 'other', count: 1 },
    ];
    const out = formatScopeSummary(summary);
    expect(out).toMatch('Scope summary:');
    expect(out).toMatch('database');
    expect(out).toMatch('2 keys');
    expect(out).toMatch('auth');
    expect(out).toMatch('3 keys');
    expect(out).toMatch('other');
    expect(out).toMatch('1 key');
  });

  test('singular key label when count is 1', () => {
    const out = formatScopeSummary([{ name: 'x', count: 1 }]);
    expect(out).toMatch('1 key');
    expect(out).not.toMatch('1 keys');
  });
});

describe('formatScopeBreakdown', () => {
  test('lists keys under each scope heading', () => {
    const scopes = {
      database: { DB_HOST: 'localhost', DB_PORT: '5432' },
      auth: { AUTH_SECRET: 'abc' },
    };
    const out = formatScopeBreakdown(scopes);
    expect(out).toMatch('[database]');
    expect(out).toMatch('DB_HOST');
    expect(out).toMatch('[auth]');
    expect(out).toMatch('AUTH_SECRET');
  });

  test('shows (empty) for scopes with no keys', () => {
    const out = formatScopeBreakdown({ empty_scope: {} });
    expect(out).toMatch('(empty)');
  });
});

describe('formatOverlapWarning', () => {
  test('reports no overlap when clean', () => {
    const scopes = {
      a: { FOO: '1' },
      b: { BAR: '2' },
    };
    expect(formatOverlapWarning(scopes)).toMatch('No overlapping keys');
  });

  test('lists overlapping keys', () => {
    const scopes = {
      a: { SHARED: '1', UNIQUE_A: '2' },
      b: { SHARED: '1', UNIQUE_B: '3' },
    };
    const out = formatOverlapWarning(scopes);
    expect(out).toMatch('Warning:');
    expect(out).toMatch('SHARED');
    expect(out).toMatch('1 key(s)');
  });
});
