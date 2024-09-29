import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import vueJsx from '@vitejs/plugin-vue-jsx';
//import VueDevTools from 'vite-plugin-vue-devtools';
// needed for json-refs
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    // Exclude vuetify since it has an issue with vite dev - TypeError: makeVExpansionPanelTextProps is not a function - the makeVExpansionPanelTextProps is used before it is defined
    exclude: ['vuetify'],
  },
  plugins: [
    vue({
      template: {
        transformAssetUrls,
        compilerOptions: {
          isCustomElement: (tag) => tag === 'vuetify-json-forms',
        },
      },
    }),
    vuetify(),
    vueJsx(),
    //VueDevTools(),
    // needed for json-refs
    nodePolyfills({
      include: ['path', 'querystring'],
      globals: {
        process: true,
      },
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@chobantonov/jsonforms-vuetify-webcomponent/dist/*', // Source path
          dest: 'js', // Target directory
        },
      ],
    }),
  ],
  build: {
    minify: true,
    sourcemap: true, // generates sourcemap files
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },
});
