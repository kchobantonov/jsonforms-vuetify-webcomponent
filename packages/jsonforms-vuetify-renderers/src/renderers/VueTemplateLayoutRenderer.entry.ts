import {
  and,
  rankWith,
  uiTypeIs,
  type JsonFormsRendererRegistryEntry,
  type JsonSchema,
  type Tester,
  type TesterContext,
  type UISchemaElement,
} from '@jsonforms/core';

import vueTemplateLayoutRenderer from './VueTemplateLayoutRenderer.vue';
export const langIs =
  (expected: string): Tester =>
  (
    uischema: UISchemaElement & { lang?: string },
    schema: JsonSchema,
    context: TesterContext,
  ): boolean => {
    return (
      uischema.lang === expected ||
      (uischema.lang === undefined &&
        context.config &&
        context.config.defaultTemplateLang === expected)
    );
  };

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: vueTemplateLayoutRenderer,
  tester: rankWith(2, and(uiTypeIs('TemplateLayout'), langIs('vue'))),
};
