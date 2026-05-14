/**
 * reporter.deprecate.js
 * Format deprecation results for CLI output.
 */

const WARN = '⚠️';
const OK = '✅';
const ARROW = '→';

/**
 * Format a single deprecated key entry.
 * @param {{ key: string, replacement: string|null }} entry
 * @returns {string}
 */
function formatDeprecatedEntry(entry) {
  if (entry.replacement) {
    return `  ${WARN}  ${entry.key}  ${ARROW}  use ${entry.replacement} instead`;
  }
  return `  ${WARN}  ${entry.key}  (no replacement — consider removing)`;
}

/**
 * Format the full deprecation report.
 * @param {{ total: number, deprecated: number, clean: boolean, entries: Array }} summary
 * @returns {string}
 */
function formatDeprecationReport(summary) {
  if (summary.clean) {
    return `${OK}  No deprecated keys found (${summary.total} keys checked).`;
  }

  const lines = [
    `${WARN}  Found ${summary.deprecated} deprecated key(s) out of ${summary.total}:`,
    ...summary.entries.map(formatDeprecatedEntry)
  ];
  return lines.join('\n');
}

/**
 * Format a short one-line summary.
 * @param {{ deprecated: number, total: number, clean: boolean }} summary
 * @returns {string}
 */
function formatDeprecationSummary(summary) {
  if (summary.clean) {
    return `Deprecation check passed — all ${summary.total} keys are current.`;
  }
  return `Deprecation check failed — ${summary.deprecated}/${summary.total} key(s) are deprecated.`;
}

module.exports = {
  formatDeprecatedEntry,
  formatDeprecationReport,
  formatDeprecationSummary
};
