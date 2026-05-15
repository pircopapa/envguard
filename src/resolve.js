/**
 * resolve.js — Resolve missing keys in an env by looking them up from fallback envs.
 */

/**
 * Attempt to resolve missing keys in `target` from one or more `sources`.
 * Sources are checked in order; first match wins.
 *
 * @param {Object} target - The env with potentially missing/undefined values
 * @param {Object[]} sources - Ordered list of fallback envs
 * @returns {{ resolved: Object, report: Array }}
 */
function resolveEnv(target, sources = []) {
  const resolved = { ...target };
  const report = [];

  for (const [key, value] of Object.entries(target)) {
    if (value !== '' && value !== undefined && value !== null) continue;

    for (let i = 0; i < sources.length; i++) {
      const src = sources[i];
      if (src[key] !== undefined && src[key] !== '' && src[key] !== null) {
        resolved[key] = src[key];
        report.push({ key, resolvedFrom: i, value: src[key] });
        break;
      }
    }
  }

  return { resolved, report };
}

/**
 * Return keys that could not be resolved from any source.
 *
 * @param {Object} target
 * @param {Object[]} sources
 * @returns {string[]}
 */
function unresolvedKeys(target, sources = []) {
  const { resolved } = resolveEnv(target, sources);
  return Object.entries(resolved)
    .filter(([, v]) => v === '' || v === undefined || v === null)
    .map(([k]) => k);
}

/**
 * Returns true if all empty/missing keys in target were resolved.
 *
 * @param {Object} target
 * @param {Object[]} sources
 * @returns {boolean}
 */
function isCleanResolve(target, sources = []) {
  return unresolvedKeys(target, sources).length === 0;
}

/**
 * Summarise a resolve operation.
 *
 * @param {Array} report
 * @param {string[]} stillMissing
 * @returns {Object}
 */
function resolveSummary(report, stillMissing = []) {
  return {
    resolvedCount: report.length,
    unresolvedCount: stillMissing.length,
    resolved: report.map(r => r.key),
    unresolved: stillMissing,
  };
}

module.exports = { resolveEnv, unresolvedKeys, isCleanResolve, resolveSummary };
