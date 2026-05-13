/**
 * cli.sort.js — CLI command for sorting .env files
 */

const fs = require('fs');
const { loadEnvFile } = require('./loader');
const { stringifyEnv } = require('./parser');
const { sortAlpha, sortByPrefix, sortByValueLength, isSorted, unsortedKeys } = require('./sort');
const { formatSortSummary, formatSortPreview, formatUnsortedWarning } = require('./reporter.sort');

/**
 * @param {import('commander').Command} program
 */
function registerSortCommand(program) {
  program
    .command('sort <file>')
    .description('Sort keys in a .env file')
    .option('--by <method>', 'Sort method: alpha (default), prefix, length', 'alpha')
    .option('--check', 'Exit with error if file is not sorted, without modifying it')
    .option('--preview', 'Show what the sort would do without writing')
    .option('--write', 'Write sorted output back to file')
    .action((file, opts) => {
      let env;
      try {
        env = loadEnvFile(file);
      } catch (err) {
        console.error(`Error loading file: ${err.message}`);
        process.exit(1);
      }

      if (opts.check) {
        const bad = unsortedKeys(env);
        console.log(formatUnsortedWarning(bad));
        if (bad.length > 0) process.exit(1);
        return;
      }

      let sorted;
      if (opts.by === 'prefix') sorted = sortByPrefix(env);
      else if (opts.by === 'length') sorted = sortByValueLength(env);
      else sorted = sortAlpha(env);

      if (opts.preview) {
        console.log(formatSortPreview(env, sorted));
        return;
      }

      console.log(formatSortSummary(env, sorted));

      if (opts.write) {
        fs.writeFileSync(file, stringifyEnv(sorted), 'utf8');
        console.log(`\n✔ Written to ${file}`);
      } else if (!isSorted(env)) {
        console.log('\nRun with --write to apply changes.');
      }
    });
}

module.exports = { registerSortCommand };
