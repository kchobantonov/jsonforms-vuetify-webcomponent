import type { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { registerExamples } from '../register';
import data from './data.json';
import schema from './schema.json';
import uischema from './uischema.json';

export const input: {
  schema: JsonSchema;
  uischema: UISchemaElement;
  data: any;
} = { schema, uischema, data };

registerExamples([
  {
    name: 'one-of-tab',
    label: 'Combinators oneOf tab',
    input,
  },
]);
