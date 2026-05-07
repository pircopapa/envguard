/**
 * reporter.transform.js
 * Format transform results for CLI output
 */

/**
 * Show a summary of key renames
 * @param {Object} original
 * @param {Object} transformed
 * @param {Object} renameMap
 * @returns {string}
 */
function formatRenameSummary(original, transformed, renameMap) {
  const lines = ['Transform — Rename Summary', ''];
  const renames = Object.entries(renameMap);
  if (renames.length === 0) {
    lines.push('  No renames applied.');
    return lines.join('\n');
  }
  for (const [oldKey, newKey] of renames) {
    if (oldKey in original) {
      lines.push(`  ${oldKey}  →  ${newKey}`);
    } else {
      lines.push(`  ${oldKey}  (not found, skipped)`);
    }
  }
  lines.push('');
  lines.push(`  ${renames.length} rename(s) requested, ${Object.keys(transformed).length} key(s) in result.`);
  return lines.join('\n');
}

/**
 * Show a before/after diff of keys changed by any transform
 * @param {Object} original
 * @param {Object} transformed
 * @returns {string}
 */
function formatTransformDiff(original, transformed) {
  const lines = ['Transform — Key Diff', ''];
  const origKeys = new Set(Object.keys(original));
  const newKeys = new Set(Object.keys(transformed));

  const added = [...newKeys].filter(k => !origKeys.has(k));
  const removed = [...origKeys].filter(k => !newKeys.has(k));
  const kept = [...newKeys].filter(k => origKeys.has(k));

  for (const k of removed) lines.push(`  - ${k}`);
  for (const k of added) lines.push(`  + ${k}`);
  for (const k of kept) {
    if (original[k] !== transformed[k]) {
      lines.push(`  ~ ${k}: "${original[k]}" → "${transformed[k]}"`);
    }
  }

  if (added.length === 0 && removed.length === 0) {
    lines.push('  No key changes.');
  }

  return lines.join('\n');
}

module.exports = { formatRenameSummary, formatTransformDiff };
