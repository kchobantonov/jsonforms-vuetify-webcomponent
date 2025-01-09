<template>
  <control-wrapper
    v-bind="controlWrapper"
    :styles="styles"
    :isFocused="isFocused"
    :appliedOptions="appliedOptions"
  >
    <v-checkbox
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
      :model-value="control.data === null"
      v-bind="vuetifyProps('v-checkbox')"
      @update:model-value="onChange"
      @focus="handleFocus"
      @blur="handleBlur"
    />
  </control-wrapper>
</template>

<script lang="ts">
import { type ControlElement } from '@jsonforms/core';
import {
  rendererProps,
  useJsonFormsControl,
  type RendererProps,
} from '@jsonforms/vue';
import { ControlWrapper, useVuetifyControl } from '@jsonforms/vue-vuetify';
import { defineComponent } from 'vue';
import { VCheckbox } from 'vuetify/components';

const controlRenderer = defineComponent({
  name: 'null-control-renderer',
  components: {
    VCheckbox,
    ControlWrapper,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const adaptValue = (value: any) => (value === true ? null : undefined);
    const input = useVuetifyControl(useJsonFormsControl(props), adaptValue);

    return { ...input, adaptValue };
  },
});

export default controlRenderer;
</script>
