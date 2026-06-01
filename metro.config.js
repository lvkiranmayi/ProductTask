const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Disable package exports map resolution for Firebase packages.
// With exports enabled, Metro resolves @firebase/component to its ESM build
// (dist/esm/index.esm2017.js) for some imports and the CJS build for others,
// creating two separate module instances with two separate component registries.
// This produces the "Component auth has not been registered yet" error because
// registerAuth() writes to one registry while initializeAuth() reads from the other.
//
// With exports disabled, Metro falls back to the traditional react-native/main
// fields, which consistently return the CJS build for all Firebase packages.
config.resolver.unstable_enablePackageExports = false;

// Also pin all Firebase packages to the single root-level copies.
const rootNodeModules = path.resolve(__dirname, "node_modules");
config.resolver.extraNodeModules = {
  "firebase":                  path.join(rootNodeModules, "firebase"),
  "firebase/app":              path.join(rootNodeModules, "firebase/app"),
  "firebase/auth":             path.join(rootNodeModules, "firebase/auth"),
  "firebase/firestore":        path.join(rootNodeModules, "firebase/firestore"),
  "firebase/database":         path.join(rootNodeModules, "firebase/database"),
  "@firebase/app":             path.join(rootNodeModules, "@firebase/app"),
  "@firebase/auth":            path.join(rootNodeModules, "@firebase/auth"),
  "@firebase/firestore":       path.join(rootNodeModules, "@firebase/firestore"),
  "@firebase/database":        path.join(rootNodeModules, "@firebase/database"),
  "@firebase/component":       path.join(rootNodeModules, "@firebase/component"),
  "@firebase/util":            path.join(rootNodeModules, "@firebase/util"),
  "@firebase/logger":          path.join(rootNodeModules, "@firebase/logger"),
  "@firebase/auth-compat":     path.join(rootNodeModules, "@firebase/auth-compat"),
  "@firebase/app-compat":      path.join(rootNodeModules, "@firebase/app-compat"),
  "@firebase/webchannel-wrapper": path.join(rootNodeModules, "@firebase/webchannel-wrapper"),
};

module.exports = withNativeWind(config, { input: "./global.css" });
