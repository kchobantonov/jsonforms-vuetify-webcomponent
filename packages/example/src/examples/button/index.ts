import type { ExampleInputDescription } from '@/core/types';
import { registerExamples } from '../register';
import { onHandleAction } from './actions';
import data from './data.json';
import schema from './schema.json';
import uischema from './uischema.json';

export const input: ExampleInputDescription = {
  schema,
  uischema,
  data,
  onHandleAction,
};

registerExamples([
  {
    name: 'button',
    label: 'Button',
    input,
  },
]);
