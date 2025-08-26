import {
  type JsonFormsUISchemaRegistryEntry,
  type UISchemaElement,
  type UISchemaTester,
  type ValidateFunctionContext,
  NOT_APPLICABLE,
} from '@jsonforms/core';
import type { Ref } from 'vue';

export const resolveUISchemaValidations = (
  uischema: UISchemaElement | undefined,
  config: Ref<Record<string, any> | undefined>,
): UISchemaElement | undefined => {
  if (!uischema) {
    return undefined;
  }

  const transformNode = (node: UISchemaElement): UISchemaElement => {
    const transformed = { ...node } as UISchemaElement;

    if (
      'rule' in transformed &&
      transformed.rule?.condition &&
      typeof transformed.rule.condition === 'object' &&
      'validate' in transformed.rule.condition &&
      typeof transformed.rule.condition.validate === 'string'
    ) {
      const fnBody = transformed.rule.condition.validate;

      const validate = (context: ValidateFunctionContext): boolean => {
        try {
          const enhancedContext = {
            ...context,
            config: config?.value,
          };

          const validateFn = new Function(
            'context',
            `const validateFn = ${fnBody}; return validateFn(context);`,
          );

          const result = validateFn(enhancedContext);

          if (typeof result !== 'boolean') {
            console.error(
              `UISchema validate: expected boolean, got ${typeof result}`,
            );
            return false;
          }

          return result;
        } catch (e) {
          console.error(`UISchema validate error:`, e);
          return false;
        }
      };

      transformed.rule.condition.validate = validate;
    }

    if ('elements' in transformed && Array.isArray(transformed.elements)) {
      transformed.elements = transformed.elements.map(transformNode);
    }

    return transformed;
  };

  return transformNode(uischema);
};

export const parseAndTransformUISchemaRegistryEntries = (
  uischemaRegistryEntries?:
    | string
    | {
        tester: string;
        uischema: UISchemaElement;
      }[],
): JsonFormsUISchemaRegistryEntry[] => {
  const uischemasMap: {
    tester: string;
    uischema: UISchemaElement;
  }[] =
    typeof uischemaRegistryEntries === 'string'
      ? JSON.parse(uischemaRegistryEntries)
      : (uischemaRegistryEntries ?? []);

  return uischemasMap
    .map((elem, index) => {
      if (elem.tester) {
        const action: UISchemaTester = (jsonSchema, schemaPath, path) => {
          try {
            const tester = new Function(
              'jsonSchema, schemaPath, path',
              `const NOT_APPLICABLE = -1; const tester = ${elem.tester}; return tester(jsonSchema, schemaPath, path);`,
            );
            const result = tester(jsonSchema, schemaPath, path);
            if (typeof result !== 'number') {
              console.error(
                `Error at uischema tester[${index}]: invalid result type, expected number but got ${typeof result}`,
              );
            }
            return typeof result === 'number' ? result : NOT_APPLICABLE;
          } catch (e) {
            console.error(`Error at uischema tester[${index}]: ${e}`);
            return NOT_APPLICABLE;
          }
        };
        return {
          tester: action,
          uischema: elem.uischema,
        };
      }
      return null;
    })
    .filter((x) => !!x) as JsonFormsUISchemaRegistryEntry[];
};

export const getLightDarkTheme = (
  dark: boolean,
  currentTheme: string,
  exists: (theme: string) => boolean,
) => {
  if (!currentTheme || !exists(currentTheme)) {
    // fallback to default
    return dark ? 'dark' : 'light';
  }

  // Determine if currentTheme is dark
  const isCurrentDark =
    currentTheme.endsWith('Dark') || currentTheme.includes('dark');

  // If the theme already matches the desired mode, return it
  if ((dark && isCurrentDark) || (!dark && !isCurrentDark)) {
    return currentTheme;
  }

  let newTheme: string;

  if (dark) {
    // Switching to dark mode
    if (currentTheme.endsWith('Light')) {
      newTheme = currentTheme.replace('Light', 'Dark');
    } else if (currentTheme.includes('light')) {
      newTheme = currentTheme.replace('light', 'dark');
    } else {
      const darkVariant = currentTheme + 'Dark';
      newTheme = exists(darkVariant) ? darkVariant : 'dark';
    }
  } else {
    // Switching to light mode
    if (currentTheme.endsWith('Dark')) {
      const baseTheme = currentTheme.replace('Dark', '');
      const lightVariant = baseTheme + 'Light';
      newTheme = exists(lightVariant)
        ? lightVariant
        : exists(baseTheme)
          ? baseTheme
          : 'light';
    } else if (currentTheme.includes('dark')) {
      newTheme = currentTheme.replace('dark', 'light');
    } else {
      // Already light
      newTheme = currentTheme;
    }
  }

  // Final fallback
  if (!exists(newTheme)) {
    newTheme = dark ? 'dark' : 'light';
  }

  return newTheme;
};
