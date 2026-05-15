/**
 * reporter.scope.js — Human-readable output for scope operations.
 */

const { findOverlappingKeys } = require('./scope');

/**
 * @param {{ name: string, count: number }[]} summary
 * @returns {string}
 */
function formatScopeSummary(summary) {
  const lines = ['Scope summary:'];
  for (const { name, count } of summary) {
    lines.push(`  ${name.padEnd(20)} ${count} key${count !== 1 ? 's' : ''}`);
  }
  return lines.join('\n');
}

/**
 * @param {Record<string, Record<string,string>>} scopes
 * @returns {string}
 */
function formatScopeBreakdown(scopes) {
  const lines = [];
  for (const [name, vars] of Object.entries(scopes)) {
    const keys = Object.keys(vars);
    lines.push(`[${name}]`);
    if (keys.length === 0) {
      lines.push('  (empty)');
    } else {
      keys.forEach((k) => lines.push(`  ${k}`));
    }
  }
  return lines.join('\n');
}

/**
 * @param {Record<string, Record<string,string>>} scopes
 * @returns {string}
 */
function formatOverlapWarning(scopes) {
  const overlapping = findOverlappingKeys(scopes);
  if (overlapping.length === 0) return 'No overlapping keys across scopes.';
  const list = overlapping.map((k) => `  - ${k}`).join('\n');
  return `Warning: ${overlapping.length} key(s) appear in multiple scopes:\n${list}`;
}

module.exports = { formatScopeSummary, formatScopeBreakdown, formatOverlapWarning };
