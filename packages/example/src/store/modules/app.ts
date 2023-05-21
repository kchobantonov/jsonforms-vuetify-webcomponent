// Pathify
import { make } from 'vuex-pathify';
import { AppState } from './types';
import { RootState } from '../types';
import { Module } from 'vuex';
import { createAjv } from '@jsonforms/vue2-vuetify';
import { vuetifyRenderers } from '@chobantonov/jsonforms-vuetify-renderers';

const ajv = createAjv({ useDefaults: true });

// Data
const state: AppState = {
  drawer: null,
  vuetify: {
    theme: {
      dark: false,
    },
  },
  jsonforms: {
    readonly: false,
    validationMode: 'ValidateAndShow',
    config: {
      restrict: true,
      trim: false,
      showUnfocusedDescription: false,
      hideRequiredAsterisk: true,
      collapseNewItems: false,
      breakHorizontal: false,
      initCollapsed: false,
      hideAvatar: false,
      hideArraySummaryValidation: false,
    },
    renderers: vuetifyRenderers,
    cells: vuetifyRenderers,
    ajv,
    locale: 'en',
  },
  monaco: {
    schemaModel: undefined,
    uischemaModel: undefined,
    uischemasModel: undefined,
    dataModel: undefined,
    i18nModel: undefined,
  },
};

const mutations = make.mutations(state);

const actions = make.actions(state);

const getters = {};

const app: Module<AppState, RootState> = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};

export default app;
