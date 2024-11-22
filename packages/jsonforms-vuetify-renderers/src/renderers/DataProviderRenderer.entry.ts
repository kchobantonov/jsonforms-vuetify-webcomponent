import {
  rankWith,
  uiTypeIs,
  type JsonFormsRendererRegistryEntry,
} from '@jsonforms/core';

import dataProviderRenderer from './DataProviderRenderer.vue';
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: dataProviderRenderer,
  tester: rankWith(1, uiTypeIs('DataProvider')),
};
