/**
 * flatten.js
 * Utilities for flattening nested env-like objects and expanding flat keys back to nested.
 */

/**
 * Flatten a nested object into dot-notation env keys.
 * e.g. { DB: { HOST: 'localhost' } } => { DB_HOST: 'localhost' }
 * @param {object} obj
 * @param {string} [prefix]
 * @returns {Record<string, string>}
 */
function flattenObject(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}_${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, fullKey));
    } else {
      result[fullKey] = String(value ?? '');
    }
  }
  return result;
}

/**
 * Expand a flat env record with underscore-separated keys into a nested object.
 * e.g. { DB_HOST: 'localhost', DB_PORT: '5432' } => { DB: { HOST: 'localhost', PORT: '5432' } }
 * @param {Record<string, string>} env
 * @returns {object}
 */
function expandToNested(env) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    const parts = key.split('_');
    let cursor = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (cursor[part] === undefined || typeof cursor[part] !== 'object') {
        cursor[part] = {};
      }
      cursor = cursor[part];
    }
    cursor[parts[parts.length - 1]] = value;
  }
  return result;
}

/**
 * Return keys that would collide during flattening (a key and a prefix share the same path).
 * @param {Record<string, string>} env
 * @returns {string[]}
 */
function findFlattenCollisions(env) {
  const keys = Object.keys(env);
  const collisions = [];
  for (const key of keys) {
    const parts = key.split('_');
    for (let i = 1; i < parts.length; i++) {
      const prefix = parts.slice(0, i).join('_');
      if (keys.includes(prefix)) {
        collisions.push(key);
        break;
      }
    }
  }
  return [...new Set(collisions)];
}

/**
 * Check whether the env has no flatten collisions.
 * @param {Record<string, string>} env
 * @returns {boolean}
 */
function isCleanFlatten(env) {
  return findFlattenCollisions(env).length === 0;
}

module.exports = { flattenObject, expandToNested, findFlattenCollisions, isCleanFlatten };
