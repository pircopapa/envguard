const {
  buildPinMap,
  checkPinnedKey,
  checkPinned,
  isCleanPin,
  driftedKeys,
  pinSummary,
} = require('../src/pin');

describe('buildPinMap', () => {
  it('returns a copy of the pins object', () => {
    const pins = { NODE_ENV: 'production', PORT: '3000' };
    expect(buildPinMap(pins)).toEqual(pins);
  });

  it('returns empty object for null/undefined input', () => {
    expect(buildPinMap(null)).toEqual({});
    expect(buildPinMap(undefined)).toEqual({});
  });
});

describe('checkPinnedKey', () => {
  it('returns pinned=true when actual matches expected', () => {
    const result = checkPinnedKey('NODE_ENV', 'production', 'production');
    expect(result.pinned).toBe(true);
    expect(result.actual).toBe('production');
  });

  it('returns pinned=false when actual differs', () => {
    const result = checkPinnedKey('NODE_ENV', 'development', 'production');
    expect(result.pinned).toBe(false);
    expect(result.expected).toBe('production');
  });

  it('returns actual=null when key is missing from env', () => {
    const result = checkPinnedKey('MISSING_KEY', undefined, 'expected');
    expect(result.actual).toBeNull();
    expect(result.pinned).toBe(false);
  });
});

describe('checkPinned', () => {
  const env = { NODE_ENV: 'production', PORT: '3000', DEBUG: 'false' };
  const pins = { NODE_ENV: 'production', PORT: '8080' };

  it('returns results for all pinned keys', () => {
    const results = checkPinned(env, pins);
    expect(results).toHaveLength(2);
  });

  it('correctly marks matching and drifted keys', () => {
    const results = checkPinned(env, pins);
    const nodeEnv = results.find((r) => r.key === 'NODE_ENV');
    const port = results.find((r) => r.key === 'PORT');
    expect(nodeEnv.pinned).toBe(true);
    expect(port.pinned).toBe(false);
  });
});

describe('isCleanPin', () => {
  it('returns true when all pins match', () => {
    const env = { NODE_ENV: 'production', PORT: '3000' };
    expect(isCleanPin(env, { NODE_ENV: 'production', PORT: '3000' })).toBe(true);
  });

  it('returns false when any pin drifts', () => {
    const env = { NODE_ENV: 'development', PORT: '3000' };
    expect(isCleanPin(env, { NODE_ENV: 'production', PORT: '3000' })).toBe(false);
  });
});

describe('driftedKeys', () => {
  it('returns only drifted entries', () => {
    const env = { A: '1', B: 'wrong', C: '3' };
    const pins = { A: '1', B: '2', C: '3' };
    const drifted = driftedKeys(env, pins);
    expect(drifted).toHaveLength(1);
    expect(drifted[0].key).toBe('B');
  });

  it('returns empty array when all pins match', () => {
    const env = { X: 'ok' };
    expect(driftedKeys(env, { X: 'ok' })).toHaveLength(0);
  });
});

describe('pinSummary', () => {
  it('returns correct totals', () => {
    const env = { A: '1', B: 'bad', C: '3' };
    const pins = { A: '1', B: '2', C: '3' };
    const summary = pinSummary(env, pins);
    expect(summary.total).toBe(3);
    expect(summary.passed).toBe(2);
    expect(summary.failed).toBe(1);
    expect(summary.drifted[0].key).toBe('B');
  });
});
