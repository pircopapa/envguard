/**
 * encrypt.js — Simple symmetric encryption/decryption for .env values
 * Uses AES-256-CBC via Node's built-in crypto module
 */

const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;
const KEY_LENGTH = 32;

function deriveKey(secret) {
  return crypto.createHash('sha256').update(secret).digest();
}

function encryptValue(value, secret) {
  const key = deriveKey(secret);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptValue(encrypted, secret) {
  const [ivHex, dataHex] = encrypted.split(':');
  if (!ivHex || !dataHex) throw new Error('Invalid encrypted format');
  const key = deriveKey(secret);
  const iv = Buffer.from(ivHex, 'hex');
  const data = Buffer.from(dataHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

function encryptEnv(env, secret, keys = null) {
  const result = {};
  for (const [k, v] of Object.entries(env)) {
    if (keys === null || keys.includes(k)) {
      result[k] = encryptValue(v, secret);
    } else {
      result[k] = v;
    }
  }
  return result;
}

function decryptEnv(env, secret, keys = null) {
  const result = {};
  for (const [k, v] of Object.entries(env)) {
    if (keys === null || keys.includes(k)) {
      result[k] = decryptValue(v, secret);
    } else {
      result[k] = v;
    }
  }
  return result;
}

function isEncryptedValue(value) {
  return /^[0-9a-f]{32}:[0-9a-f]+$/i.test(value);
}

function listEncryptedKeys(env) {
  return Object.keys(env).filter(k => isEncryptedValue(env[k]));
}

module.exports = {
  encryptValue,
  decryptValue,
  encryptEnv,
  decryptEnv,
  isEncryptedValue,
  listEncryptedKeys
};
