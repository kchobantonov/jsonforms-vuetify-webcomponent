import type { ExampleInputDescription } from '@/core/types';
import data from './data.json';
import i18n from './i18n.json';
import schema from './schema.json';
import uischema from './uischema.json';
import uischemas from './uischemas.json';
import { NOT_APPLICABLE } from '@jsonforms/core';

export const input: ExampleInputDescription = {
  schema,
  uischema,
  i18n,
  uischemas: uischemas.map((item) => ({
    ...item,
    tester: (jsonSchema, schemaPath, path) => {
      return NOT_APPLICABLE;
    },
  })),
  data,
};
