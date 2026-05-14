/**
 * cli.encrypt.js — CLI commands for encrypting/decrypting .env files
 */

const { loadEnvFile } = require('./loader');
const { stringifyEnv } = require('./parser');
const { encryptEnv, decryptEnv, listEncryptedKeys } = require('./encrypt');
const { formatEncryptSummary, formatDecryptSummary, formatEncryptedKeys } = require('./reporter.encrypt');
const fs = require('fs');

function registerEncryptCommand(program) {
  program
    .command('encrypt <file>')
    .description('Encrypt values in a .env file')
    .option('-s, --secret <secret>', 'Encryption secret (or set ENVGUARD_SECRET)')
    .option('-k, --keys <keys>', 'Comma-separated keys to encrypt (default: all)')
    .option('-o, --output <output>', 'Output file (default: overwrite input)')
    .option('--dry-run', 'Preview without writing')
    .action((file, opts) => {
      const secret = opts.secret || process.env.ENVGUARD_SECRET;
      if (!secret) {
        console.error('Error: secret is required (--secret or ENVGUARD_SECRET)');
        process.exit(1);
      }
      const env = loadEnvFile(file);
      const keys = opts.keys ? opts.keys.split(',').map(k => k.trim()) : null;
      const result = encryptEnv(env, secret, keys);
      console.log(formatEncryptSummary(env, result));
      if (!opts.dryRun) {
        const out = opts.output || file;
        fs.writeFileSync(out, stringifyEnv(result), 'utf8');
        console.log(`Written to ${out}`);
      }
    });

  program
    .command('decrypt <file>')
    .description('Decrypt values in a .env file')
    .option('-s, --secret <secret>', 'Decryption secret (or set ENVGUARD_SECRET)')
    .option('-k, --keys <keys>', 'Comma-separated keys to decrypt (default: all encrypted)')
    .option('-o, --output <output>', 'Output file (default: overwrite input)')
    .option('--dry-run', 'Preview without writing')
    .action((file, opts) => {
      const secret = opts.secret || process.env.ENVGUARD_SECRET;
      if (!secret) {
        console.error('Error: secret is required (--secret or ENVGUARD_SECRET)');
        process.exit(1);
      }
      const env = loadEnvFile(file);
      const encKeys = listEncryptedKeys(env);
      const keys = opts.keys ? opts.keys.split(',').map(k => k.trim()) : encKeys;
      console.log(formatEncryptedKeys(encKeys));
      const result = decryptEnv(env, secret, keys);
      console.log(formatDecryptSummary(env, result));
      if (!opts.dryRun) {
        const out = opts.output || file;
        fs.writeFileSync(out, stringifyEnv(result), 'utf8');
        console.log(`Written to ${out}`);
      }
    });
}

module.exports = { registerEncryptCommand };
