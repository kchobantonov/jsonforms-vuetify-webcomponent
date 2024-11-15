import type { ActionEvent } from '@chobantonov/jsonforms-vuetify-renderers';

const changeLang = (event: ActionEvent) => {
  if (event.context.appStore) {
    event.context.appStore.jsonforms.locale = event.params.lang;
  }
};

export const onHandleAction = (event: ActionEvent) => {
  if (event.action === 'changeLang') {
    event.callback = changeLang;
  }
};
