import type { Ajv, Schema, ValidateFunction } from 'ajv';
import localize from 'ajv-i18n/localize';
import type {
  AnySchema,
  AnyValidateFunction,
  AsyncSchema,
  AsyncValidateFunction,
  JSONSchemaType,
  JTDDataType,
  JTDSchemaType,
  SomeJTDSchemaType,
} from 'ajv/dist/core';
import { unref, type ComputedRef, type MaybeRef } from 'vue';

export const enableErrorTranslations = (
  ajv: Ajv,
  locale: MaybeRef<string | undefined> | ComputedRef<string | undefined>,
) => {
  const originalCompile = ajv.compile.bind(ajv);

  function compile<T = unknown>(
    schema: Schema | JSONSchemaType<T>,
    _meta?: boolean,
  ): ValidateFunction<T>;
  // Separated for type inference to work
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  function compile<T = unknown>(
    schema: JTDSchemaType<T>,
    _meta?: boolean,
  ): ValidateFunction<T>;
  // This overload is only intended for typescript inference, the first
  // argument prevents manual type annotation from matching this overload
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function compile<N extends never, T extends SomeJTDSchemaType>(
    schema: T,
    _meta?: boolean,
  ): ValidateFunction<JTDDataType<T>>;
  function compile<T = unknown>(
    schema: AsyncSchema,
    _meta?: boolean,
  ): AsyncValidateFunction<T>;
  function compile<T = unknown>(
    schema: AnySchema,
    _meta?: boolean,
  ): AnyValidateFunction<T>;
  function compile<T = unknown>(
    schema: AnySchema,
    _meta?: boolean,
  ): AnyValidateFunction<T> {
    const originalValidate = originalCompile(schema, _meta);

    const makeValidate = () => {
      // Create a new function using a Proxy to intercept property access and modifications
      const validate = ((...args: Parameters<ValidateFunction<T>>) => {
        const isValid = originalValidate(...args); // Call the original function

        if (!isValid && originalValidate.errors) {
          const language = unref(locale) as keyof typeof localize | undefined;
          const localized =
            language &&
            (localize[language] ||
              localize[language.split('-')[0] as keyof typeof localize]);
          if (localized) localized(originalValidate.errors);
        }
        return isValid;
      }) as ValidateFunction<T>;

      // Create a Proxy to synchronize properties between validate and originalValidate
      const handler = {
        get(target: any, prop: string, receiver: any) {
          if (prop in target) {
            return target[prop];
          }
          return (originalValidate as any)[prop];
        },
        set(target: any, prop: string, value: any) {
          // Sync properties between validate and originalValidate
          if (prop in target) {
            target[prop] = value;
          }
          (originalValidate as any)[prop] = value;
          return true;
        },
      };

      // Wrap the validate function in a Proxy to make sure properties are synchronized
      const proxyValidate = new Proxy(validate, handler);

      return proxyValidate;
    };

    return makeValidate();
  }

  ajv.compile = compile;
  return ajv;
};
