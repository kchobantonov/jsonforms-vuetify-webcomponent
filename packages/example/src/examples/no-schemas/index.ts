import type { ExampleInputDescription } from '@/core/types';
import { registerExamples } from '../register';
import data from './data.json';

export const input: ExampleInputDescription = { data };

registerExamples([
  {
    name: 'no-schemas',
    label: 'Generate Both Schemas',
    input,
  },
]);
