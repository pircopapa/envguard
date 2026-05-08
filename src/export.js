/**
 * export.js — Convert parsed env objects to various output formats
 */

/**
 * Convert env object to JSON string
 * @param {Record<string, string>} env
 * @param {boolean} pretty
 * @returns {string}
 */
function toJSON(env, pretty = false) {
  return pretty ? JSON.stringify(env, null, 2) : JSON.stringify(env);
}

/**
 * Convert env object to CSV string (key,value)
 * @param {Record<string, string>} env
 * @returns {string}
 */
function toCSV(env) {
  const header = 'key,value';
  const rows = Object.entries(env).map(([k, v]) => {
    const safeVal = v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v;
    return `${k},${safeVal}`;
  });
  return [header, ...rows].join('\n');
}

/**
 * Convert env object to YAML-like key: value format
 * @param {Record<string, string>} env
 * @returns {string}
 */
function toYAML(env) {
  return Object.entries(env)
    .map(([k, v]) => {
      const needsQuotes = /[:#{}\[\],&*?|<>=!%@`]/.test(v) || v.trim() !== v;
      const safeVal = needsQuotes ? `"${v.replace(/"/g, '\\"')}"` : v || '""';
      return `${k}: ${safeVal}`;
    })
    .join('\n');
}

/**
 * Convert env object back to .env format
 * @param {Record<string, string>} env
 * @returns {string}
 */
function toDotEnv(env) {
  return Object.entries(env)
    .map(([k, v]) => {
      const needsQuotes = v.includes(' ') || v.includes('#') || v === '';
      return needsQuotes ? `${k}="${v}"` : `${k}=${v}`;
    })
    .join('\n');
}

module.exports = { toJSON, toCSV, toYAML, toDotEnv };
