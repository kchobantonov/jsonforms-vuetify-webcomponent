import type {
  JsonFormsCellRendererRegistryEntry,
  JsonFormsI18nState,
  JsonFormsRendererRegistryEntry,
  JsonFormsSubStates,
  JsonFormsUISchemaRegistryEntry,
  JsonSchema,
  Middleware,
  Translator,
  UISchemaElement,
  ValidationMode,
} from '@jsonforms/core';
import type { MaybeReadonly } from '@jsonforms/vue';
import type { Ajv, ErrorObject } from 'ajv';
import type {
  Component,
  ComputedOptions,
  Directive,
  InjectionKey,
  MethodOptions,
} from 'vue';

export const AsyncFunction = Object.getPrototypeOf(async function (
  _event: ActionEvent,
) {}).constructor;

export interface JsonFormsProps {
  data: any;
  schema?: JsonSchema;
  schemaUrl?: string;
  uischema?: UISchemaElement;
  renderers: MaybeReadonly<JsonFormsRendererRegistryEntry[]>;
  cells?: MaybeReadonly<JsonFormsCellRendererRegistryEntry[]>;
  config?: any;
  readonly?: boolean;
  uischemas?: MaybeReadonly<JsonFormsUISchemaRegistryEntry[]>;
  validationMode?: ValidationMode;
  ajv?: Ajv;
  i18n?: JsonFormsI18nState;
  additionalErrors?: ErrorObject<string, Record<string, any>, unknown>[];
  middleware?: Middleware;
}

export type ResolvedSchema = {
  schema?: JsonSchema;
  resolved: boolean;
  error?: string;
};

export interface FormContext {
  schemaUrl?: string;
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

export type ActionEvent = {
  action: string;
  callback?: (event: ActionEvent) => void;
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

export interface NamedUISchemaElement extends UISchemaElement {
  name: string;
}

export interface DataProvider {
  loading: boolean;
  data: any;
  error: any;
}

export const DataProviderKey: InjectionKey<DataProvider> = Symbol.for(
  'jsonforms-vuetify-renderers:dataProvider',
);

export const TemplateContextKey: InjectionKey<TemplateContext> = Symbol.for(
  'jsonforms-vuetify-renderers:templateContext',
);

export const TemplateDirectivesKey: InjectionKey<Record<string, Directive>> =
  Symbol.for(
    'jsonforms-vuetify-renderers:templateLayoutRendererComponentDirectives',
  );

export const TemplateComputedKey: InjectionKey<ComputedOptions> = Symbol.for(
  'jsonforms-vuetify-renderers:templateLayoutRendererComponentComputed',
);

export const TemplateMethodsKey: InjectionKey<MethodOptions> = Symbol.for(
  'jsonforms-vuetify-renderers:templateLayoutRendererComponentMethods',
);

export const TemplateFiltersKey: InjectionKey<MethodOptions> = Symbol.for(
  'jsonforms-vuetify-renderers:templateLayoutRendererComponentFilters',
);

export const TemplateComponentsKey: InjectionKey<Record<string, Component>> =
  Symbol.for(
    'jsonforms-vuetify-renderers:templateLayoutRendererComponentComponents',
  );

export const FormContextKey: InjectionKey<FormContext> = Symbol.for(
  'jsonforms-vuetify-renderers:formContext',
);
