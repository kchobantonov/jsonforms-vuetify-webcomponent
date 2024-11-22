import {
  and,
  isStringControl,
  rankWith,
  schemaMatches,
  uiTypeIs,
  type JsonFormsRendererRegistryEntry,
} from '@jsonforms/core';

import fileRenderer from './FileRenderer.vue';

export const isBase64String = and(
  uiTypeIs('Control'),
  isStringControl,
  schemaMatches(
    (schema) =>
      (Object.prototype.hasOwnProperty.call(schema, 'contentEncoding') &&
        (schema as any).contentEncoding == 'base64') ||
      schema.format === 'binary' ||
      schema.format === 'byte',
  ),
);

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: fileRenderer,
  tester: rankWith(2, isBase64String),
};
