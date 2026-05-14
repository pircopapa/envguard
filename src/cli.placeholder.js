/**
 * cli.placeholder.js
 * CLI command: envguard placeholder <file>
 * Scans an env file for unfilled placeholder values.
 */

const { loadEnvFile } = require('./loader');
const { isCleanPlaceholder } = require('./placeholder');
const { formatPlaceholderReport, formatPlaceholderSummary } = require('./reporter.placeholder');

/**
 * @param {import('commander').Command} program
 */
function registerPlaceholderCommand(program) {
  program
    .command('placeholder <file>')
    .description('Scan an .env file for unfilled placeholder values')
    .option('--summary', 'Print one-line summary only')
    .option(
      '--extra-patterns <patterns>',
      'Comma-separated list of additional regex patterns to treat as placeholders',
    )
    .action((file, opts) => {
      let env;
      try {
        env = loadEnvFile(file);
      } catch (err) {
        console.error(`Error loading file: ${err.message}`);
        process.exit(1);
      }

      let patterns;
      if (opts.extraPatterns) {
        const extra = opts.extraPatterns.split(',').map((p) => new RegExp(p.trim(), 'i'));
        const { DEFAULT_PATTERNS } = require('./placeholder');
        patterns = [...DEFAULT_PATTERNS, ...extra];
      }

      if (opts.summary) {
        console.log(formatPlaceholderSummary(env, patterns));
      } else {
        console.log(formatPlaceholderReport(env, file, patterns));
        console.log();
        console.log(formatPlaceholderSummary(env, patterns));
      }

      if (!isCleanPlaceholder(env, patterns)) {
        process.exit(1);
      }
    });
}

module.exports = { registerPlaceholderCommand };
