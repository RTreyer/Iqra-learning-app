const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// Block native-only / build-tool packages that Metro cannot bundle
// and that cause ENOENT errors when their temp files disappear after install.
const BLOCK_LIST_PATTERNS = [
  // @napi-rs packages create tmp files during install that vanish immediately
  /node_modules[/\\]\.pnpm[/\\]@napi-rs[^/\\]*/,
  /node_modules[/\\]@napi-rs[/\\]/,
  // expo-updates / expo-structured-headers write _tmp_ dirs during pnpm install
  // that disappear immediately, causing Metro ENOENT watcher crashes
  /node_modules[/\\]\.pnpm[/\\]expo-structured-headers[^/\\]*[/\\]node_modules[/\\]expo-structured-headers_tmp_/,
  // Prevent Metro from watching transient agent-skills directories
  /\.local[/\\]skills[/\\]/,
];

config.resolver = {
  ...config.resolver,
  blockList: BLOCK_LIST_PATTERNS,
};

module.exports = config;
