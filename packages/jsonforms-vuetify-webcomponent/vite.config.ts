import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import vueJsx from '@vitejs/plugin-vue-jsx';
//import VueDevTools from 'vite-plugin-vue-devtools';
// needed for json-refs
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { resolve } from 'node:path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // Use relative paths for assets
  optimizeDeps: {
    // Exclude vuetify since it has an issue with vite dev - TypeError: makeVExpansionPanelTextProps is not a function - the makeVExpansionPanelTextProps is used before it is defined
    exclude: ['vuetify'],
  },
  plugins: [
    visualizer(),
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
    minify: true,
    sourcemap: true, // generates sourcemap files
    rollupOptions: {
      input: resolve(__dirname, 'src/web-component.ts'), // Specify the entry point here
      output: {
        entryFileNames: 'vuetify-json-forms.js', // Set the output file name
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks(id) {
          // Check if the module is inside node_modules
          if (id.includes('node_modules') && !id.includes('monaco-editor')) {
            // Extract the package name (considering scoped packages as well)
            let packageName = id.split('node_modules/').pop()!.split('/')[0];

            // Handle scoped packages like @vue/cli
            if (packageName.startsWith('@')) {
              packageName = packageName.replace('@', '').replace(/[\\/]/, '_');
            }

            // Remove version information from package name
            packageName = packageName.replace(/@[^/]+$/, '');

            // Return the custom chunk name based on the package name
            return `npm.${packageName}`;
          }

          // Return null for other modules, keeping them in the main chunk
          return null;
        },
        chunkFileNames: (chunkInfo) => {
          let name = chunkInfo.name;

          if (!chunkInfo.isDynamicEntry) {
            // Extract package name from the module path
            let packageName = chunkInfo.name.split('/').pop();

            // Handle scoped packages like @vue/cli
            if (packageName && packageName.startsWith('@')) {
              packageName = packageName
                .replace('@', '') // Remove '@'
                .replace(/[\\/]/, '_'); // Replace '/' with '_'
            }

            // Remove version information (anything after the '@')
            packageName = packageName?.replace(/@[^/]+$/, '');

            // Return the final chunk name
            name = packageName ?? name;
          }

          return `chunks/${name}-[hash].js`; // Default naming if name is undefined
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // support runtime compilation of Vue components
      vue: 'vue/dist/vue.esm-bundler.js',
      'vuetify/labs/VNumberInput': 'vuetify/components/VNumberInput',
    },
  },
});
