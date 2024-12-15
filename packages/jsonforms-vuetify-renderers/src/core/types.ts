import type {
  JsonFormsCellRendererRegistryEntry,
  JsonFormsI18nState,
  JsonFormsRendererRegistryEntry,
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
  ComputedRef,
  Directive,
  InjectionKey,
  MaybeRefOrGetter,
  MethodOptions,
  Reactive,
  Ref,
  SetupContext,
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
  i18n?: JsonFormsI18nState & { translations?: Record<string, any> };
  additionalErrors?: ErrorObject<string, Record<string, any>, unknown>[];
  middleware?: Middleware;
  onHandleAction?: (event: ActionEvent) => void;
}

export type ResolvedSchema = {
  schema?: JsonSchema;
  resolved: boolean;
  error?: string;
};

type DefaultsInstance =
  | undefined
  | {
      [key: string]: undefined | Record<string, unknown>;
      global?: Record<string, unknown>;
    };
type DefaultsOptions = Partial<DefaultsInstance>;

export type VuetifyConfig = {
  theme: string;
  rtl: boolean;
  defaults: DefaultsOptions;
};

export interface FormContext {
  [key: string]: any;

  schemaUrl?: string;
  uidata?: Reactive<Record<string, any>>;
  vuetify?: VuetifyConfig & { dark: boolean };
  config?: MaybeRefOrGetter<any>;
  readonly?: MaybeRefOrGetter<boolean>;

  locale?: MaybeRefOrGetter<string | undefined>;
  translate?: MaybeRefOrGetter<Translator | undefined>;
  data?: MaybeRefOrGetter<any>;
  schema?: MaybeRefOrGetter<JsonSchema | undefined>;
  uischema?: MaybeRefOrGetter<UISchemaElement | undefined>;
  errors?: MaybeRefOrGetter<ErrorObject[] | undefined>;
  additionalErrors?: MaybeRefOrGetter<ErrorObject[] | undefined>;

  fireActionEvent?: <TypeEl extends Element = any>(
    action: string,
    params: any,
    el: TypeEl,
  ) => Promise<void>;
}

export type ActionEvent = {
  action: string;
  callback?: (event: ActionEvent) => void;
  context: FormContext;
  // the action parameters passes from the UI schema
  params: Record<string, any>;
  $el: Element;
};

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

export const FormContextKey: InjectionKey<Ref<FormContext>> = Symbol.for(
  'jsonforms-vuetify-renderers:formContext',
);

export const TemplateRenderSlotContentsKey: InjectionKey<
  ComputedRef<Record<string, UISchemaElement>>
> = Symbol.for('jsonforms-vuetify-renderers:templateRendererSlotContents');

export const HandleActionEmitterKey: InjectionKey<SetupContext['emit']> =
  Symbol.for('jsonforms-vuetify-renderers:handleActionEmitter');
