import type { ExampleInputDescription } from '@/core/types';
import { registerExamples } from '../register';
import data from './data.json';
import schema from './schema.json';

export const input: ExampleInputDescription = { schema, data };

registerExamples([
  {
    name: 'any-of-simple',
    label: 'Combinators anyOf simple',
    input,
  },
]);
