const fs = require('fs');
const path = require('path');
const { parseEnv } = require('./parser');

/**
 * Load and parse a .env file from disk.
 *
 * @param {string} filePath - Absolute or relative path to the .env file
 * @returns {Record<string, string>} Parsed key-value pairs
 * @throws {Error} If the file cannot be read
 */
function loadEnvFile(filePath) {
  const resolved = path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    throw new Error(`envguard: file not found: ${resolved}`);
  }

  const content = fs.readFileSync(resolved, 'utf8');
  return parseEnv(content);
}

/**
 * Load multiple .env files and return them as a named map.
 *
 * @param {Record<string, string>} files - Map of label -> file path
 * @returns {Record<string, Record<string, string>>} Map of label -> parsed env
 */
function loadEnvFiles(files) {
  const result = {};
  for (const [label, filePath] of Object.entries(files)) {
    result[label] = loadEnvFile(filePath);
  }
  return result;
}

module.exports = { loadEnvFile, loadEnvFiles };
