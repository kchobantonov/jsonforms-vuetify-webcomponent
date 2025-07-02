import {
  rankWith,
  uiTypeIs,
  type JsonFormsRendererRegistryEntry,
} from '@jsonforms/core';

import splitLayoutRenderer from './SplitLayoutRenderer.vue';
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: splitLayoutRenderer,
  tester: rankWith(2, uiTypeIs('SplitLayout')),
};
