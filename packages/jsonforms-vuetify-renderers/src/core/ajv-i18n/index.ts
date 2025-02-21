import type { JsonFormsI18nState } from '@jsonforms/core';
import type { Ajv, ErrorObject, Plugin } from 'ajv';
import localize from 'ajv-i18n/localize';
import { computed, type ComputedRef, type Ref } from 'vue';
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

export interface I18NOptions {
  i18n?:
    | Ref<JsonFormsI18nState | undefined>
    | ComputedRef<JsonFormsI18nState | undefined>;
}

export const ajvTranslations: Plugin<I18NOptions> = (
  ajv: Ajv,
  options?: I18NOptions,
): Ajv => {
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
            const i18n = options!.i18n?.value;

            const language: keyof typeof localize | undefined = i18n
              ? (i18n.locale as keyof typeof localize)
              : undefined;

            const localized =
              language &&
              (localize[language] ||
                localize[language.split('-')[0] as keyof typeof localize]);
            if (localized) {
              localized(
                // exclude errorMessage keyword since the message itself will be comming from the schema itself and possible then translated
                validateFunction.errors.filter(
                  (error) => error.keyword !== 'errorMessage',
                ),
              );
            }

            validateFunction.errors = unwrapErrorMessageErrors(
              validateFunction.errors,
              options!.i18n,
            );
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

  return ajv;
};

export const unwrapErrorMessageErrors = (
  errors: ErrorObject[],
  i18n?:
    | Ref<JsonFormsI18nState | undefined>
    | ComputedRef<JsonFormsI18nState | undefined>,
): ErrorObject[] => {
  return (
    errors
      // filter out any errors that are marked as processed by ajv-errors
      .filter((error) => (error as any)['emUsed'] !== true)
      .map((error) => {
        if (
          error.keyword === 'errorMessage' &&
          Array.isArray(error.params?.errors)
        ) {
          // error created by the ajv-errors, replace the error with the actual errors and change the error message
          const result = error.params.errors.map((paramError) => ({
            ...paramError,
            message: computed(() =>
              i18n?.value?.translate && error.message
                ? i18n.value.translate(
                    `error.errorMessage.${error.message}`,
                    error.message,
                  )
                : error.message,
            ),
          }));
          return result;
        }
        // otherwise just return the current error that is not related to ajv-errors
        return error;
      })
      .flat()
  );
};
