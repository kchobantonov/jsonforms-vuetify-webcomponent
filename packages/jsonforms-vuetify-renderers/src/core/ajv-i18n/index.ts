import type { Ajv } from 'ajv';
import localize from 'ajv-i18n/localize';
import { unref, type ComputedRef, type MaybeRef } from 'vue';
import { localize_bg } from './bg';

function injectAdditionalLocales() {
  // add missing BG locale - https://github.com/ajv-validator/ajv-i18n/pull/312 until this is merged and released
  const bg = 'bg' as keyof typeof localize;
  if (!localize[bg]) {
    localize[bg] = localize_bg;
  }

  // override the required message so that the missingProperty is not displayed as not translated text
  localize[bg] = (errors) => {
    if (!(errors && errors.length)) return;

    localize_bg(errors);
    for (const e of errors) {
      if (e.keyword === 'required') {
        e.message = 'полето е задължително';
      }
    }
  };
}

export function enableErrorTranslations(
  ajv: Ajv,
  locale: MaybeRef<string | undefined> | ComputedRef<string | undefined>,
) {
  injectAdditionalLocales();

  const compileFunction = ajv.compile;
  ajv.compile = Object.assign(
    (...compileProps: Parameters<typeof compileFunction>) => {
      const validateFunction = compileFunction.apply(ajv, compileProps);

      const newValidateFunction = Object.assign(
        (...innerProps: Parameters<typeof validateFunction>) => {
          const validationResult = validateFunction.apply(
            compileFunction,
            innerProps,
          );
          if (!validationResult && validateFunction.errors) {
            const language = unref(locale) as keyof typeof localize | undefined;
            const localized =
              language &&
              (localize[language] ||
                localize[language.split('-')[0] as keyof typeof localize]);
            if (localized) localized(validateFunction.errors);
          }
          Object.assign(newValidateFunction, validateFunction);
          return validationResult;
        },
        validateFunction,
      );

      return newValidateFunction;
    },
    compileFunction,
  );
}
