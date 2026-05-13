/**
 * required.js
 * Check for required keys in an env object, with optional group support.
 */

/**
 * Check if a single key is present and non-empty.
 * @param {Object} env
 * @param {string} key
 * @returns {{ key: string, present: boolean, empty: boolean }}
 */
function checkKey(env, key) {
  const present = Object.prototype.hasOwnProperty.call(env, key);
  const empty = present && (env[key] === '' || env[key] == null);
  return { key, present, empty };
}

/**
 * Validate that all required keys exist and are non-empty.
 * @param {Object} env
 * @param {string[]} requiredKeys
 * @returns {{ missing: string[], empty: string[], valid: boolean }}
 */
function checkRequired(env, requiredKeys) {
  const missing = [];
  const empty = [];

  for (const key of requiredKeys) {
    const result = checkKey(env, key);
    if (!result.present) {
      missing.push(key);
    } else if (result.empty) {
      empty.push(key);
    }
  }

  return {
    missing,
    empty,
    valid: missing.length === 0 && empty.length === 0,
  };
}

/**
 * Validate multiple groups of required keys.
 * Each group has a name and a list of keys.
 * @param {Object} env
 * @param {Array<{ name: string, keys: string[] }>} groups
 * @returns {Array<{ name: string, missing: string[], empty: string[], valid: boolean }>}
 */
function checkRequiredGroups(env, groups) {
  return groups.map(({ name, keys }) => ({
    name,
    ...checkRequired(env, keys),
  }));
}

/**
 * Return only the keys that are missing or empty.
 * @param {Object} env
 * @param {string[]} requiredKeys
 * @returns {string[]}
 */
function failingKeys(env, requiredKeys) {
  const { missing, empty } = checkRequired(env, requiredKeys);
  return [...missing, ...empty];
}

module.exports = { checkKey, checkRequired, checkRequiredGroups, failingKeys };
