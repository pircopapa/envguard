const {
  encryptValue,
  decryptValue,
  encryptEnv,
  decryptEnv,
  isEncryptedValue,
  listEncryptedKeys
} = require('../src/encrypt');

const SECRET = 'test-secret-key';

describe('encryptValue / decryptValue', () => {
  test('round-trips a plain string', () => {
    const enc = encryptValue('hello', SECRET);
    expect(decryptValue(enc, SECRET)).toBe('hello');
  });

  test('produces different ciphertext each call (random IV)', () => {
    const a = encryptValue('same', SECRET);
    const b = encryptValue('same', SECRET);
    expect(a).not.toBe(b);
  });

  test('throws on invalid encrypted format', () => {
    expect(() => decryptValue('notvalid', SECRET)).toThrow('Invalid encrypted format');
  });

  test('throws on wrong secret', () => {
    const enc = encryptValue('secret-data', SECRET);
    expect(() => decryptValue(enc, 'wrong-secret')).toThrow();
  });
});

describe('isEncryptedValue', () => {
  test('detects encrypted values', () => {
    const enc = encryptValue('val', SECRET);
    expect(isEncryptedValue(enc)).toBe(true);
  });

  test('rejects plain values', () => {
    expect(isEncryptedValue('plaintext')).toBe(false);
    expect(isEncryptedValue('http://example.com')).toBe(false);
  });
});

describe('encryptEnv / decryptEnv', () => {
  const env = { DB_PASS: 'secret', API_KEY: 'key123', NODE_ENV: 'production' };

  test('encrypts all keys by default', () => {
    const enc = encryptEnv(env, SECRET);
    expect(isEncryptedValue(enc.DB_PASS)).toBe(true);
    expect(isEncryptedValue(enc.API_KEY)).toBe(true);
    expect(isEncryptedValue(enc.NODE_ENV)).toBe(true);
  });

  test('encrypts only specified keys', () => {
    const enc = encryptEnv(env, SECRET, ['DB_PASS']);
    expect(isEncryptedValue(enc.DB_PASS)).toBe(true);
    expect(enc.API_KEY).toBe('key123');
  });

  test('full round-trip', () => {
    const enc = encryptEnv(env, SECRET);
    const dec = decryptEnv(enc, SECRET);
    expect(dec).toEqual(env);
  });

  test('partial round-trip with key list', () => {
    const enc = encryptEnv(env, SECRET, ['DB_PASS', 'API_KEY']);
    const dec = decryptEnv(enc, SECRET, ['DB_PASS', 'API_KEY']);
    expect(dec).toEqual(env);
  });
});

describe('listEncryptedKeys', () => {
  test('returns keys with encrypted values', () => {
    const env = { DB_PASS: encryptValue('x', SECRET), NODE_ENV: 'prod' };
    expect(listEncryptedKeys(env)).toEqual(['DB_PASS']);
  });

  test('returns empty array when none encrypted', () => {
    expect(listEncryptedKeys({ A: '1', B: '2' })).toEqual([]);
  });
});
