<template>
  <v-btn
    v-if="button.visible"
    :disabled="!button.enabled"
    :loading="loading"
    :color="button.color"
    v-bind="vuetifyProps('v-btn')"
    :icon="button.icon !== undefined"
    @click="click"
  >
    <v-icon v-if="button.icon">{{ button.icon }}</v-icon>
    <span v-if="button.label">{{ button.label }}</span>
  </v-btn>
</template>

<script lang="ts">
import {
  rankWith,
  uiTypeIs,
  type JsonFormsRendererRegistryEntry,
} from '@jsonforms/core';
import { rendererProps, type RendererProps } from '@jsonforms/vue';
import { useJsonForms, useTranslator } from '@jsonforms/vue-vuetify';
import isFunction from 'lodash/isFunction';
import { defineComponent, inject, ref, unref, type SetupContext } from 'vue';
import { VBtn, VIcon } from 'vuetify/components';
import {
  AsyncFunction,
  type ActionEvent,
  type TemplateFormContext,
} from '../core';
import {
  useFormContext,
  useJsonFormsButton,
  useVuetifyButton,
  type ButtonElement,
} from '../util';

const buttonRenderer = defineComponent({
  name: 'button-renderer',
  components: {
    VBtn,
    VIcon,
  },
  props: {
    ...rendererProps<ButtonElement>(),
  },
  setup(props: RendererProps<ButtonElement>) {
    const t = useTranslator();
    const button = useVuetifyButton(useJsonFormsButton(props));

    const jsonforms = useJsonForms();
    const formContext = useFormContext();

    const handleActionEmitter = inject<SetupContext['emit'] | undefined>(
      'handleActionEmitter',
      undefined,
    );

    const scopeData = inject<any>('scopeData', null);

    const loading = ref(false);

    return {
      ...button,
      t,
      jsonforms,
      formContext,
      scopeData,
      loading,
      handleActionEmitter,
    };
  },
  computed: {
    context(): TemplateFormContext {
      return {
        ...unref(this.formContext),
        jsonforms: this.jsonforms,
        locale: this.jsonforms.i18n?.locale,
        translate: this.jsonforms.i18n?.translate,

        data: this.jsonforms.core?.data,
        schema: this.jsonforms.core?.schema,
        uischema: this.jsonforms.core?.uischema,
        errors: this.jsonforms.core?.errors,
        additionalErrors: this.jsonforms.core?.additionalErrors,
        scopeData: this.scopeData,
      };
    },
  },
  methods: {
    async click() {
      this.loading = true;

      const source: ActionEvent = {
        action: this.button.action,
        jsonforms: this.jsonforms,
        context: this.context,
        // the action parameters passes from the UI schema
        params: this.button.params ? { ...this.button.params } : {},
        $el: this.$el,
      };
      try {
        if (this.button.action) {
          if (this.handleActionEmitter) {
            this.handleActionEmitter('handle-action', source);
          } else {
            this.$root
              ? this.$root.$emit('handle-action', source)
              : this.$emit('handle-action', source);
          }

          if (isFunction(source.callback)) {
            await source.callback(source);
          } else {
            console.log('action [' + this.button.action + '] is not handled');
          }
        } else if (this.button.script) {
          await new AsyncFunction(this.button.script).call(source);
        }
      } finally {
        this.loading = false;
      }
    },
  },
});

export default buttonRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: buttonRenderer,
  tester: rankWith(1, uiTypeIs('Button')),
};
</script>
