import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import vueJsx from '@vitejs/plugin-vue-jsx';
//import VueDevTools from 'vite-plugin-vue-devtools';
// needed for json-refs
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { resolve } from 'node:path';
import { createHash } from 'crypto';

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
      formats: ['es'],
      fileName: (format: string) => {
        if (format === 'es') {
          format = 'esm';
        }
        return `vuetify-json-forms.${format}.js`;
      },
    },
    minify: true,
    sourcemap: true, // generates sourcemap files
    rollupOptions: {
      output: {
        chunkFileNames: (chunkInfo) => {
          // Use the npm module name or file name for the chunk
          let moduleName = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').slice(-2).join('_')
            : chunkInfo.name;
          if (moduleName.endsWith('.js')) {
            moduleName = moduleName.substring(
              0,
              moduleName.length - '.js'.length,
            );
          }
          // Create an MD5 hash of the chunk content for cache-busting
          const hash = createHash('md5')
            .update(chunkInfo.code || '')
            .digest('hex')
            .slice(0, 20); // Slice the hash to make it shorter (optional)

          return `chunks/${moduleName}-${hash}.js`;
        },
        assetFileNames: (assetInfo) => {
          // Create an MD5 hash of the asset content for cache-busting
          const hash = createHash('md5')
            .update(assetInfo.source || '')
            .digest('hex')
            .slice(0, 20);

          return `assets/${assetInfo.name}-${hash}[extname]`;
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // support runtime compilation of Vue components
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});
