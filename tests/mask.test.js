const { isMaskableKey, maskValue, maskEnv, listMaskedKeys } = require('../src/mask');
const { formatMaskSummary, formatMaskedEnv } = require('../src/reporter.mask');

describe('isMaskableKey', () => {
  it('detects password keys', () => {
    expect(isMaskableKey('DB_PASSWORD')).toBe(true);
    expect(isMaskableKey('PASSWD')).toBe(true);
  });

  it('detects token keys', () => {
    expect(isMaskableKey('API_TOKEN')).toBe(true);
    expect(isMaskableKey('AUTH_TOKEN')).toBe(true);
  });

  it('detects secret keys', () => {
    expect(isMaskableKey('SECRET_KEY')).toBe(true);
    expect(isMaskableKey('APP_SECRET')).toBe(true);
  });

  it('does not flag safe keys', () => {
    expect(isMaskableKey('PORT')).toBe(false);
    expect(isMaskableKey('NODE_ENV')).toBe(false);
    expect(isMaskableKey('DATABASE_URL')).toBe(false);
  });
});

describe('maskValue', () => {
  it('masks most of a long value', () => {
    const result = maskValue('supersecret123', 3);
    expect(result).toBe('sup********');
  });

  it('fully masks short values', () => {
    expect(maskValue('ab', 3)).toBe('**');
  });

  it('returns empty string for empty value', () => {
    expect(maskValue('')).toBe('');
  });

  it('respects custom visibleChars', () => {
    const result = maskValue('hello_world', 5);
    expect(result.startsWith('hello')).toBe(true);
    expect(result).toContain('*');
  });
});

describe('maskEnv', () => {
  const env = {
    PORT: '3000',
    DB_PASSWORD: 'mysecretpass',
    API_TOKEN: 'tok_abc123',
    NODE_ENV: 'production'
  };

  it('masks sensitive keys only', () => {
    const result = maskEnv(env);
    expect(result.PORT).toBe('3000');
    expect(result.NODE_ENV).toBe('production');
    expect(result.DB_PASSWORD).not.toBe('mysecretpass');
    expect(result.API_TOKEN).not.toBe('tok_abc123');
  });

  it('does not mutate original', () => {
    maskEnv(env);
    expect(env.DB_PASSWORD).toBe('mysecretpass');
  });
});

describe('listMaskedKeys', () => {
  it('returns only sensitive keys', () => {
    const env = { PORT: '3000', API_KEY: 'xyz', HOST: 'localhost' };
    expect(listMaskedKeys(env)).toEqual(['API_KEY']);
  });

  it('returns empty array when none sensitive', () => {
    expect(listMaskedKeys({ PORT: '3000', HOST: 'localhost' })).toEqual([]);
  });
});

describe('formatMaskSummary', () => {
  it('reports no sensitive keys', () => {
    expect(formatMaskSummary({ PORT: '3000' })).toContain('No sensitive keys');
  });

  it('lists masked keys', () => {
    const result = formatMaskSummary({ DB_PASSWORD: 'x', PORT: '3000' });
    expect(result).toContain('DB_PASSWORD');
    expect(result).toContain('1 sensitive');
  });
});

describe('formatMaskedEnv', () => {
  it('formats key=value lines', () => {
    const result = formatMaskedEnv({ PORT: '3000', DB_PASSWORD: 'mys******' });
    expect(result).toContain('PORT=3000');
    expect(result).toContain('DB_PASSWORD=mys******');
  });

  it('handles empty env', () => {
    expect(formatMaskedEnv({})).toBe('(empty)');
  });
});
