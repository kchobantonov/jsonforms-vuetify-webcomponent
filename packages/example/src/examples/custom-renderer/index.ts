import type { ExampleInputDescription } from '@/core/types';
import { registerExamples } from '../register';
import { entry as customArrayRendererEntry } from './CustomArrayRenderer.vue';
import data from './data.json';
import schema from './schema.json';
import uischema from './uischema.json';
import type { StateProps } from '@jsonforms/examples';

const actions = [
  {
    label: 'Register Custom Renderer',
    apply: (props: StateProps) => {
      const alreadyRegistered = props.renderers.some(
        (r) => r === customArrayRendererEntry,
      );

      return {
        ...props,
        renderers: alreadyRegistered
          ? props.renderers
          : [...props.renderers, customArrayRendererEntry],
      };
    },
  },
  {
    label: 'Deregister Custom Renderer',
    apply: (props: StateProps) => {
      return {
        ...props,
        renderers: [
          ...props.renderers.filter((r) => r !== customArrayRendererEntry),
        ],
      };
    },
  },
];

export const input: ExampleInputDescription = {
  schema,
  uischema,
  data,
  actions,
};

registerExamples([
  {
    name: 'custom-renderer',
    label: 'Custom Renderer',
    input,
  },
]);
