const fs = require('fs');
const path = require('path');
const { parseEnv } = require('./parser');

/**
 * Save a snapshot of an env file to disk
 * @param {string} envPath - path to the .env file
 * @param {string} snapshotDir - directory to store snapshots
 * @returns {string} path to the written snapshot file
 */
function saveSnapshot(envPath, snapshotDir = '.envguard/snapshots') {
  if (!fs.existsSync(envPath)) {
    throw new Error(`Env file not found: ${envPath}`);
  }

  const raw = fs.readFileSync(envPath, 'utf-8');
  const parsed = parseEnv(raw);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const baseName = path.basename(envPath).replace(/^\./,  '');
  const snapshotName = `${baseName}.${timestamp}.json`;

  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }

  const snapshotPath = path.join(snapshotDir, snapshotName);
  const payload = {
    source: envPath,
    createdAt: new Date().toISOString(),
    keys: parsed,
  };

  fs.writeFileSync(snapshotPath, JSON.stringify(payload, null, 2), 'utf-8');
  return snapshotPath;
}

/**
 * Load the most recent snapshot for a given env file
 * @param {string} envPath
 * @param {string} snapshotDir
 * @returns {object|null}
 */
function loadLatestSnapshot(envPath, snapshotDir = '.envguard/snapshots') {
  if (!fs.existsSync(snapshotDir)) return null;

  const baseName = path.basename(envPath).replace(/^\./, '');
  const files = fs.readdirSync(snapshotDir)
    .filter(f => f.startsWith(baseName) && f.endsWith('.json'))
    .sort();

  if (files.length === 0) return null;

  const latest = path.join(snapshotDir, files[files.length - 1]);
  return JSON.parse(fs.readFileSync(latest, 'utf-8'));
}

/**
 * List all snapshots for a given env file
 * @param {string} envPath
 * @param {string} snapshotDir
 * @returns {string[]}
 */
function listSnapshots(envPath, snapshotDir = '.envguard/snapshots') {
  if (!fs.existsSync(snapshotDir)) return [];

  const baseName = path.basename(envPath).replace(/^\./, '');
  return fs.readdirSync(snapshotDir)
    .filter(f => f.startsWith(baseName) && f.endsWith('.json'))
    .sort();
}

module.exports = { saveSnapshot, loadLatestSnapshot, listSnapshots };
