import {
  and,
  type JsonFormsRendererRegistryEntry,
  rankWith,
  schemaTypeIs,
  uiTypeIs,
} from '@jsonforms/core';
import controlRenderer from './NullControlRenderer.vue';

export const isNullControl = and(uiTypeIs('Control'), schemaTypeIs('null'));

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(1, isNullControl),
};
