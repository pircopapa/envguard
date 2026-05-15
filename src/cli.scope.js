/**
 * cli.scope.js — CLI command for scoped env inspection.
 */

const { loadEnvFile } = require('./loader');
const { partitionByScope, scopeSummary } = require('./scope');
const { formatScopeSummary, formatScopeBreakdown, formatOverlapWarning } = require('./reporter.scope');

/**
 * @param {import('commander').Command} program
 */
function registerScopeCommand(program) {
  program
    .command('scope <envFile>')
    .description('Partition env vars into named scopes')
    .option(
      '-s, --scope <name=patterns>',
      'Define a scope as name=PREFIX1,PREFIX2 (repeatable)',
      collect,
      []
    )
    .option('--show-breakdown', 'Print all keys per scope', false)
    .option('--warn-overlap', 'Warn when keys appear in multiple scopes', false)
    .action((envFile, opts) => {
      const env = loadEnvFile(envFile);
      const scopeMap = parseScopeOptions(opts.scope);

      if (Object.keys(scopeMap).length === 0) {
        console.error('No scopes defined. Use --scope name=PREFIX*');
        process.exit(1);
      }

      const partition = partitionByScope(env, scopeMap);
      const summary = scopeSummary(partition);

      console.log(formatScopeSummary(summary));

      if (opts.showBreakdown) {
        console.log('');
        console.log(formatScopeBreakdown(partition.scopes));
      }

      if (opts.warnOverlap) {
        console.log('');
        console.log(formatOverlapWarning(partition.scopes));
      }
    });
}

function collect(val, acc) {
  acc.push(val);
  return acc;
}

function parseScopeOptions(rawList) {
  const map = {};
  for (const raw of rawList) {
    const eqIdx = raw.indexOf('=');
    if (eqIdx === -1) continue;
    const name = raw.slice(0, eqIdx).trim();
    const patterns = raw
      .slice(eqIdx + 1)
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    map[name] = patterns;
  }
  return map;
}

module.exports = { registerScopeCommand };
