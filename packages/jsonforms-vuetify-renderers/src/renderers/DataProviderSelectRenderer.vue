<template>
  <control-wrapper
    v-if="dataProvider"
    v-bind="controlWrapper"
    :styles="styles"
    :isFocused="isFocused"
    :appliedOptions="appliedOptions"
  >
    <v-select
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
      :clearable="control.enabled"
      :value="control.data"
      :error="dataProvider.error !== undefined"
      :loading="dataProvider.loading"
      :items="dataProvider.data"
      :item-text="getItemText"
      :item-value="getItemValue"
      v-bind="vuetifyProps('v-select')"
      @change="onChange"
      @focus="handleFocus"
      @blur="handleBlur"
    />
  </control-wrapper>
</template>

<script lang="ts">
import { type ControlElement } from '@jsonforms/core';
import {
  rendererProps,
  type RendererProps,
  useJsonFormsOneOfEnumControl,
} from '@jsonforms/vue';
import {
  ControlWrapper,
  useVuetifyControl,
  DisabledIconFocus,
} from '@jsonforms/vue-vuetify';

import { defineComponent, inject } from 'vue';
import { VSelect } from 'vuetify/components';
import {
  DataProviderKey,
  type DataProvider,
  template as templateFn,
} from '../core';

const controlRenderer = defineComponent({
  name: 'data-provider-select-renderer',
  components: {
    ControlWrapper,
    VSelect,
  },
  directives: {
    DisabledIconFocus,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const dataProvider = inject<DataProvider | null>(DataProviderKey, null);

    return {
      ...useVuetifyControl(useJsonFormsOneOfEnumControl(props), (value) =>
        value !== null ? value : undefined,
      ),
      dataProvider,
    };
  },
  methods: {
    getItemValue(item: any) {
      const compiled = templateFn(
        this.control.uischema.options?.['item-value'],
      );

      return compiled(item);
    },
    getItemText(item: any) {
      const compiled = templateFn(this.control.uischema.options?.['item-text']);

      return compiled(item);
    },
  },
});

export default controlRenderer;
</script>
