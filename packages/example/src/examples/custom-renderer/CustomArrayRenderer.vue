<template>
  <array-layout-renderer v-bind="$props">
    <template v-slot:toolbar-elements>{{ null }}</template>
    <template v-slot:actions="actionsProps">
      <v-tooltip bottom>
        <template v-slot:activator="{ props }">
          <v-btn
            color="primary"
            rounded
            :aria-label="actionsProps.labels.add"
            v-bind="props"
            :class="actionsProps.styles.arrayList.addButton"
            :disabled="actionsProps.addDisabled"
            @click="actionsProps.addClick"
          >
            <v-icon>$plus</v-icon> {{ actionsProps.labels.add }}
          </v-btn>
        </template>
        {{ actionsProps.labels.add }}
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
