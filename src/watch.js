const fs = require('fs');
const path = require('path');
const { loadEnvFile } = require('./loader');
const { diffEnvs, isClean } = require('./diff');
const { formatDiff } = require('./reporter');

/**
 * Watch a .env file for changes and emit diffs on update.
 * @param {string} filePath - path to the .env file to watch
 * @param {object} options
 * @param {function} options.onChange - called with (diff, formatted) on each change
 * @param {function} [options.onError] - called with (err) on read errors
 * @returns {{ stop: function }} watcher handle
 */
function watchEnvFile(filePath, options = {}) {
  const { onChange, onError } = options;
  const resolved = path.resolve(filePath);

  let previous = {};
  try {
    previous = loadEnvFile(resolved);
  } catch (e) {
    // file may not exist yet
  }

  const watcher = fs.watch(resolved, { persistent: false }, (eventType) => {
    if (eventType !== 'change') return;
    try {
      const current = loadEnvFile(resolved);
      const diff = diffEnvs(previous, current);
      if (!isClean(diff)) {
        const formatted = formatDiff(diff);
        if (typeof onChange === 'function') onChange(diff, formatted);
      }
      previous = current;
    } catch (err) {
      if (typeof onError === 'function') onError(err);
    }
  });

  return {
    stop() {
      watcher.close();
    }
  };
}

module.exports = { watchEnvFile };
