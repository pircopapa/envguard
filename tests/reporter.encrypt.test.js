const {
  formatEncryptSummary,
  formatDecryptSummary,
  formatEncryptedEnv,
  formatEncryptedKeys
} = require('../src/reporter.encrypt');
const { encryptValue } = require('../src/encrypt');

const SECRET = 'test-secret';

describe('formatEncryptSummary', () => {
  test('shows correct counts', () => {
    const original = { A: 'foo', B: 'bar', C: 'baz' };
    const encrypted = { A: encryptValue('foo', SECRET), B: 'bar', C: encryptValue('baz', SECRET) };
    const out = formatEncryptSummary(original, encrypted);
    expect(out).toContain('Encrypted  : 2');
    expect(out).toContain('Unchanged  : 1');
    expect(out).toContain('Total keys : 3');
  });
});

describe('formatDecryptSummary', () => {
  test('shows correct counts', () => {
    const original = { A: encryptValue('foo', SECRET), B: 'bar' };
    const decrypted = { A: 'foo', B: 'bar' };
    const out = formatDecryptSummary(original, decrypted);
    expect(out).toContain('Decrypted  : 1');
    expect(out).toContain('Unchanged  : 1');
  });
});

describe('formatEncryptedEnv', () => {
  test('lists all key=value pairs', () => {
    const env = { TOKEN: 'abc123', HOST: 'localhost' };
    const out = formatEncryptedEnv(env);
    expect(out).toContain('TOKEN=abc123');
    expect(out).toContain('HOST=localhost');
  });

  test('truncates long values', () => {
    const longVal = 'a'.repeat(60);
    const env = { BIG: longVal };
    const out = formatEncryptedEnv(env);
    expect(out).toContain('...');
  });
});

describe('formatEncryptedKeys', () => {
  test('lists keys', () => {
    const out = formatEncryptedKeys(['DB_PASS', 'API_KEY']);
    expect(out).toContain('DB_PASS');
    expect(out).toContain('API_KEY');
    expect(out).toContain('(2)');
  });

  test('handles empty list', () => {
    expect(formatEncryptedKeys([])).toBe('No encrypted keys found.');
  });
});
