const { groupByPrefix, flattenGroups, listPrefixes, getGroup } = require('../src/group');

const sampleEnv = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_NAME: 'mydb',
  REDIS_HOST: 'localhost',
  REDIS_PORT: '6379',
  APP_NAME: 'envguard',
  PORT: '3000',
};

describe('groupByPrefix', () => {
  it('groups keys by their prefix', () => {
    const grouped = groupByPrefix(sampleEnv);
    expect(grouped['DB']).toEqual({ HOST: 'localhost', PORT: '5432', NAME: 'mydb' });
    expect(grouped['REDIS']).toEqual({ HOST: 'localhost', PORT: '6379' });
    expect(grouped['APP']).toEqual({ NAME: 'envguard' });
  });

  it('places keys without a separator into __ungrouped__', () => {
    const grouped = groupByPrefix(sampleEnv);
    expect(grouped['__ungrouped__']).toEqual({ PORT: '3000' });
  });

  it('works with a custom separator', () => {
    const env = { 'DB.HOST': 'localhost', 'DB.PORT': '5432', STANDALONE: 'yes' };
    const grouped = groupByPrefix(env, '.');
    expect(grouped['DB']).toEqual({ HOST: 'localhost', PORT: '5432' });
    expect(grouped['__ungrouped__']).toEqual({ STANDALONE: 'yes' });
  });

  it('returns empty object for empty env', () => {
    expect(groupByPrefix({})).toEqual({});
  });
});

describe('flattenGroups', () => {
  it('round-trips through groupByPrefix and flattenGroups', () => {
    const grouped = groupByPrefix(sampleEnv);
    const flat = flattenGroups(grouped);
    expect(flat).toEqual(sampleEnv);
  });

  it('handles ungrouped keys correctly', () => {
    const grouped = { __ungrouped__: { PORT: '3000' }, DB: { HOST: 'localhost' } };
    const flat = flattenGroups(grouped);
    expect(flat).toEqual({ PORT: '3000', DB_HOST: 'localhost' });
  });
});

describe('listPrefixes', () => {
  it('returns sorted unique prefixes', () => {
    const prefixes = listPrefixes(sampleEnv);
    expect(prefixes).toEqual(['APP', 'DB', 'REDIS']);
  });

  it('returns empty array when no prefixed keys exist', () => {
    expect(listPrefixes({ PORT: '3000', HOST: 'localhost' })).toEqual([]);
  });
});

describe('getGroup', () => {
  it('returns only keys matching the given prefix', () => {
    const group = getGroup(sampleEnv, 'DB');
    expect(group).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432', DB_NAME: 'mydb' });
  });

  it('returns empty object if prefix not found', () => {
    expect(getGroup(sampleEnv, 'UNKNOWN')).toEqual({});
  });

  it('does not include partial prefix matches', () => {
    const env = { DB_HOST: 'a', DB2_HOST: 'b' };
    expect(getGroup(env, 'DB')).toEqual({ DB_HOST: 'a' });
  });
});
