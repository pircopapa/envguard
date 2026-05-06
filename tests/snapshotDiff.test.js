const fs = require('fs');
const path = require('path');
const os = require('os');
const { saveSnapshot } = require('../src/snapshot');
const { diffAgainstSnapshot, hasChangedSinceSnapshot } = require('../src/snapshotDiff');

let tmpDir;
let envFile;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envguard-snap-diff-'));
  envFile = path.join(tmpDir, '.env');
  fs.writeFileSync(envFile, 'APP_NAME=myapp\nDEBUG=true\nPORT=3000\n', 'utf-8');
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('diffAgainstSnapshot', () => {
  test('throws when no snapshot exists', () => {
    const snapshotDir = path.join(tmpDir, 'snapshots');
    expect(() => diffAgainstSnapshot(envFile, snapshotDir)).toThrow('No snapshot found');
  });

  test('returns clean diff when env is unchanged', () => {
    const snapshotDir = path.join(tmpDir, 'snapshots');
    saveSnapshot(envFile, snapshotDir);
    const { diff } = diffAgainstSnapshot(envFile, snapshotDir);
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
    expect(diff.changed).toHaveLength(0);
  });

  test('detects added keys', () => {
    const snapshotDir = path.join(tmpDir, 'snapshots');
    saveSnapshot(envFile, snapshotDir);
    fs.writeFileSync(envFile, 'APP_NAME=myapp\nDEBUG=true\nPORT=3000\nNEW_KEY=hello\n', 'utf-8');
    const { diff } = diffAgainstSnapshot(envFile, snapshotDir);
    expect(diff.added).toContain('NEW_KEY');
  });

  test('detects removed keys', () => {
    const snapshotDir = path.join(tmpDir, 'snapshots');
    saveSnapshot(envFile, snapshotDir);
    fs.writeFileSync(envFile, 'APP_NAME=myapp\nPORT=3000\n', 'utf-8');
    const { diff } = diffAgainstSnapshot(envFile, snapshotDir);
    expect(diff.removed).toContain('DEBUG');
  });

  test('includes snapshotMeta in result', () => {
    const snapshotDir = path.join(tmpDir, 'snapshots');
    saveSnapshot(envFile, snapshotDir);
    const { snapshotMeta } = diffAgainstSnapshot(envFile, snapshotDir);
    expect(snapshotMeta).toHaveProperty('createdAt');
    expect(snapshotMeta).toHaveProperty('source');
  });
});

describe('hasChangedSinceSnapshot', () => {
  test('returns false when env is unchanged', () => {
    const snapshotDir = path.join(tmpDir, 'snapshots');
    saveSnapshot(envFile, snapshotDir);
    expect(hasChangedSinceSnapshot(envFile, snapshotDir)).toBe(false);
  });

  test('returns true when env has changed', () => {
    const snapshotDir = path.join(tmpDir, 'snapshots');
    saveSnapshot(envFile, snapshotDir);
    fs.writeFileSync(envFile, 'APP_NAME=changed\nPORT=4000\n', 'utf-8');
    expect(hasChangedSinceSnapshot(envFile, snapshotDir)).toBe(true);
  });
});
