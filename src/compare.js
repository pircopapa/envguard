/**
 * compare.js — Compare two env objects and produce structured comparison results.
 * Useful for multi-environment comparisons (e.g. dev vs staging vs prod).
 */

/**
 * Compare multiple env objects against a base env.
 * Returns per-key status across all envs.
 *
 * @param {Object} base - The reference env (e.g. .env.example)
 * @param {Object.<string, Object>} targets - Named envs to compare against base
 * @returns {Object} comparison result
 */
function compareEnvs(base, targets) {
  const allKeys = new Set([
    ...Object.keys(base),
    ...Object.values(targets).flatMap(Object.keys),
  ]);

  const rows = {};

  for (const key of allKeys) {
    const baseVal = base[key];
    rows[key] = {
      base: baseVal !== undefined ? baseVal : null,
      targets: {},
      status: {},
    };

    for (const [name, env] of Object.entries(targets)) {
      const val = env[key] !== undefined ? env[key] : null;
      rows[key].targets[name] = val;

      if (baseVal === undefined && val !== null) {
        rows[key].status[name] = 'extra';
      } else if (val === null) {
        rows[key].status[name] = 'missing';
      } else if (val === baseVal) {
        rows[key].status[name] = 'match';
      } else {
        rows[key].status[name] = 'differs';
      }
    }
  }

  return rows;
}

/**
 * Returns true if all targets match the base exactly (no missing, extra, or differing keys).
 *
 * @param {Object} comparisonResult - Output of compareEnvs
 * @returns {boolean}
 */
function isCleanComparison(comparisonResult) {
  return Object.values(comparisonResult).every(({ status }) =>
    Object.values(status).every((s) => s === 'match')
  );
}

/**
 * Summarize comparison: count of matches, missing, extra, differs per target.
 *
 * @param {Object} comparisonResult - Output of compareEnvs
 * @returns {Object.<string, {match: number, missing: number, extra: number, differs: number}>}
 */
function compareSummary(comparisonResult) {
  const summary = {};

  for (const { status } of Object.values(comparisonResult)) {
    for (const [name, s] of Object.entries(status)) {
      if (!summary[name]) {
        summary[name] = { match: 0, missing: 0, extra: 0, differs: 0 };
      }
      summary[name][s] = (summary[name][s] || 0) + 1;
    }
  }

  return summary;
}

module.exports = { compareEnvs, isCleanComparison, compareSummary };
