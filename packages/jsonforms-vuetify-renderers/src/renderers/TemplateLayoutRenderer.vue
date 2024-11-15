<template>
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
</template>

<script lang="ts">
import {
  rankWith,
  uiTypeIs,
  type JsonFormsRendererRegistryEntry,
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
} from '@jsonforms/vue-vuetify';
import { type ErrorObject } from 'ajv';
import {
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
import { useFormContext } from '../util';

import * as defaultComponents from 'vuetify/components';

export interface TemplateLayout extends Layout {
  type: 'TemplateLayout';
  /**
   * The template string.
   */
  template: string;
}

const templateLayoutRenderer = defineComponent({
  name: 'template-layout-renderer',
  components: {
    TemplateCompiler,
  },
  props: {
    ...rendererProps<TemplateLayout>(),
  },
  setup(props: RendererProps<TemplateLayout>) {
    const t = useTranslator();
    const layout = useVuetifyLayout(useJsonFormsLayout(props));

    const jsonforms = useJsonForms();
    const context = useFormContext();
    const templateError = ref<string | null>(null);

    return {
      ...layout,
      t,
      jsonforms,
      parentComponent: this,
      templateError,
      context,
      defaultComponents,
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
      const defaultDirective = {};

      const override = unref(
        inject<Record<string, Directive> | undefined>(
          TemplateDirectivesKey,
          undefined,
        ),
      );

      return override ? { ...defaultDirective, ...override } : defaultDirective;
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

      return override
        ? { ...this.defaultComponents, ...override }
        : this.defaultComponents;
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

export default templateLayoutRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: templateLayoutRenderer,
  tester: rankWith(2, uiTypeIs('TemplateLayout')),
};
</script>
