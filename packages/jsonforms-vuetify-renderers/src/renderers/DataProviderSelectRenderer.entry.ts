import {
  and,
  isStringControl,
  optionIs,
  rankWith,
  type JsonFormsRendererRegistryEntry,
} from '@jsonforms/core';

import dataProviderSelectRenderer from './DataProviderSelectRenderer.vue';
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: dataProviderSelectRenderer,
  tester: rankWith(
    11,
    and(isStringControl, optionIs('variant', 'data-provider-select')),
  ),
};
