/**
 * reporter.export.js — Format export results for CLI output
 */

const FORMATS = ['json', 'csv', 'yaml', 'dotenv'];

/**
 * Format a successful export message
 * @param {string} format
 * @param {string} outputPath
 * @param {number} keyCount
 * @returns {string}
 */
function formatExportSuccess(format, outputPath, keyCount) {
  return [
    `✔ Exported ${keyCount} key(s) as ${format.toUpperCase()}`,
    `  → ${outputPath}`,
  ].join('\n');
}

/**
 * Format an export preview (stdout, no file)
 * @param {string} format
 * @param {string} content
 * @returns {string}
 */
function formatExportPreview(format, content) {
  const border = '─'.repeat(40);
  return [
    `── ${format.toUpperCase()} Preview ${'─'.repeat(29 - format.length)}`,
    content,
    border,
  ].join('\n');
}

/**
 * Format an unsupported format error
 * @param {string} format
 * @returns {string}
 */
function formatUnsupportedFormat(format) {
  return [
    `✖ Unsupported export format: "${format}"`,
    `  Supported formats: ${FORMATS.join(', ')}`,
  ].join('\n');
}

module.exports = { formatExportSuccess, formatExportPreview, formatUnsupportedFormat, FORMATS };
