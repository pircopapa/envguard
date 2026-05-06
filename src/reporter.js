/**
 * Format validation results for human-readable output
 * @param {object} results - output from validateEnv or validateAll
 * @returns {string}
 */
function formatValidation(results) {
  if (!results || Object.keys(results).length === 0) {
    return '✅ All validations passed.';
  }

  const lines = ['❌ Validation errors found:\n'];

  for (const [file, issues] of Object.entries(results)) {
    lines.push(`  ${file}:`);
    for (const issue of issues) {
      lines.push(`    - [${issue.type}] ${issue.key}: ${issue.message}`);
    }
  }

  return lines.join('\n');
}

/**
 * Format a diff result for human-readable output
 * @param {object} diff - output from diffEnvs
 * @param {object} [options]
 * @param {string} [options.from] - label for the base env
 * @param {string} [options.to] - label for the comparison env
 * @returns {string}
 */
function formatDiff(diff, options = {}) {
  const from = options.from || 'base';
  const to = options.to || 'compare';
  const lines = [`Diff (${from} → ${to}):\n`];

  if (diff.added.length === 0 && diff.removed.length === 0 && diff.changed.length === 0) {
    return `✅ No differences between ${from} and ${to}.`;
  }

  if (diff.added.length > 0) {
    lines.push('  Added:');
    diff.added.forEach(k => lines.push(`    + ${k}`));
  }

  if (diff.removed.length > 0) {
    lines.push('  Removed:');
    diff.removed.forEach(k => lines.push(`    - ${k}`));
  }

  if (diff.changed.length > 0) {
    lines.push('  Changed:');
    diff.changed.forEach(k => lines.push(`    ~ ${k}`));
  }

  return lines.join('\n');
}

/**
 * Format a snapshot diff result
 * @param {object} snapshotResult - output from diffAgainstSnapshot
 * @param {string} envPath
 * @returns {string}
 */
function formatSnapshotDiff(snapshotResult, envPath) {
  const { diff, snapshotMeta } = snapshotResult;
  const header = `Snapshot diff for ${envPath}\n  Snapshot taken: ${snapshotMeta.createdAt}\n`;
  const body = formatDiff(diff, { from: 'snapshot', to: 'current' });
  return `${header}\n${body}`;
}

module.exports = { formatValidation, formatDiff, formatSnapshotDiff };
