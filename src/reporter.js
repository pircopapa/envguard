/**
 * Formats validation and diff results into human-readable output.
 */

const { diffEnvs } = require('./diff');

/**
 * Format a single ValidationResult into a readable string.
 * @param {string} name - label for this env
 * @param {import('./validator').ValidationResult} result
 * @returns {string}
 */
function formatValidation(name, result) {
  const lines = [`[${name}] ${result.valid ? '✓ valid' : '✗ invalid'}'];

  if (result.missing.length > 0) {
    lines.push(`  Missing keys (${result.missing.length}):`);
    result.missing.forEach((k) => lines.push(`    - ${k}`));
  }

  if (result.extra.length > 0) {
    lines.push(`  Extra keys (${result.extra.length}):`);
    result.extra.forEach((k) => lines.push(`    + ${k}`));
  }

  if (result.empty.length > 0) {
    lines.push(`  Empty values (${result.empty.length}):`);
    result.empty.forEach((k) => lines.push(`    ! ${k}`));
  }

  return lines.join('\n');
}

/**
 * Format a diff between two envs into a readable string.
 * @param {Record<string, string>} envA
 * @param {Record<string, string>} envB
 * @param {string} [labelA='A']
 * @param {string} [labelB='B']
 * @returns {string}
 */
function formatDiff(envA, envB, labelA = 'A', labelB = 'B') {
  const diff = diffEnvs(envA, envB);
  const lines = [`Diff [${labelA}] → [${labelB}]`];

  if (diff.added.length > 0) {
    lines.push(`  Added in ${labelB}:`);
    diff.added.forEach((k) => lines.push(`    + ${k}=${envB[k]}`));
  }

  if (diff.removed.length > 0) {
    lines.push(`  Removed from ${labelA}:`);
    diff.removed.forEach((k) => lines.push(`    - ${k}=${envA[k]}`));
  }

  if (diff.changed.length > 0) {
    lines.push('  Changed:');
    diff.changed.forEach((k) =>
      lines.push(`    ~ ${k}: "${envA[k]}" → "${envB[k]}"`)
    );
  }

  if (diff.added.length === 0 && diff.removed.length === 0 && diff.changed.length === 0) {
    lines.push('  No differences found.');
  }

  return lines.join('\n');
}

module.exports = { formatValidation, formatDiff };
