// Metro config for Expo monorepo — forces single React copy
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');
const mobileNodeModules = path.resolve(projectRoot, 'node_modules');

const config = getDefaultConfig(projectRoot);

// Watch the full monorepo
config.watchFolders = [monorepoRoot];

// Packages that MUST come from mobile's node_modules (not root)
const forcedLocal = ['react', 'react-native', 'react-dom'];

// Override the resolver to intercept react imports
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Force react/react-native to resolve from mobile node_modules
  for (const pkg of forcedLocal) {
    if (moduleName === pkg || moduleName.startsWith(pkg + '/')) {
      const localPath = path.resolve(mobileNodeModules, moduleName);
      
      // Check if exact file exists
      if (fs.existsSync(localPath)) {
        const stat = fs.statSync(localPath);
        if (stat.isFile()) {
          return { type: 'sourceFile', filePath: localPath };
        }
        // Directory — look for index
        for (const ext of ['.js', '.ts', '.tsx', '.jsx']) {
          const idx = path.join(localPath, 'index' + ext);
          if (fs.existsSync(idx)) return { type: 'sourceFile', filePath: idx };
        }
      }
      
      // Try with extensions
      for (const ext of ['.js', '.ts', '.tsx', '.jsx', '.json']) {
        const withExt = localPath + ext;
        if (fs.existsSync(withExt)) return { type: 'sourceFile', filePath: withExt };
      }
    }
  }
  
  // Default resolution for everything else
  return context.resolveRequest(context, moduleName, platform);
};

// Also set nodeModulesPaths so non-intercepted packages check mobile first
config.resolver.nodeModulesPaths = [
  mobileNodeModules,
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = config;
