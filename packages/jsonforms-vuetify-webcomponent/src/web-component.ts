import { type App, defineCustomElement } from 'vue';
import VuetifyJsonForms from './web-components/VuetifyJsonForms.ce.vue';

import LoadScript from 'vue-plugin-load-script';
import buildVuetify from './plugins/vuetify';

import { styles } from './styles';

import './monaco-setup';

import { renderers } from './renderers';
for (const entry of renderers) {
  // hack to make sure that vite do not remove the render function
  if (entry.render) {
  }
}

const VuetifyJsonFormsElement = defineCustomElement(VuetifyJsonForms, {
  shadowRoot: true, // Ensure shadow DOM is used
  configureApp: (app: App) => {
    app.use(buildVuetify());
    app.use(LoadScript);
  },
  styles,
});

customElements.define('vuetify-json-forms', VuetifyJsonFormsElement);
