/**
 * cli.merge.js — CLI command for merging .env files
 */

const { loadEnvFile } = require('./loader');
const { mergeEnvs, isCleanMerge } = require('./merge');
const { formatMerge } = require('./reporter.merge');
const { resolveFile } = require('./cli');

/**
 * cmdMerge — merge two or more .env files and print the result
 * @param {string[]} filePaths
 * @param {{ strict: boolean, output: boolean }} opts
 */
async function cmdMerge(filePaths, opts = {}) {
  if (filePaths.length < 2) {
    console.error('merge requires at least two files');
    process.exit(1);
  }

  const envObjects = [];
  for (const fp of filePaths) {
    const resolved = resolveFile(fp);
    const env = await loadEnvFile(resolved);
    envObjects.push(env);
  }

  const { merged, conflicts } = mergeEnvs(...envObjects);
  const report = formatMerge({ merged, conflicts, files: filePaths });
  console.log(report);

  if (opts.strict && !isCleanMerge({ conflicts })) {
    process.exit(1);
  }
}

module.exports = { cmdMerge };
