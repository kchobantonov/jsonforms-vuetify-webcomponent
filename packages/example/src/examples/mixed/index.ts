import type { ExampleInputDescription } from '@/core/types';
import { registerExamples } from '../register';
import schema from './schema.json';
import uischema from './uischema.json';

export const input: ExampleInputDescription = { schema, uischema };

registerExamples([
  {
    name: 'mixed',
    label: 'Mixed',
    input,
  },
]);
