/**
 * cli.clone.js — CLI command for cloning/scaffolding .env files
 */

const fs = require('fs');
const path = require('path');
const { loadEnvFile } = require('./loader');
const { cloneEnv, scaffoldTemplate, applyOverrides, emptyCloneKeys } = require('./clone');
const { stringifyEnv } = require('./parser');
const { formatCloneSummary, formatTemplatePreview, formatEmptyCloneWarning } = require('./reporter.clone');

/**
 * Register the `clone` command on a commander program.
 * @param {import('commander').Command} program
 */
function registerCloneCommand(program) {
  program
    .command('clone <source>')
    .description('Clone a .env file as a template or populated copy')
    .option('-o, --output <file>', 'output file path')
    .option('--blank', 'blank all values (scaffold mode)', false)
    .option('--omit <keys>', 'comma-separated keys to omit')
    .option('--header <text>', 'header comment for scaffolded template')
    .option('--preview', 'preview output without writing', false)
    .action((source, opts) => {
      const sourcePath = path.resolve(source);
      if (!fs.existsSync(sourcePath)) {
        console.error(`Error: source file not found: ${sourcePath}`);
        process.exit(1);
      }

      const env = loadEnvFile(sourcePath);
      const omitKeys = opts.omit ? opts.omit.split(',').map((k) => k.trim()) : [];
      const cloned = cloneEnv(env, { blankValues: opts.blank, omitKeys });

      console.log(formatCloneSummary(env, cloned, omitKeys));

      const empty = emptyCloneKeys(cloned);
      if (empty.length > 0) {
        console.log(formatEmptyCloneWarning(empty));
      }

      let output;
      if (opts.blank) {
        output = scaffoldTemplate(env, { header: opts.header });
        console.log(formatTemplatePreview(output));
      } else {
        output = stringifyEnv(cloned);
      }

      if (opts.preview) {
        console.log('\n[Preview mode — no file written]');
        return;
      }

      const outPath = opts.output ? path.resolve(opts.output) : sourcePath.replace(/(\.env[^.]*)?$/, '.env.clone');
      fs.writeFileSync(outPath, output, 'utf8');
      console.log(`Written to: ${outPath}`);
    });
}

module.exports = { registerCloneCommand };
