/**
 * clone.js — Clone and scaffold .env files from templates or existing envs
 */

/**
 * Clone an env object, optionally blanking all values.
 * @param {Record<string, string>} env
 * @param {object} options
 * @param {boolean} [options.blankValues] - replace all values with empty string
 * @param {string[]} [options.omitKeys] - keys to exclude from clone
 * @returns {Record<string, string>}
 */
function cloneEnv(env, { blankValues = false, omitKeys = [] } = {}) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    if (omitKeys.includes(key)) continue;
    result[key] = blankValues ? '' : value;
  }
  return result;
}

/**
 * Scaffold a template from an env — keeps keys, blanks values, adds comments.
 * @param {Record<string, string>} env
 * @param {object} options
 * @param {string} [options.header] - optional header comment
 * @returns {string}
 */
function scaffoldTemplate(env, { header = '' } = {}) {
  const lines = [];
  if (header) {
    lines.push(`# ${header}`);
    lines.push('');
  }
  for (const key of Object.keys(env)) {
    lines.push(`${key}=`);
  }
  return lines.join('\n') + '\n';
}

/**
 * Merge a cloned env with override values.
 * @param {Record<string, string>} base
 * @param {Record<string, string>} overrides
 * @returns {Record<string, string>}
 */
function applyOverrides(base, overrides) {
  return { ...base, ...overrides };
}

/**
 * Check if a cloned env is fully populated (no empty values).
 * @param {Record<string, string>} env
 * @returns {boolean}
 */
function isFullyCloned(env) {
  return Object.values(env).every((v) => v !== '' && v !== undefined);
}

/**
 * List keys with empty values in the clone.
 * @param {Record<string, string>} env
 * @returns {string[]}
 */
function emptyCloneKeys(env) {
  return Object.entries(env)
    .filter(([, v]) => v === '' || v === undefined)
    .map(([k]) => k);
}

module.exports = { cloneEnv, scaffoldTemplate, applyOverrides, isFullyCloned, emptyCloneKeys };
