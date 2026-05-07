/**
 * reporter.typecast.js — Format typecast results for CLI output
 */

const { typecastSummary } = require('./typecast');

/**
 * Format a single cast entry.
 * @param {{key: string, original: string, cast: any, type: string}} entry
 * @returns {string}
 */
function formatCastEntry(entry) {
  const castDisplay = entry.cast === null ? 'null'
    : Array.isArray(entry.cast) ? `[array(${entry.cast.length})]`
    : typeof entry.cast === 'object' ? `[object]`
    : String(entry.cast);
  return `  ${entry.key}: "${entry.original}" → ${castDisplay} (${entry.type})`;
}

/**
 * Format the full typecast summary for an env.
 * @param {Record<string, string>} env
 * @returns {string}
 */
function formatTypecastSummary(env) {
  const summary = typecastSummary(env);
  if (summary.length === 0) {
    return 'No values were cast (all values remain strings).';
  }
  const lines = ['Typecast results:', ...summary.map(formatCastEntry)];
  lines.push(`\n${summary.length} key(s) cast to non-string types.`);
  return lines.join('\n');
}

/**
 * Format a diff between raw env and typecast env.
 * @param {Record<string, string>} env
 * @returns {string}
 */
function formatTypecastDiff(env) {
  const summary = typecastSummary(env);
  if (summary.length === 0) return 'No type changes detected.';
  const lines = summary.map(e => {
    const castStr = e.cast === null ? 'null'
      : Array.isArray(e.cast) ? JSON.stringify(e.cast)
      : typeof e.cast === 'object' ? JSON.stringify(e.cast)
      : String(e.cast);
    return `  ~ ${e.key}: (string) "${e.original}" → (${e.type}) ${castStr}`;
  });
  return ['Type changes:', ...lines].join('\n');
}

module.exports = { formatCastEntry, formatTypecastSummary, formatTypecastDiff };
