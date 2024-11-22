import {
  and,
  rankWith,
  uiTypeIs,
  type JsonFormsRendererRegistryEntry,
} from '@jsonforms/core';
import isEmpty from 'lodash/isEmpty';

import templateRenderer from './TemplateRenderer.vue';

export const hasName = (uischema: any) =>
  !isEmpty(uischema) && typeof uischema.name === 'string';

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: templateRenderer,
  tester: rankWith(2, and(uiTypeIs('Template'), hasName)),
};
