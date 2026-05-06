/**
 * interpolate.js
 * Resolve variable references within .env values (e.g. FOO=${BAR})
 */

/**
 * Expand a single value by resolving ${VAR} references from the env map.
 * Supports simple references only (no default values or nested expansion).
 *
 * @param {string} value
 * @param {Record<string, string>} env
 * @param {Set<string>} [seen] - tracks keys currently being resolved to detect cycles
 * @returns {string}
 */
function expandValue(value, env, seen = new Set()) {
  return value.replace(/\$\{([^}]+)\}/g, (match, key) => {
    if (seen.has(key)) {
      // Circular reference — return the raw placeholder
      return match;
    }
    if (Object.prototype.hasOwnProperty.call(env, key)) {
      const nextSeen = new Set(seen).add(key);
      return expandValue(env[key], env, nextSeen);
    }
    // Not found in env — leave as-is
    return match;
  });
}

/**
 * Interpolate all values in an env map, resolving internal references.
 *
 * @param {Record<string, string>} env
 * @returns {Record<string, string>}
 */
function interpolateEnv(env) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = expandValue(value, env);
  }
  return result;
}

/**
 * Return a list of keys whose values contain unresolved references
 * (i.e. ${VAR} patterns that were not expanded).
 *
 * @param {Record<string, string>} interpolated
 * @returns {string[]}
 */
function unresolvedKeys(interpolated) {
  return Object.entries(interpolated)
    .filter(([, v]) => /\$\{[^}]+\}/.test(v))
    .map(([k]) => k);
}

module.exports = { expandValue, interpolateEnv, unresolvedKeys };
