/**
 * filter.js — Filter env entries by key pattern, prefix, or value predicate
 */

/**
 * Filter env object by key prefix
 * @param {Record<string,string>} env
 * @param {string} prefix
 * @returns {Record<string,string>}
 */
function filterByPrefix(env, prefix) {
  return Object.fromEntries(
    Object.entries(env).filter(([k]) => k.startsWith(prefix))
  );
}

/**
 * Filter env object by regex pattern on keys
 * @param {Record<string,string>} env
 * @param {RegExp|string} pattern
 * @returns {Record<string,string>}
 */
function filterByPattern(env, pattern) {
  const re = pattern instanceof RegExp ? pattern : new RegExp(pattern);
  return Object.fromEntries(
    Object.entries(env).filter(([k]) => re.test(k))
  );
}

/**
 * Filter env object by a predicate on value
 * @param {Record<string,string>} env
 * @param {(value: string, key: string) => boolean} predicate
 * @returns {Record<string,string>}
 */
function filterByValue(env, predicate) {
  return Object.fromEntries(
    Object.entries(env).filter(([k, v]) => predicate(v, k))
  );
}

/**
 * Exclude keys from env object
 * @param {Record<string,string>} env
 * @param {string[]} keys
 * @returns {Record<string,string>}
 */
function excludeKeys(env, keys) {
  const set = new Set(keys);
  return Object.fromEntries(
    Object.entries(env).filter(([k]) => !set.has(k))
  );
}

/**
 * Pick only specified keys from env object
 * @param {Record<string,string>} env
 * @param {string[]} keys
 * @returns {Record<string,string>}
 */
function pickKeys(env, keys) {
  const set = new Set(keys);
  return Object.fromEntries(
    Object.entries(env).filter(([k]) => set.has(k))
  );
}

/**
 * Return keys that are empty or whitespace-only
 * @param {Record<string,string>} env
 * @returns {string[]}
 */
function emptyKeys(env) {
  return Object.entries(env)
    .filter(([, v]) => v.trim() === '')
    .map(([k]) => k);
}

module.exports = {
  filterByPrefix,
  filterByPattern,
  filterByValue,
  excludeKeys,
  pickKeys,
  emptyKeys,
};
