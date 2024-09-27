import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import vueJsx from '@vitejs/plugin-vue-jsx';
//import VueDevTools from 'vite-plugin-vue-devtools';
// needed for json-refs
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { resolve } from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    // Exclude vuetify since it has an issue with vite dev - TypeError: makeVExpansionPanelTextProps is not a function - the makeVExpansionPanelTextProps is used before it is defined
    exclude: ['vuetify'],
  },
  plugins: [
    vue({
      template: { transformAssetUrls },
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
  ],
  build: {
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'src/web-component.ts'),
      name: 'vuetify-json-forms',
      formats: ['es', 'cjs'],
      fileName: (format: string) => {
        if (format === 'es') {
          format = 'esm';
        }
        return `vuetify-json-forms.${format}.js`;
      },
    },
    minify: true,
    sourcemap: true, // generates sourcemap files
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    //'process.env.NODE_ENV': JSON.stringify('production'),
  },
});
