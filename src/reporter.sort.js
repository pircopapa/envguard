/**
 * reporter.sort.js — format output for sort operations
 */

/**
 * Format a summary of a sort operation
 * @param {Record<string, string>} original
 * @param {Record<string, string>} sorted
 * @returns {string}
 */
function formatSortSummary(original, sorted) {
  const origKeys = Object.keys(original);
  const sortedKeys = Object.keys(sorted);
  const moved = origKeys.filter((k, i) => sortedKeys[i] !== k);

  if (moved.length === 0) {
    return '✔ Already sorted — no changes needed.';
  }

  const lines = [`⟳ Sorted ${origKeys.length} keys (${moved.length} reordered):`, ''];
  sortedKeys.forEach((key, i) => {
    const oldIndex = origKeys.indexOf(key);
    if (oldIndex !== i) {
      lines.push(`  ${key}  (was #${oldIndex + 1}, now #${i + 1})`);
    }
  });
  return lines.join('\n');
}

/**
 * Format a preview showing before/after key order
 * @param {Record<string, string>} original
 * @param {Record<string, string>} sorted
 * @returns {string}
 */
function formatSortPreview(original, sorted) {
  const origKeys = Object.keys(original);
  const sortedKeys = Object.keys(sorted);
  const lines = ['Sort preview (before → after):', ''];

  const maxLen = Math.max(...origKeys.map(k => k.length), 3);
  sortedKeys.forEach((key, i) => {
    const before = origKeys[i] || '—';
    const marker = before === key ? ' ' : '↕';
    lines.push(`  ${marker} ${before.padEnd(maxLen)}  →  ${key}`);
  });

  return lines.join('\n');
}

/**
 * Format a warning listing unsorted keys
 * @param {string[]} keys
 * @returns {string}
 */
function formatUnsortedWarning(keys) {
  if (keys.length === 0) return '✔ No unsorted keys found.';
  const lines = [`⚠ ${keys.length} key(s) are out of order:`, ''];
  keys.forEach(k => lines.push(`  - ${k}`));
  return lines.join('\n');
}

module.exports = { formatSortSummary, formatSortPreview, formatUnsortedWarning };
