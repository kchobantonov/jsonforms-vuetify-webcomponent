const fs = require('fs');
const replace = require('replace-in-file');

const node_modules_path = '../../node_modules';

(async () => {
  await replace({
    files: `${node_modules_path}/@vue/cli-service/lib/commands/build/resolveWcConfig.js`,
    from: 'chunkFilename: `${libName}.[name]${minify ? `.min` : ``}.js`,',
    to: 'chunkFilename: `${libName}.[name].[contenthash]${minify ? `.min` : ``}.js`,',
  });
})();
