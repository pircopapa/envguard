/**
 * reporter.encrypt.js — Formatting helpers for encrypt/decrypt output
 */

function formatEncryptSummary(original, encrypted) {
  const keys = Object.keys(encrypted);
  const encryptedCount = keys.filter(k => encrypted[k] !== original[k]).length;
  const lines = [
    `Encryption summary:`,
    `  Total keys : ${keys.length}`,
    `  Encrypted  : ${encryptedCount}`,
    `  Unchanged  : ${keys.length - encryptedCount}`
  ];
  return lines.join('\n');
}

function formatDecryptSummary(original, decrypted) {
  const keys = Object.keys(decrypted);
  const decryptedCount = keys.filter(k => decrypted[k] !== original[k]).length;
  const lines = [
    `Decryption summary:`,
    `  Total keys : ${keys.length}`,
    `  Decrypted  : ${decryptedCount}`,
    `  Unchanged  : ${keys.length - decryptedCount}`
  ];
  return lines.join('\n');
}

function formatEncryptedEnv(env) {
  const lines = ['Encrypted env values:'];
  for (const [k, v] of Object.entries(env)) {
    const display = v.length > 40 ? v.slice(0, 40) + '...' : v;
    lines.push(`  ${k}=${display}`);
  }
  return lines.join('\n');
}

function formatEncryptedKeys(keys) {
  if (keys.length === 0) return 'No encrypted keys found.';
  return `Encrypted keys (${keys.length}):\n` + keys.map(k => `  - ${k}`).join('\n');
}

module.exports = {
  formatEncryptSummary,
  formatDecryptSummary,
  formatEncryptedEnv,
  formatEncryptedKeys
};
