/**
 * reporter.placeholder.js
 * Formats placeholder scan results for CLI output.
 */

const { findPlaceholders, placeholderSummary } = require('./placeholder');

/**
 * Formats a list of placeholder entries.
 * @param {{ key: string, value: string }[]} entries
 * @returns {string}
 */
function formatPlaceholderList(entries) {
  if (entries.length === 0) return '  (none)';
  return entries.map(({ key, value }) => `  ⚠  ${key} = "${value}"`).join('\n');
}

/**
 * Formats a full placeholder report for an env object.
 * @param {Record<string, string>} env
 * @param {string} [label]
 * @param {RegExp[]} [patterns]
 * @returns {string}
 */
function formatPlaceholderReport(env, label = '.env', patterns) {
  const hits = findPlaceholders(env, patterns);
  const lines = [`Placeholder scan: ${label}`];
  if (hits.length === 0) {
    lines.push('  ✔ No placeholder values found.');
  } else {
    lines.push(`  ${hits.length} placeholder(s) detected:`);
    lines.push(formatPlaceholderList(hits));
  }
  return lines.join('\n');
}

/**
 * Formats a one-line summary.
 * @param {Record<string, string>} env
 * @param {RegExp[]} [patterns]
 * @returns {string}
 */
function formatPlaceholderSummary(env, patterns) {
  const { total, placeholderCount } = placeholderSummary(env, patterns);
  if (placeholderCount === 0) {
    return `✔ All ${total} keys look filled in.`;
  }
  return `✘ ${placeholderCount}/${total} key(s) still have placeholder values.`;
}

module.exports = { formatPlaceholderList, formatPlaceholderReport, formatPlaceholderSummary };
