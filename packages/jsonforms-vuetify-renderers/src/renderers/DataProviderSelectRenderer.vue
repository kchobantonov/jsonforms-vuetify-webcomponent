<template>
  <control-wrapper
    v-if="dataProvider"
    v-bind="controlWrapper"
    :styles="styles"
    :isFocused="isFocused"
    :appliedOptions="appliedOptions"
  >
    <v-hover v-slot="{ hover }">
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
        :clearable="hover"
        :value="control.data"
        :error="dataProvider.error !== undefined"
        :loading="dataProvider.loading"
        :items="dataProvider.data"
        :item-text="getItemText"
        :item-value="getItemValue"
        v-bind="vuetifyProps('v-select')"
        @change="onChange"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />
    </v-hover>
  </control-wrapper>
</template>

<script lang="ts">
import {
  and,
  ControlElement,
  isStringControl,
  JsonFormsRendererRegistryEntry,
  optionIs,
  rankWith,
} from '@jsonforms/core';
import {
  rendererProps,
  RendererProps,
  useJsonFormsOneOfEnumControl,
} from '@jsonforms/vue2';
import { ControlWrapper, useVuetifyControl } from '@jsonforms/vue2-vuetify';
import { DisabledIconFocus } from './directives/DisabledIconFocus';

import { defineComponent, inject } from 'vue';
import { VHover, VSelect } from 'vuetify/lib';
import { template as templateFn } from '../core/template';

const controlRenderer = defineComponent({
  name: 'data-provider-select-renderer',
  components: {
    ControlWrapper,
    VSelect,
    VHover,
  },
  directives: {
    DisabledIconFocus,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const scopeData = inject<any>('scopeData', null);

    return {
      ...useVuetifyControl(
        useJsonFormsOneOfEnumControl(props),
        (value) => (value !== null ? value : undefined)
      ),
      scopeData,
    };
  },
  computed: {
    dataProvider(): any {
      const scopeData: any = this.scopeData;
      return scopeData;
    },
  },
  methods: {
    getItemValue(item: any) {
      const compiled = templateFn(
        this.control.uischema.options?.['item-value']
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

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(
    11,
    and(isStringControl, optionIs('variant', 'data-provider-select'))
  ),
};
</script>
