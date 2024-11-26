import type { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { registerExamples } from '../register';
import data from './data.json';
import i18n from './i18n.json';
import schema from './schema.json';
import uischema from './uischema.json';

export const input: {
  schema: JsonSchema;
  uischema: UISchemaElement;
  data: any;
  i18n: any;
} = { schema, uischema, data, i18n };

registerExamples([
  {
    name: 'additional-properties',
    label: 'Additional Properties',
    input,
  },
]);
