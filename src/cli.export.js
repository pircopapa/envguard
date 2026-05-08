/**
 * cli.export.js — CLI command for exporting .env files to other formats
 */

const fs = require('fs');
const path = require('path');
const { loadEnvFile } = require('./loader');
const { toJSON, toCSV, toYAML, toDotEnv } = require('./export');
const {
  formatExportSuccess,
  formatExportPreview,
  formatUnsupportedFormat,
  FORMATS,
} = require('./reporter.export');

const CONVERTERS = {
  json: (env, pretty) => toJSON(env, pretty),
  csv: (env) => toCSV(env),
  yaml: (env) => toYAML(env),
  dotenv: (env) => toDotEnv(env),
};

/**
 * Register the export command on a yargs instance
 * @param {import('yargs').Argv} yargs
 */
function registerExportCommand(yargs) {
  yargs.command(
    'export <file>',
    'Export a .env file to another format',
    (y) => {
      y.positional('file', { describe: '.env file to export', type: 'string' })
        .option('format', {
          alias: 'f',
          choices: FORMATS,
          default: 'json',
          describe: 'Output format',
        })
        .option('output', {
          alias: 'o',
          type: 'string',
          describe: 'Output file path (omit to print to stdout)',
        })
        .option('pretty', {
          type: 'boolean',
          default: false,
          describe: 'Pretty-print JSON output',
        });
    },
    (argv) => {
      const format = argv.format;
      if (!FORMATS.includes(format)) {
        console.error(formatUnsupportedFormat(format));
        process.exit(1);
      }

      const env = loadEnvFile(argv.file);
      const content = CONVERTERS[format](env, argv.pretty);

      if (argv.output) {
        const outPath = path.resolve(argv.output);
        fs.writeFileSync(outPath, content + '\n', 'utf8');
        console.log(formatExportSuccess(format, outPath, Object.keys(env).length));
      } else {
        console.log(formatExportPreview(format, content));
      }
    }
  );
}

module.exports = { registerExportCommand };
