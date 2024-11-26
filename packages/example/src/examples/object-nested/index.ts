import type { ExampleInputDescription } from '@/core/types';
import { registerExamples } from '../register';
import data from './data.json';
import schema from './schema.json';

export const input: ExampleInputDescription = {
  schema,
  uischema: undefined,
  data,
};

registerExamples([
  {
    name: 'object-nested',
    label: 'Object (Nested)',
    input,
  },
]);
