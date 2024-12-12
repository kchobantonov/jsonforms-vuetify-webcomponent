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
import { rendererProps, type RendererProps } from '@jsonforms/vue';
import { useJsonForms, useTranslator } from '@jsonforms/vue-vuetify';
import { defineComponent, ref } from 'vue';
import { VBtn, VIcon } from 'vuetify/components';
import { AsyncFunction, type ActionEvent } from '../core';
import {
  useFormContext,
  useJsonFormsButton,
  useVuetifyButton,
  type ButtonElement,
} from '../util';

const controlRenderer = defineComponent({
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

    const loading = ref(false);

    return {
      ...button,
      t,
      jsonforms,
      formContext,
      loading,
    };
  },
  methods: {
    async click() {
      this.loading = true;

      try {
        if (this.button.action) {
          this.formContext.fireActionEvent?.(
            this.button.action,
            this.button.params ? { ...this.button.params } : {},
            this.$el,
          );
        } else if (this.button.script) {
          const source: ActionEvent = {
            action: this.button.action,
            jsonforms: this.jsonforms,
            context: this.formContext,
            // the action parameters passes from the UI schema
            params: this.button.params ? { ...this.button.params } : {},
            $el: this.$el,
          };
          await new AsyncFunction(this.button.script).call(source);
        }
      } finally {
        this.loading = false;
      }
    },
  },
});

export default controlRenderer;
</script>
