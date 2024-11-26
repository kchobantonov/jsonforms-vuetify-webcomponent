import type { ExampleInputDescription } from '@/core/types';
import { registerExamples } from '../register';
import data from './data.json';
import schema from './schema.json';

export const input: ExampleInputDescription = { schema, data };

registerExamples([
  {
    name: 'no-ui-schema',
    label: 'Generate UI Schema',
    input,
  },
]);
