/**
 * placeholder.js
 * Detects and reports placeholder/unfilled values in .env files.
 * e.g. CHANGE_ME, <YOUR_VALUE>, TODO, etc.
 */

const DEFAULT_PATTERNS = [
  /^CHANGE[_-]?ME$/i,
  /^YOUR[_-]/i,
  /^<.*>$/,
  /^\[.*\]$/,
  /^TODO$/i,
  /^FIXME$/i,
  /^PLACEHOLDER$/i,
  /^REPLACE[_-]?ME$/i,
  /^FILL[_-]?IN$/i,
  /^EXAMPLE$/i,
  /^xxx+$/i,
  /^\*+$/,
];

/**
 * Returns true if the value looks like an unfilled placeholder.
 * @param {string} value
 * @param {RegExp[]} [patterns]
 * @returns {boolean}
 */
function isPlaceholder(value, patterns = DEFAULT_PATTERNS) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed === '') return false;
  return patterns.some((re) => re.test(trimmed));
}

/**
 * Scans an env object and returns entries whose values are placeholders.
 * @param {Record<string, string>} env
 * @param {RegExp[]} [patterns]
 * @returns {{ key: string, value: string }[]}
 */
function findPlaceholders(env, patterns = DEFAULT_PATTERNS) {
  return Object.entries(env)
    .filter(([, v]) => isPlaceholder(v, patterns))
    .map(([key, value]) => ({ key, value }));
}

/**
 * Returns true if the env has no placeholder values.
 * @param {Record<string, string>} env
 * @param {RegExp[]} [patterns]
 * @returns {boolean}
 */
function isCleanPlaceholder(env, patterns = DEFAULT_PATTERNS) {
  return findPlaceholders(env, patterns).length === 0;
}

/**
 * Summary stats for placeholder scan.
 * @param {Record<string, string>} env
 * @param {RegExp[]} [patterns]
 * @returns {{ total: number, placeholderCount: number, keys: string[] }}
 */
function placeholderSummary(env, patterns = DEFAULT_PATTERNS) {
  const hits = findPlaceholders(env, patterns);
  return {
    total: Object.keys(env).length,
    placeholderCount: hits.length,
    keys: hits.map((h) => h.key),
  };
}

module.exports = { isPlaceholder, findPlaceholders, isCleanPlaceholder, placeholderSummary, DEFAULT_PATTERNS };
