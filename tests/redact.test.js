const { isSensitiveKey, redactValue, redactEnv, listRedactedKeys } = require('../src/redact');
const { formatRedactSummary, formatRedactedEnv } = require('../src/reporter.redact');

describe('isSensitiveKey', () => {
  it('detects password keys', () => {
    expect(isSensitiveKey('DB_PASSWORD')).toBe(true);
    expect(isSensitiveKey('password')).toBe(true);
  });

  it('detects token/secret/api_key', () => {
    expect(isSensitiveKey('AUTH_TOKEN')).toBe(true);
    expect(isSensitiveKey('APP_SECRET')).toBe(true);
    expect(isSensitiveKey('API_KEY')).toBe(true);
    expect(isSensitiveKey('STRIPE_API_KEY')).toBe(true);
  });

  it('does not flag safe keys', () => {
    expect(isSensitiveKey('PORT')).toBe(false);
    expect(isSensitiveKey('NODE_ENV')).toBe(false);
    expect(isSensitiveKey('APP_NAME')).toBe(false);
  });
});

describe('redactValue', () => {
  it('masks a normal value', () => {
    const result = redactValue('supersecret123');
    expect(result).toMatch(/^su\*+3$/);
  });

  it('handles short values', () => {
    expect(redactValue('abc')).toBe('****');
    expect(redactValue('')).toBe('');
  });
});

describe('redactEnv', () => {
  it('redacts sensitive keys and leaves others intact', () => {
    const env = { DB_PASSWORD: 'hunter2', PORT: '3000', API_KEY: 'abc123xyz' };
    const redacted = redactEnv(env);
    expect(redacted.PORT).toBe('3000');
    expect(redacted.DB_PASSWORD).not.toBe('hunter2');
    expect(redacted.API_KEY).not.toBe('abc123xyz');
  });
});

describe('listRedactedKeys', () => {
  it('returns only sensitive keys', () => {
    const env = { DB_PASSWORD: 'x', PORT: '80', SECRET_KEY: 'y' };
    expect(listRedactedKeys(env)).toEqual(expect.arrayContaining(['DB_PASSWORD', 'SECRET_KEY']));
    expect(listRedactedKeys(env)).not.toContain('PORT');
  });
});

describe('formatRedactSummary', () => {
  it('reports no sensitive keys when clean', () => {
    const result = formatRedactSummary({ PORT: '3000' }, 'test');
    expect(result).toContain('No sensitive keys detected');
  });

  it('lists sensitive keys found', () => {
    const result = formatRedactSummary({ API_KEY: 'abc', PORT: '80' }, 'prod');
    expect(result).toContain('1 sensitive key(s)');
    expect(result).toContain('API_KEY');
  });
});

describe('formatRedactedEnv', () => {
  it('formats env as key=value lines', () => {
    const output = formatRedactedEnv({ PORT: '3000', API_KEY: 'ab****3' });
    expect(output).toContain('PORT=3000');
    expect(output).toContain('API_KEY=ab****3');
  });
});
