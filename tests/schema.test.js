const { validateField, validateSchema } = require('../src/schema');

describe('validateField', () => {
  test('passes when required field is present', () => {
    expect(validateField('PORT', '3000', { required: true })).toEqual([]);
  });

  test('errors when required field is missing', () => {
    const errs = validateField('PORT', undefined, { required: true });
    expect(errs).toHaveLength(1);
    expect(errs[0]).toMatch(/required/);
  });

  test('errors when required field is empty string', () => {
    const errs = validateField('PORT', '', { required: true });
    expect(errs).toHaveLength(1);
  });

  test('passes optional missing field', () => {
    expect(validateField('DEBUG', undefined, { required: false })).toEqual([]);
  });

  test('validates number type', () => {
    expect(validateField('PORT', '8080', { type: 'number' })).toEqual([]);
    const errs = validateField('PORT', 'abc', { type: 'number' });
    expect(errs[0]).toMatch(/number/);
  });

  test('validates boolean type', () => {
    expect(validateField('DEBUG', 'true', { type: 'boolean' })).toEqual([]);
    expect(validateField('DEBUG', '0', { type: 'boolean' })).toEqual([]);
    const errs = validateField('DEBUG', 'yes', { type: 'boolean' });
    expect(errs[0]).toMatch(/boolean/);
  });

  test('validates pattern', () => {
    const schema = { pattern: /^https?:\/\// };
    expect(validateField('URL', 'https://example.com', schema)).toEqual([]);
    const errs = validateField('URL', 'ftp://bad.com', schema);
    expect(errs[0]).toMatch(/pattern/);
  });
});

describe('validateSchema', () => {
  const schema = {
    PORT: { required: true, type: 'number' },
    NODE_ENV: { required: true, pattern: /^(development|production|test)$/ },
    DEBUG: { required: false, type: 'boolean' },
  };

  test('returns valid for a correct env', () => {
    const env = { PORT: '3000', NODE_ENV: 'production', DEBUG: 'false' };
    const result = validateSchema(env, schema);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('collects multiple errors', () => {
    const env = { PORT: 'abc', NODE_ENV: 'staging' };
    const result = validateSchema(env, schema);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  test('warns about undeclared keys', () => {
    const env = { PORT: '3000', NODE_ENV: 'test', UNKNOWN_KEY: 'foo' };
    const result = validateSchema(env, schema);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toMatch(/UNKNOWN_KEY/);
  });

  test('no warnings when all keys are in schema', () => {
    const env = { PORT: '3000', NODE_ENV: 'test' };
    const result = validateSchema(env, schema);
    expect(result.warnings).toHaveLength(0);
  });
});
