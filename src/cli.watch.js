const path = require('path');
const { watchEnvFiles } = require('./watchMultiple');

/**
 * CLI command: watch one or more .env files and print diffs on change.
 * @param {string[]} files
 * @param {object} opts
 * @param {boolean} [opts.quiet] - suppress startup message
 */
function cmdWatch(files, opts = {}) {
  if (!files || files.length === 0) {
    console.error('watch: no files specified');
    process.exit(1);
  }

  const resolved = files.map((f) => path.resolve(f));

  if (!opts.quiet) {
    console.log(`Watching ${resolved.length} file(s) for changes...`);
    resolved.forEach((f) => console.log(`  ${f}`));
  }

  const handle = watchEnvFiles(resolved, {
    onChange(filePath, _diff, formatted) {
      console.log(`\n[changed] ${filePath}`);
      console.log(formatted);
    },
    onError(filePath, err) {
      console.error(`[error] ${filePath}: ${err.message}`);
    }
  });

  process.on('SIGINT', () => {
    handle.stop();
    console.log('\nStopped watching.');
    process.exit(0);
  });
}

module.exports = { cmdWatch };
