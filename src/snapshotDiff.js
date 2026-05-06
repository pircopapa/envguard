const { diffEnvs } = require('./diff');
const { loadLatestSnapshot } = require('./snapshot');
const { loadEnvFile } = require('./loader');

/**
 * Diff the current env file against its latest snapshot
 * @param {string} envPath - path to the current .env file
 * @param {string} snapshotDir
 * @returns {{ diff: object, snapshotMeta: object }}
 */
function diffAgainstSnapshot(envPath, snapshotDir = '.envguard/snapshots') {
  const snapshot = loadLatestSnapshot(envPath, snapshotDir);

  if (!snapshot) {
    throw new Error(`No snapshot found for ${envPath}. Run saveSnapshot first.`);
  }

  const current = loadEnvFile(envPath);
  const diff = diffEnvs(snapshot.keys, current);

  return {
    snapshotMeta: {
      source: snapshot.source,
      createdAt: snapshot.createdAt,
    },
    diff,
  };
}

/**
 * Check whether the current env file has changed since the last snapshot
 * @param {string} envPath
 * @param {string} snapshotDir
 * @returns {boolean}
 */
function hasChangedSinceSnapshot(envPath, snapshotDir = '.envguard/snapshots') {
  const { diff } = diffAgainstSnapshot(envPath, snapshotDir);
  return (
    diff.added.length > 0 ||
    diff.removed.length > 0 ||
    diff.changed.length > 0
  );
}

module.exports = { diffAgainstSnapshot, hasChangedSinceSnapshot };
