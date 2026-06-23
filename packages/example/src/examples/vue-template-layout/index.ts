import type { ExampleInputDescription } from '@/core/types';
import { registerExamples } from '../register';
import { onHandleAction } from './actions';
import data from './data.json';
import i18n from './i18n.json';
import schema from './schema.json';
import uischema from './uischema.json';
import config from './config.json';

export const input: ExampleInputDescription = {
  schema,
  uischema,
  data,
  i18n,
  onHandleAction,
  config,
};

registerExamples([
  {
    name: 'vue-template-layout',
    label: 'Vue Template Layout',
    input,
  },
]);
