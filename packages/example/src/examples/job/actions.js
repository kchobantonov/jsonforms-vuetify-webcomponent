//import type { ActionEvent } from '@chobantonov/jsonforms-vuetify-renderers';

const changeLang = (event /*: ActionEvent*/) => {
  if (event.context.appStore) {
    // demo app
    event.context.appStore.jsonforms.locale = event.params.lang;
  } else if (event.$el.getRootNode() instanceof ShadowRoot) {
    // web component
    const form = event.$el.getRootNode() /*as ShadowRoot*/.host;
    if (form) {
      form.setAttribute('locale', event.params.lang);
    }
  }
};

const toggleDarkMode = (event) => {
  event.context.vuetify.dark = !event.context.vuetify.dark;
};

export const onHandleAction = (customEvent) => {
  let [event /*: ActionEvent*/] = customEvent.detail;
  if (event.action === 'changeLang') {
    event.callback = changeLang;
  } else if (event.action === 'toggleDarkMode') {
    event.callback = toggleDarkMode;
  }
};
