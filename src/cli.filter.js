/**
 * cli.filter.js — CLI command for filtering env keys
 */

const { loadEnvFile } = require('./loader');
const { filterByPrefix, filterByPattern, excludeKeys, emptyKeys } = require('./filter');
const { formatFilterSummary, formatEmptyKeys, formatExcludeSummary } = require('./reporter.filter');

/**
 * Register filter subcommands on a commander program
 * @param {import('commander').Command} program
 */
function registerFilterCommand(program) {
  const cmd = program.command('filter').description('Filter env keys by various criteria');

  cmd
    .command('prefix <prefix>')
    .description('Show keys matching a prefix')
    .option('-f, --file <path>', 'Path to .env file', '.env')
    .action(async (prefix, opts) => {
      const env = await loadEnvFile(opts.file);
      const filtered = filterByPrefix(env, prefix);
      console.log(formatFilterSummary(env, filtered, `prefix:${prefix}`));
    });

  cmd
    .command('pattern <regex>')
    .description('Show keys matching a regex pattern')
    .option('-f, --file <path>', 'Path to .env file', '.env')
    .action(async (regex, opts) => {
      const env = await loadEnvFile(opts.file);
      const filtered = filterByPattern(env, new RegExp(regex));
      console.log(formatFilterSummary(env, filtered, `pattern:${regex}`));
    });

  cmd
    .command('empty')
    .description('List keys with empty or blank values')
    .option('-f, --file <path>', 'Path to .env file', '.env')
    .action(async (opts) => {
      const env = await loadEnvFile(opts.file);
      const keys = emptyKeys(env);
      console.log(formatEmptyKeys(keys));
    });

  cmd
    .command('exclude <keys...>')
    .description('Show env after excluding specified keys')
    .option('-f, --file <path>', 'Path to .env file', '.env')
    .action(async (keys, opts) => {
      const env = await loadEnvFile(opts.file);
      const result = excludeKeys(env, keys);
      console.log(formatExcludeSummary(keys, result));
    });
}

module.exports = { registerFilterCommand };
