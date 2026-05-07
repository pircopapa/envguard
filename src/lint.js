/**
 * lint.js — Check .env files for common style and correctness issues
 */

const UPPERCASE_KEY = /^[A-Z][A-Z0-9_]*$/;
const NO_SPACES_AROUND_EQUALS = /^[^=]+=[^]*$/;
const DUPLICATE_KEY_CHECK = true;

/**
 * Lint a single key-value pair entry.
 * @param {string} key
 * @param {string} value
 * @param {number} lineNumber
 * @returns {Array<{rule: string, message: string, line: number}>}
 */
function lintEntry(key, value, lineNumber) {
  const issues = [];

  if (!UPPERCASE_KEY.test(key)) {
    issues.push({
      rule: 'key-case',
      message: `Key "${key}" should be UPPER_SNAKE_CASE`,
      line: lineNumber,
    });
  }

  if (key.trim() !== key) {
    issues.push({
      rule: 'key-whitespace',
      message: `Key "${key}" has leading or trailing whitespace`,
      line: lineNumber,
    });
  }

  if (typeof value === 'string' && value !== value.trim() && value.length > 0) {
    issues.push({
      rule: 'value-whitespace',
      message: `Value for "${key}" has leading or trailing whitespace`,
      line: lineNumber,
    });
  }

  if (value === '' || value === undefined || value === null) {
    issues.push({
      rule: 'empty-value',
      message: `Key "${key}" has an empty value`,
      line: lineNumber,
    });
  }

  return issues;
}

/**
 * Lint an entire parsed env object.
 * @param {Record<string, string>} env
 * @returns {{ issues: Array, isClean: boolean }}
 */
function lintEnv(env) {
  const issues = [];
  const seenKeys = new Set();
  let lineNumber = 1;

  for (const [key, value] of Object.entries(env)) {
    if (DUPLICATE_KEY_CHECK && seenKeys.has(key)) {
      issues.push({
        rule: 'duplicate-key',
        message: `Duplicate key "${key}" detected`,
        line: lineNumber,
      });
    }
    seenKeys.add(key);

    const entryIssues = lintEntry(key, value, lineNumber);
    issues.push(...entryIssues);
    lineNumber++;
  }

  return {
    issues,
    isClean: issues.length === 0,
  };
}

module.exports = { lintEntry, lintEnv };
