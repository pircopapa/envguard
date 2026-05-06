const fs = require('fs');
const os = require('os');
const path = require('path');
const { watchEnvFile } = require('../src/watch');

function writeTmp(name, content) {
  const p = path.join(os.tmpdir(), name);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

describe('watchEnvFile', () => {
  it('calls onChange when a key is added', async () => {
    const file = writeTmp('watch_add.env', 'FOO=bar\n');
    const changes = [];

    const handle = watchEnvFile(file, {
      onChange(diff) { changes.push(diff); }
    });

    await sleep(100);
    fs.writeFileSync(file, 'FOO=bar\nBAZ=qux\n', 'utf8');
    await sleep(300);
    handle.stop();

    expect(changes.length).toBeGreaterThan(0);
    expect(changes[0].added).toContain('BAZ');
  });

  it('does not call onChange when file content is identical', async () => {
    const file = writeTmp('watch_noop.env', 'FOO=bar\n');
    const changes = [];

    const handle = watchEnvFile(file, {
      onChange(diff) { changes.push(diff); }
    });

    await sleep(100);
    fs.writeFileSync(file, 'FOO=bar\n', 'utf8');
    await sleep(300);
    handle.stop();

    expect(changes.length).toBe(0);
  });

  it('stop() prevents further callbacks', async () => {
    const file = writeTmp('watch_stop.env', 'A=1\n');
    const changes = [];

    const handle = watchEnvFile(file, {
      onChange(diff) { changes.push(diff); }
    });
    handle.stop();

    fs.writeFileSync(file, 'A=1\nB=2\n', 'utf8');
    await sleep(300);

    expect(changes.length).toBe(0);
  });
});
