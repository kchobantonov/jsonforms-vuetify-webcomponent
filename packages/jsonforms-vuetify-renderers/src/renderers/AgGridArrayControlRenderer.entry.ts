import {
  and,
  optionIs,
  rankWith,
  schemaTypeIs,
  uiTypeIs,
  type JsonFormsRendererRegistryEntry,
} from '@jsonforms/core';
import controlRenderer from './AgGridArrayControlRenderer.vue';

export const isArrayControl = and(uiTypeIs('Control'), schemaTypeIs('array'));

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(4, and(optionIs('variant', 'ag-grid'), isArrayControl)),
};
