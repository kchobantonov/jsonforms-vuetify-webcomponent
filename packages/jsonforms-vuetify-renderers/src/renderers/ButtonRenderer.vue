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
  JsonFormsRendererRegistryEntry,
  JsonFormsSubStates,
  rankWith,
  uiTypeIs,
} from '@jsonforms/core';
import { rendererProps, RendererProps } from '@jsonforms/vue2';
import { useTranslator } from '@jsonforms/vue2-vuetify';
import isFunction from 'lodash/isFunction';
import { defineComponent, inject, ref, unref } from 'vue';
import { VBtn, VIcon } from 'vuetify/lib';
import {
  ActionEvent,
  Actions,
  FormContext,
  AsyncFunction,
  TemplateFormContext,
} from '../core';
import { ButtonElement, useJsonFormsButton, useVuetifyButton } from '../util';

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

    const actions = inject<Actions>('actions');
    if (!actions) {
      throw new Error(
        "'actions' couldn't be injected. Are you within JSON Forms?"
      );
    }
    const jsonforms = inject<JsonFormsSubStates>('jsonforms');
    if (!jsonforms) {
      throw new Error(
        "'jsonforms' couldn't be injected. Are you within JSON Forms?"
      );
    }

    const formContext = inject<FormContext>('formContext');

    if (!formContext) {
      throw new Error(
        "'formContext' couldn't be injected. Are you within JsonForms?"
      );
    }

    const scopeData = inject<any>('scopeData', null);

    const loading = ref(false);

    return {
      ...button,
      t,
      actions,
      jsonforms,
      formContext,
      scopeData,
      loading,
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
        jsonforms: this.jsonforms,
        context: this.context,
        // the action parameters passes from the UI schema
        params: this.button.params ? { ...this.button.params } : {},
        $el: this.$el,
      };
      try {
        if (this.button.action) {
          const action = this.actions[this.button.action];
          if (isFunction(action)) {
            await action(source);
          } else {
            console.log('action [' + this.button.action + '] is missing');
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
