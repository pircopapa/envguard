const { cloneEnv, scaffoldTemplate, applyOverrides, isFullyCloned, emptyCloneKeys } = require('../src/clone');
const { formatCloneSummary, formatTemplatePreview, formatEmptyCloneWarning } = require('../src/reporter.clone');

const sampleEnv = {
  APP_NAME: 'envguard',
  DB_HOST: 'localhost',
  DB_PASS: 'secret',
  API_KEY: 'abc123',
};

describe('cloneEnv', () => {
  it('clones all keys and values by default', () => {
    const result = cloneEnv(sampleEnv);
    expect(result).toEqual(sampleEnv);
    expect(result).not.toBe(sampleEnv);
  });

  it('blanks values when blankValues is true', () => {
    const result = cloneEnv(sampleEnv, { blankValues: true });
    expect(Object.values(result).every((v) => v === '')).toBe(true);
    expect(Object.keys(result)).toEqual(Object.keys(sampleEnv));
  });

  it('omits specified keys', () => {
    const result = cloneEnv(sampleEnv, { omitKeys: ['DB_PASS', 'API_KEY'] });
    expect(result).not.toHaveProperty('DB_PASS');
    expect(result).not.toHaveProperty('API_KEY');
    expect(result).toHaveProperty('APP_NAME');
  });

  it('returns empty object if all keys are omitted', () => {
    const result = cloneEnv(sampleEnv, { omitKeys: Object.keys(sampleEnv) });
    expect(result).toEqual({});
  });

  it('ignores omitKeys entries that do not exist in the source', () => {
    const result = cloneEnv(sampleEnv, { omitKeys: ['NONEXISTENT_KEY'] });
    expect(result).toEqual(sampleEnv);
  });
});

describe('scaffoldTemplate', () => {
  it('produces lines of KEY= for each key', () => {
    const result = scaffoldTemplate(sampleEnv);
    expect(result).toContain('APP_NAME=');
    expect(result).toContain('DB_HOST=');
    expect(result).not.toContain('secret');
  });

  it('includes header comment when provided', () => {
    const result = scaffoldTemplate(sampleEnv, { header: 'My App Config' });
    expect(result).toContain('# My App Config');
  });
});

describe('applyOverrides', () => {
  it('merges overrides into base env', () => {
    const base = cloneEnv(sampleEnv, { blankValues: true });
    const result = applyOverrides(base, { DB_HOST: 'prod-db' });
    expect(result.DB_HOST).toBe('prod-db');
    expect(result.APP_NAME).toBe('');
  });
});

describe('isFullyCloned / emptyCloneKeys', () => {
  it('returns true when all values are populated', () => {
    expect(isFullyCloned(sampleEnv)).toBe(true);
  });

  it('returns false when any value is empty', () => {
    expect(isFullyCloned({ ...sampleEnv, DB_PASS: '' })).toBe(false);
  });

  it('lists keys with empty values', () => {
    const env = { ...sampleEnv, DB_PASS: '', API_KEY: '' };
    expect(emptyCloneKeys(env)).toEqual(['DB_PASS', 'API_KEY']);
  });

  it('returns empty array when all values are populated', () => {
    expect(emptyCloneKeys(sampleEnv)).toEqual([]);
  });
});

describe('formatCloneSummary', () => {
  it('includes total and kept counts', () => {
    const cloned = cloneEnv(sampleEnv, { omitKeys: ['API_KEY'] });
    const out = formatCloneSummary(sampleEnv, cloned, ['API_KEY']);
    expect(out).toContain('4');
    expect(out).toContain('3');
    expect(out).toContain('API_KEY');
  });
});

describe('formatEmptyCloneWarning', () => {
  it('returns clean message when no empty keys', () => {
    expect(formatEmptyCloneWarning([])).toMatch(/All cloned/);
  });

  it('includes empty key names in warning message', () => {
    const out = formatEmptyCloneWarning(['DB_PASS', 'API_KEY']);
    expect(out).toContain('DB_PASS');
    expect(out).toContain('API_KEY');
  });
});
