import type { ExampleInputDescription } from '@/core/types';
import { registerExamples } from '../register';
import data from './data.json';
import schema from './schema.json';
import uischema from './uischema.json';

export const input: ExampleInputDescription = { schema, uischema, data };

registerExamples([
  {
    name: 'nested-layout',
    label: 'Nested Layout',
    input,
  },
]);
