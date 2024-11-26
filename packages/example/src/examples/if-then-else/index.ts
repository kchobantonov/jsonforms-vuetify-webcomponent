import type { ExampleInputDescription } from '@/core/types';
import { registerExamples } from '../register';
import data from './data.json';
import schema from './schema.json';

const uischema = undefined;
export const input: ExampleInputDescription = { schema, uischema, data };

registerExamples([
  {
    name: 'if-then-else',
    label: 'If Then Else',
    input,
  },
]);
