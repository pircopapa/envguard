/**
 * reporter.clone.js — Formatting helpers for clone/scaffold output
 */

/**
 * Format a summary of the clone operation.
 * @param {Record<string, string>} original
 * @param {Record<string, string>} cloned
 * @param {string[]} omitted
 * @returns {string}
 */
function formatCloneSummary(original, cloned, omitted = []) {
  const total = Object.keys(original).length;
  const kept = Object.keys(cloned).length;
  const lines = [
    `Clone Summary`,
    `  Total keys in source : ${total}`,
    `  Keys cloned          : ${kept}`,
  ];
  if (omitted.length > 0) {
    lines.push(`  Keys omitted         : ${omitted.length}`);
    omitted.forEach((k) => lines.push(`    - ${k}`));
  }
  return lines.join('\n');
}

/**
 * Format a preview of the scaffolded template string.
 * @param {string} template
 * @param {number} [maxLines]
 * @returns {string}
 */
function formatTemplatePreview(template, maxLines = 20) {
  const lines = template.split('\n');
  const preview = lines.slice(0, maxLines);
  const truncated = lines.length > maxLines;
  const out = ['Template Preview:', ...preview.map((l) => `  ${l}`)];
  if (truncated) out.push(`  ... (${lines.length - maxLines} more lines)`);
  return out.join('\n');
}

/**
 * Format a warning about empty keys in the cloned env.
 * @param {string[]} emptyKeys
 * @returns {string}
 */
function formatEmptyCloneWarning(emptyKeys) {
  if (emptyKeys.length === 0) return 'All cloned keys have values.';
  const lines = [`Warning: ${emptyKeys.length} key(s) have empty values in the clone:`];
  emptyKeys.forEach((k) => lines.push(`  - ${k}`));
  return lines.join('\n');
}

module.exports = { formatCloneSummary, formatTemplatePreview, formatEmptyCloneWarning };
