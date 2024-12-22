import type { JsonFormsI18nState } from '@jsonforms/core';
import { createAjv as createDefaultAjv } from '@jsonforms/vue-vuetify';
import type { Options } from 'ajv';
import ajvErrors from 'ajv-errors';
import { markRaw, type ComputedRef, type Ref } from 'vue';
import { ajvTranslations } from './ajv-i18n';
import { ajvKeywords } from './keywords';

export const createAjv = (
  i18n?:
    | Ref<JsonFormsI18nState | undefined>
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
