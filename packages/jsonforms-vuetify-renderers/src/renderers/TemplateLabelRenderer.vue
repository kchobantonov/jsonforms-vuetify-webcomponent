<template>
  <v-label
    v-if="label.visible"
    :class="styles.label.root"
    :v-once="once"
    v-bind="vuetifyProps('v-label')"
  >
    {{ translatedLabel }}
  </v-label>
</template>

<script lang="ts">
import {
  and,
  JsonFormsRendererRegistryEntry,
  JsonFormsSubStates,
  LabelElement,
  optionIs,
  rankWith,
  uiTypeIs,
} from '@jsonforms/core';
import {
  rendererProps,
  RendererProps,
  useJsonFormsLabel,
} from '@jsonforms/vue2';
import { useTranslator, useVuetifyLabel } from '@jsonforms/vue2-vuetify';
import { ErrorObject } from 'ajv';
import { defineComponent, inject, unref } from 'vue';
import { VLabel } from 'vuetify/lib';
import { template as templateFn } from '../core/template';
import { FormContext, TemplateFormContext } from '../core/types';

const templateLabelRenderer = defineComponent({
  name: 'template-label-renderer',
  components: {
    VLabel,
  },
  props: {
    ...rendererProps<LabelElement>(),
  },
  setup(props: RendererProps<LabelElement>) {
    const t = useTranslator();
    const label = useVuetifyLabel(useJsonFormsLabel(props));

    const jsonforms = inject<JsonFormsSubStates>('jsonforms');
    if (!jsonforms) {
      throw new Error(
        "'jsonforms' couldn't be injected. Are you within JsonForms?"
      );
    }

    const formContext = inject<FormContext>('formContext');

    if (!formContext) {
      throw new Error(
        "'formContext' couldn't be injected. Are you within JsonForms?"
      );
    }

    const scopeData = inject<any>('scopeData', null);

    return {
      ...label,
      t,
      jsonforms,
      parentComponent: this,
      formContext,
      scopeData,
    };
  },
  computed: {
    once(): boolean {
      return (
        this.uischema?.options?.['v-once'] === true ||
        this.uischema?.options?.['v-once'] === 'true'
      );
    },
    data(): any {
      return this.jsonforms.core?.data;
    },
    context(): TemplateFormContext {
      return {
        jsonforms: this.jsonforms,
        locale: this.jsonforms.i18n?.locale,
        translate: this.jsonforms.i18n?.translate,

        data: this.jsonforms.core?.data,
        schema: this.jsonforms.core?.schema,
        uischema: this.jsonforms.core?.uischema,
        errors: this.jsonforms.core?.errors,
        additionalErrors: this.jsonforms.core?.additionalErrors,
        scopeData: this.scopeData,
        ...unref(this.formContext),
      };
    },
    errors(): ErrorObject[] | undefined {
      return this.jsonforms.core?.errors;
    },
    template(): string | undefined {
      if (this.uischema.options?.i18n) {
        // try to use i18n template if the template changes based on the language
        return this.t(
          this.uischema.options.i18n,
          (this.uischema as LabelElement).text
        );
      }
      return (this.uischema as LabelElement).text;
    },
    translatedLabel(): string | undefined {
      const compile = templateFn(this.template, {
        imports: {
          data: this.data,
          context: this.context,
          errors: this.errors,
          translate: this.translate.bind(this),
        },
      });

      return compile();
    },
  },
  methods: {
    translate(
      key: string,
      defaultMessage: string | undefined
    ): string | undefined {
      return this.t(key, defaultMessage ?? '');
    },
  },
});

export default templateLabelRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: templateLabelRenderer,
  tester: rankWith(2, and(uiTypeIs('Label'), optionIs('template', true))),
};
</script>
