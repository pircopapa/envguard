/**
 * transform.js
 * Apply transformations to env key/value pairs:
 * - rename keys
 * - uppercase/lowercase keys
 * - trim whitespace from values
 * - prefix/strip prefix from keys
 */

/**
 * Rename keys according to a map { oldKey: newKey }
 * @param {Object} env
 * @param {Object} renameMap
 * @returns {Object}
 */
function renameKeys(env, renameMap) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    const newKey = renameMap[key] !== undefined ? renameMap[key] : key;
    result[newKey] = value;
  }
  return result;
}

/**
 * Normalize all keys to uppercase or lowercase
 * @param {Object} env
 * @param {'upper'|'lower'} mode
 * @returns {Object}
 */
function normalizeKeys(env, mode = 'upper') {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    const newKey = mode === 'lower' ? key.toLowerCase() : key.toUpperCase();
    result[newKey] = value;
  }
  return result;
}

/**
 * Trim leading/trailing whitespace from all values
 * @param {Object} env
 * @returns {Object}
 */
function trimValues(env) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = typeof value === 'string' ? value.trim() : value;
  }
  return result;
}

/**
 * Add a prefix to all keys
 * @param {Object} env
 * @param {string} prefix
 * @returns {Object}
 */
function addPrefix(env, prefix) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    result[`${prefix}${key}`] = value;
  }
  return result;
}

/**
 * Strip a prefix from all keys that have it
 * @param {Object} env
 * @param {string} prefix
 * @returns {Object}
 */
function stripPrefix(env, prefix) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    const newKey = key.startsWith(prefix) ? key.slice(prefix.length) : key;
    result[newKey] = value;
  }
  return result;
}

/**
 * Apply a pipeline of transform functions to an env object
 * @param {Object} env
 * @param {Function[]} transforms
 * @returns {Object}
 */
function applyTransforms(env, transforms) {
  return transforms.reduce((current, fn) => fn(current), env);
}

module.exports = {
  renameKeys,
  normalizeKeys,
  trimValues,
  addPrefix,
  stripPrefix,
  applyTransforms,
};
