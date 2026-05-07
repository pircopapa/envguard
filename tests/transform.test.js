const {
  renameKeys,
  normalizeKeys,
  trimValues,
  addPrefix,
  stripPrefix,
  applyTransforms,
} = require('../src/transform');
const { formatRenameSummary, formatTransformDiff } = require('../src/reporter.transform');

const sample = {
  db_host: '  localhost  ',
  db_port: '5432',
  api_key: 'secret',
};

describe('renameKeys', () => {
  it('renames specified keys', () => {
    const result = renameKeys(sample, { db_host: 'DATABASE_HOST' });
    expect(result).toHaveProperty('DATABASE_HOST', '  localhost  ');
    expect(result).not.toHaveProperty('db_host');
  });

  it('leaves unmentioned keys unchanged', () => {
    const result = renameKeys(sample, { db_host: 'DATABASE_HOST' });
    expect(result).toHaveProperty('db_port', '5432');
  });

  it('handles empty rename map', () => {
    expect(renameKeys(sample, {})).toEqual(sample);
  });
});

describe('normalizeKeys', () => {
  it('uppercases keys by default', () => {
    const result = normalizeKeys(sample);
    expect(Object.keys(result)).toEqual(['DB_HOST', 'DB_PORT', 'API_KEY']);
  });

  it('lowercases keys when mode is lower', () => {
    const upper = { DB_HOST: 'localhost' };
    expect(Object.keys(normalizeKeys(upper, 'lower'))).toEqual(['db_host']);
  });
});

describe('trimValues', () => {
  it('trims whitespace from values', () => {
    const result = trimValues(sample);
    expect(result.db_host).toBe('localhost');
  });

  it('leaves non-string values alone', () => {
    const env = { PORT: 3000 };
    expect(trimValues(env).PORT).toBe(3000);
  });
});

describe('addPrefix / stripPrefix', () => {
  it('adds prefix to all keys', () => {
    const result = addPrefix({ HOST: 'x' }, 'APP_');
    expect(result).toHaveProperty('APP_HOST', 'x');
  });

  it('strips prefix from matching keys', () => {
    const result = stripPrefix({ APP_HOST: 'x', OTHER: 'y' }, 'APP_');
    expect(result).toHaveProperty('HOST', 'x');
    expect(result).toHaveProperty('OTHER', 'y');
  });
});

describe('applyTransforms', () => {
  it('applies a pipeline of transforms in order', () => {
    const result = applyTransforms(
      sample,
      [trimValues, env => normalizeKeys(env, 'upper')]
    );
    expect(result.DB_HOST).toBe('localhost');
  });
});

describe('formatRenameSummary', () => {
  it('lists renames', () => {
    const transformed = renameKeys(sample, { db_host: 'DATABASE_HOST' });
    const out = formatRenameSummary(sample, transformed, { db_host: 'DATABASE_HOST' });
    expect(out).toContain('db_host');
    expect(out).toContain('DATABASE_HOST');
  });
});

describe('formatTransformDiff', () => {
  it('shows added and removed keys', () => {
    const transformed = renameKeys(sample, { db_host: 'DATABASE_HOST' });
    const out = formatTransformDiff(sample, transformed);
    expect(out).toContain('+ DATABASE_HOST');
    expect(out).toContain('- db_host');
  });

  it('reports no changes when identical', () => {
    const out = formatTransformDiff(sample, { ...sample });
    expect(out).toContain('No key changes');
  });
});
