/**
 * reporter.filter.js — Format filter operation results
 */

/**
 * Format a filtered env summary
 * @param {Record<string,string>} original
 * @param {Record<string,string>} filtered
 * @param {string} label
 * @returns {string}
 */
function formatFilterSummary(original, filtered, label = 'filter') {
  const totalKeys = Object.keys(original).length;
  const matchedKeys = Object.keys(filtered).length;
  const lines = [
    `Filter [${label}]: ${matchedKeys}/${totalKeys} keys matched`,
  ];
  if (matchedKeys === 0) {
    lines.push('  (no keys matched)');
  } else {
    for (const [k, v] of Object.entries(filtered)) {
      lines.push(`  ${k}=${v}`);
    }
  }
  return lines.join('\n');
}

/**
 * Format a list of empty keys
 * @param {string[]} keys
 * @returns {string}
 */
function formatEmptyKeys(keys) {
  if (keys.length === 0) return 'No empty keys found.';
  const lines = [`Empty keys (${keys.length}):`, ...keys.map(k => `  - ${k}`)];
  return lines.join('\n');
}

/**
 * Format excluded keys report
 * @param {string[]} excluded
 * @param {Record<string,string>} result
 * @returns {string}
 */
function formatExcludeSummary(excluded, result) {
  const lines = [
    `Excluded ${excluded.length} key(s). Remaining: ${Object.keys(result).length}`,
    ...excluded.map(k => `  - ${k}`),
  ];
  return lines.join('\n');
}

module.exports = {
  formatFilterSummary,
  formatEmptyKeys,
  formatExcludeSummary,
};
