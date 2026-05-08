const { toJSON, toCSV, toYAML, toDotEnv } = require('../src/export');
const {
  formatExportSuccess,
  formatExportPreview,
  formatUnsupportedFormat,
} = require('../src/reporter.export');

const sampleEnv = {
  APP_NAME: 'myapp',
  PORT: '3000',
  DB_URL: 'postgres://localhost/db',
  EMPTY_KEY: '',
  SPACED: 'hello world',
};

describe('toJSON', () => {
  it('produces compact JSON by default', () => {
    const result = toJSON(sampleEnv);
    expect(JSON.parse(result)).toEqual(sampleEnv);
    expect(result).not.toContain('\n');
  });

  it('produces pretty JSON when requested', () => {
    const result = toJSON(sampleEnv, true);
    expect(result).toContain('\n');
    expect(JSON.parse(result)).toEqual(sampleEnv);
  });
});

describe('toCSV', () => {
  it('includes a header row', () => {
    const result = toCSV(sampleEnv);
    expect(result.startsWith('key,value')).toBe(true);
  });

  it('has one row per key', () => {
    const lines = toCSV(sampleEnv).split('\n');
    expect(lines.length).toBe(Object.keys(sampleEnv).length + 1);
  });

  it('quotes values containing commas', () => {
    const result = toCSV({ URL: 'a,b' });
    expect(result).toContain('"a,b"');
  });
});

describe('toYAML', () => {
  it('formats each key on its own line', () => {
    const result = toYAML({ FOO: 'bar', BAZ: 'qux' });
    expect(result).toContain('FOO: bar');
    expect(result).toContain('BAZ: qux');
  });

  it('quotes values with special characters', () => {
    const result = toYAML({ KEY: 'val: ue' });
    expect(result).toContain('"val: ue"');
  });

  it('quotes empty values', () => {
    const result = toYAML({ EMPTY: '' });
    expect(result).toContain('EMPTY: ""');
  });
});

describe('toDotEnv', () => {
  it('writes simple values without quotes', () => {
    const result = toDotEnv({ FOO: 'bar' });
    expect(result).toContain('FOO=bar');
  });

  it('quotes values with spaces', () => {
    const result = toDotEnv({ MSG: 'hello world' });
    expect(result).toContain('MSG="hello world"');
  });

  it('quotes empty values', () => {
    const result = toDotEnv({ EMPTY: '' });
    expect(result).toContain('EMPTY=""');
  });
});

describe('reporter.export', () => {
  it('formatExportSuccess includes key count and path', () => {
    const msg = formatExportSuccess('json', '/out/file.json', 5);
    expect(msg).toContain('5 key(s)');
    expect(msg).toContain('/out/file.json');
    expect(msg).toContain('JSON');
  });

  it('formatExportPreview includes format label and content', () => {
    const msg = formatExportPreview('csv', 'key,value\nFOO,bar');
    expect(msg).toContain('CSV');
    expect(msg).toContain('FOO,bar');
  });

  it('formatUnsupportedFormat lists valid formats', () => {
    const msg = formatUnsupportedFormat('xml');
    expect(msg).toContain('xml');
    expect(msg).toContain('json');
  });
});
