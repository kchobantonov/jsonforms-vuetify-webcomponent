const HtmlWebpackPlugin = require('html-webpack-plugin');

const fs = require('fs');
const path = require('path');

const data = require('./src/example/data.json');
const schema = require('./src/example/schema.json');
const uischema = require('./src/example/uischema.json');
const uischemas = require('./src/example/uischemas.json');
const preset = require('./src/example/preset.json');
const config = require('./src/example/config.json');
const uidata = require('./src/example/uidata.json');
const i18n = require('./src/example/i18n.json');
const style = fs
  .readFileSync(path.join(__dirname, './src/example/user-style.css'))
  .toString();
const actions = fs
  .readFileSync(path.join(__dirname, './src/example/actions.js'))
  .toString();

module.exports = {
  parallel: false,
  configureWebpack: {
    optimization: {
      splitChunks: {
        chunks: 'async',
        maxInitialRequests: Infinity,
        minSize: 0,
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
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'demo.html',
        minify: false,
        templateContent: `
        <meta charset="utf-8">
        <title>vuetify-json-forms demo</title>
        
        <style>
          /* # =================================================================
            # Global selectors
            # ================================================================= */
          html {
            box-sizing: border-box;
            overflow-y: scroll;
            /* All browsers without overlaying scrollbars */
            -webkit-text-size-adjust: 100%;
            /* Prevent adjustments of font size after orientation changes in iOS */
            word-break: normal;
            -moz-tab-size: 4;
            tab-size: 4;
          }
          
          *,
          ::before,
          ::after {
            background-repeat: no-repeat;
            /* Set background-repeat: no-repeat to all elements and pseudo elements */
            box-sizing: inherit;
          }
          
          ::before,
          ::after {
            text-decoration: inherit;
            /* Inherit text-decoration and vertical align to ::before and ::after pseudo elements */
            vertical-align: inherit;
          }
          
          * {
            padding: 0;
            /* Reset padding and margin of all elements */
            margin: 0;
          }
        </style>

        <script type="text/javascript">
  
        const data = ${JSON.stringify(data)};
        const schema = ${JSON.stringify(schema)};
        const uischema = ${JSON.stringify(uischema)};
        const uischemas = ${JSON.stringify(uischemas)};
        const config = ${JSON.stringify(config)};
        const preset = ${JSON.stringify(preset)};
        const i18n = ${JSON.stringify(i18n)}; 
        const uidata = ${JSON.stringify(uidata)}; 
        const style = ${'`' + style + '`'}; 

        ${actions
          .replace(/export const /g, 'const ')
          .replace(/export let /g, 'let ')}

        let actionsAsString = {}
        Object.keys(actions).forEach((key) => {
          actionsAsString[key] = actions[key].toString();
        });
      </script>
  
      <vuetify-json-forms id="vuetify-json-forms">
      </vuetify-json-forms>
  
      <script>
        let form = document.getElementById('vuetify-json-forms');

        form.setAttribute('custom-style', style);
        form.setAttribute('data', JSON.stringify(data));
        form.setAttribute('schema', JSON.stringify(schema));
        form.setAttribute('uischema', JSON.stringify(uischema));
        form.setAttribute('uischemas', JSON.stringify(uischemas));        
        form.setAttribute('uidata', JSON.stringify(uidata));
        form.setAttribute('config', JSON.stringify(config));
        form.setAttribute('translations', JSON.stringify(i18n));
        form.setAttribute('default-preset', JSON.stringify(preset));
        form.setAttribute('actions', JSON.stringify(actionsAsString));

        form.addEventListener('change', onChange);
      </script>`,
      }),
    ],
  },
  chainWebpack: (config) => {
    // remove typecheck
    config.plugins.delete('fork-ts-checker');

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
