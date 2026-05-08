/**
 * cli.rename.js — CLI command for renaming env keys
 */

const { loadEnvFile } = require('./loader');
const { stringifyEnv } = require('./parser');
const { applyRenameMap, renameByPattern } = require('./rename');
const { formatRenameSummary, formatRenamePreview } = require('./reporter.rename');
const fs = require('fs');

/**
 * Register the `rename` CLI command.
 * @param {import('commander').Command} program
 */
function registerRenameCommand(program) {
  program
    .command('rename <file>')
    .description('Rename keys in a .env file using a mapping or pattern')
    .option('--map <pairs>', 'Comma-separated OLD=NEW pairs, e.g. FOO=BAR,BAZ=QUX')
    .option('--pattern <regex>', 'Regex pattern to match keys for renaming')
    .option('--replace <str>', 'Replacement string for pattern-based renaming')
    .option('--preview', 'Preview changes without writing to file')
    .option('--write', 'Write renamed output back to file')
    .action((file, opts) => {
      const env = loadEnvFile(file);
      let renamed = [];
      let skipped = [];
      let result = env;

      if (opts.map) {
        const renameMap = {};
        for (const pair of opts.map.split(',')) {
          const [from, to] = pair.split('=');
          if (from && to) renameMap[from.trim()] = to.trim();
        }
        ({ result, renamed, skipped } = applyRenameMap(env, renameMap));
      } else if (opts.pattern && opts.replace) {
        const pattern = new RegExp(opts.pattern);
        ({ result, renamed } = renameByPattern(env, pattern, (k) =>
          k.replace(pattern, opts.replace)
        ));
      } else {
        console.error('Provide --map or --pattern + --replace');
        process.exit(1);
      }

      console.log(formatRenameSummary(renamed, skipped));

      if (opts.preview) {
        console.log(formatRenamePreview(env, result, renamed));
      }

      if (opts.write && renamed.length > 0) {
        fs.writeFileSync(file, stringifyEnv(result), 'utf8');
        console.log(`Written to ${file}`);
      }
    });
}

module.exports = { registerRenameCommand };
