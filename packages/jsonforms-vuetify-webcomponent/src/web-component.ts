import { type App, defineCustomElement } from 'vue';
import VuetifyJsonForms from './web-components/VuetifyJsonForms.ce.vue';

import LoadScript from 'vue-plugin-load-script';
import buildVuetify from './plugins/vuetify';

import { styles } from './styles';

const VuetifyJsonFormsElement = defineCustomElement(VuetifyJsonForms, {
  shadowRoot: true, // Ensure shadow DOM is used
  configureApp: (app: App) => {
    // provide dummy usehead to disable injection of theme css with id vuetify-theme-stylesheet
    app.provide('usehead', {
      push(getHead: () => {}) {
        return {
          patch(getHead: () => {}) {},
        };
      },
    });
    app.use(buildVuetify());
    app.use(LoadScript);
  },
  styles,
});

if (!customElements.get('vuetify-json-forms')) {
  customElements.define('vuetify-json-forms', VuetifyJsonFormsElement);
}
