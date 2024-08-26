import type { ExampleInputDescription } from '@/core/types';
import data from './data.json';
import schema from './schema.json';
import uischema from './uischema.json';
import uischemas from './uischemas.json';
import { NOT_APPLICABLE } from '@jsonforms/core';

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
