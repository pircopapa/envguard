const { formatValidation, formatDiff } = require('../src/reporter');

describe('formatValidation', () => {
  test('shows valid message when result is clean', () => {
    const result = { valid: true, missing: [], extra: [], empty: [] };
    const output = formatValidation('production', result);
    expect(output).toContain('[production]');
    expect(output).toContain('✓ valid');
  });

  test('shows missing keys in output', () => {
    const result = { valid: false, missing: ['API_KEY', 'SECRET'], extra: [], empty: [] };
    const output = formatValidation('staging', result);
    expect(output).toContain('✗ invalid');
    expect(output).toContain('- API_KEY');
    expect(output).toContain('- SECRET');
  });

  test('shows extra keys in output', () => {
    const result = { valid: false, missing: [], extra: ['DEBUG_MODE'], empty: [] };
    const output = formatValidation('dev', result);
    expect(output).toContain('+ DEBUG_MODE');
  });

  test('shows empty value keys in output', () => {
    const result = { valid: false, missing: [], extra: [], empty: ['DATABASE_URL'] };
    const output = formatValidation('ci', result);
    expect(output).toContain('! DATABASE_URL');
  });

  test('includes env name in output for invalid result', () => {
    const result = { valid: false, missing: ['TOKEN'], extra: [], empty: [] };
    const output = formatValidation('staging', result);
    expect(output).toContain('[staging]');
  });
});

describe('formatDiff', () => {
  test('shows no differences message when envs are identical', () => {
    const env = { PORT: '3000', API_KEY: 'abc' };
    const output = formatDiff(env, env, 'dev', 'prod');
    expect(output).toContain('No differences found.');
  });

  test('shows added keys', () => {
    const envA = { PORT: '3000' };
    const envB = { PORT: '3000', NEW_KEY: 'hello' };
    const output = formatDiff(envA, envB, 'dev', 'prod');
    expect(output).toContain('+ NEW_KEY=hello');
  });

  test('shows removed keys', () => {
    const envA = { PORT: '3000', OLD_KEY: 'bye' };
    const envB = { PORT: '3000' };
    const output = formatDiff(envA, envB, 'dev', 'prod');
    expect(output).toContain('- OLD_KEY=bye');
  });

  test('shows changed values', () => {
    const envA = { PORT: '3000' };
    const envB = { PORT: '8080' };
    const output = formatDiff(envA, envB, 'dev', 'prod');
    expect(output).toContain('~ PORT');
    expect(output).toContain('"3000"');
    expect(output).toContain('"8080"');
  });

  test('includes env names in diff header', () => {
    const envA = { PORT: '3000' };
    const envB = { PORT: '8080' };
    const output = formatDiff(envA, envB, 'dev', 'prod');
    expect(output).toContain('dev');
    expect(output).toContain('prod');
  });
});
