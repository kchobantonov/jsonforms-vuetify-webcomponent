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

export const onHandleAction = (event /*: ActionEvent*/) => {
  if (event.action === 'changeLang') {
    event.callback = changeLang;
  }
};
