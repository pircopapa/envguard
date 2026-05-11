/**
 * defaults.js
 * Fill in missing keys in an env object using a defaults map or a reference env.
 */

/**
 * Apply default values for any keys missing or empty in the target env.
 * @param {Record<string,string>} env - The target env object.
 * @param {Record<string,string>} defaults - Default values to apply.
 * @param {object} [options]
 * @param {boolean} [options.overwriteEmpty=false] - If true, also fill keys that exist but are empty string.
 * @returns {{ result: Record<string,string>, applied: Record<string,string> }}
 */
function applyDefaults(env, defaults, { overwriteEmpty = false } = {}) {
  const result = { ...env };
  const applied = {};

  for (const [key, value] of Object.entries(defaults)) {
    const missing = !(key in result);
    const isEmpty = overwriteEmpty && result[key] === '';

    if (missing || isEmpty) {
      result[key] = value;
      applied[key] = value;
    }
  }

  return { result, applied };
}

/**
 * Return keys that are present in the defaults map but missing from env.
 * @param {Record<string,string>} env
 * @param {Record<string,string>} defaults
 * @returns {string[]}
 */
function missingDefaultKeys(env, defaults) {
  return Object.keys(defaults).filter((k) => !(k in env));
}

/**
 * Return keys that exist in env but are not covered by the defaults map.
 * @param {Record<string,string>} env
 * @param {Record<string,string>} defaults
 * @returns {string[]}
 */
function undocumentedKeys(env, defaults) {
  return Object.keys(env).filter((k) => !(k in defaults));
}

/**
 * Check whether all keys in the defaults map are present (and non-empty) in env.
 * @param {Record<string,string>} env
 * @param {Record<string,string>} defaults
 * @returns {boolean}
 */
function isFullyPopulated(env, defaults) {
  return missingDefaultKeys(env, defaults).length === 0;
}

module.exports = { applyDefaults, missingDefaultKeys, undocumentedKeys, isFullyPopulated };
