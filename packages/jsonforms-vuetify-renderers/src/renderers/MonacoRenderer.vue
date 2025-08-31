<template>
  <control-wrapper
    v-bind="controlWrapper"
    :styles="styles"
    :isFocused="isFocused"
    :appliedOptions="appliedOptions"
  >
    <v-monaco-editor
      v-disabled-icon-focus
      :id="control.id + '-input'"
      :class="styles.control.input"
      :disabled="!control.enabled"
      :autofocus="appliedOptions.focus"
      :placeholder="appliedOptions.placeholder"
      :label="computedLabel"
      :hint="control.description"
      :persistent-hint="persistentHint()"
      :required="control.required"
      :error-messages="control.errors"
      :model-value="control.data"
      :clearable="control.enabled"
      v-bind="vuetifyProps('v-monaco-editor')"
      :language="language"
      @update:model-value="onChange"
      @focus="handleFocus"
      @blur="handleBlur"
    ></v-monaco-editor>
  </control-wrapper>
</template>

<script lang="ts">
import { type ControlElement, Resolve } from '@jsonforms/core';
import {
  type RendererProps,
  rendererProps,
  useJsonFormsControl,
} from '@jsonforms/vue';
import {
  ControlWrapper,
  determineClearValue,
  DisabledIconFocus,
  useJsonForms,
  useVuetifyControl,
} from '@jsonforms/vue-vuetify';
import { defineComponent } from 'vue';
import { defineAsyncComponent } from 'vue';

const VMonacoEditor = defineAsyncComponent(() =>
  import('../components/VMonacoEditor').then((m) => m.VMonacoEditor),
);

const controlRenderer = defineComponent({
  name: 'monaco-control-renderer',
  components: {
    ControlWrapper,
    VMonacoEditor,
  },
  directives: {
    DisabledIconFocus,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const jsonforms = useJsonForms();

    const clearValue = determineClearValue('');
    const adaptValue = (value: any) => value || clearValue;

    return {
      ...useVuetifyControl(useJsonFormsControl(props), adaptValue, 300),
      jsonforms,
    };
  },
  computed: {
    language(): string | undefined {
      const language = this.control.uischema.options?.[':language'];
      if (language) {
        const rootData = this.jsonforms.core?.data;
        return Resolve.data(rootData, language);
      }
      return this.control.uischema.options?.language;
    },
  },
});

export default controlRenderer;
</script>
