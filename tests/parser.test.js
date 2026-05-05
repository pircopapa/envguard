const { parseEnv } = require('../src/parser');

describe('parseEnv', () => {
  test('parses simple key=value pairs', () => {
    const result = parseEnv('FOO=bar\nBAZ=qux');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  test('ignores comment lines', () => {
    const result = parseEnv('# this is a comment\nKEY=value');
    expect(result).toEqual({ KEY: 'value' });
  });

  test('ignores blank lines', () => {
    const result = parseEnv('\nKEY=value\n\n');
    expect(result).toEqual({ KEY: 'value' });
  });

  test('strips double-quoted values', () => {
    const result = parseEnv('KEY="hello world"');
    expect(result).toEqual({ KEY: 'hello world' });
  });

  test('strips single-quoted values', () => {
    const result = parseEnv("KEY='hello world'");
    expect(result).toEqual({ KEY: 'hello world' });
  });

  test('strips inline comments from unquoted values', () => {
    const result = parseEnv('KEY=value # inline comment');
    expect(result).toEqual({ KEY: 'value' });
  });

  test('handles empty values', () => {
    const result = parseEnv('KEY=');
    expect(result).toEqual({ KEY: '' });
  });

  test('handles values containing equals sign', () => {
    const result = parseEnv('KEY=a=b=c');
    expect(result).toEqual({ KEY: 'a=b=c' });
  });

  test('handles Windows-style line endings', () => {
    const result = parseEnv('FOO=bar\r\nBAZ=qux');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });
});
