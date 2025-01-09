import type { ActionEvent } from '@chobantonov/jsonforms-vuetify-renderers';
import type {
  UISchemaElement,
  JsonSchema,
  JsonFormsRendererRegistryEntry,
  JsonFormsUISchemaRegistryEntry,
} from '@jsonforms/core';

export type ExampleDescription = {
  name: string;
  label: string;
  note?: string;
  input: ExampleInputDescription;
};

export type ExampleInputDescription = {
  schema?: JsonSchema;
  uischema?: UISchemaElement;
  uischemas?: JsonFormsUISchemaRegistryEntry[];
  data: null | string | number | boolean | any[] | Record<string, any>;
  i18n?: Record<string, any>;
  renderers?: JsonFormsRendererRegistryEntry[];
  onHandleAction?: (event: ActionEvent) => void;
};
