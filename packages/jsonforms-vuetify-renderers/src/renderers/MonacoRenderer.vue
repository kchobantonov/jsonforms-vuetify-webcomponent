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
      :value="control.data"
      v-bind="vuetifyProps('v-monaco-editor')"
      :language="language"
      @input="onChange"
      @focus="isFocused = true"
      @blur="isFocused = false"
    ></v-monaco-editor>
  </control-wrapper>
</template>

<script lang="ts">
import isEmpty from 'lodash/isEmpty';
import { VCard, VCardSubtitle, VHover } from 'vuetify/lib';

import {
  ControlElement,
  JsonFormsRendererRegistryEntry,
  JsonFormsSubStates,
  Resolve,
  Tester,
  UISchemaElement,
  and,
  isStringControl,
  optionIs,
  or,
  rankWith,
} from '@jsonforms/core';
import {
  RendererProps,
  rendererProps,
  useJsonFormsControl,
} from '@jsonforms/vue2';
import {
  ControlWrapper,
  DisabledIconFocus,
  useVuetifyControl,
} from '@jsonforms/vue2-vuetify';
import { defineComponent, inject } from 'vue';
import VMonacoEditor from '../components/VMonacoEditor/VMonacoEditor';

const controlRenderer = defineComponent({
  name: 'monaco-control-renderer',
  components: {
    ControlWrapper,
    VMonacoEditor,
    VCard,
    VHover,
    VCardSubtitle,
  },
  directives: {
    DisabledIconFocus,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const jsonforms = inject<JsonFormsSubStates>('jsonforms');
    if (!jsonforms) {
      throw new Error(
        "'jsonforms' couldn't be injected. Are you within JsonForms?"
      );
    }

    return {
      ...useVuetifyControl(
        useJsonFormsControl(props),
        (value) => value || undefined
      ),
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

const hasOption =
  (optionName: string): Tester =>
  (uischema: UISchemaElement): boolean => {
    if (isEmpty(uischema)) {
      return false;
    }
    const options = uischema.options;
    return (
      (options &&
        !isEmpty(options) &&
        typeof options[optionName] === 'string') ||
      false
    );
  };
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(
    2,
    and(
      isStringControl,
      optionIs('format', 'code'),
      or(hasOption('language'), hasOption(':language'))
    )
  ),
};
</script>
