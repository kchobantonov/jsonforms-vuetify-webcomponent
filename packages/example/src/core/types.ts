import type { ActionEvent } from '@chobantonov/jsonforms-vuetify-renderers';
import type {
  JsonFormsUISchemaRegistryEntry,
  JsonSchema,
  UISchemaElement,
} from '@jsonforms/core';
import type { StateProps } from '@jsonforms/examples';

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
  data?: any;
  i18n?: Record<string, any>;
  actions?: { label: string; apply: (props: StateProps) => StateProps }[];
  onHandleAction?: (event: ActionEvent) => void;
  config?: Record<string, any>;
};
