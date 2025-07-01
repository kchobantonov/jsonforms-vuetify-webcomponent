import type { ExampleInputDescription } from '@/core/types';
import { registerExamples } from '../register';
import schema from './schema.json';
import uischema from './uischema.json';
import config from './config.json';

export const input: ExampleInputDescription = { schema, uischema, config };

registerExamples([
  {
    name: 'mixed',
    label: 'Mixed',
    input,
  },
]);
