/**
 * reporter.merge.js — Format output for merge results
 */

/**
 * Format a merge result into a human-readable string.
 * @param {{ merged: Object, conflicts: Object, files: string[] }} param0
 * @returns {string}
 */
function formatMerge({ merged, conflicts, files = [] }) {
  const lines = [];

  if (files.length) {
    lines.push(`Merging: ${files.join(' + ')}`);
    lines.push('');
  }

  const conflictKeys = Object.keys(conflicts);
  if (conflictKeys.length === 0) {
    lines.push('✔ No conflicts detected.');
  } else {
    lines.push(`⚠ ${conflictKeys.length} conflict(s) detected:`);
    for (const key of conflictKeys) {
      lines.push(`  ${key}:`);
      conflicts[key].forEach((val, i) => {
        lines.push(`    [${i + 1}] ${val}`);
      });
    }
  }

  lines.push('');
  lines.push('Merged result:');
  for (const [key, value] of Object.entries(merged)) {
    const flag = conflicts[key] ? ' ⚠' : '';
    lines.push(`  ${key}=${value}${flag}`);
  }

  return lines.join('\n');
}

/**
 * Format a merge result as a summary line (single line, no detail).
 * Useful for logging or compact output modes.
 * @param {{ merged: Object, conflicts: Object, files: string[] }} param0
 * @returns {string}
 */
function formatMergeSummary({ merged, conflicts, files = [] }) {
  const totalKeys = Object.keys(merged).length;
  const conflictCount = Object.keys(conflicts).length;
  const fileLabel = files.length ? files.join(' + ') : 'unknown';
  const status = conflictCount === 0 ? '✔ clean' : `⚠ ${conflictCount} conflict(s)`;
  return `[${fileLabel}] ${totalKeys} key(s) merged — ${status}`;
}

module.exports = { formatMerge, formatMergeSummary };
