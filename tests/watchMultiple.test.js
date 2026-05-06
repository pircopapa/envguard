const fs = require('fs');
const os = require('os');
const path = require('path');
const { watchEnvFiles } = require('../src/watchMultiple');

function writeTmp(name, content) {
  const p = path.join(os.tmpdir(), name);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

describe('watchEnvFiles', () => {
  it('reports which file changed', async () => {
    const f1 = writeTmp('multi1.env', 'X=1\n');
    const f2 = writeTmp('multi2.env', 'Y=2\n');
    const events = [];

    const handle = watchEnvFiles([f1, f2], {
      onChange(filePath, diff) {
        events.push({ filePath, diff });
      }
    });

    await sleep(100);
    fs.writeFileSync(f2, 'Y=2\nZ=3\n', 'utf8');
    await sleep(300);
    handle.stop();

    expect(events.length).toBeGreaterThan(0);
    const ev = events.find((e) => e.filePath === path.resolve(f2));
    expect(ev).toBeDefined();
    expect(ev.diff.added).toContain('Z');
  });

  it('stop() stops all watchers', async () => {
    const f1 = writeTmp('multi_stop1.env', 'A=1\n');
    const f2 = writeTmp('multi_stop2.env', 'B=2\n');
    const events = [];

    const handle = watchEnvFiles([f1, f2], {
      onChange(filePath, diff) { events.push(diff); }
    });
    handle.stop();

    fs.writeFileSync(f1, 'A=1\nC=3\n', 'utf8');
    await sleep(300);

    expect(events.length).toBe(0);
  });
});
