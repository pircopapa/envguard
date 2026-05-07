/**
 * Parse .env file content into a key-value map.
 * Handles comments, blank lines, and quoted values.
 */

/**
 * @param {string} content - Raw .env file content
 * @returns {Record<string, string>} Parsed key-value pairs
 */
function parseEnv(content) {
  const result = {};

  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip blank lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    // Strip inline comments (unquoted values only)
    if (!value.startsWith('"') && !value.startsWith("'")) {
      const commentIdx = value.indexOf(' #');
      if (commentIdx !== -1) {
        value = value.slice(0, commentIdx).trim();
      }
    }

    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key) {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Serialize a key-value map back into .env file content.
 * @param {Record<string, string>} env - Key-value pairs to serialize
 * @returns {string} Formatted .env file content
 */
function stringifyEnv(env) {
  return Object.entries(env)
    .map(([key, value]) => {
      // Quote values that contain spaces or special characters
      const needsQuotes = /[\s#"'\\]/.test(value);
      const serializedValue = needsQuotes ? `"${value.replace(/"/g, '\\"')}"` : value;
      return `${key}=${serializedValue}`;
    })
    .join('\n');
}

module.exports = { parseEnv, stringifyEnv };
