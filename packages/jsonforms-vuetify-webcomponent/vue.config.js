const HtmlWebpackPlugin = require('html-webpack-plugin');

const fs = require('fs');
const path = require('path');
const example = './src/examples/basic';

const data = require(`${example}/data.json`);
const schema = require(`${example}/schema.json`);
const uischema = require(`${example}/uischema.json`);
const uischemas = require(`${example}/uischemas.json`);
const preset = require(`${example}/preset.json`);
const config = require(`${example}/config.json`);
const uidata = require(`${example}/uidata.json`);
const i18n = require(`${example}/i18n.json`);
const style = fs
  .readFileSync(path.join(__dirname, `${example}/style.css`))
  .toString();
const actions = fs
  .readFileSync(path.join(__dirname, `${example}/actions.js`))
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
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width,initial-scale=1" />
            <meta name="theme-color" content="#023246">
            <meta name="description" content="vuetify-json-forms demo">
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
          </head>
          <body>
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
              ${actions}
            </script>
      
            <vuetify-json-forms id="vuetify-json-forms">
            </vuetify-json-forms>
        
            <script>
              let form = document.getElementById('vuetify-json-forms');

              if (style) {
                form.setAttribute('custom-style', style);
              }
              if (data) {
                form.setAttribute('data', JSON.stringify(data));
              }
              if (schema) {
                form.setAttribute('schema', JSON.stringify(schema));
              }
              if (uischema) {
                form.setAttribute('uischema', JSON.stringify(uischema));
              }
              if (uischemas) {
                form.setAttribute('uischemas', JSON.stringify(uischemas));
              }
              if (uidata) {
                form.setAttribute('uidata', JSON.stringify(uidata));
              }
              if (config) {
                form.setAttribute('config', JSON.stringify(config));
              }
              if (i18n) {
                form.setAttribute('translations', JSON.stringify(i18n));
              }
              if (preset) {
                form.setAttribute('default-preset', JSON.stringify(preset));
              }
          
              if (onChange) {
                form.addEventListener('change', onChange);
              }
              if (onHandleAction) {
                form.addEventListener('handle-action', onHandleAction);
              }
            </script>
          </body>
        </html>  
        `,
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
