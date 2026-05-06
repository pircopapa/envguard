/**
 * Validates env files against a schema or reference env.
 * Checks for missing required keys, unexpected keys, and empty values.
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {string[]} missing - keys required but not present
 * @property {string[]} extra - keys present but not in reference
 * @property {string[]} empty - keys present but with empty values
 */

/**
 * Validate a parsed env object against a reference env object.
 * @param {Record<string, string>} env - the env to validate
 * @param {Record<string, string>} reference - the reference/template env
 * @param {object} [options]
 * @param {boolean} [options.allowExtra=false] - if false, extra keys are flagged
 * @param {boolean} [options.allowEmpty=false] - if false, empty values are flagged
 * @returns {ValidationResult}
 */
function validateEnv(env, reference, options = {}) {
  const { allowExtra = false, allowEmpty = false } = options;

  const refKeys = Object.keys(reference);
  const envKeys = Object.keys(env);

  const missing = refKeys.filter((key) => !(key in env));
  const extra = allowExtra ? [] : envKeys.filter((key) => !(key in reference));
  const empty = allowEmpty
    ? []
    : envKeys.filter((key) => env[key] === '' || env[key] === undefined);

  const valid = missing.length === 0 && extra.length === 0 && empty.length === 0;

  return { valid, missing, extra, empty };
}

/**
 * Validate multiple envs against a single reference.
 * @param {Record<string, Record<string, string>>} envMap - named env objects
 * @param {Record<string, string>} reference
 * @param {object} [options]
 * @returns {Record<string, ValidationResult>}
 */
function validateAll(envMap, reference, options = {}) {
  return Object.fromEntries(
    Object.entries(envMap).map(([name, env]) => [
      name,
      validateEnv(env, reference, options),
    ])
  );
}

module.exports = { validateEnv, validateAll };
