/**
 * reporter.mask.js — Format masking results for display
 */

const { listMaskedKeys } = require('./mask');

/**
 * Format a summary of which keys were masked
 * @param {Record<string, string>} original
 * @returns {string}
 */
function formatMaskSummary(original) {
  const masked = listMaskedKeys(original);
  if (masked.length === 0) {
    return '✔ No sensitive keys detected.';
  }
  const lines = [`Masked ${masked.length} sensitive key(s):`, ''];
  for (const key of masked) {
    lines.push(`  • ${key}`);
  }
  return lines.join('\n');
}

/**
 * Format the masked env as key=value lines for display
 * @param {Record<string, string>} maskedEnv
 * @returns {string}
 */
function formatMaskedEnv(maskedEnv) {
  if (Object.keys(maskedEnv).length === 0) {
    return '(empty)';
  }
  return Object.entries(maskedEnv)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
}

module.exports = { formatMaskSummary, formatMaskedEnv };
