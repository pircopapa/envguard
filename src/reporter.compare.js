/**
 * reporter.compare.js — Format multi-environment comparison results for output.
 */

const { compareSummary } = require('./compare');

const STATUS_SYMBOLS = {
  match: '✔',
  missing: '✘',
  extra: '+',
  differs: '~',
};

/**
 * Format a full comparison table as a string.
 *
 * @param {Object} comparisonResult - Output of compareEnvs
 * @returns {string}
 */
function formatComparison(comparisonResult) {
  const targetNames = [
    ...new Set(
      Object.values(comparisonResult).flatMap(({ status }) => Object.keys(status))
    ),
  ];

  const header = ['KEY', ...targetNames].map((h) => h.padEnd(20)).join(' ');
  const divider = '-'.repeat(header.length);

  const lines = [header, divider];

  for (const [key, { status }] of Object.entries(comparisonResult)) {
    const cols = [key.padEnd(20)];
    for (const name of targetNames) {
      const s = status[name] || 'missing';
      const symbol = STATUS_SYMBOLS[s] || '?';
      cols.push(`${symbol} ${s}`.padEnd(20));
    }
    lines.push(cols.join(' '));
  }

  return lines.join('\n');
}

/**
 * Format a short summary of the comparison per target env.
 *
 * @param {Object} comparisonResult - Output of compareEnvs
 * @returns {string}
 */
function formatComparisonSummary(comparisonResult) {
  const summary = compareSummary(comparisonResult);
  const lines = ['Comparison Summary:', ''];

  for (const [name, counts] of Object.entries(summary)) {
    lines.push(`  ${name}:`);
    lines.push(`    ✔ match:   ${counts.match || 0}`);
    lines.push(`    ~ differs: ${counts.differs || 0}`);
    lines.push(`    ✘ missing: ${counts.missing || 0}`);
    lines.push(`    + extra:   ${counts.extra || 0}`);
  }

  return lines.join('\n');
}

module.exports = { formatComparison, formatComparisonSummary };
