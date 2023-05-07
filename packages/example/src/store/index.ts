/**
 * Vuetify Vue CLI Preset
 *
 * store/index.js
 *
 * vuex documentation: https://vuex.vuejs.org/
 */

// Vue
import Vue from 'vue';
import Vuex from 'vuex';
import { RootState } from './types';

// Utilities
// https://davestewart.github.io/vuex-pathify/#/
import pathify from '../plugins/vuex-pathify';

import vuexLocal from '../plugins/vuex-persist';

// Modules
// https://vuex.vuejs.org/guide/modules.html
import * as modules from './modules';

Vue.use(Vuex);

export default new Vuex.Store<RootState>({
  //strict: process.env.NODE_ENV !== 'production',
  modules,
  mutations: {
    RESTORE_MUTATION: (state: RootState, savedState?: RootState) => {
      // this mutation **MUST** be named "RESTORE_MUTATION"
      state.app.vuetify.theme.dark =
        savedState?.app?.vuetify.theme.dark || false;
    },
  },
  plugins: [pathify.plugin, vuexLocal.plugin],
});

// A reusable const for making root commits and dispatches
// https://vuex.vuejs.org/guide/modules.html#accessing-global-assets-in-namespaced-modules
export const ROOT_DISPATCH = Object.freeze({ root: true });
