/**
 * reporter.redact.js — Format redaction reports for CLI output
 */

const { listRedactedKeys } = require('./redact');

/**
 * Format a summary of which keys were redacted in an env.
 * @param {Record<string, string>} env
 * @param {string} [label]
 * @returns {string}
 */
function formatRedactSummary(env, label = 'env') {
  const keys = listRedactedKeys(env);
  if (keys.length === 0) {
    return `[${label}] No sensitive keys detected.`;
  }
  const lines = [`[${label}] ${keys.length} sensitive key(s) detected and redacted:`];
  for (const key of keys) {
    lines.push(`  - ${key}`);
  }
  return lines.join('\n');
}

/**
 * Format a redacted env as key=value lines (safe for display).
 * @param {Record<string, string>} redactedEnv
 * @returns {string}
 */
function formatRedactedEnv(redactedEnv) {
  return Object.entries(redactedEnv)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
}

module.exports = { formatRedactSummary, formatRedactedEnv };
