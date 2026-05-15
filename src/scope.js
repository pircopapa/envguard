/**
 * scope.js — Filter and partition env vars by named scope definitions.
 * A scope is a named set of key patterns that belong together (e.g. "database", "auth").
 */

/**
 * @param {Record<string,string>} env
 * @param {string[]} patterns  glob-style prefixes or exact keys
 * @returns {Record<string,string>}
 */
function pickByScope(env, patterns) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    if (patterns.some((p) => matchesPattern(key, p))) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Partition env into named scopes plus an "other" bucket.
 * @param {Record<string,string>} env
 * @param {Record<string, string[]>} scopeMap  { scopeName: [patterns] }
 * @returns {{ scopes: Record<string, Record<string,string>>, other: Record<string,string> }}
 */
function partitionByScope(env, scopeMap) {
  const scopes = {};
  const claimed = new Set();

  for (const [name, patterns] of Object.entries(scopeMap)) {
    scopes[name] = {};
    for (const [key, value] of Object.entries(env)) {
      if (patterns.some((p) => matchesPattern(key, p))) {
        scopes[name][key] = value;
        claimed.add(key);
      }
    }
  }

  const other = {};
  for (const [key, value] of Object.entries(env)) {
    if (!claimed.has(key)) other[key] = value;
  }

  return { scopes, other };
}

/**
 * Returns keys that appear in more than one scope.
 * @param {Record<string, Record<string,string>>} scopes
 * @returns {string[]}
 */
function findOverlappingKeys(scopes) {
  const seen = new Map();
  for (const [name, vars] of Object.entries(scopes)) {
    for (const key of Object.keys(vars)) {
      if (!seen.has(key)) seen.set(key, []);
      seen.get(key).push(name);
    }
  }
  return [...seen.entries()]
    .filter(([, names]) => names.length > 1)
    .map(([key]) => key);
}

/** Simple prefix/exact matcher (no full glob needed here). */
function matchesPattern(key, pattern) {
  if (pattern.endsWith('*')) {
    return key.startsWith(pattern.slice(0, -1));
  }
  return key === pattern;
}

/**
 * @param {{ scopes: Record<string, Record<string,string>>, other: Record<string,string> }} partition
 * @returns {{ name: string, count: number }[]}
 */
function scopeSummary(partition) {
  const rows = Object.entries(partition.scopes).map(([name, vars]) => ({
    name,
    count: Object.keys(vars).length,
  }));
  rows.push({ name: 'other', count: Object.keys(partition.other).length });
  return rows;
}

module.exports = { pickByScope, partitionByScope, findOverlappingKeys, matchesPattern, scopeSummary };
