const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  parallel: false,
  configureWebpack: {
    optimization: {
      splitChunks: {
        chunks: 'all',
        minSize: 10000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )[1];
              return `npm.${packageName.replace('@', '')}`;
            },
          },
        },
      },
    },
  },
  chainWebpack: (config) => {
    // remove typecheck
    config.plugins.delete('fork-ts-checker');

    config.plugin('copy').use(CopyPlugin, [
      {
        patterns: [
          {
            context:
              'node_modules/@chobantonov/jsonforms-vuetify-webcomponent/dist/',
            from: '*.min.js*',
            to: './js',
            noErrorOnMissing: true,
          },
          {
            context:
              'node_modules/@chobantonov/jsonforms-vuetify-webcomponent/dist/fonts',
            from: '*',
            to: './js/fonts',
          },
        ],
      },
    ]);
    config.plugin('monaco-editor').use(MonacoWebpackPlugin, [
      {
        // Languages are loaded on demand at runtime
        languages: ['json'],
      },
    ]);

    return config;
  },
  devServer: {
    watchOptions: {
      ignored: ['node_modules'],
      poll: true,
    },
  },
  transpileDependencies: ['vuetify', '@jsonforms/core', '@jsonforms/vue2'],
};
