import {
  JsonFormsSubStates,
  JsonSchema,
  Translator,
  UISchemaElement,
} from '@jsonforms/core';
import { ErrorObject } from 'ajv';
import { AsyncComponent, Component } from 'vue';

export const AsyncFunction = Object.getPrototypeOf(async function (
  _event: ActionEvent
) {}).constructor;

export type ResolvedSchema = {
  schema?: JsonSchema;
  resolved: boolean;
  error?: string;
};

export interface FormContext {
  schemaUrl?: string;
  actions?: Record<string, (event: ActionEvent) => void>;
}

export interface TemplateFormContext extends FormContext {
  jsonforms: JsonFormsSubStates;
  scopeData: any;

  // below are just the shortcuts for acessing the jsonforms.core
  locale?: string;
  translate?: Translator;
  data?: any;
  schema?: JsonSchema;
  uischema?: UISchemaElement;
  errors?: ErrorObject[];
  additionalErrors?: ErrorObject[];
}
export interface Actions {
  [id: string]: (event: ActionEvent) => void;
}

export type ActionEvent = {
  jsonforms: JsonFormsSubStates;
  context: TemplateFormContext;
  // the action parameters passes from the UI schema
  params: Record<string, any>;
  $el: Element;
};

export interface TemplateContext {
  jsonforms: JsonFormsSubStates;

  // below are just the shortcuts for acessing the jsonforms.core
  locale?: string;
  translate?: Translator;
  data?: any;
  schema?: JsonSchema;
  uischema?: UISchemaElement;
  errors?: ErrorObject[];
  additionalErrors?: ErrorObject[];
}

export type Components = {
  [key: string]:
    | Component<any, any, any, any>
    | AsyncComponent<any, any, any, any>;
};

export interface NamedUISchemaElement extends UISchemaElement {
  name: string;
}
