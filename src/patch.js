/**
 * patch.js — Apply a partial set of key/value updates to an env object.
 * Supports add, update, and delete operations via a patch map.
 */

/**
 * Apply a patch map to an env object.
 * Patch map values of `null` indicate deletion.
 * @param {Record<string,string>} env
 * @param {Record<string,string|null>} patch
 * @returns {{ result: Record<string,string>, applied: string[], deleted: string[], skipped: string[] }}
 */
function applyPatch(env, patch) {
  const result = { ...env };
  const applied = [];
  const deleted = [];
  const skipped = [];

  for (const [key, value] of Object.entries(patch)) {
    if (value === null) {
      if (Object.prototype.hasOwnProperty.call(result, key)) {
        delete result[key];
        deleted.push(key);
      } else {
        skipped.push(key);
      }
    } else {
      applied.push(key);
      result[key] = value;
    }
  }

  return { result, applied, deleted, skipped };
}

/**
 * Returns true if the patch would make no changes to the env.
 * @param {Record<string,string>} env
 * @param {Record<string,string|null>} patch
 * @returns {boolean}
 */
function isCleanPatch(env, patch) {
  for (const [key, value] of Object.entries(patch)) {
    if (value === null) {
      if (Object.prototype.hasOwnProperty.call(env, key)) return false;
    } else {
      if (env[key] !== value) return false;
    }
  }
  return true;
}

/**
 * Summarise the result of an applyPatch call.
 * @param {{ applied: string[], deleted: string[], skipped: string[] }} patchResult
 * @returns {{ total: number, applied: number, deleted: number, skipped: number }}
 */
function patchSummary({ applied, deleted, skipped }) {
  return {
    total: applied.length + deleted.length + skipped.length,
    applied: applied.length,
    deleted: deleted.length,
    skipped: skipped.length,
  };
}

module.exports = { applyPatch, isCleanPatch, patchSummary };
