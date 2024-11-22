import { createAjv as createDefaultAjv } from '@jsonforms/vue-vuetify';
import type { Options } from 'ajv';
import { ajvTranslations } from './ajv-i18n';
import { ajvKeywords } from './keywords';
import ajvErrors from 'ajv-errors';
import { markRaw, type ComputedRef, type MaybeRef } from 'vue';
import type { JsonFormsI18nState } from '@jsonforms/core';

export const createAjv = (
  i18n:
    | MaybeRef<JsonFormsI18nState | undefined>
    | ComputedRef<JsonFormsI18nState | undefined>,
) => {
  const options: Options = {
    useDefaults: true,
    $data: true,
    discriminator: true,
  };

  const ajv = createDefaultAjv(options);

  ajvKeywords(ajv);
  ajvErrors(ajv);

  ajvTranslations(ajv, { i18n });

  // when ajv is used in component properties do not make it reactive
  return markRaw(ajv);
};
