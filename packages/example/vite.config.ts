import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';

import vue from '@vitejs/plugin-vue';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import vueJsx from '@vitejs/plugin-vue-jsx';
//import VueDevTools from 'vite-plugin-vue-devtools';
// needed for json-refs
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { createHash } from 'crypto';

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
            .update((chunkInfo as any).code || '')
            .digest('hex')
            .slice(0, 20); // Slice the hash to make it shorter (optional)

          return `chunks/${moduleName}-${hash}.js`;
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
});
