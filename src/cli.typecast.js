/**
 * cli.typecast.js — CLI command for typecasting .env values
 */

const { loadEnvFile } = require('./loader');
const { typecastEnv } = require('./typecast');
const { formatTypecastSummary, formatTypecastDiff } = require('./reporter.typecast');
const { resolveFile } = require('./cli');

/**
 * Print a typecast summary for a given .env file.
 * @param {string} filePath
 * @param {{diff: boolean, quiet: boolean}} options
 */
async function cmdTypecast(filePath, options = {}) {
  const resolved = resolveFile(filePath);
  let env;
  try {
    env = await loadEnvFile(resolved);
  } catch (err) {
    console.error(`Error loading file: ${err.message}`);
    process.exit(1);
  }

  const result = typecastEnv(env);

  if (!options.quiet) {
    if (options.diff) {
      console.log(formatTypecastDiff(env));
    } else {
      console.log(formatTypecastSummary(env));
    }
  }

  return result;
}

/**
 * Register the typecast subcommand on a commander program.
 * @param {import('commander').Command} program
 */
function registerTypecastCommand(program) {
  program
    .command('typecast <file>')
    .description('Show how .env string values would be cast to native types')
    .option('-d, --diff', 'show diff-style output of type changes')
    .option('-q, --quiet', 'suppress output, only return the result')
    .action(async (file, opts) => {
      await cmdTypecast(file, { diff: !!opts.diff, quiet: !!opts.quiet });
    });
}

module.exports = { cmdTypecast, registerTypecastCommand };
