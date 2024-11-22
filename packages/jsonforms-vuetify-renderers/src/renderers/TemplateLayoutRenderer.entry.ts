import {
  rankWith,
  uiTypeIs,
  type JsonFormsRendererRegistryEntry,
} from '@jsonforms/core';

import templateLayoutRenderer from './TemplateLayoutRenderer.vue';
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: templateLayoutRenderer,
  tester: rankWith(2, uiTypeIs('TemplateLayout')),
};
