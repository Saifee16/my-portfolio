// eslint-disable-next-line @typescript-eslint/no-require-imports -- Next loads this synchronous adapter through CommonJS.
const { globSync } = require("tinyglobby");

// Next expects fast-glob's non-recursive handling of literal directories.
exports.globSync = (patterns, options) => globSync(patterns, {
  ...options,
  expandDirectories: false,
});
