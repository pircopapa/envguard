/**
 * reporter.rename.js — Format output for rename operations
 */

/**
 * Format a summary of renamed keys.
 * @param {Array<{from: string, to: string}>} renamed
 * @param {string[]} skipped
 * @returns {string}
 */
function formatRenameSummary(renamed, skipped = []) {
  const lines = [];

  if (renamed.length === 0 && skipped.length === 0) {
    return 'No keys renamed.';
  }

  if (renamed.length > 0) {
    lines.push(`Renamed ${renamed.length} key(s):`);
    for (const { from, to } of renamed) {
      lines.push(`  ${from} → ${to}`);
    }
  }

  if (skipped.length > 0) {
    lines.push(`Skipped ${skipped.length} key(s) (not found or would overwrite):`);
    for (const key of skipped) {
      lines.push(`  ${key}`);
    }
  }

  return lines.join('\n');
}

/**
 * Format a before/after diff view of renamed keys.
 * @param {Record<string, string>} original
 * @param {Record<string, string>} result
 * @param {Array<{from: string, to: string}>} renamed
 * @returns {string}
 */
function formatRenamePreview(original, result, renamed) {
  if (renamed.length === 0) return 'No changes to preview.';

  const lines = ['Rename preview:'];
  for (const { from, to } of renamed) {
    const value = original[from];
    lines.push(`  - ${from}=${value}`);
    lines.push(`  + ${to}=${result[to]}`);
  }
  return lines.join('\n');
}

module.exports = { formatRenameSummary, formatRenamePreview };
