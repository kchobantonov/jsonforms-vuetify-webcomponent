import {
  type JsonFormsUISchemaRegistryEntry,
  type UISchemaElement,
  type UISchemaTester,
  NOT_APPLICABLE,
} from '@jsonforms/core';

export const parseAndTransformUISchemaRegistryEntries = (
  uischemaRegistryEntries?: string,
): JsonFormsUISchemaRegistryEntry[] => {
  const uischemasMap: {
    tester: string;
    uischema: UISchemaElement;
  }[] =
    typeof uischemaRegistryEntries === 'string'
      ? JSON.parse(uischemaRegistryEntries)
      : [];

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
