/**
 * merge.js — Merge multiple .env sources with conflict detection
 */

/**
 * Merge multiple parsed env objects into one.
 * Later sources take precedence over earlier ones.
 * Returns merged result and any conflicts found.
 *
 * @param {...Object} envObjects - parsed env key/value maps
 * @returns {{ merged: Object, conflicts: Object }}
 */
function mergeEnvs(...envObjects) {
  const merged = {};
  const conflicts = {};

  for (const env of envObjects) {
    for (const [key, value] of Object.entries(env)) {
      if (key in merged && merged[key] !== value) {
        if (!conflicts[key]) {
          conflicts[key] = [merged[key]];
        }
        conflicts[key].push(value);
      }
      merged[key] = value;
    }
  }

  return { merged, conflicts };
}

/**
 * Returns true if there are no conflicts in the merge result.
 * @param {{ conflicts: Object }} mergeResult
 * @returns {boolean}
 */
function isCleanMerge({ conflicts }) {
  return Object.keys(conflicts).length === 0;
}

/**
 * Merge envs but throw if any conflicts are detected.
 * @param {...Object} envObjects
 * @returns {Object} merged env
 */
function mergeStrict(...envObjects) {
  const { merged, conflicts } = mergeEnvs(...envObjects);
  if (!isCleanMerge({ conflicts })) {
    const keys = Object.keys(conflicts).join(', ');
    throw new Error(`Merge conflicts detected for keys: ${keys}`);
  }
  return merged;
}

/**
 * Returns a human-readable summary of conflicts from a merge result.
 * Useful for logging or displaying conflict details to the user.
 *
 * @param {{ conflicts: Object }} mergeResult
 * @returns {string}
 */
function formatConflicts({ conflicts }) {
  if (isCleanMerge({ conflicts })) {
    return 'No conflicts.';
  }
  return Object.entries(conflicts)
    .map(([key, values]) => `  ${key}: [${values.map(v => JSON.stringify(v)).join(' → ')}]`)
    .join('\n');
}

module.exports = { mergeEnvs, isCleanMerge, mergeStrict, formatConflicts };
