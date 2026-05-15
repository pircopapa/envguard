/**
 * cli.inherit.js — CLI command for env inheritance
 */

const { loadEnvFile } = require('./loader');
const { inheritEnv, inheritSummary } = require('./inherit');
const { formatInheritSummary } = require('./reporter.inherit');
const { stringifyEnv } = require('./parser');
const fs = require('fs');

function registerInheritCommand(program) {
  program
    .command('inherit <base> <child>')
    .description('Merge a base .env into a child .env (child keys win)')
    .option('--no-override', 'Fail if child overrides any base key')
    .option('-o, --output <file>', 'Write merged result to file')
    .option('--summary', 'Print inheritance summary')
    .option('--base-label <label>', 'Label for base env', 'base')
    .option('--child-label <label>', 'Label for child env', 'child')
    .action((basePath, childPath, opts) => {
      let base, child;
      try {
        base = loadEnvFile(basePath);
        child = loadEnvFile(childPath);
      } catch (err) {
        console.error(`Error loading files: ${err.message}`);
        process.exit(1);
      }

      let merged;
      try {
        merged = inheritEnv(base, child, { allowOverride: opts.override !== false });
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }

      if (opts.summary) {
        const summary = inheritSummary(base, child);
        console.log(formatInheritSummary(summary, {
          baseLabel: opts.baseLabel,
          childLabel: opts.childLabel,
        }));
      }

      const output = stringifyEnv(merged);
      if (opts.output) {
        fs.writeFileSync(opts.output, output, 'utf8');
        console.log(`Merged env written to ${opts.output}`);
      } else {
        console.log(output);
      }
    });
}

module.exports = { registerInheritCommand };
