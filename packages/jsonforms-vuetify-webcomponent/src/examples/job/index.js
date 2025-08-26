import actions from './actions.js';
import data from './data.json';
import i18n from './i18n.json';
import preset from './preset.json';
import schema from './schema.json';
import uischema from './uischema.json';
import uischemas from './uischemas.json';
import style from './style.css?inline';

export const input = {
  schema,
  uischema,
  i18n,
  preset: preset,
  uischemas: uischemas.map((item) => ({
    ...item,
    tester: (jsonSchema, schemaPath, path) => {
      return -1;
    },
  })),
  data,
  style,
  actions,
};
