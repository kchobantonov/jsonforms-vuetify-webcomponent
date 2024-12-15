// keep the JS version of the actions file so that it can be used as a demo for the vscode extension
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

export const onHandleAction = (
  customEvent /*: ActionEvent | CustomEvent */,
) => {
  // if the event is sent via webcomponent then it will be of type CustomEvent otherwise it will be ActionEvent
  const event =
    customEvent instanceof CustomEvent ? customEvent.detail[0] : customEvent;

  if (event.action === 'changeLang') {
    event.callback = changeLang;
  } else if (event.action === 'toggleDarkMode') {
    event.callback = toggleDarkMode;
  }
};
