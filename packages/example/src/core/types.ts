import type { ActionEvent } from '@chobantonov/jsonforms-vuetify-renderers';
import type {
  JsonFormsCellRendererRegistryEntry,
  JsonFormsRendererRegistryEntry,
  JsonFormsUISchemaRegistryEntry,
  JsonSchema,
  UISchemaElement,
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
  data?: any;
  i18n?: Record<string, any>;
  renderers?: JsonFormsRendererRegistryEntry[];
  actions?: { label: string; apply: (props: StateProps) => any }[];
  onHandleAction?: (event: ActionEvent) => void;
};

export interface StateProps {
  data: any;
  schema?: JsonSchema;
  uischema?: UISchemaElement;
  renderers: JsonFormsRendererRegistryEntry[];
  cells?: JsonFormsCellRendererRegistryEntry[];
  config?: any;
  uischemas?: JsonFormsUISchemaRegistryEntry[];
  readonly?: boolean;
}
