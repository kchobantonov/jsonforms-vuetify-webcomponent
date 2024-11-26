import type { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { registerExamples } from '../register';
import data from './data.json';
import schema from './schema.json';

const uischema = undefined;

export const input: {
  schema: JsonSchema;
  uischema?: UISchemaElement;
  data: any;
} = { schema, uischema, data };

registerExamples([
  {
    name: 'one-of-with-props',
    label: 'Combinators oneOf with props',
    input,
  },
]);
