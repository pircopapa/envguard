/**
 * dedupe.js — Detect and remove duplicate keys in parsed env objects
 */

/**
 * Parse raw .env text and return entries including duplicates.
 * @param {string} raw
 * @returns {Array<{key: string, value: string, line: number}>}
 */
function parseWithDuplicates(raw) {
  const entries = [];
  const lines = raw.split(/\r?\n/);
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) return;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    entries.push({ key, value, line: idx + 1 });
  });
  return entries;
}

/**
 * Find duplicate keys in an array of entries.
 * Returns a map of key -> array of line numbers where it appears.
 * @param {Array<{key: string, line: number}>} entries
 * @returns {Record<string, number[]>}
 */
function findDuplicates(entries) {
  const seen = {};
  for (const { key, line } of entries) {
    if (!seen[key]) seen[key] = [];
    seen[key].push(line);
  }
  const dupes = {};
  for (const [key, lines] of Object.entries(seen)) {
    if (lines.length > 1) dupes[key] = lines;
  }
  return dupes;
}

/**
 * Remove duplicate keys from an env object, keeping the last occurrence.
 * @param {string} raw
 * @returns {{ env: Record<string, string>, removed: Record<string, number[]> }}
 */
function dedupeEnv(raw) {
  const entries = parseWithDuplicates(raw);
  const dupes = findDuplicates(entries);

  // Build final env keeping last value for each key
  const env = {};
  for (const { key, value } of entries) {
    env[key] = value;
  }

  // removed contains only the duplicate keys and their conflicting lines
  const removed = {};
  for (const [key, lines] of Object.entries(dupes)) {
    // All lines except the last are "removed"
    removed[key] = lines.slice(0, -1);
  }

  return { env, removed };
}

/**
 * Returns true if no duplicate keys exist.
 * @param {string} raw
 * @returns {boolean}
 */
function isCleanDedupe(raw) {
  const entries = parseWithDuplicates(raw);
  const dupes = findDuplicates(entries);
  return Object.keys(dupes).length === 0;
}

/**
 * Summary of deduplication results.
 * @param {Record<string, number[]>} removed
 * @returns {{ totalDuplicates: number, affectedKeys: string[] }}
 */
function dedupeSummary(removed) {
  const affectedKeys = Object.keys(removed);
  const totalDuplicates = affectedKeys.reduce((sum, k) => sum + removed[k].length, 0);
  return { totalDuplicates, affectedKeys };
}

module.exports = { parseWithDuplicates, findDuplicates, dedupeEnv, isCleanDedupe, dedupeSummary };
