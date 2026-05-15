/**
 * reporter.inherit.js — format output for inherit operations
 */

function formatInheritSummary(summary, { baseLabel = 'base', childLabel = 'child' } = {}) {
  const lines = [];
  lines.push(`Inherit: ${baseLabel} → ${childLabel}`);
  lines.push(`  Base keys   : ${summary.baseKeys}`);
  lines.push(`  Child keys  : ${summary.childKeys}`);

  if (summary.inherited.length > 0) {
    lines.push(`  Inherited (${summary.inherited.length}):`);
    summary.inherited.forEach(k => lines.push(`    + ${k}`));
  } else {
    lines.push('  Inherited   : none');
  }

  if (summary.overridden.length > 0) {
    lines.push(`  Overridden (${summary.overridden.length}):`);
    summary.overridden.forEach(k => lines.push(`    ~ ${k}`));
  }

  if (summary.conflicts.length > 0) {
    lines.push(`  Conflicts (${summary.conflicts.length}):`);
    summary.conflicts.forEach(k => lines.push(`    ! ${k}`));
  }

  lines.push(summary.isClean ? '  Status: clean' : '  Status: conflicts detected');
  return lines.join('\n');
}

function formatInheritConflicts(conflicts) {
  if (conflicts.length === 0) return 'No inherit conflicts.';
  return [
    `${conflicts.length} inherit conflict(s):`,
    ...conflicts.map(k => `  ! ${k}`),
  ].join('\n');
}

module.exports = { formatInheritSummary, formatInheritConflicts };
