import type { ExampleInputDescription } from '@/core/types';
import { registerExamples } from '../register';
import { entry as customArrayRendererEntry } from './CustomArrayRenderer.vue';
import data from './data.json';
import schema from './schema.json';
import uischema from './uischema.json';

export const input: ExampleInputDescription = {
  schema,
  uischema,
  data,
  renderers: [customArrayRendererEntry],
};

registerExamples([
  {
    name: 'custom-renderer',
    label: 'Custom Renderer',
    input,
  },
]);
