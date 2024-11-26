import type { ExampleInputDescription } from '@/core/types';
import { registerExamples } from '../register';
import data from './data.json';
import i18n from './i18n.json';
import schema from './schema.json';
import uischema from './uischema.json';

export const input: ExampleInputDescription = { schema, uischema, data, i18n };

registerExamples([
  {
    name: 'file',
    label: 'File',
    input,
  },
]);
