/**
 * reporter.interpolate.js
 * Format interpolation results for CLI output.
 */

const { unresolvedKeys } = require('./interpolate');

/**
 * Format a summary of the interpolation pass.
 *
 * @param {Record<string, string>} original  - raw parsed env
 * @param {Record<string, string>} expanded  - interpolated env
 * @returns {string}
 */
function formatInterpolationSummary(original, expanded) {
  const unresolved = unresolvedKeys(expanded);
  const totalRefs = Object.values(original).filter(v =>
    /\$\{[^}]+\}/.test(v)
  ).length;
  const resolved = totalRefs - unresolved.length;

  const lines = [
    `Interpolation summary:`,
    `  References found   : ${totalRefs}`,
    `  Resolved           : ${resolved}`,
    `  Unresolved         : ${unresolved.length}`,
  ];

  if (unresolved.length > 0) {
    lines.push('  Unresolved keys:');
    unresolved.forEach(k => lines.push(`    - ${k}`));
  }

  return lines.join('\n');
}

/**
 * Format the expanded env as key=value lines (useful for --dry-run output).
 *
 * @param {Record<string, string>} expanded
 * @returns {string}
 */
function formatExpandedEnv(expanded) {
  return Object.entries(expanded)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
}

module.exports = { formatInterpolationSummary, formatExpandedEnv };
