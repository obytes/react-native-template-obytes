// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const MetroSymlinksResolver = require('@rnx-kit/metro-resolver-symlinks');

// config for expo, with MetroSymlinkResolver this works with pnpm monorepo
const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);
config.resolver.resolveRequest = MetroSymlinksResolver();
module.exports = config;
