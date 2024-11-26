import type { ExampleInputDescription } from '@/core/types';
import { NOT_APPLICABLE } from '@jsonforms/core';
import { registerExamples } from '../register';
import data from './data.json';
import schema from './schema.json';
import uischema from './uischema.json';
import uischemas from './uischemas.json';

export const input: ExampleInputDescription = {
  schema,
  uischema,
  uischemas: uischemas.map((item) => ({
    ...item,
    tester: (jsonSchema, schemaPath, path) => {
      return NOT_APPLICABLE;
    },
  })),
  data,
};

registerExamples([
  {
    name: 'template-slot',
    label: 'Template/Slot Layout',
    input,
  },
]);
