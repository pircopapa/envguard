const { formatCastEntry, formatTypecastSummary, formatTypecastDiff } = require('../src/reporter.typecast');

describe('formatCastEntry', () => {
  it('formats a number cast entry', () => {
    const entry = { key: 'PORT', original: '3000', cast: 3000, type: 'number' };
    const result = formatCastEntry(entry);
    expect(result).toContain('PORT');
    expect(result).toContain('"3000"');
    expect(result).toContain('3000');
    expect(result).toContain('number');
  });

  it('formats a boolean cast entry', () => {
    const entry = { key: 'DEBUG', original: 'true', cast: true, type: 'boolean' };
    const result = formatCastEntry(entry);
    expect(result).toContain('DEBUG');
    expect(result).toContain('boolean');
  });

  it('formats a null cast entry', () => {
    const entry = { key: 'X', original: 'null', cast: null, type: 'null' };
    const result = formatCastEntry(entry);
    expect(result).toContain('null');
  });

  it('formats an array cast entry', () => {
    const entry = { key: 'LIST', original: '[1,2]', cast: [1, 2], type: 'object' };
    const result = formatCastEntry(entry);
    expect(result).toContain('[array(2)]');
  });

  it('formats an object cast entry', () => {
    const entry = { key: 'CFG', original: '{"a":1}', cast: { a: 1 }, type: 'object' };
    const result = formatCastEntry(entry);
    expect(result).toContain('[object]');
  });
});

describe('formatTypecastSummary', () => {
  it('returns a no-cast message when all values are strings', () => {
    const result = formatTypecastSummary({ NAME: 'app', ENV: 'production' });
    expect(result).toMatch(/no values were cast/i);
  });

  it('lists cast keys and count', () => {
    const result = formatTypecastSummary({ PORT: '8080', DEBUG: 'false', LABEL: 'x' });
    expect(result).toContain('PORT');
    expect(result).toContain('DEBUG');
    expect(result).toMatch(/2 key/);
  });
});

describe('formatTypecastDiff', () => {
  it('returns no-change message for all-string env', () => {
    expect(formatTypecastDiff({ A: 'hello' })).toMatch(/no type changes/i);
  });

  it('shows type change lines with ~ prefix', () => {
    const result = formatTypecastDiff({ PORT: '9000', ACTIVE: 'true' });
    expect(result).toContain('~ PORT');
    expect(result).toContain('~ ACTIVE');
    expect(result).toContain('(number)');
    expect(result).toContain('(boolean)');
  });
});
