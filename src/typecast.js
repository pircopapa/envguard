/**
 * typecast.js — Parse and cast .env string values to native JS types
 */

/**
 * Attempt to cast a string value to its most appropriate native type.
 * @param {string} value
 * @returns {string|number|boolean|null}
 */
function castValue(value) {
  if (value === '' || value === undefined || value === null) return value;

  // Boolean
  if (value === 'true') return true;
  if (value === 'false') return false;

  // Null / undefined literals
  if (value === 'null') return null;
  if (value === 'undefined') return undefined;

  // Integer
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);

  // Float
  if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);

  // JSON array or object
  if ((value.startsWith('[') && value.endsWith(']')) ||
      (value.startsWith('{') && value.endsWith('}'))) {
    try {
      return JSON.parse(value);
    } catch (_) {
      // fall through
    }
  }

  return value;
}

/**
 * Cast all values in an env object.
 * @param {Record<string, string>} env
 * @returns {Record<string, any>}
 */
function typecastEnv(env) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = castValue(value);
  }
  return result;
}

/**
 * Return a map of keys whose values changed type after casting.
 * @param {Record<string, string>} env
 * @returns {Array<{key: string, original: string, cast: any, type: string}>}
 */
function typecastSummary(env) {
  const summary = [];
  for (const [key, value] of Object.entries(env)) {
    const cast = castValue(value);
    if (typeof cast !== 'string') {
      summary.push({ key, original: value, cast, type: cast === null ? 'null' : typeof cast });
    }
  }
  return summary;
}

module.exports = { castValue, typecastEnv, typecastSummary };
