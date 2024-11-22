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
  optionIs,
  rankWith,
  uiTypeIs,
  type JsonFormsRendererRegistryEntry,
  type LabelElement,
} from '@jsonforms/core';
import {
  rendererProps,
  useJsonFormsLabel,
  type RendererProps,
} from '@jsonforms/vue';
import {
  useJsonForms,
  useTranslator,
  useVuetifyLabel,
} from '@jsonforms/vue-vuetify';
import type { ErrorObject } from 'ajv';
import { defineComponent } from 'vue';
import { VLabel } from 'vuetify/components';
import { template as templateFn } from '../core/template';
import { useFormContext } from '../util';

const controlRenderer = defineComponent({
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

    const jsonforms = useJsonForms();
    const formContext = useFormContext();

    return {
      ...label,
      t,
      jsonforms,
      parentComponent: this,
      formContext,
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
    errors(): ErrorObject[] | undefined {
      return this.jsonforms.core?.errors;
    },
    template(): string | undefined {
      if (this.uischema.options?.i18n) {
        // try to use i18n template if the template changes based on the language
        return this.t(
          this.uischema.options.i18n,
          (this.uischema as LabelElement).text,
        );
      }
      return (this.uischema as LabelElement).text;
    },
    translatedLabel(): string | undefined {
      const compile = templateFn(this.template, {
        imports: {
          data: this.data,
          context: this.formContext,
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
      defaultMessage: string | undefined,
    ): string | undefined {
      return this.t(key, defaultMessage ?? '');
    },
  },
});

export default controlRenderer;
</script>
