/**
 * promote.js — Utilities for promoting env values from one environment to another
 * e.g. staging -> production, dev -> staging
 */

/**
 * Promote keys from a source env into a target env.
 * Only keys that exist in source but are missing or empty in target are promoted.
 * @param {Object} source - source env object
 * @param {Object} target - target env object
 * @param {string[]} [keys] - optional list of keys to promote (defaults to all source keys)
 * @returns {{ result: Object, promoted: string[], skipped: string[] }}
 */
function promoteEnv(source, target, keys = null) {
  const keysToPromote = keys || Object.keys(source);
  const promoted = [];
  const skipped = [];
  const result = { ...target };

  for (const key of keysToPromote) {
    if (!(key in source)) {
      skipped.push(key);
      continue;
    }
    const targetVal = target[key];
    if (targetVal === undefined || targetVal === '') {
      result[key] = source[key];
      promoted.push(key);
    } else {
      skipped.push(key);
    }
  }

  return { result, promoted, skipped };
}

/**
 * Force-promote keys from source to target, overwriting existing values.
 * @param {Object} source
 * @param {Object} target
 * @param {string[]} [keys]
 * @returns {{ result: Object, promoted: string[], overwritten: string[] }}
 */
function forcePromote(source, target, keys = null) {
  const keysToPromote = keys || Object.keys(source);
  const promoted = [];
  const overwritten = [];
  const result = { ...target };

  for (const key of keysToPromote) {
    if (!(key in source)) continue;
    if (key in target && target[key] !== '') {
      overwritten.push(key);
    } else {
      promoted.push(key);
    }
    result[key] = source[key];
  }

  return { result, promoted, overwritten };
}

/**
 * Returns keys present in source but completely absent from target.
 * @param {Object} source
 * @param {Object} target
 * @returns {string[]}
 */
function missingInTarget(source, target) {
  return Object.keys(source).filter(k => !(k in target));
}

/**
 * Returns a summary object describing the promotion operation.
 * @param {string[]} promoted
 * @param {string[]} skipped
 * @param {string[]} [overwritten]
 * @returns {Object}
 */
function promoteSummary(promoted, skipped, overwritten = []) {
  return {
    total: promoted.length + skipped.length + overwritten.length,
    promoted: promoted.length,
    skipped: skipped.length,
    overwritten: overwritten.length,
    clean: promoted.length === 0 && overwritten.length === 0
  };
}

module.exports = { promoteEnv, forcePromote, missingInTarget, promoteSummary };
