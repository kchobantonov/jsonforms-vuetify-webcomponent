import type { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { registerExamples } from '../register';
import data from './data.json';
import schema from './schema.json';

export const input: {
  schema: JsonSchema;
  uischema?: UISchemaElement;
  data: any;
} = { schema, uischema: undefined, data };

registerExamples([
  {
    name: 'any-of-with-props',
    label: 'Combinators anyOf with props',
    input,
  },
]);
