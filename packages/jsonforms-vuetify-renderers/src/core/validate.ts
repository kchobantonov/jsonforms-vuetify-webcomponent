import { createAjv as createDefaultAjv } from '@jsonforms/vue-vuetify';
import type { Options } from 'ajv';
import { enableErrorTranslations } from './ajv-i18n';
import { ajvKeywords } from './keywords';
import type { ComputedRef, MaybeRef } from 'vue';

export const createAjv = (
  locale: MaybeRef<string | undefined> | ComputedRef<string | undefined>,
) => {
  const options: Options = {
    useDefaults: true,
    $data: true,
    discriminator: true,
    addUsedSchema: false,
  };

  const ajv = createDefaultAjv(options);
  enableErrorTranslations(ajv, locale);

  ajvKeywords(ajv);

  return ajv;
};
