<template>
  <v-defaults-provider
    :disabled="!vuetifyProps('defaults')"
    :defaults="vuetifyProps('defaults')"
  >
    <div v-if="templateError !== null" class="error">
      Template Error: {{ templateError }}
    </div>

    <template-compiler
      v-else-if="layout.visible"
      :template="template"
      :parent="parentComponent"
      :elements="namedElements"
      :componentComputed="componentComputed"
      :componentDirectives="componentDirectives"
      :componentMethods="componentMethods"
      :componentFilters="componentFilters"
      :componentComponents="componentComponents"
      :layout="layout"
    >
    </template-compiler>
  </v-defaults-provider>
</template>

<script lang="ts">
import {
  type JsonFormsSubStates,
  type Layout,
  type UISchemaElement,
} from '@jsonforms/core';
import {
  rendererProps,
  useJsonFormsLayout,
  type RendererProps,
} from '@jsonforms/vue';
import {
  useJsonForms,
  useTranslator,
  useVuetifyLayout,
  ValidationIcon,
} from '@jsonforms/vue-vuetify';

import { type ErrorObject } from 'ajv';
import {
  defineAsyncComponent,
  defineComponent,
  inject,
  ref,
  unref,
  type Component,
  type ComponentPublicInstance,
  type ComputedOptions,
  type Directive,
  type MethodOptions,
} from 'vue';
import TemplateCompiler from '../components/TemplateCompiler.vue';
import {
  TemplateComponentsKey,
  TemplateComputedKey,
  TemplateDirectivesKey,
  TemplateFiltersKey,
  TemplateMethodsKey,
  type NamedUISchemaElement,
} from '../core/types';
import { useFormContext, type TemplateLayout } from '../util';

import { VDefaultsProvider } from 'vuetify/components/VDefaultsProvider';
import * as defaultDirectives from 'vuetify/directives';
import SlotElement from '../components/SlotElement.vue';
import VPane from '../components/VPane.vue';
import VSplitpanes from '../components/VSplitpanes.vue';

const VMonacoEditor = defineAsyncComponent(() =>
  import('../components/VMonacoEditor').then((m) => m.VMonacoEditor),
);

const controlRenderer = defineComponent({
  name: 'vue-template-layout-renderer',
  inheritAttrs: false,
  components: {
    TemplateCompiler,
    VDefaultsProvider: VDefaultsProvider,
  },
  props: {
    ...rendererProps<TemplateLayout>(),
  },
  async setup(props: RendererProps<TemplateLayout>) {
    const t = useTranslator();
    const layout = useVuetifyLayout(useJsonFormsLayout(props));

    const jsonforms = useJsonForms();
    const context = useFormContext();
    const templateError = ref<string | null>(null);

    const defaultComponents = await import('vuetify/components');

    return {
      ...layout,
      t,
      jsonforms,
      parentComponent: this,
      templateError,
      context,
      defaultComponents,
      defaultDirectives,
    };
  },
  errorCaptured: function (
    err: unknown,
    _instance: ComponentPublicInstance | null,
    info: string,
  ) {
    if (info == 'render') {
      this.templateError = err instanceof Error ? err.message : String(err);
    }
  },
  computed: {
    data(): any {
      const jsonforms: JsonFormsSubStates = this.jsonforms;
      return jsonforms.core?.data;
    },
    errors(): ErrorObject[] | undefined {
      const jsonforms: JsonFormsSubStates = this.jsonforms;
      return jsonforms.core?.errors;
    },
    template(): string | undefined {
      return (this.layout.uischema as TemplateLayout).template;
    },
    namedElements(): NamedUISchemaElement[] {
      return (this.layout.uischema as TemplateLayout).elements?.map(
        (element, index) => {
          if ((element as any).name === undefined) {
            (element as any).name = `${index}`;
          }
          return element as UISchemaElement & { name: string };
        },
      );
    },
    componentDirectives(): Record<string, Directive> {
      const override = unref(
        inject<Record<string, Directive> | undefined>(
          TemplateDirectivesKey,
          undefined,
        ),
      );

      return override
        ? {
            ...(this.defaultDirectives as Record<string, Directive>),
            ...override,
          }
        : (this.defaultDirectives as Record<string, Directive>);
    },
    componentComputed(): ComputedOptions {
      const defaultComputed = {} as ComputedOptions;

      defaultComputed.data = () => this.data;
      defaultComputed.errors = () => this.errors;
      defaultComputed.elements = () => this.namedElements;
      defaultComputed.context = () => this.context;

      const override = unref(
        inject<ComputedOptions | undefined>(TemplateComputedKey, undefined),
      );
      return override ? { ...defaultComputed, ...override } : defaultComputed;
    },
    componentMethods() {
      const defaultMethods = {
        translate: this.translate.bind(this.parentComponent),
      } as MethodOptions;

      const override = unref(
        inject<MethodOptions | undefined>(TemplateMethodsKey, undefined),
      );

      return override ? { ...defaultMethods, ...override } : defaultMethods;
    },
    componentFilters() {
      const defaultFilters = {
        translate: this.translate.bind(this.parentComponent),
      } as MethodOptions;

      const override = unref(
        inject<MethodOptions | undefined>(TemplateFiltersKey, undefined),
      );
      return override ? { ...defaultFilters, ...override } : defaultFilters;
    },
    componentComponents(): Record<string, Component> {
      // by default we use only Vuetify components that are already used by other renderers
      const override = unref(
        inject<Record<string, Component> | undefined>(
          TemplateComponentsKey,
          undefined,
        ),
      );

      return {
        ...this.defaultComponents,
        VMonacoEditor,
        ValidationIcon,
        SlotElement,
        VSplitpanes,
        VPane,
        ...(override ? override : {}),
      };
    },
  },
  methods: {
    translate(
      key: string,
      defaultMessage: string | undefined,
    ): string | undefined {
      return this.t(key, defaultMessage ?? '');
    },
  },
  filters: {
    translate: function (value: any) {
      if (!value) return '';
      value = value.toString();
      return this.t(value, '');
    },
  },
});

export default controlRenderer;
</script>
