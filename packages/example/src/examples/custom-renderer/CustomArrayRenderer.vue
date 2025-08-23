<template>
  <array-layout-renderer v-bind="$props">
    <template v-slot:toolbar-elements="actionsProps">
      <v-tooltip bottom>
        <template v-slot:activator="{ props }">
          <v-btn
            color="primary"
            rounded
            :aria-label="actionsProps.control.translations.addAriaLabel"
            v-bind="props"
            :class="actionsProps.styles.arrayList.addButton"
            :disabled="actionsProps.addDisabled"
            @click="actionsProps.addClick"
          >
            Custom Add
          </v-btn>
        </template>
        {{ actionsProps.control.translations.addTooltip }}
      </v-tooltip>
    </template>
  </array-layout-renderer>
</template>

<script lang="ts">
import {
  type ControlElement,
  type JsonFormsRendererRegistryEntry,
  withIncreasedRank,
} from '@jsonforms/core';
import { rendererProps } from '@jsonforms/vue';
import {
  ArrayLayoutRenderer,
  arrayLayoutRendererEntry,
} from '@jsonforms/vue-vuetify';
import { VTooltip, VIcon, VBtn } from 'vuetify/components';
import { defineComponent } from 'vue';

const controlRenderer = defineComponent({
  name: 'custom-array-renderer',
  components: {
    ArrayLayoutRenderer,
    VTooltip,
    VIcon,
    VBtn,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
});

export default controlRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: withIncreasedRank(1, arrayLayoutRendererEntry.tester),
};
</script>
