/**
 * group.js — Group and organize env keys by prefix or custom rules
 */

/**
 * Group env keys by their prefix (e.g. DB_HOST, DB_PORT -> { DB: { HOST, PORT } })
 * @param {Object} env
 * @param {string} [separator='_']
 * @returns {Object} grouped
 */
function groupByPrefix(env, separator = '_') {
  const groups = {};
  for (const [key, value] of Object.entries(env)) {
    const idx = key.indexOf(separator);
    if (idx === -1) {
      const g = '__ungrouped__';
      groups[g] = groups[g] || {};
      groups[g][key] = value;
    } else {
      const prefix = key.slice(0, idx);
      const rest = key.slice(idx + 1);
      groups[prefix] = groups[prefix] || {};
      groups[prefix][rest] = value;
    }
  }
  return groups;
}

/**
 * Flatten a grouped env object back to a flat key-value map
 * @param {Object} grouped
 * @param {string} [separator='_']
 * @returns {Object}
 */
function flattenGroups(grouped, separator = '_') {
  const flat = {};
  for (const [prefix, keys] of Object.entries(grouped)) {
    for (const [key, value] of Object.entries(keys)) {
      const fullKey = prefix === '__ungrouped__' ? key : `${prefix}${separator}${key}`;
      flat[fullKey] = value;
    }
  }
  return flat;
}

/**
 * List all unique prefixes found in an env object
 * @param {Object} env
 * @param {string} [separator='_']
 * @returns {string[]}
 */
function listPrefixes(env, separator = '_') {
  const prefixes = new Set();
  for (const key of Object.keys(env)) {
    const idx = key.indexOf(separator);
    if (idx !== -1) {
      prefixes.add(key.slice(0, idx));
    }
  }
  return Array.from(prefixes).sort();
}

/**
 * Get all keys belonging to a specific prefix group
 * @param {Object} env
 * @param {string} prefix
 * @param {string} [separator='_']
 * @returns {Object}
 */
function getGroup(env, prefix, separator = '_') {
  const result = {};
  const search = `${prefix}${separator}`;
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith(search)) {
      result[key] = value;
    }
  }
  return result;
}

module.exports = { groupByPrefix, flattenGroups, listPrefixes, getGroup };
