import {
  and,
  isStringControl,
  rankWith,
  schemaMatches,
  uiTypeIs,
  type JsonFormsRendererRegistryEntry,
  type JsonSchema,
} from '@jsonforms/core';

import fileRenderer from './FileRenderer.vue';

export const isBase64String = and(
  uiTypeIs('Control'),
  isStringControl,
  schemaMatches((schema) => {
    const s = schema as JsonSchema & {
      contentEncoding?: string;
    };

    return (
      s.contentEncoding === 'base64' ||
      s.format === 'binary' ||
      s.format === 'byte'
    );
  }),
);

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: fileRenderer,
  tester: rankWith(2, isBase64String),
};
