/**
 * reporter.lint.js — Format lint results for display
 */

const RULE_LABELS = {
  'key-case': 'KEY CASE',
  'key-whitespace': 'KEY SPACE',
  'value-whitespace': 'VALUE SPACE',
  'empty-value': 'EMPTY VALUE',
  'duplicate-key': 'DUPLICATE',
};

/**
 * Format a single lint issue.
 * @param {{ rule: string, message: string, line: number }} issue
 * @returns {string}
 */
function formatIssue(issue) {
  const label = RULE_LABELS[issue.rule] || issue.rule.toUpperCase();
  return `  [${label}] line ${issue.line}: ${issue.message}`;
}

/**
 * Format the full lint result report.
 * @param {{ issues: Array, isClean: boolean }} lintResult
 * @param {string} [filename]
 * @returns {string}
 */
function formatLintReport(lintResult, filename) {
  const lines = [];
  const header = filename ? `Lint results for ${filename}` : 'Lint results';
  lines.push(header);
  lines.push('='.repeat(header.length));

  if (lintResult.isClean) {
    lines.push('  No issues found.');
    return lines.join('\n');
  }

  const byRule = {};
  for (const issue of lintResult.issues) {
    if (!byRule[issue.rule]) byRule[issue.rule] = [];
    byRule[issue.rule].push(issue);
  }

  for (const [rule, ruleIssues] of Object.entries(byRule)) {
    const label = RULE_LABELS[rule] || rule.toUpperCase();
    lines.push(`\n  Rule: ${label} (${ruleIssues.length} issue${ruleIssues.length > 1 ? 's' : ''})`);
    for (const issue of ruleIssues) {
      lines.push(formatIssue(issue));
    }
  }

  lines.push(`\nTotal: ${lintResult.issues.length} issue${lintResult.issues.length > 1 ? 's' : ''} found.`);
  return lines.join('\n');
}

/**
 * Format a compact lint summary (single line).
 * @param {{ issues: Array, isClean: boolean }} lintResult
 * @returns {string}
 */
function formatLintSummary(lintResult) {
  if (lintResult.isClean) return 'Lint: clean';
  const counts = {};
  for (const issue of lintResult.issues) {
    counts[issue.rule] = (counts[issue.rule] || 0) + 1;
  }
  const parts = Object.entries(counts).map(([rule, n]) => `${n} ${rule}`);
  return `Lint: ${lintResult.issues.length} issue(s) — ${parts.join(', ')}`;
}

module.exports = { formatIssue, formatLintReport, formatLintSummary };
