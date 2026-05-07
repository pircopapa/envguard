const fs = require('fs');
const path = require('path');
const os = require('os');
const { saveSnapshot, loadLatestSnapshot, listSnapshots } = require('../src/snapshot');

let tmpDir;
let envFile;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envguard-'));
  envFile = path.join(tmpDir, '.env');
  fs.writeFileSync(envFile, 'APP_NAME=myapp\nDEBUG=true\nPORT=3000\n', 'utf-8');
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('saveSnapshot', () => {
  test('creates a snapshot file in the snapshot dir', () => {
    const snapshotDir = path.join(tmpDir, 'snapshots');
    const snapshotPath = saveSnapshot(envFile, snapshotDir);
    expect(fs.existsSync(snapshotPath)).toBe(true);
  });

  test('snapshot contains correct keys', () => {
    const snapshotDir = path.join(tmpDir, 'snapshots');
    const snapshotPath = saveSnapshot(envFile, snapshotDir);
    const data = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
    expect(data.keys).toHaveProperty('APP_NAME', 'myapp');
    expect(data.keys).toHaveProperty('DEBUG', 'true');
    expect(data.keys).toHaveProperty('PORT', '3000');
  });

  test('snapshot includes a timestamp', () => {
    const snapshotDir = path.join(tmpDir, 'snapshots');
    const snapshotPath = saveSnapshot(envFile, snapshotDir);
    const data = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
    expect(data).toHaveProperty('timestamp');
    expect(new Date(data.timestamp).getTime()).not.toBeNaN();
  });

  test('throws if env file does not exist', () => {
    expect(() => saveSnapshot('/nonexistent/.env')).toThrow('Env file not found');
  });
});

describe('loadLatestSnapshot', () => {
  test('returns null when no snapshots exist', () => {
    const snapshotDir = path.join(tmpDir, 'empty-snapshots');
    expect(loadLatestSnapshot(envFile, snapshotDir)).toBeNull();
  });

  test('returns the most recent snapshot', () => {
    const snapshotDir = path.join(tmpDir, 'snapshots');
    saveSnapshot(envFile, snapshotDir);
    const snapshot = loadLatestSnapshot(envFile, snapshotDir);
    expect(snapshot).not.toBeNull();
    expect(snapshot.keys).toHaveProperty('APP_NAME', 'myapp');
  });
});

describe('listSnapshots', () => {
  test('returns empty array when no snapshots', () => {
    const snapshotDir = path.join(tmpDir, 'empty-snapshots');
    expect(listSnapshots(envFile, snapshotDir)).toEqual([]);
  });

  test('returns list of snapshot filenames', () => {
    const snapshotDir = path.join(tmpDir, 'snapshots');
    saveSnapshot(envFile, snapshotDir);
    saveSnapshot(envFile, snapshotDir);
    const list = listSnapshots(envFile, snapshotDir);
    expect(list.length).toBe(2);
  });
});
