import type { Ajv } from 'ajv';
import localize from 'ajv-i18n/localize';
import { unref, type ComputedRef, type MaybeRef } from 'vue';

export function enableErrorTranslations(
  ajv: Ajv,
  locale: MaybeRef<string | undefined> | ComputedRef<string | undefined>,
) {
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
