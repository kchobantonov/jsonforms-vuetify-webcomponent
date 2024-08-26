import {
  createApp,
  defineCustomElement,
  getCurrentInstance,
  h,
  Plugin,
} from 'vue';
import VuetifyJsonForms from './web-components/VuetifyJsonForms.ce.vue';

import buildVuetify from './plugins/vuetify';
import LoadScript from 'vue-plugin-load-script';

createApp(VuetifyJsonForms).use(buildVuetify());

const registerCustomElement = (component, { plugins = [] as Plugin[] } = {}) =>
  defineCustomElement({
    styles: component.styles, // <- this
    render: () => h(component),
    setup() {
      const app = createApp();

      // install plugins
      plugins.forEach(app.use);

      const inst = getCurrentInstance();
      Object.assign(inst!.appContext, app._context);
      //Object.assign(inst!.provides, app._context.provides);
    },
  });

export function register(tagName = 'vuetify-json-forms') {
  customElements.define(
    tagName,
    registerCustomElement(VuetifyJsonForms, {
      plugins: [buildVuetify(), LoadScript as Plugin],
    }),
  );
}
