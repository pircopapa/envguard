'use strict';

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const CLI = path.resolve(__dirname, '../src/cli.js');

function run(args, opts = {}) {
  try {
    const stdout = execSync(`node ${CLI} ${args}`, {
      encoding: 'utf8',
      env: { ...process.env },
      ...opts
    });
    return { stdout, code: 0 };
  } catch (err) {
    return { stdout: err.stdout || '', stderr: err.stderr || '', code: err.status };
  }
}

function writeTmp(name, content) {
  const filePath = path.join(os.tmpdir(), name);
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

describe('cli diff', () => {
  it('exits 0 when two identical env files are diffed', () => {
    const a = writeTmp('a.env', 'FOO=bar\nBAZ=qux\n');
    const b = writeTmp('b.env', 'FOO=bar\nBAZ=qux\n');
    const { code } = run(`diff ${a} ${b}`);
    expect(code).toBe(0);
  });

  it('exits 1 when env files differ', () => {
    const a = writeTmp('c.env', 'FOO=bar\n');
    const b = writeTmp('d.env', 'FOO=bar\nEXTRA=1\n');
    const { code, stdout } = run(`diff ${a} ${b}`);
    expect(code).toBe(1);
    expect(stdout).toMatch(/EXTRA/);
  });

  it('prints error and exits 1 when args are missing', () => {
    const { code, stderr } = run('diff');
    expect(code).toBe(1);
    expect(stderr).toMatch(/Usage/);
  });
});

describe('cli no command', () => {
  it('prints help and exits 0', () => {
    const { code, stdout } = run('');
    expect(code).toBe(0);
    expect(stdout).toMatch(/envguard/);
  });
});

describe('cli unknown command', () => {
  it('shows help for unknown commands', () => {
    const { code, stdout } = run('unknown');
    expect(code).toBe(0);
    expect(stdout).toMatch(/envguard/);
  });
});
