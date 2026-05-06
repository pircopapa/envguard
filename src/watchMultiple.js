const path = require('path');
const { watchEnvFile } = require('./watch');

/**
 * Watch multiple .env files simultaneously.
 * @param {string[]} filePaths
 * @param {object} options
 * @param {function} options.onChange - called with (filePath, diff, formatted)
 * @param {function} [options.onError] - called with (filePath, err)
 * @returns {{ stop: function }} combined watcher handle
 */
function watchEnvFiles(filePaths, options = {}) {
  const { onChange, onError } = options;

  const watchers = filePaths.map((filePath) => {
    const resolved = path.resolve(filePath);
    return watchEnvFile(resolved, {
      onChange(diff, formatted) {
        if (typeof onChange === 'function') onChange(resolved, diff, formatted);
      },
      onError(err) {
        if (typeof onError === 'function') onError(resolved, err);
      }
    });
  });

  return {
    stop() {
      watchers.forEach((w) => w.stop());
    }
  };
}

module.exports = { watchEnvFiles };
