/**
 * inherit.js — merge a base env into a child env, with override semantics
 */

/**
 * Merge base into child. Child keys win unless allowOverride is false.
 * @param {Object} base
 * @param {Object} child
 * @param {Object} options
 * @returns {Object}
 */
function inheritEnv(base, child, { allowOverride = true } = {}) {
  if (!allowOverride) {
    const conflicts = findInheritConflicts(base, child);
    if (conflicts.length > 0) {
      throw new Error(`Inherit conflict on keys: ${conflicts.join(', ')}`);
    }
  }
  return { ...base, ...child };
}

/**
 * Keys that exist in both base and child (potential conflicts).
 * @param {Object} base
 * @param {Object} child
 * @returns {string[]}
 */
function findInheritConflicts(base, child) {
  return Object.keys(child).filter(k => Object.prototype.hasOwnProperty.call(base, k));
}

/**
 * Keys present in base but absent in child (inherited as-is).
 * @param {Object} base
 * @param {Object} child
 * @returns {string[]}
 */
function inheritedKeys(base, child) {
  return Object.keys(base).filter(k => !Object.prototype.hasOwnProperty.call(child, k));
}

/**
 * Keys overridden by child relative to base.
 * @param {Object} base
 * @param {Object} child
 * @returns {string[]}
 */
function overriddenKeys(base, child) {
  return Object.keys(child).filter(
    k => Object.prototype.hasOwnProperty.call(base, k) && base[k] !== child[k]
  );
}

/**
 * Summary of the inheritance operation.
 */
function inheritSummary(base, child) {
  const conflicts = findInheritConflicts(base, child);
  return {
    baseKeys: Object.keys(base).length,
    childKeys: Object.keys(child).length,
    inherited: inheritedKeys(base, child),
    overridden: overriddenKeys(base, child),
    conflicts,
    isClean: conflicts.length === 0,
  };
}

module.exports = { inheritEnv, findInheritConflicts, inheritedKeys, overriddenKeys, inheritSummary };
